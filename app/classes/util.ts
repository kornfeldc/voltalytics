import moment from "moment";

export class Util {

    static numberFormat(number: number): string {
        return number.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    static getFormattedTime(time: any, startOnly = false): string {
        const timestamp = moment(time).startOf("hour");
        const part1 = `${timestamp.format("HH:mm")}`;
        if (startOnly) return part1;
        return `${part1} - ${timestamp.add(1, "hours").format("HH:mm")}`;
    }

    static isPast(time: any): boolean {
        return moment(time).startOf("hour").isBefore(moment().startOf("hour"));
    }

    static isNow(time: any): boolean {
        return moment(time).startOf("hour").format("HH") === moment().startOf("hour").format("HH");
    }
}