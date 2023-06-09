import moment from "moment";

interface IVoltCacheData {
    obj: any;
    expiresAt: number;
}

export class VoltCache {
    static async get(
        key: string,
        user: string,
        seconds: number,
        promise: () => Promise<any>
    ): Promise<any> {
        const cacheKey = `${key}_${user}`;
        const cachedInfo = localStorage.getItem(cacheKey);

        if (cachedInfo) {
            const {obj, expiresAt} = JSON.parse(cachedInfo);
            if (moment(expiresAt).isAfter(moment())) {
                return obj;
            } else {
                localStorage.removeItem(cacheKey);
            }
        }

        const data = await promise();
        localStorage.setItem(
            cacheKey,
            JSON.stringify({
                obj: data,
                expiresAt: moment().add(seconds,"seconds"),
            })
        );
        return data;
    }
}
