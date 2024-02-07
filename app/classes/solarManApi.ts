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

export interface ISolarManFrameInfo {
    success: boolean | null;
    stationDataItems: Array<ISolarManFrameStationDataItem>;
}

export interface ISolarManFrameStationDataItem {
    generationPower: number | null;
    usePower: number | null;
    gridPower: number | null;
    purchasePower: number | null;
    wirePower: number | null;
    chargePower: number | null;
    dischargePower: number | null;
    batteryPower: number | null;
    batterySoc: number | null;
    dateTime: number | null;
}

export class SolarManApi {
    static solarManUrl = "/api/proxy";
    static keyVersion = 3;

    static async getToken(user: IUser): Promise<string | undefined> {
        return await VoltCache.get(
            `solarMan_token_${this.keyVersion}`,
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
            `solarMan_stationId_${this.keyVersion}`,
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
            `solarMan_realTimeData_${this.keyVersion}`,
            user.email,
            60,
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
        range: "day" | "month" | "year" = "day"
    ): Promise<ISolarManStatInfo | undefined> {

        const isToday = range === "day" && moment(day).isSame(moment(), "day");
        const isYesterday = range === "day" && moment(day).add(-1, "days").isSame(moment(), "day");
        const isThisMonth = range === "month" && moment(day).isSame(moment(), "month");

        let cacheSeconds =
            isToday ? 30 : isYesterday || isThisMonth ? 60 * 5 : 60 * 60 * 24;

        const key = `solarMan_${range}_${day}_${this.keyVersion}`;
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

                if (range === "day") {
                    body.timeType = 2;
                    body.startTime = moment(day).format("YYYY-MM-DD")
                    body.endTime = moment(day).format("YYYY-MM-DD")
                } else if (range === "month") {
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

    static async getFrameData(
        user: IUser,
        day: string = moment().format("YYYY-MM-DD")
    ): Promise<ISolarManFrameInfo | undefined> {

        const isToday = moment(day).isSame(moment(), "day");
        const isYesterday = moment(day).add(-1, "days").isSame(moment(), "day");

        let cacheSeconds =
            isToday ? 30 : isYesterday ? 60 * 5 : 60 * 60 * 24;

        const key = `solarMan_frameData_${day}_${this.keyVersion}`;
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
                    stationId,
                    timeType: 1,
                    startTime: moment(day).format("YYYY-MM-DD"),
                    endTime: moment(day).format("YYYY-MM-DD")
                } as any;

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

                return result as ISolarManFrameInfo;
            }
        );
    }
}