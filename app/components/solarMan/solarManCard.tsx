import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManRealTimeInfo, SolarManApi} from "@/app/classes/solarManApi";
import {IUser} from "@/app/classes/db";
import moment from "moment";
import LoadingSpinner from "@/app/components/loadingSpinner";
import smStyles from "./solarManCard.module.css";
import globalStyles from "../../globals.module.css";

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
    }, [user]);

    const prepareValue = (watt: number | null | undefined): number => {
        if (!watt) return 0;
        let kw = watt / 1000;
        if (Math.abs(kw) <= 0.03) kw = 0;
        return kw;
    }

    const format = (watt: number | null | undefined) => {
        const kw = prepareValue(watt);
        return `${kw.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
    }

    const getLastUpdateTime = (lastUpdateTime: number | undefined | null): string => {
        if (!lastUpdateTime) return "";
        return moment(lastUpdateTime * 1000).format("DD.MM.YYYY HH:mm");
    }

    const renderLabel = (label: string) => <div className={globalStyles.label}>{label}</div>;

    const renderRealTimeStat = (
        color: string,
        value: number | undefined | null,
        label: string,
        right = false,
        additionalRenderFunction: JSX.Element | undefined = undefined) => {

        return (
            <div className={right ? "text-right" : ""}>
                <div className={[
                    value ? color : "text-inactive",
                    smStyles.stat,
                    right ? smStyles.statRight : ""
                ].join(" ")}>
                    <span className={!right ? "mr-2" : ""}>{format(value)}&nbsp;<span className="text-xs">kWh</span></span>
                    {additionalRenderFunction && additionalRenderFunction}
                </div>
                {renderLabel(label)}
            </div>
        );
    }

    const renderProduction = (right = false) => {
        if (!realTimeData) return;
        return renderRealTimeStat("text-neutral", realTimeData.generationPower, "Production", right);
    }

    const renderGrid = (right = false) => {
        if (!realTimeData) return;
        if (prepareValue(realTimeData.purchasePower))
            return renderRealTimeStat(
                "text-negative",
                Math.abs(realTimeData.purchasePower ?? 0),
                "From Grid",
                right);
        if (prepareValue(realTimeData.gridPower))
            return renderRealTimeStat(
                "text-positive",
                realTimeData.gridPower,
                "To Grid",
                right);
        return renderRealTimeStat("", 0, "Grid", true);
    }

    const getBatteryColor = (percentage: number) => (
        percentage >= 80 ? smStyles.batteryFull :
            percentage >= 50 ? smStyles.batteryMedium :
                percentage >= 25 ? smStyles.batteryLow :
                    smStyles.batteryEmpty
    );

    const renderBatteryIcon = () => {
        if (!realTimeData) return;
        return (
            <span className={[
                smStyles.battery,
                getBatteryColor(realTimeData.batterySoc ?? 0)
            ].join(" ")}>{realTimeData.batterySoc} %</span>
        );
    }

    const renderBattery = (right = false) => {
        if (!realTimeData) return;
        if (prepareValue(realTimeData.dischargePower))
            return renderRealTimeStat(
                "text-neutral2",
                Math.abs(realTimeData.dischargePower ?? 0),
                "Discharging Battery",
                right,
                renderBatteryIcon()
            );
        if (prepareValue(realTimeData.chargePower))
            return renderRealTimeStat(
                "text-positive",
                Math.abs(realTimeData.chargePower ?? 0),
                "Charging Battery",
                right,
                renderBatteryIcon());
        return (<div>
            <div>{renderBatteryIcon()}</div>
            {renderLabel("Battery idle")}
        </div>);
    }

    const renderUsage = (right = false) => {
        if (!realTimeData) return;
        return renderRealTimeStat("text-warning", realTimeData.usePower, "Usage", right);
    }

    const renderRealtimeContent = () => {
        if (!realTimeData) return null;

        return (
            <div className={smStyles.grid}>
                <h2>{getLastUpdateTime(realTimeData.lastUpdateTime)}</h2>
                <div>
                    <div>{renderProduction()}</div>
                    <div>{renderGrid(true)}</div>
                </div>
                <div>
                    <div>{renderBattery()}</div>
                    <div>{renderUsage(true)}</div>
                </div>
            </div>
        );
    }

    const renderLoadingOrData = () => {
        if (loading)
            return (
                <div className="text-sm text-slate-300 mt-1">
                    <LoadingSpinner text="Loading inverter data ..."></LoadingSpinner>
                </div>);
        if (!realTimeData?.success)
            return (<div>error on loading data, please try again</div>)
        return renderRealtimeContent();
    }


    const renderCardBase = () => (
        <div className="cursor-pointer">
            <h1>solarman live data</h1>
            {renderLoadingOrData()}
        </div>);

    return (<Card>{renderCardBase()}</Card>);
}