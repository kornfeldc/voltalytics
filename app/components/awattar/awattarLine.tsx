import {AwattarEntry} from "@/app/interfaces";
import {Util} from "@/app/classes/util";

export default function AwattarLine({entry, entries}: { entry: AwattarEntry, entries: Array<AwattarEntry> }) {

    const getClass = (entry: AwattarEntry): string => {
        if (Util.isNow(entry.time))
            return "text-indigo-500 dark:text-indigo-300 py-2 font-medium text-lg";
        if (Util.isPast(entry.time))
            return "text-gray-500 dark:text-gray-400";
        return "";
    }

    return (
        <div className={[
            "flex",
            getClass(entry)
        ].join(' ')}>
            <div className="grow">{Util.getFormattedTime(entry.time)}</div>
            <div className="">{Util.numberFormat(entry.grossPrice)}</div>
        </div>
    );
}