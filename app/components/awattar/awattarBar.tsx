import {AwattarEntry} from "@/app/interfaces";
import {AwattarApi} from "@/app/classes/awattarApi";

export default function AwattarBar({entry, entries}: { entry: AwattarEntry, entries: Array<AwattarEntry> }) {

    const getEntriesWithRange = () => {
        const prices = entries.map(e => e.grossPrice);
        const maxValue = Math.max(...prices);
        const minValue = Math.min(...prices);

        // Step 2: calculate the range
        const range = maxValue-minValue;

        // Step 3: calculate the interval size
        const interval = range / 99;

        // Step 4: create a new array and assign each value to a number between 1 and 12
        const result = [];
        for (let i = 0; i < entries.length; i++) {
            const grossPrice = entries[i].grossPrice;
            const index = Math.floor((grossPrice - minValue) / interval);
            result.push({ entry: entries[i], range: index + 1});
        }

        // Step 5: return the new array
        console.log("entrieswithRange",result);
        return result;
    }
    
    const entriesWithRange = getEntriesWithRange();
    
    const getClass = (): string => {
        let ret = "m-1 my-2 pr-3 border rounded-md";
        ret += " border-indigo-200 text-slate-800";
        ret += " dark:border-indigo-950 dark:text-gray-200";
        if (AwattarApi.isNow(entry))
            ret += " font-medium text-xl";
        return ret;
    }
    
    const getTimeClass = (): string => {
        let ret = `pl-2 rounded-md bg-gradient-to-r`;
        ret += " from-blue-200 to-indigo-300";
        ret += " dark:from-indigo-500 dark:to-pink-400";
        return ret;
    }

    const getTimePercentage = (): number => {
        return entriesWithRange?.find(e => e.entry.grossPrice === entry.grossPrice)?.range ?? 1
    }

    const format = (number: number): string => {
        return number.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    return (
        <div className={[
            "flex",
            getClass()
        ].join(' ')}>
            <div className="grow">
                <div 
                    style={{width: getTimePercentage()+"%", minWidth: "0.1em" }}
                    className={["", getTimeClass()].join(' ')}>
                    {AwattarApi.getFormattedTime(entry, true)}
                </div>
            </div>
            <div className="text-right" style={{width:"3em"}}>{format(entry.grossPrice)}</div>
        </div>
    );
}
