"use client";
import AwattarCard from "@/app/components/awattar/awattarCard";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import PullToRefresh from "@/app/components/pullToRefresh";
import {useSession} from "next-auth/react";
import {Db, IUser} from "@/app/classes/db";
import SolarManRealTimeCard from "@/app/components/solarMan/solarManRealTimeCard";
import SolarManStatCard from "@/app/components/solarMan/solarManStatCard";
import Link from "next/link";
import moment from "moment";
import GoERealTimeCard from "@/app/components/goe/goERealTimeCard";


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
                <div>
                    <div className="mb-4">
                        <SolarManRealTimeCard user={user!}/>
                    </div>
                    {user?.goEIsOn &&

                        <div className="mb-4">
                            <GoERealTimeCard user={user!}/>
                        </div>
                    }
                    <div className="mb-4 flex flex-col min-[410px]:flex-row">
                        <div className="flex-auto min-[410px]:mr-1 max-[409px]:mb-4">
                            <Link href={`/solarman/days/${moment().format("YYYY-MM-DD")}`}>
                                <SolarManStatCard user={user!}/>
                            </Link>
                        </div>
                        <div className="flex-auto min-[410px]:ml-1">
                            <Link href={`/solarman/months/${moment().startOf("month").format("YYYY-MM-DD")}`}>
                                <SolarManStatCard user={user!} range="month" showComma={false}/>
                            </Link>
                        </div>
                    </div>
                </div>
            }
            <div className="mb-4" onClick={gotoAwattar}>
                <AwattarCard/>
            </div>
        </div>
    )
}
