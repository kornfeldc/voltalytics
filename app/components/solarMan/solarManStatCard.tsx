import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManStatInfo, ISolarManStationDataItem, SolarManApi} from "@/app/classes/solarManApi";
import {IUser} from "@/app/classes/db";
import LoadingSpinner from "@/app/components/loadingSpinner";
import smStyles from "@/app/components/solarMan/solarManCard.module.css";
import globalStyles from "@/app/globals.module.css";
import moment from "moment";

interface SolarManStatCardProps {
    user: IUser;
    range?: "day" | "month";
    day?: string;
}

export default function SolarManStatCard({user, range = "day", day = moment().format("YYYY-MM-DD")}: SolarManStatCardProps) {

    const [isSuccess, setIsSuccess] = useState(false);
    const [statData, setStatData] = useState<ISolarManStationDataItem | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        SolarManApi.getStatistics(user, day, range).then(data => {
            setIsSuccess(data?.success ?? false);
            if(data?.stationDataItems?.length ?? 0 > 0)
                setStatData(data!.stationDataItems![0]);
            else
               setStatData({} as ISolarManStationDataItem);
            setLoading(false);
        })
    }, [user]);

    const format = (kw: number | null | undefined) => {
        return `${(kw ?? 0).toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
    }
    const renderLabel = (label: string) => <div className={globalStyles.label}>{label}</div>;

    const renderStatValue = (
        color: string,
        value: number | undefined | null,
        label: string,
        right = false) => {

        return (
            <div className={right ? "text-right" : ""}>
                <div className={[
                    value ? color : smStyles.color0,
                    smStyles.stat,
                    right ? smStyles.statRight : ""
                ].join(" ")}>
                    <span className={!right ? "mr-2" : ""}>{format(value)} <span className="text-xs">kW</span></span>
                </div>
                {renderLabel(label)}
            </div>
        );
    }
    
    const renderProduction = () => {
        return renderStatValue(smStyles.colorProduction, statData?.generationValue, "Production");
    }

    const renderUsage = () => {
        return renderStatValue(smStyles.colorUsage, statData?.useValue, "Usage", true);
    }
    
    const renderBattery = () => {
        return renderStatValue(smStyles.colorCharging, statData?.dischargeValue, "From Battery");
    };
    
    const renderGrid = () => {
        return renderStatValue(smStyles.colorFromGrid, statData?.buyValue, "From Grid", true);
    }
    
    
    const renderContent = () => {
        if (!statData) return null;

        return (
            <div className={smStyles.grid}>
                <div>
                    <div>{renderProduction()}</div>
                    <div>{renderGrid()}</div>
                </div>
                <div>
                    <div>{renderBattery()}</div>
                    <div>{renderUsage()}</div>
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
        if (!isSuccess)
            return (<div>error on loading data, please try again</div>)
        return renderContent();
    }
    
    const getTimeSpan = (): string => {
        if(range === "day") {
            if(moment(day).isSame(moment().startOf("day")))
                return "TODAY";
            return moment(day).format("DD.MM.YYYY");
        }
        else if(range === "month") {
            if(moment(day).isSame(moment().startOf("day")))
                return "THIS MONTH";
            return moment(day).format("MMMM YYYY");
        }
        return "todo";
    }
    
    const renderCardBase = () => (
        <div className="cursor-pointer">
            <h1>{getTimeSpan()}</h1>
            {renderLoadingOrData()}
        </div>);

    return (<Card>{renderCardBase()}</Card>);
}