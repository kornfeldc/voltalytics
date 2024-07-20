import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManRealTimeInfo, SolarManApi} from "@/app/classes/solarManApi";
import {Db, IUser} from "@/app/classes/db";
import moment from "moment";
import LoadingSpinner from "@/app/components/loadingSpinner";
import SolarManLiveDiagram from "@/app/components/solarMan/solarManLiveDiagram";
import SolarManDayChartContainer from "@/app/components/solarMan/solarManDayChartContainer";
import {AwattarApi} from "@/app/classes/awattarApi";
import {session} from "next-auth/core/routes";
import {useSession} from "next-auth/react";

interface SolarManCardProps {
    user: IUser;
}

export default function SolarManRealTimeCard({user}: SolarManCardProps) {

    const {data: session} = useSession();
    const [realTimeData, setRealTimeData] = useState<ISolarManRealTimeInfo | undefined>();
    const [currentPrice, setCurrentPrice] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        SolarManApi.getRealtimeInfo(user).then(data => {
            
            if(session && data?.success && data?.token && data.token !== user.solarManLastAccessToken) {
                user.solarManLastAccessToken = data.token;
                Db.saveUserSolarManToken(session, data.token);
            }
            
            setRealTimeData(data);
            AwattarApi.getCurrentPrice().then(price => {
                setCurrentPrice(price);
                setLoading(false);
            });
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
                <SolarManLiveDiagram realTimeData={realTimeData} currentPrice={currentPrice}></SolarManLiveDiagram>
                <div className={"mt-4"}>
                    <SolarManDayChartContainer day={moment().format("YYYY-MM-DD")} showLegend={false}
                                               showWholeDay={false}></SolarManDayChartContainer>
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