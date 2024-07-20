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
    const forceStop = url.searchParams.get('forceStop');

    let fetchedUser;
    try {
        fetchedUser = await Db.getUserByHash(hash);
        if (!fetchedUser) return NextResponse.json({message: "No user"});
        if (!fetchedUser.goEApiToken) return NextResponse.json({message: "No go e api token"});
        if (!fetchedUser.goESerial) return NextResponse.json({message: "No go e serial nr"});
        if (!fetchedUser.goEIsOn) return NextResponse.json({message: "No go e integration"});
        if (!fetchedUser.solarManLastAccessToken) return NextResponse.json({message: "No solarMan access token"});
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

        currentLine = "determine set speed";
        let chargeResponse = {} as any;
        if (mode !== "readonly") {
            if (forceStop === "1" || excessSuggestion.suggestion.mode === "dont_charge") {
                currentLine = `dont_charge (forceStop ${forceStop} )`;
                chargeResponse = await goe.setChargingSpeed(0, 0);
            }
            else if (excessSuggestion.suggestion.mode === "charge") {
                currentLine = "turn charge on current " + currentKw + ", suggestion "+excessSuggestion.suggestion.kw;
                chargeResponse = await goe.setChargingSpeed(currentKw, excessSuggestion.suggestion.kw);
            }
        }

        return NextResponse.json({
            mode,
            forceStop, 
            currentLine,
            excessSuggestion,
            goe: {
                currentKw,
                car: goeStatus.car,
                allowedCharging: goeStatus.alw,
                ampere: goeStatus.amp,
                phase: goeStatus.psm,
                phaseAndCurrent
            },
            response: {
                chargeResponse
            } 
        });
    } catch (e) {
        return NextResponse.json({message: "Error on getting RealTimeInfo", e, currentLine});
    }
}
