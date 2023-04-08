"use client";
import AwattarCard from "@/app/components/awattar/awattarCard";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import PullToRefresh from "@/app/components/pullToRefresh";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import SolarManCard from "@/app/components/solarMan/solarManCard";
import SolarManStatCard from "@/app/components/solarMan/solarManStatCard";


export default function DashboardPage() {
    const router = useRouter();
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

    const gotoAwattar = () => {
        router.push("/awattar");
    }

    return (
        <div className="p-4">
            <PullToRefresh></PullToRefresh>
            {renderSolarManCard &&
                <div className="mb-4">
                    <SolarManCard user={user!}/>
                </div>}
            {renderSolarManCard &&
                <div className="mb-4">
                    <SolarManStatCard user={user!}/>
                </div>}
            <div className="mb-4" onClick={gotoAwattar}>
                <AwattarCard/>
            </div>
        </div>
    )
}
