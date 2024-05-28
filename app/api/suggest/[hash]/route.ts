// app/api/data/route.ts

import {NextResponse} from 'next/server';
import {Db} from "@/app/classes/db";
import {SolarManApi} from "@/app/classes/solarManApi";
import moment from "moment";

interface Params {
    hash: string;
}

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
        const realTimeInfo = await SolarManApi.getRealtimeInfo(fetchedUser);
        if (!realTimeInfo) return NextResponse.json({message: "No RealTimeInfo"});
        if (!realTimeInfo.lastUpdateTime) return NextResponse.json({message: "No RealTimeInfo UpdateTime"});

        const lastUpdateMoment = moment(realTimeInfo.lastUpdateTime * 1000);
        const minutesOld = moment().diff(lastUpdateMoment, "minutes");

        return NextResponse.json(
            {
                lastUpdate: lastUpdateMoment.format("YYYY-MM-DD HH:mm:ss"),
                minutesOld
            }
        );
    } catch (e) {
        return NextResponse.json({message: "Error on getting RealTimeInfo"});
    }
}
