import React from "react";
import {ISolarManRealTimeInfo} from "@/app/classes/solarManApi";
import {
    Battery0Icon,
    Battery100Icon,
    Battery50Icon,
    BoltIcon,
    HomeIcon,
    LightBulbIcon,
    SunIcon
} from "@heroicons/react/24/outline";
import smStyles from "./solarMan.module.css";

interface SolarManLiveDiagramProps {
    realTimeData: ISolarManRealTimeInfo;
    currentPrice: number | undefined;
}

export default function SolarManLiveDiagram({realTimeData, currentPrice}: SolarManLiveDiagramProps) {

    const iconSize = 30;

    const prepareValue = (watt: number | null | undefined): number => {
        if (!watt) return 0;
        let kw = Math.abs(watt / 1000);
        if (Math.abs(kw) <= 0.03) kw = 0;
        return kw;
    }

    const format = (watt: number | null | undefined) => {
        const kw = prepareValue(watt);
        return `${kw.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
    }
    
    const formatCurr = (nr: number|null|undefined): string => {
        if(!nr) return "";
        return `${nr.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
    }

    const renderIcon = (icon: any, color: string) => {
        return (
            <div className={`${color}`}>
                {icon}
            </div>
        );
    }

    const renderLabel = (label: string) => <div className={`${"label"} whitespace-nowrap`}>{label}</div>;

    const renderRealTimeStat = (
        color: string,
        value: number | undefined | null,
        label: string,
        doesAffectCosts: boolean,
        right = false,
        additionalRenderFunction: JSX.Element | undefined = undefined) => {

        return (
            <div className={right ? "text-right mr-2" : "ml-2"}>
                <div className={[
                    value ? color : "text-inactive",
                    smStyles.stat,
                    right ? smStyles.statRight : ""
                ].join(" ")}>
                    <span className={!right ? "mr-2" : ""}>
                        {format(value)}&nbsp;
                        <span className="text-xs">kW</span>
                        {doesAffectCosts && currentPrice
                            ? <span className={"text-s " + (right ? "ml-2" : "mr-2")}>{formatCurr(currentPrice)}&nbsp;c</span> 
                            : <template></template>}
                    </span>
                    {additionalRenderFunction && additionalRenderFunction}
                </div>
                {renderLabel(label)}
            </div>
        );
    }

    const renderCorner = (
        label: string,
        color: string,
        icon: any,
        value: number,
        doesAffectCosts: boolean,
        right = false
    ) => {
        if (prepareValue(value) === 0)
            color = "text-inactive";

        return (
            <div className={["flex", right ? "text-right justify-end" : ""].join(" ")}>
                {right && renderRealTimeStat(color, value, label, doesAffectCosts, right)}
                {renderIcon(icon, color)}
                {!right && renderRealTimeStat(color, value, label, doesAffectCosts, right)}
            </div>
        );
    }

    const renderProduction = () => {
        return renderCorner("Production", "text-neutral", <SunIcon width={iconSize}
                                                                   height={iconSize}/>, realTimeData.generationPower ?? 0, false);
    }

    const renderGrid = () => {
        if (prepareValue(realTimeData.purchasePower))
            return renderCorner("From Grid", "text-negative", <BoltIcon width={iconSize}
                                                                        height={iconSize}/>, realTimeData.purchasePower ?? 0, true, true);
        if (prepareValue(realTimeData.gridPower))
            return renderCorner("To Grid", "text-positive", <BoltIcon width={iconSize}
                                                                      height={iconSize}/>, realTimeData.gridPower ?? 0, false, true);
        return renderCorner("Grid", "", <BoltIcon width={iconSize} height={iconSize}/>, 0, false, true);
    }

    const getBatteryColor = (percentage: number) => (
        percentage >= 80 ? smStyles.batteryFull :
            percentage >= 50 ? smStyles.batteryMedium :
                percentage >= 25 ? smStyles.batteryLow :
                    smStyles.batteryEmpty
    );

    const renderBatteryIcon = () => {
        if (!realTimeData) return;
        const rotation = "transform rotate-[-90deg]";
        const icon =
            (realTimeData.batterySoc ?? 0) >= 80
                ? <Battery100Icon width={iconSize} height={iconSize} className={rotation}/>
                : (realTimeData.batterySoc ?? 0) >= 30
                    ? <Battery50Icon width={iconSize} height={iconSize} className={rotation}/>
                    : <Battery0Icon width={iconSize} height={iconSize} className={rotation}/>;

        const color = "";// getBatteryColor(realTimeData.batterySoc ?? 0);

        return (
            <div className={"flex flex-col justify-center"}>
                {renderIcon(icon, color)}
                <span className={[color, "text-xs text-center"].join(" ")}>{realTimeData.batterySoc}%</span>
            </div>
        );
    }

    const renderBattery = () => {
        if (prepareValue(realTimeData.chargePower))
            return renderCorner("Charging Battery", "text-positive", renderBatteryIcon(), realTimeData.chargePower ?? 0, false);
        if (prepareValue(realTimeData.dischargePower))
            return renderCorner("Discharging Battery", "text-neutral2", renderBatteryIcon(), realTimeData.dischargePower ?? 0, false);
        return renderCorner("Battery", "", renderBatteryIcon(), 0, false);
    }

    const renderUsage = () => {
        return renderCorner("Usage", "text-warning", <LightBulbIcon width={iconSize}
                                                                    height={iconSize}/>, realTimeData.usePower ?? 0, false, true);
    }

    const renderHouse = () => {
        return (
            <div className={"flex justify-center items-center"}>
                {renderIcon(<HomeIcon width={iconSize} height={iconSize}></HomeIcon>, "text-inactive")}
            </div>
        );
    }

    const renderFlow = (
        color: string,
        topClass: string,
        bottomClass: string,
        topDot: string,
        bottomDot: string) => {
        return (<div className="flex h-5">
            <div className="relative w-full">
                <div className={["line absolute", topClass, color].join(" ")}>
                    <div className={["dot z-10 w-2 h-2 bg-amber-300 absolute rounded-full", topDot].join(" ")}></div>
                </div>
                <div className={["line absolute", bottomClass, color].join(" ")}>
                    <div className={["dot z-10 w-2 h-2 bg-amber-300 absolute rounded-full", bottomDot].join(" ")}></div>
                </div>
            </div>
        </div>);
    }

    const renderProductionFlow = () => {

        const animate =
            prepareValue(realTimeData.generationPower ?? 0) > 0
                ? smStyles.animateLeftToRight
                : "hidden";

        return renderFlow(
            "bg-slate-500",
            "left-[18px] w-1 h-4",
            "top-4 left-[18px] w-full h-1",
            "hidden",
            "top-[-2px] left-[-2px] " + animate
        );
    }

    const renderGridFlow = () => {

        const animate =
            prepareValue(realTimeData.purchasePower ?? 0) > 0
                ? smStyles.animateRightToLeft
                : prepareValue(realTimeData.gridPower ?? 0) > 0
                    ? smStyles.animateLeftToRight
                    : "hidden";

        return renderFlow(
            "bg-slate-500",
            "right-[18px] w-1 h-4",
            "top-4 right-[18px] w-full h-1",
            "hidden",
            "top-[-2px] right-[-2px] " + animate,
        );
    }

    const renderBatteryFlow = () => {

        const animate =
            prepareValue(realTimeData.chargePower ?? 0) > 0
                ? smStyles.animateRightToLeft
                : prepareValue(realTimeData.dischargePower ?? 0) > 0
                    ? smStyles.animateLeftToRight
                    : "hidden";

        return renderFlow(
            "bg-slate-500",
            "top-2 left-[18px] w-full h-1",
            "top-2 left-[18px] w-1 h-5",
            "top-[-2px] left-[-2px] " + animate,
            "hidden"
        );
    }

    const renderUsageFlow = () => {

        const animate = prepareValue(realTimeData.usePower)
            ? smStyles.animateLeftToRight
            : "hidden";

        return renderFlow(
            "bg-slate-500",
            "top-2 right-[18px] w-full h-1",
            "top-2 right-[18px] w-1 h-5 pb-5",
            "top-[-2px] right-[-2px] " + animate,
            "hidden"
        );
    }

    return (
        <div>
            <div className={"grid grid-cols-3"}>
                <div>{renderProduction()}</div>
                <div></div>
                <div>{renderGrid()}</div>

                <div>{renderProductionFlow()}</div>
                <div className={"row-span-2 flex align-middle justify-center"}>{renderHouse()}</div>
                <div>{renderGridFlow()}</div>
                <div>{renderBatteryFlow()}</div>
                <div>{renderUsageFlow()}</div>

                <div className={"mt-3"}>{renderBattery()}</div>
                <div></div>
                <div className={"mt-3"}>{renderUsage()}</div>
            </div>
        </div>);
}
