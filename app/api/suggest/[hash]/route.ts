// app/api/data/route.ts

import {NextResponse} from 'next/server';
import {Db} from "@/app/classes/db";
import {SolarManApi} from "@/app/classes/solarManApi";
import moment, {min} from "moment";

interface Params {
    hash: string;
}

const Settings = {
    minChargingPower: 1.5,
    maxChargingPower: 8,
    minMinutesOldForAction: 10
};

export async function GET(request: Request, {params}: { params: Params }) {
    const {hash} = params;
    if (!hash) return NextResponse.json({message: "No hash"});

    let fetchedUser;
    try {
        fetchedUser = await Db.getUserByHash(hash);
        if (!fetchedUser) return NextResponse.json({message: "No user"});
    } catch (e) {
        return NextResponse.json({message: "Error on getting user"});
    }

    try {
        SolarManApi.solarManUrl = "https://globalapi.solarmanpv.com";
        const realTimeInfo = await SolarManApi.getRealtimeInfo(fetchedUser, true);
        if (!realTimeInfo) return NextResponse.json({message: "No RealTimeInfo"});
        if (!realTimeInfo.lastUpdateTime) return NextResponse.json({message: "No RealTimeInfo UpdateTime"});

        const lastUpdateMoment = moment(realTimeInfo.lastUpdateTime * 1000);
        const minutesOld = moment().diff(lastUpdateMoment, "minutes");
        
        const power = {
            production: (realTimeInfo.generationPower ?? 0) / 1000,
            usage: (realTimeInfo.usePower ?? 0) /1000,
            purchase: (realTimeInfo.purchasePower ?? 0) /1000,
            grid: (realTimeInfo.gridPower ?? 0) /1000,
            excess: ((realTimeInfo.generationPower ?? 0) - (realTimeInfo.usePower ?? 0)) / 1000
        }
        
        let suggestion = {
           mode: "dont_charge",
           kw: 0
        };
        if(minutesOld > Settings.minMinutesOldForAction)
            suggestion.mode = "no_change";
        else if(fetchedUser.chargeWithExcessIsOn && power.excess > Settings.minChargingPower) {
            suggestion.mode = "charge";
            suggestion.kw = power.excess;
            if(suggestion.kw >= Settings.maxChargingPower)
                suggestion.kw = Settings.maxChargingPower;
        }

        return NextResponse.json(
            {
                useChargeWithExcessIsOn: fetchedUser.chargeWithExcessIsOn,
                lastUpdate: lastUpdateMoment.format("YYYY-MM-DD HH:mm:ss"),
                minutesOld,
                power,
                suggestion
            }
        );
    } catch (e) {
        return NextResponse.json({message: "Error on getting RealTimeInfo"});
    }
}
