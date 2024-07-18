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
        promise: () => Promise<any>,
        force = false
    ): Promise<any> {
        const cacheKey = `${key}_${user}`;
        if (!force) {
            try {
                const cachedInfo = localStorage.getItem(cacheKey);

                if (cachedInfo) {
                    const {obj, expiresAt} = JSON.parse(cachedInfo);
                    if (moment(expiresAt).isAfter(moment())) {
                        return obj;
                    } else {
                        localStorage.removeItem(cacheKey);
                    }
                }
            } catch (e) {
                // if an error occurs - try to remove the cache
                try {
                    localStorage.removeItem(cacheKey);
                } catch (e) {
                    //
                }
            }
        }

        const data = await promise();
        try {
            localStorage.setItem(
                cacheKey,
                JSON.stringify({
                    obj: data,
                    expiresAt: moment().add(seconds, "seconds"),
                })
            );
        } catch (e) {
            if (JSON.stringify(e).indexOf("exceeded") >= 0) {
                // cache is full -> remove all
                localStorage.clear();
            }
        }
        return data;
    }

    static cleanupCache(): void {
        // implement
        localStorage.clear();
    }
}
