import {AwattarEntry} from "@/app/interfaces";
import {AwattarApi} from "@/app/classes/awattarApi";

export default function AwattarLine({entry, entries}: { entry: AwattarEntry, entries: Array<AwattarEntry> }) {

    const getClass = (entry: AwattarEntry): string => {
        if (AwattarApi.isNow(entry))
            return "text-indigo-500 dark:text-indigo-300 py-2 font-medium text-lg";
        if (AwattarApi.isPast(entry))
            return "text-gray-500 dark:text-gray-400";
        return "";
    }

    const format = (number: number): string => {
        return number.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    return (
        <div className={[
            "flex",
            getClass(entry)
        ].join(' ')}>
            <div className="grow">{AwattarApi.getFormattedTime(entry)}</div>
            <div className="">{format(entry.grossPrice)}</div>
        </div>
    );
}