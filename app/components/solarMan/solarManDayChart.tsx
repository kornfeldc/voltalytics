import React, {useEffect, useState} from "react";
import {ISolarManFrameStationDataItem} from "@/app/classes/solarManApi";
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import {Line} from 'react-chartjs-2';
import moment from "moment";
import {useOrientationChange} from "@/app/hooks/useOrientationChange";

interface SolarManDayChartProps {
    data: Array<ISolarManFrameStationDataItem>;
    showLegend: boolean;
    showWholeDay: boolean;
}

export default function SolarManDayChart({data, showLegend, showWholeDay}: SolarManDayChartProps) {
    const orientation = useOrientationChange();
    const [, setRerender] = useState(false);
    useEffect(() => {
        setRerender(prevState => !prevState);
    }, [orientation]);

    if (showWholeDay && data?.length > 0) {
        let act = moment(data[0].dateTime! * 1000);
        let end = moment(act).endOf("day");
        while (act <= end) {
            if (!data.find(x => moment(x.dateTime! * 1000).isSame(act)))
                data.push({dateTime: act.unix()} as ISolarManFrameStationDataItem);
            act = act.add(5, "minutes");
        }
    }

    const labels = data.map(x => {
        return moment(x.dateTime! * 1000).format("HH:mm");
    });


    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Filler,
        Legend
    );
    let options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            axis: {
                x: {
                    ticks: {}
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                    callback: (value: any, index: number) => {
                        const val = labels[index];
                        const displayLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:55"];
                        return displayLabels.includes(val)
                            ? val == "23:55" ? "24:00" : val : null;
                    }
                }
            }
        }
    } as any;

    if (!showLegend)
        options.plugins.legend.display = false;

    const getRealPurchasePower = (item: ISolarManFrameStationDataItem): number => {
        if ((item.purchasePower ?? 0) !== 0) return item.purchasePower!;
        const usage = Math.abs(item.usePower ?? 0);
        const generation = Math.abs(item.generationPower ?? 0);
        const discharge = Math.abs(item.dischargePower ?? 0);
        const theoreticalPurchase = usage - generation - discharge;
        if (theoreticalPurchase < 0) return 0;
        return theoreticalPurchase * -1;
    }

    const mapLineData = (): any => {
        return {
            labels: labels,
            datasets: [
                {
                    fill: true,
                    label: 'Production',
                    data: data.map(x => Math.abs(x.generationPower ?? 0) / 1000),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    fill: true,
                    label: 'Purchased',
                    data: data.map(x => Math.abs(getRealPurchasePower(x)) / -1000),
                    borderColor: 'rgb(244, 63, 94)',
                    backgroundColor: 'rgba(244, 63, 94, 0.5)',
                    borderWidth: 1,
                    pointRadius: 0
                },
                {
                    fill: true,
                    label: 'Usage',
                    data: data.map(x => Math.abs(x.usePower ?? 0) / 1000),
                    borderColor: 'rgb(251, 146, 60)',
                    backgroundColor: 'rgba(251, 146, 60, 0.5)',
                    borderWidth: 1,
                    pointRadius: 0
                }
            ]
        };
    };

    return (<div><Line redraw={true} options={options} data={mapLineData()}/></div>);
}
