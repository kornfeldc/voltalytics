import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManRealTimeInfo, SolarManApi} from "@/app/classes/solarManApi";
import {IUser} from "@/app/classes/db";
import moment from "moment";
import LoadingSpinner from "@/app/components/loadingSpinner";

interface SolarManCardProps {
    user: IUser;
}

export default function SolarManCard({user}: SolarManCardProps) {

    const [realTimeData, setRealTimeData] = useState<ISolarManRealTimeInfo | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        SolarManApi.getRealtimeInfo(user).then(data => {
            setRealTimeData(data);
            setLoading(false);
        })
    }, []);

    const format = (watt: number | null | undefined) => {
        if (!watt) return "0 kW";
        const kw = watt / 1000;
        return `${kw.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})} kW`;
    }

    const getLastUpdateTime = (lastUpdateTime: number | undefined | null): string => {
        if (!lastUpdateTime) return "";
        return moment(lastUpdateTime * 1000).format("DD.MM.YYYY HH:mm");
    }

    const renderLabel = (label: string) => {
        return (<div className="text-xs dark:text-slate-400">{label}</div>);
    }

    const renderRealTimeStat = (
        color: string,
        value: number | undefined | null,
        label: string,
        right = false,
        additionalRenderFunction: JSX.Element | undefined = undefined) => {

        return (
            <div className={right ? "text-right" : ""}>
                <div className={[
                    value ? color : "text-slate-400",
                    !right ? "mr-2" : ""
                ].join(" ")}>
                    {format(value) + (additionalRenderFunction ? additionalRenderFunction : "")}
                </div>
                {renderLabel(label)}
            </div>
        );
    }

    const renderProduction = () => {
        if (!realTimeData) return;
        return renderRealTimeStat("text-blue-600", realTimeData.generationPower, "Production");
    }

    const renderGrid = () => {
        if (!realTimeData) return;
        if (realTimeData.purchasePower)
            return renderRealTimeStat(
                "text-red-600",
                (realTimeData.purchasePower ?? 0) * -1,
                "From Grid",
                true);
        if (realTimeData.gridPower)
            return renderRealTimeStat(
                "text-green-600",
                realTimeData.gridPower,
                "To Grid",
                true);
        return renderRealTimeStat("", 0, "From/To Grid", true);
    }

    const renderBatteryIcon = () => {
        if (!realTimeData) return;
        return (
            <span className="rounded-md bg-green-600 text-white text-xs py-1 px-2">{realTimeData.batterySoc} %</span>
        );
    }

    const renderBattery = () => {
        if (!realTimeData) return;
        if (realTimeData.chargePower)
            return renderRealTimeStat(
                "text-green-600",
                realTimeData.chargePower,
                "Charging Power",
                false,
                renderBatteryIcon());
        if (realTimeData.dischargePower)
            return renderRealTimeStat(
                "text-green-600",
                realTimeData.chargePower,
                "Charging Power",
                false,
                renderBatteryIcon()
            );
        return (<div>
            <div>{renderBatteryIcon()}</div>
            {renderLabel("Battery idle")}
        </div>);
    }

    const renderUsage = () => {
        if (!realTimeData) return;
        return renderRealTimeStat("text-amber-400", realTimeData.usePower, "Usage", true);
    }

    const renderRealtimeContent = () => {
        if (!realTimeData) return null;

        return (
            <div>
                <h2 className="grow text-xs dark:text-slate-300">{getLastUpdateTime(realTimeData.lastUpdateTime)}</h2>
                <div className="w-full flex mb-2 mt-2">
                    <div className="w-1/2">
                        {renderProduction()}
                    </div>
                    <div className="w-1/2">
                        {renderGrid()}
                    </div>
                </div>
                <div className="w-full flex">
                    <div className="w-1/2">
                        {renderBattery()}
                    </div>
                    <div className="w-1/2">
                        {renderUsage()}
                    </div>
                </div>
            </div>
        );
    }

    const renderLoadingOrData = () => {
        if (loading)
            return (
                <div className="text-xs text-slate-300">
                    <LoadingSpinner></LoadingSpinner>
                </div>);
        if (!realTimeData?.success)
            return (<div>error on loading data, please try again</div>)
        return renderRealtimeContent();
    }


    const renderCardBase = () => (
        <div className="cursor-pointer">
            <h1 className="grow font-medium subpixel-antialiased">solarman live data</h1>
            {renderLoadingOrData()}
        </div>);

    return (<Card>{renderCardBase()}</Card>);
}