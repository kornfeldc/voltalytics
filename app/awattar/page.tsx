"use client";
import {AwattarEntry} from "@/app/interfaces";
import React, {useEffect, useState} from "react";
import {AwattarApi} from "@/app/classes/awattarApi";
import AwattarBar from "@/app/components/awattar/awattarBar";

export default function AwattarPage() {

    const [awattarData, setAwattarData] = useState<AwattarEntry[] | null>([]);

    useEffect(() => {
        AwattarApi.getData({hours: 0, offsetHours: 1}).then(data => setAwattarData(data))

    }, []);
    return (
        <div className="p-4">
            {awattarData?.map((entry: AwattarEntry, index: number) => (
                <AwattarBar key={index} entry={entry} entries={awattarData}/>
            ))}
        </div>
    )
}
