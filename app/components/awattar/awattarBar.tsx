import {AwattarEntry} from "@/app/interfaces";
import {Util} from "@/app/classes/util";
import moment from "moment";

export default function AwattarBar({entry, entries, showWithoutTax}: {
    entry: AwattarEntry,
    entries: Array<AwattarEntry>,
    showWithoutTax: boolean
}) {

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

        // add a spacer when a new day begins
        const index = entries.findIndex(x => JSON.stringify(x) === JSON.stringify(entry));
        if (index !== 0 && moment(entry.time).format("HH") === "00")
            ret += " mt-6";

        return ret;
    }

    const getTimeClass = (): string => {
        let ret = `pl-2 rounded-md bg-gradient-to-r`;
        //ret += " from-blue-200 to-indigo-300";
        //ret += " from-indigo-200 to-violet-300";
        ret += " from-indigo-300 via-purple-300 to-pink-400";
        ret += " dark:from-indigo-500 dark:via-purple-500 dark:to-rose-400";
        return ret;
    }

    const getTimePercentage = (): number => {
        return entriesWithRange?.find(e => e.entry.grossPrice === entry.grossPrice)?.range ?? 0;
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
            <div className="text-right"
                 style={{width: "3em"}}>{Util.numberFormat(showWithoutTax ? entry.netPrice : entry.grossPrice)}</div>
        </div>
    );
}
