"use client";
import {AwattarEntry} from "@/app/interfaces";
import React, {useEffect, useState} from "react";
import {AwattarApi} from "@/app/classes/awattarApi";
import AwattarBar from "@/app/components/awattar/awattarBar";

export default function AwattarPage() {

    const [awattarData, setAwattarData] = useState<AwattarEntry[] | null>([]);
    const [showWithoutTax, setShowWithoutTax] = useState<boolean>(false);

    const changeTaxDisplay = () => {
        setShowWithoutTax(!showWithoutTax);
    }
    
    useEffect(() => {
        AwattarApi.getData({hours: 0, offsetHours: 1}).then(data => setAwattarData(data))

    }, []);
    return (
        <div className="p-4 cursor-pointer" onClick={changeTaxDisplay}>
            <div className="pl-1 pr-3 flex items-center" >
                <h1 className="grow font-medium subpixel-antialiased pb-2">aWATTar prices</h1>
                <span className="text-xs">cent/kWh{showWithoutTax ? ' (w/o tax)': ''}</span>
            </div>
            {awattarData?.map((entry: AwattarEntry, index: number) => (
                <AwattarBar key={index} entry={entry} entries={awattarData} showWithoutTax={showWithoutTax}/>
            ))}
        </div>
    )
}
