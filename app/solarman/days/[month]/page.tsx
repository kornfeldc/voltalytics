"use client";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import SolarManStatCard from "@/app/components/solarMan/solarManStatCard";
import moment from "moment";

export default function SolarManDayPage({params}: { params: any }) {

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


    let begin = moment(params.month).startOf("month");
    let end = moment(params.month).endOf("month").startOf("day");
    if (end.isAfter(moment().startOf("day")))
        end = moment().startOf("day");

    let days = [];
    let act = moment(end);
    while (act.isSameOrAfter(begin)) {
        days.push(moment(act));
        act = act.add(-1, "days");
    }

    return (
        <div>
            {renderSolarManCard &&
                days.map(day => (
                    <div className="m-4" key={day.format("YYYY-MM-DD")}>
                        <SolarManStatCard user={user!} day={day.format("YYYY-MM-DD")}/>
                    </div>
                ))
            }
        </div>
    );
}
