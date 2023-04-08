"use client";
import {AwattarEntry} from "@/app/interfaces";
import React, {useEffect, useState} from "react";
import {AwattarApi} from "@/app/classes/awattarApi";
import AwattarBar from "@/app/components/awattar/awattarBar";
import PullToRefresh from "@/app/components/pullToRefresh";
import LoadingSpinner from "@/app/components/loadingSpinner";

export default function AwattarPage() {

    const [awattarData, setAwattarData] = useState<AwattarEntry[] | null>([]);
    const [showWithoutTax, setShowWithoutTax] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    const changeTaxDisplay = () => {
        setShowWithoutTax(!showWithoutTax);
    }

    useEffect(() => {
        setLoading(true);
        AwattarApi.getData({hours: 0, offsetHours: 0}).then(data => {
            setAwattarData(data);
            setLoading(false);
        });
    }, []);
    return (
        <div>
            <PullToRefresh></PullToRefresh>
            <div className="p-4 cursor-pointer" onClick={changeTaxDisplay}>
                <div className="pl-1 pr-3 flex items-center">
                    <h1 className="pb-2">aWATTar prices</h1>
                    <span className="text-xs">cent/kWh{showWithoutTax ? ' (w/o tax)' : ''}</span>
                </div>
                {loading && (
                    <div className="text-sm text-slate-300 mt-1">
                        <LoadingSpinner text="Loading aWATTar data ..."></LoadingSpinner>
                    </div>
                )}
                {!loading && awattarData?.map((entry: AwattarEntry, index: number) => (
                    <AwattarBar key={index} entry={entry} entries={awattarData} showWithoutTax={showWithoutTax}/>
                ))}
            </div>
        </div>
    )
}
