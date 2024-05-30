"use client";
import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {Db, IUser} from "@/app/classes/db";
import LoadingSpinner from "@/app/components/loadingSpinner";
import {ArrowPathIcon, StopIcon} from "@heroicons/react/24/solid";
import {PlayIcon} from "@heroicons/react/20/solid";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {is} from "@babel/types";

interface GoECardProps {
    user: IUser;
}

export default function GoERealTimeCard({user}: GoECardProps) {
    const {data: session} = useSession();
    const [goEStatus, setGoEStatus] = useState<any | undefined>();
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        const url = "/api/goe/status/" + user.hash + "?mode=readonly";
        fetch(url).then(response => {
            if (response.ok)
                response.json().then(data => {
                    setGoEStatus(data);
                    setLoading(false);
                });
            else
                setLoading(false);
        });
    }, [user]);

    const setChargingSpeed = async (forceStop = false) => {
        setLoading(true);
        let url =  "/api/goe/status/" + user.hash;
        if(forceStop)
            url+="?forceStop=1"
        
        const response = await fetch(url);
        if (!response.ok) {
            setLoading(false);
            alert("Failed");
            return;
        }
        
        if (response.ok) {
            const data = await response.json();
            alert(JSON.stringify(data));
        }
        
        setTimeout(()=> {
            window.location.reload();
        },1000);
    }

    const enableExcessCharging = async (isOn: boolean) => {
        if (!user || !session) return;
        setLoading(true);
        await Db.saveUser(session, {...user, chargeWithExcessIsOn: isOn});
        await setChargingSpeed(!isOn);
    }

    const renderGoEStatus = () => {
        if (!goEStatus) return null;
        const car = goEStatus.goe?.car ?? 0;
        if (!car)
            return <div className={"text-sm text-slate-400"}>No car</div>;

        const currentKw = goEStatus.goe?.currentKw ?? 0;

        return (
            <div>
                {currentKw === 0 && <div className={"text-sm text-slate-400"}>not charging</div>}
                {currentKw > 0 && <span>charging with <span
                    className={"text-lg text-pink-400"}>{goEStatus.goe.currentKw} kw</span></span>}

                {goEStatus.excessSuggestion.suggestion.mode === "charge" &&
                    <div>suggestion: {goEStatus.excessSuggestion.suggestion.mode} with {goEStatus.excessSuggestion.suggestion.kw} kw</div>
                }
                {goEStatus.excessSuggestion.suggestion.mode === "dont_charge" &&
                    <div>suggestion: do not charge</div>
                }
            </div>
        );
    }

    const renderLoadingOrData = () => {
        if (loading)
            return (
                <div className="text-sm text-slate-300 mt-1">
                    <LoadingSpinner text="Loading wallbox data ..."></LoadingSpinner>
                </div>);
        if (!goEStatus)
            return (<div>error on loading data, please try again</div>)
        return renderGoEStatus();
    }


    const renderCardBase = () => (
        <div className="cursor-pointer">
            <div className={"flex"}>
                <div className={"flex flex-col grow"}>
                    <h1>go-e live data</h1>
                    {renderLoadingOrData()}
                </div>
                <div>
                    <ArrowPathIcon width={30} height={30} className={"text-pink-400 mb-4"} onClick={()=> setChargingSpeed()}/>
                    {!loading && user.chargeWithExcessIsOn &&
                        <StopIcon width={30} height={30} className={"text-red-400"}
                                  onClick={() => enableExcessCharging(false)}/>
                    }
                    {!loading && !user.chargeWithExcessIsOn &&
                        <PlayIcon width={30} height={30} className={"text-green-400"}
                                  onClick={() => enableExcessCharging(true)}/>
                    }
                </div>
            </div>
        </div>);

    return (<Card>{renderCardBase()}</Card>);
}