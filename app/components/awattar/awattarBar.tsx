import {AwattarEntry} from "@/app/interfaces";
import {Util} from "@/app/classes/util";

export default function AwattarBar({entry, entries}: { entry: AwattarEntry, entries: Array<AwattarEntry> }) {

    const prices = entries.map(e => e.grossPrice);
    const maxValue = Math.max(...prices);
    const minValue = Math.min(...prices);
    const interval = (maxValue - minValue) / 99;

    const entriesWithRange = entries.map(entry => {
        const index = Math.floor((entry.grossPrice - minValue) / interval);
        return {entry, range: index + 1};
    });

    const getClass = (): string => {
        let ret = "m-1 my-2 pr-3 border rounded-md";
        ret += " border-indigo-200 text-slate-800";
        ret += " dark:border-indigo-950 dark:text-gray-200";
        if (Util.isNow(entry.time))
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


    return (
        <div className={[
            "flex",
            getClass()
        ].join(' ')}>
            <div className="grow">
                <div
                    style={{width: getTimePercentage() + "%", minWidth: "0.1em"}}
                    className={["", getTimeClass()].join(' ')}>
                    {Util.getFormattedTime(entry.time, true)}
                </div>
            </div>
            <div className="text-right" style={{width: "3em"}}>{Util.numberFormat(entry.grossPrice)}</div>
        </div>
    );
}
