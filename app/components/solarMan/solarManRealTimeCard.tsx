import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManRealTimeInfo, SolarManApi} from "@/app/classes/solarManApi";
import {IUser} from "@/app/classes/db";
import moment from "moment";
import LoadingSpinner from "@/app/components/loadingSpinner";
import SolarManLiveDiagram from "@/app/components/solarMan/solarManLiveDiagram";

interface SolarManCardProps {
    user: IUser;
}

export default function SolarManRealTimeCard({user}: SolarManCardProps) {

    const [realTimeData, setRealTimeData] = useState<ISolarManRealTimeInfo | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        SolarManApi.getRealtimeInfo(user).then(data => {
            setRealTimeData(data);
            setLoading(false);
        })
    }, [user]);

    const getLastUpdateTime = (lastUpdateTime: number | undefined | null): string => {
        if (!lastUpdateTime) return "";
        return moment(lastUpdateTime * 1000).format("DD.MM.YYYY HH:mm");
    }

    const renderRealtimeContent = () => {
        if (!realTimeData) return null;

        return (
            <div>
                <h2 className={"mb-2"}>{getLastUpdateTime(realTimeData.lastUpdateTime)}</h2>
                <SolarManLiveDiagram realTimeData={realTimeData}></SolarManLiveDiagram>
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