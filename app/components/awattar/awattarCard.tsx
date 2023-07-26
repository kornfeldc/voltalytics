import AwattarLine from "@/app/components/awattar/awattarLine";
import Card from "@/app/components/card";
import {AwattarEntry} from "@/app/interfaces";
import React, {useEffect, useState} from "react";
import {AwattarApi} from "@/app/classes/awattarApi";
import LoadingSpinner from "@/app/components/loadingSpinner";

export default function AwattarCard() {

    const [awattarData, setAwattarData] = useState<AwattarEntry[] | null>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        alert("start getting data");
        AwattarApi.getData({hours: 3}).then(data => {
            alert("finished");
            setAwattarData(data);
            setLoading(false);
        })
    }, []);

    return (
        <Card>
            <div className="cursor-pointer">
                <div className="flex items-center">
                    <h1 className="pb-2">aWATTar prices</h1>
                    <span className="text-xs">cent/kWh</span>
                </div>
                {loading && (
                    <div className="text-sm text-slate-300 mt-1">
                        <LoadingSpinner text="Loading aWATTar data ..."></LoadingSpinner>
                    </div>
                )}
                {!loading && awattarData?.map((entry: AwattarEntry, index: number) => (
                    <AwattarLine key={index} entry={entry} entries={awattarData}/>
                ))}
            </div>
        </Card>
    );
}