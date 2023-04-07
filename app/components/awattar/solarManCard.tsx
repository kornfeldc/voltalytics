import Card from "@/app/components/card";
import React, {useEffect, useState} from "react";
import {ISolarManRealTimeInfo, SolarManApi} from "@/app/classes/solarManApi";
import {IUser} from "@/app/classes/db";
import moment from "moment";

interface SolarManCardProps {
    user: IUser;
}

export default function SolarManCard({user}: SolarManCardProps) {

    const [realTimeData, setRealTimeData] = useState<ISolarManRealTimeInfo | undefined>();

    useEffect(() => {
        SolarManApi.getRealtimeInfo(user).then(data => setRealTimeData(data))
    }, []);

    const format = (watt: number | null | undefined) => {
        if (!watt) return "0 kW";
        const kw = watt / 1000;
        return `${kw.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})} kW`;
    }
    
    const getLastUpdateTime = (lastUpdateTime: number|undefined|null): string => {
        if(!lastUpdateTime) return "";
        return moment(lastUpdateTime*1000).format("DD.MM.YYYY HH:mm");
    }

    if (realTimeData && realTimeData.success)
        return (
            <Card>
                <div className="cursor-pointer">
                    <h1 className="grow font-medium subpixel-antialiased">solarman live data</h1>
                    <h2 className="grow text-xs dark:text-slate-300">{getLastUpdateTime(realTimeData.lastUpdateTime)}</h2>
                    <div className="w-full flex mb-2 mt-2">
                        <div className="w-1/2">
                            <div className="text-blue-600">{format(realTimeData.generationPower)}</div>
                            <div className="text-xs dark:text-slate-400">Production</div>
                        </div>
                        <div className="w-1/2">
                            {realTimeData.purchasePower &&
                                <div className="text-right">
                                    <div className="text-red-600">{format((realTimeData.purchasePower ?? 0) * -1)}</div>
                                    <div className="text-xs dark:text-slate-400">From Grid</div>
                                </div>
                            }
                            {realTimeData.gridPower &&
                                <div className="text-right">
                                    <div className="text-red-600">{format((realTimeData.gridPower ?? 0))}</div>
                                    <div className="text-xs dark:text-slate-400">To Grid</div>
                                </div>
                            }
                            {!realTimeData.gridPower && !realTimeData.purchasePower &&
                                <div className="text-right">
                                    <div className="text-slate-400">{format((realTimeData.gridPower ?? 0))}</div>
                                    <div className="text-xs text-slate-400">From/To Grid</div>
                                </div>
                            }
                        </div>
                    </div>
                    <div className="w-full flex">
                        <div className="w-1/2">
                            {realTimeData.dischargePower &&
                                <div>
                                    <div className="text-green-600">
                                        {format(realTimeData.dischargePower)}
                                        <span
                                            className="ml-3 rounded-md bg-green-600 text-white text-xs py-1 px-2">{realTimeData.batterySoc} %</span>
                                    </div>
                                    <div className="text-xs dark:text-slate-400">From Battery</div>
                                </div>
                            }
                            {realTimeData.chargePower &&
                                <div>
                                    <div className="text-green-600">
                                        {format(realTimeData.chargePower)}
                                        <span
                                            className="ml-3 rounded-md bg-green-600 text-white text-xs py-1 px-2">{realTimeData.batterySoc} %</span>
                                    </div>
                                    <div className="text-xs dark:text-slate-400">Charging Battery</div>
                                </div>
                            }
                            {!realTimeData.chargePower && !realTimeData.dischargePower &&
                                <div>
                                    <div className="text-green-600">
                                        <span className="rounded-md bg-green-600 text-white text-xs py-1 px-2">{realTimeData.batterySoc} %</span>
                                    </div>
                                    <div className="text-xs dark:text-slate-400">Battery idle</div>
                                </div>
                            }
                        </div>
                        <div className="w-1/2 text-right">
                            <div className="text-amber-600">{format(realTimeData.usePower)}</div>
                            <div className="text-xs dark:text-slate-400">Usage</div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    return null;
}