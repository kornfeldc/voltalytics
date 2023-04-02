import {AwattarEntry} from "@/app/interfaces";
import moment, {max} from "moment";
import {ST} from "next/dist/shared/lib/utils";

export class AwattarApi {
    static async getData({ hours = 5, offsetHours = 2 } = {}): Promise<Array<AwattarEntry> | null> {
        const startMoment = moment().add(offsetHours*-1,'hours');
        const start = (startMoment.unix()*1000);
        let url = `https://api.awattar.at/v1/marketdata?start=${start}`;
        if(hours > 0) {
            const end = startMoment.add(hours, 'hours').unix()*1000; 
            url += "&end="+end;
        }
        
        const res = await fetch(url);
        if (res.ok) 
            return AwattarApi.parseResponse(await res.json());
        return [];
    }

    static parseResponse(response: any): Array<AwattarEntry> {
        return response.data.map((x: any) => {
            return {
                time: moment(x.start_timestamp),
                netPrice: (x.marketprice / 10),
                grossPrice: (x.marketprice / 10) * 1.2
            };
        });
    }

    static isPast(entry: AwattarEntry): boolean {
        return moment(entry.time).startOf("hour").isBefore(moment().startOf("hour"));
    }
    
    static isNow(entry: AwattarEntry): boolean {
        return moment(entry.time).startOf("hour").format("HH") === moment().startOf("hour").format("HH");
    }

    static getFormattedTime(entry: AwattarEntry, startOnly = false): string {
        const timestamp = moment(entry.time).startOf("hour");
        const part1 = `${timestamp.format("HH:mm")}`;
        if(startOnly) return part1; 
        return `${part1} - ${timestamp.add(1, "hours").format("HH:mm")}`;
    }
}