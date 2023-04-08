import {IUser} from "@/app/classes/db";
import {VoltCache} from "@/app/classes/cache";
import moment from "moment";

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

export interface ISolarManStatInfo {
    success: boolean | null;
    stationDataItems: Array<ISolarManStationDataItem>;
}

export interface ISolarManStationDataItem {
    generationValue: number | null;
    useValue: number | null;
    gridValue: number | null;
    buyValue: number | null;
    chargeValue: number | null;
    dischargeValue: number | null;
}

export class SolarManApi {
    static solarManUrl = "/api/proxy";

    static async getToken(user: IUser): Promise<string | undefined> {
        return await VoltCache.get(
            "solarMan_token",
            user.email,
            60 * 5 /* 5min */,
            async (): Promise<any> => {

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
            });
    }

    static async getStationId(user: IUser, token: string | undefined = undefined): Promise<number | undefined> {
        return await VoltCache.get(
            "solarMan_stationId",
            user.email,
            999999999,
            async (): Promise<any> => {
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
        );

    }

    static async getRealtimeInfo(user: IUser): Promise<ISolarManRealTimeInfo | undefined> {
        return await VoltCache.get(
            "solarMan_realTimeData",
            user.email,
            30,
            async (): Promise<any> => {
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
        );
    }

    static async getStatistics(
        user: IUser, 
        day: string = moment().format("YYYY-MM-DD"),
        range: "day"|"month"|"year" = "day"
        ): Promise<ISolarManStatInfo | undefined> {
       
        let cacheSeconds = 30;
        if(
            (range === "day" && moment(day).startOf("day").isBefore(moment())) ||
            (range === "month" && moment(day).startOf("month").isBefore(moment().startOf("month"))) ||
            (range === "year" && moment(day).startOf("year").isBefore(moment().startOf("year")))) {
                // past day or past month or past year => values wont change - set a high cache expiration
                cacheSeconds = 999999;
        }    
            
        
        const key = `solarMan_${range}_${day}`;
        return await VoltCache.get(
            key, 
            user.email,
            cacheSeconds,
            async (): Promise<any> => {

                const token = await this.getToken(user);
                if (!token) return;

                const stationId = await this.getStationId(user, token);
                if (!stationId) return;

                const url = `${this.solarManUrl}/station/v1.0/history?language=en`;
                const body = {
                    stationId
                } as any;
                
                if(range === "day") {
                    body.timeType = 2;
                    body.startTime = moment(day).format("YYYY-MM-DD")
                    body.endTime = moment(day).format("YYYY-MM-DD")
                }
                else if(range === "month") {
                    body.timeType = 3;
                    body.startTime = moment(day).format("YYYY-MM")
                    body.endTime = moment(day).format("YYYY-MM")
                }
                
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) return;

                const result = await response.json();
                if (!result?.requestId) return;

                return result as ISolarManStatInfo;
            }
        );
    }
}