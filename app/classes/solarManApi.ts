import {IUser} from "@/app/classes/db";
import {VoltCache} from "@/app/classes/cache";
import moment from "moment";
import {AwattarApi} from "@/app/classes/awattarApi";

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
    token: string | null; 
}

export interface ISolarManPower {
    production: number;
    usage: number;
    purchase: number;
    grid: number;
    excess: number;
    batterySoc: number;
    currentPrice: number|undefined;
}

export interface ISolarManSuggestion {
    mode: "dont_charge" | "no_change" | "charge";
    kw: number;
}

export interface ISolarManExcessSuggestion {
    useChargeWithExcessIsOn: boolean;
    lastUpdate: string;
    minutesOld: number;
    power: ISolarManPower;
    suggestion: ISolarManSuggestion;
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

export const Settings = {
    minChargingPower: 1.5,
    maxChargingPower: 8,
    minMinutesOldForAction: 10,
    minBatterySoc: 25,
    kwWhenBattery: 4.5,
    maxKwFor1Phase: 3
};

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

    static async getRealtimeInfo(user: IUser, force = false): Promise<ISolarManRealTimeInfo | undefined> {
        return await VoltCache.get(
            `solarMan_realTimeData_${this.keyVersion}`,
            user.email,
            60,
            async (): Promise<any> => {
                const token = user.solarManLastAccessToken ?? await this.getToken(user);
                if (!token) return;

                const stationId = await this.getStationId(user, token);
                if (!stationId) return;

                let url = `${this.solarManUrl}/station/v1.0/realTime?language=en`;
                if (force)
                    url += (new Date()).getTime();

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

                result.token = token;
                
                return result as ISolarManRealTimeInfo;
            },
            force
        );
    }

    static async getExcessChargeSuggestion(user: IUser, currentChargingKw = 0): Promise<ISolarManExcessSuggestion | undefined> {
        
        const realTimeInfo = await SolarManApi.getRealtimeInfo(user, true);
        if (!realTimeInfo) throw ("No RealTimeInfo");
        if (!realTimeInfo.lastUpdateTime) throw ("No RealTimeInfo UpdateTime");

        const lastUpdateMoment = moment(realTimeInfo.lastUpdateTime * 1000);
        const minutesOld = moment().diff(lastUpdateMoment, "minutes");
        
        let currentPrice = undefined;
        try {
            currentPrice = await AwattarApi.getCurrentPrice();
        }
        catch(e) {}
        
        let usageWithoutCharge = ((realTimeInfo.usePower ?? 0) / 1000) - currentChargingKw;
        if(usageWithoutCharge < 0)
            usageWithoutCharge = 0;
        const generation = (realTimeInfo.generationPower ?? 0) / 1000;
        const excess = generation - usageWithoutCharge;
        
        const power = {
            production: (realTimeInfo.generationPower ?? 0) / 1000,
            usage: (realTimeInfo.usePower ?? 0) / 1000,
            usageWithoutCharge,
            purchase: (realTimeInfo.purchasePower ?? 0) / 1000,
            grid: (realTimeInfo.gridPower ?? 0) / 1000,
            batterySoc: realTimeInfo.batterySoc ?? 0,
            currentPrice,
            currentChargingKw,
            excess
        } as ISolarManPower

        let suggestion = {
            mode: "dont_charge",
            kw: 0
        } as ISolarManSuggestion;
        
        if(user.forceChargeIsOn && 
            user.forceChargeKw !== undefined &&
            (currentPrice !== undefined && currentPrice <= (user.forceChargeUnderCent ?? 20))) {
           suggestion.mode = "charge";
           suggestion.kw = user.forceChargeKw;
        } else {
            if (minutesOld > Settings.minMinutesOldForAction)
                suggestion.mode = "no_change";
            else if (user.chargeWithExcessIsOn && power.excess > Settings.minChargingPower) {
                suggestion.mode = "charge";
                suggestion.kw = Math.round(power.excess * 10) / 10;
                if (suggestion.kw >= Settings.maxChargingPower)
                    suggestion.kw = Settings.maxChargingPower;
            }

            if (suggestion.mode !== "no_change" &&
                suggestion.kw < Settings.kwWhenBattery &&
                power.batterySoc >= (user.chargeUntilMinBattery ?? Settings.minBatterySoc)) {
                suggestion.mode = "charge";
                suggestion.kw = Settings.kwWhenBattery;
            }

            if(suggestion.mode === "dont_charge" && currentPrice !== undefined && currentPrice <= 0.5) {
                suggestion.mode = "charge";
                if(currentPrice <= -0.5)
                    suggestion.kw = 1.5;
                if(currentPrice <= -1.5)
                    suggestion.kw = 2.5;
                if(currentPrice <= -2.5)
                    suggestion.kw = 3.5;
                if(currentPrice <= -3.5)
                    suggestion.kw = Settings.kwWhenBattery;
            }
        }
        
        if(!user.chargeWithExcessIsOn)
            suggestion.mode = "no_change";

        return {
            useChargeWithExcessIsOn: user.chargeWithExcessIsOn,
            forceChargeIsOn: user.forceChargeIsOn,
            forceChargeKw: user.forceChargeKw,
            forceChargeUnderCent: user.forceChargeUnderCent,
            currentPrice,
            lastUpdate: lastUpdateMoment.format("YYYY-MM-DD HH:mm:ss"),
            minutesOld,
            power,
            suggestion
        } as ISolarManExcessSuggestion;
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