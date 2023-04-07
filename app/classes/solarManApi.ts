import {IUser} from "@/app/classes/db";

export interface ISolarManRealTimeInfo {
    success: boolean | null;
    lastUpdateTime: number | null;
    batterySoc: number | null;
    generationPower: number | null;
    usePower: number | null;
    gridPower: number | null;
    purchasePower: number | null;
    wirePower: number | null;
    chargePower: number | null;
    dischargePower: number | null;
    batteryPower: number | null;
    generationTotal: number | null;
}

export class SolarManApi {
    static solarManUrl = "/api/proxy";
    
    static async getToken(user: IUser): Promise<string | undefined> {
        const url = `${this.solarManUrl}/account/v1.0/token?appId=${user.solarManAppId}`;
        const body = {
            appSecret: user.solarManAppSecret,
            email: user.solarManAppEmail,
            password: user.solarManAppPw
        };
        
        const bodyData = JSON.stringify(body);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: bodyData
        });

        if (!response.ok) return;

        const result = await response.json();
        return result.access_token;
    }

    static async getStationId(user: IUser, token: string | undefined = undefined): Promise<number | undefined> {
        token = token ?? await this.getToken(user);
        if (!token) return;

        const body = {
            appSecret: user.solarManAppSecret,
            email: user.solarManAppEmail,
            password: user.solarManAppPw
        };

        const bodyData = JSON.stringify(body);
        
        const url = `${this.solarManUrl}/station/v1.0/list`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: bodyData
        });

        if (!response.ok) return;

        const result = await response.json();
        const stationList = result?.stationList ?? [];
        if (stationList.length === 0) return;
        return stationList[0].id;
    }

    static async getRealtimeInfo(user: IUser): Promise<ISolarManRealTimeInfo | undefined> {
        const token = await this.getToken(user);
        if (!token) return;

        const stationId = await this.getStationId(user, token);
        if (!stationId) return;

        const url = `${this.solarManUrl}/station/v1.0/realTime?language=en`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({stationId})
        });

        if (!response.ok) return;

        const result = await response.json();
        if (!result?.requestId) return;

        return result as ISolarManRealTimeInfo;
    }
}