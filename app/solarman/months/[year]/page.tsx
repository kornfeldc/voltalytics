"use client";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import SolarManStatCard from "@/app/components/solarMan/solarManStatCard";
import moment from "moment/moment";
import Link from "next/link";

export default function SolarManYearPage({params}: { params: any }) {

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

    let begin = moment(params.year).startOf("year");
    let end = moment(params.year).endOf("year").startOf("day");
    if (end.isAfter(moment().startOf("month")))
        end = moment().startOf("month");

    let months = [];
    let act = moment(end);
    while (act.isSameOrAfter(begin)) {
        months.push(moment(act));
        act = act.add(-1, "months");
    }

    return (
        <div>
            <div className={"pt-4 pl-4 pr-4"}>
                {/*<select className={
                    "bg-gray-50 " +
                    "border border-indigo-300 " +
                    "text-gray-900 text-sm rounded-lg " +
                    "focus:ring-blue-500 " +
                    "focus:border-blue-500 " +
                    "block w-full p-2.5 " +
                    "dark:bg-gray-900 dark:border-gray-800 " +
                    "dark:placeholder-gray-400 dark:text-white " +
                    "dark:focus:ring-blue-500 " +
                    "dark:focus:border-blue-500"}>
                    <option>2023</option>
                    <option>2022</option>
                </select>*/}
            </div>
            {renderSolarManCard &&
                months.map(month => (
                    <div className="m-4" key={month.format("YYYY-MM-DD")}>
                        <Link href={`/solarman/days/${month.format("YYYY-MM-DD")}`}>
                            <SolarManStatCard user={user!} range="month" day={month.format("YYYY-MM-DD")}/>
                        </Link>
                    </div>
                ))
            }
        </div>
    );
}
