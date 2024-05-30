// app/api/data/route.ts

import {NextResponse} from 'next/server';
import {Db} from "@/app/classes/db";
import {SolarManApi} from "@/app/classes/solarManApi";
import {GoEApi} from "@/app/classes/goEApi";

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
        if (!fetchedUser.goEApiToken) return NextResponse.json({message: "No go e api token", fetchedUser});
        if (!fetchedUser.goESerial) return NextResponse.json({message: "No go e serial nr"});
        if (!fetchedUser.goEIsOn) return NextResponse.json({message: "No go e integration"});
    } catch (e) {
        return NextResponse.json({message: "Error on getting user"});
    }

    try {
        const goe = new GoEApi(fetchedUser.goESerial, fetchedUser.goEApiToken);
        const goeStatus = await goe.getStatus();

        let currentKw = 0;
        try {
            currentKw = (goeStatus?.nrg[11] ?? 0) / 1000;
        } catch {
        }

        SolarManApi.solarManUrl = "https://globalapi.solarmanpv.com";
        const excessSuggestion = await SolarManApi.getExcessChargeSuggestion(fetchedUser, currentKw);
        if (!excessSuggestion) return;

        const phaseAndCurrent = goe.getPhaseAndCurrent(currentKw);

        let chargeResponse;
        if (excessSuggestion.suggestion.mode === "charge")
            chargeResponse = await goe.setChargingSpeed(currentKw, excessSuggestion.suggestion.kw);
        else if (excessSuggestion.suggestion.mode === "dont_charge")
            chargeResponse = await goe.setChargingSpeed(currentKw, 0);

        return NextResponse.json({
            excessSuggestion,
            goe: {
                currentKw,
                car: goeStatus.car,
                allowedCharging: goeStatus.alw,
                ampere: goeStatus.amp,
                phase: goeStatus.psm,
                phaseAndCurrent
            },
            chargeResponse
        });
    } catch (e) {
        return NextResponse.json({message: "Error on getting RealTimeInfo", e});
    }
}
