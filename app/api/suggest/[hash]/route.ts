// app/api/data/route.ts

import {NextResponse} from 'next/server';
import {Db} from "@/app/classes/db";
import {SolarManApi} from "@/app/classes/solarManApi";

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
        const suggestion = await SolarManApi.getExcessChargeSuggestion(fetchedUser);
        return NextResponse.json(suggestion);
    } catch (e) {
        return NextResponse.json({message: "Error on getting RealTimeInfo"});
    }
}
