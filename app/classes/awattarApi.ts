import {AwattarEntry} from "@/app/interfaces";
import moment, {max} from "moment";
import {ST} from "next/dist/shared/lib/utils";

export class AwattarApi {
    static async getData({ hours = 5, offsetHours = 1 } = {}): Promise<Array<AwattarEntry> | null> {
        const startMoment = moment().startOf("hour").add(offsetHours*-1,'hours');
        const start = (startMoment.unix()*1000);

        let key = `awd_${start}`;
        
        let url = `https://api.awattar.at/v1/marketdata?start=${start}`;
        if(hours > 0) {
            const end = startMoment.add(hours, 'hours').unix()*1000; 
            url += `&end=${end}`;
            key += `_${end}`;
        }
       
        const storedData = this.getDataFromStorage(key);
        if(storedData?.length > 0)
            return storedData;
        
        const res = await fetch(url);
        if (res.ok) {
            const data =  AwattarApi.parseResponse(await res.json());
            this.saveDataToStorate(key, data);
            return data;
        }
            
        return [];
    }
    
    static saveDataToStorate(key: string, data: Array<AwattarEntry>) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    
    static getDataFromStorage(key: string): Array<AwattarEntry> {
        const content = localStorage.getItem(key);
        if(!content)
            return [];
        return JSON.parse(content) as Array<AwattarEntry>;
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

}