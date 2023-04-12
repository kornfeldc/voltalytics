"use client";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import {ISolarManFrameInfo, SolarManApi} from "@/app/classes/solarManApi";
import SolarManDayChart from "@/app/components/solarMan/solarManDayChart";
import LoadingSpinner from "@/app/components/loadingSpinner";

export default function SolarManDayChartContainer({day, showLegend, showWholeDay}: { day: string, showLegend?: boolean, showWholeDay?: boolean }) {

    const {data: session} = useSession();
    const [user, setUser] = useState<IUser>();
    const [renderSolarManCard, setRenderSolarManCard] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!session) return;
            const fetchedUser = await Db.getUser(session);
            if (fetchedUser) setUser(fetchedUser);
        };

        fetchUser().then(() => {
        });
    }, [session]);

    useEffect(() => {
        if (!user?.solarManIsOn ||
            !user?.solarManAppId ||
            !user?.solarManAppPw ||
            !user?.solarManAppEmail ||
            !user?.solarManAppSecret
        ) return;
        setRenderSolarManCard(true);
    }, [user]);

    const [dayData, setDayData] = useState<ISolarManFrameInfo | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        SolarManApi.getFrameData(user, day).then(data => {
            setDayData(data);
            setLoading(false);
        })
    }, [user, day]);

    return (
        <div>
            {loading && (
                <div className="text-sm text-slate-300 mt-1">
                    <LoadingSpinner text="..."></LoadingSpinner>
                </div>
            )}
            {!loading && renderSolarManCard && (dayData?.stationDataItems?.length ?? 0) > 0 &&
                <SolarManDayChart data={dayData?.stationDataItems!} showLegend={showLegend ?? true} showWholeDay={showWholeDay ?? true}></SolarManDayChart>
            }
        </div>
    );
}
