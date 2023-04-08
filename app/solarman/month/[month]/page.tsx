"use client";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import SolarManStatCard from "@/app/components/solarMan/solarManStatCard";

export default function SolarManMonthPage({params}: { params: any }) {

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

    return (
        <div>
            {renderSolarManCard &&
                <div className="m-4">
                    <SolarManStatCard user={user!} range="month" day={params.month}/>
                </div>}
        </div>
    );
}
