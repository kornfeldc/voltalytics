"use client";
import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {IUser} from "@/app/classes/db";
import LoadingSpinner from "@/app/components/loadingSpinner";
import {ArrowPathIcon} from "@heroicons/react/24/solid";

interface GoECardProps {
    user: IUser;
}

export default function GoERealTimeCard({user}: GoECardProps) {

    const [goEStatus, setGoEStatus] = useState<any | undefined>();
    const [loading, setLoading] = useState(true);

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
    
    const setChargingSpeed = () => {
        window.open("/api/goe/status/"+user.hash);
    } 

    const renderGoEStatus = () => {
        if (!goEStatus) return null;
        const currentKw = goEStatus.goe?.currentKw ?? 0;
        if(currentKw === 0)
            return (<div className={"text-sm text-slate-400"}>not charging</div>);

        return (
            <div>
                Charging with <span className={"text-lg text-pink-400"}>{goEStatus.goe.currentKw} kw</span>
                {goEStatus.excessSuggestion.suggestion.mode === "charge" &&  
                    <div>Suggestion: {goEStatus.excessSuggestion.suggestion.mode} with {goEStatus.excessSuggestion.suggestion.kw} kw</div>
                }
                {goEStatus.excessSuggestion.suggestion.mode === "dont_charge" &&
                    <div>Suggestion: Don't Charge</div>
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
                   <ArrowPathIcon width={30} height={30} className={"text-pink-400"} onClick={setChargingSpeed}/> 
                </div> 
            </div>
        </div>);

    return (<Card>{renderCardBase()}</Card>);
}