import AwattarLine from "@/app/components/awattar/awattarLine";
import Card from "@/app/components/card";
import {AwattarEntry} from "@/app/interfaces";
import React, {useEffect, useState} from "react";
import {AwattarApi} from "@/app/classes/awattarApi";

export default function AwattarCard() {

    const [awattarData, setAwattarData] = useState<AwattarEntry[] | null>([]);

    useEffect(() => {
        AwattarApi.getData().then(data => setAwattarData(data))
    }, []);

    return (
        <Card>
            <div className="cursor-pointer">
                <div className="flex items-center">
                    <h1 className="grow font-medium subpixel-antialiased pb-2">aWATTar prices</h1>
                    <span className="text-xs">cent/kWh</span>
                </div>
                {awattarData?.map((entry: AwattarEntry, index: number) => (
                    <AwattarLine key={index} entry={entry} entries={awattarData}/>
                ))}
            </div>
        </Card>
    );
}