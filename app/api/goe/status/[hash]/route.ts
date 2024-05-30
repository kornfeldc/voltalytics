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

    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');

    let fetchedUser;
    try {
        fetchedUser = await Db.getUserByHash(hash);
        if (!fetchedUser) return NextResponse.json({message: "No user"});
        if (!fetchedUser.goEApiToken) return NextResponse.json({message: "No go e api token"});
        if (!fetchedUser.goESerial) return NextResponse.json({message: "No go e serial nr"});
        if (!fetchedUser.goEIsOn) return NextResponse.json({message: "No go e integration"});
    } catch (e) {
        return NextResponse.json({message: "Error on getting user"});
    }

    let currentLine = "";
    try {
        const goe = new GoEApi(fetchedUser.goESerial, fetchedUser.goEApiToken);
        const goeStatus = await goe.getStatus();
        currentLine = "got goeStatus";

        let currentKw = 0;
        try {
            currentKw = (goeStatus?.nrg[11] ?? 0) / 1000;
        } catch {
        }
        currentLine = "got currentKw";

        SolarManApi.solarManUrl = "https://globalapi.solarmanpv.com";
        const excessSuggestion = await SolarManApi.getExcessChargeSuggestion(fetchedUser, currentKw);
        if (!excessSuggestion) return;

        const phaseAndCurrent = goe.getPhaseAndCurrent(currentKw);

        currentLine = "set speed";
        let chargeResponse;
        if (mode !== "readonly") {
            if (excessSuggestion.suggestion.mode === "charge")
                chargeResponse = await goe.setChargingSpeed(currentKw, excessSuggestion.suggestion.kw);
            else if (excessSuggestion.suggestion.mode === "dont_charge")
                chargeResponse = await goe.setChargingSpeed(currentKw, 0);
        }

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
        return NextResponse.json({message: "Error on getting RealTimeInfo", e, currentLine});
    }
}
