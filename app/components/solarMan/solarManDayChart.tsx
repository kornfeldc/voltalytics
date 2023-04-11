import Card from "@/app/components/card";
import React from "react";
import {ISolarManFrameStationDataItem} from "@/app/classes/solarManApi";
import {
    CategoryScale,
    Chart as ChartJS, Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from "chart.js";
import { Line } from 'react-chartjs-2';
import moment from "moment";

interface SolarManDayChartProps {
    data: Array<ISolarManFrameStationDataItem>;
    showLegend: boolean;
}

export default function SolarManDayChart({data, showLegend}: SolarManDayChartProps) {
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
            // title: {
            //     display: true,
            //     text: moment((data[0] as ISolarManFrameStationDataItem).dateTime!*1000).format("DD.MM.YYYY"),
            // },
        },
    } as any;
   
    if(!showLegend)
        options.plugins.legend.display = false;
    
    const mapLineData = () : any => {
       return {
           labels: data.map(x => moment(x.dateTime!*1000).format("H")),
           datasets: [
               {
                   fill: true,
                   label: 'Production',
                   data: data.map(x => Math.abs(x.generationPower ?? 0)/1000),
                   borderColor: 'rgb(59, 130, 246)',
                   backgroundColor: 'rgba(59, 130, 246, 0.5)',
                   borderWidth: 1,
                   pointRadius: 0
               },
               {
                   fill: true,
                   label: 'Purchased',
                   data: data.map(x => Math.abs(x.purchasePower ?? 0)/-1000),
                   borderColor: 'rgb(244, 63, 94)',
                   backgroundColor: 'rgba(244, 63, 94, 0.5)',
                   borderWidth: 1,
                   pointRadius: 0
               },
               {
                   fill: true,
                   label: 'Usage',
                   data: data.map(x => Math.abs(x.usePower ?? 0)/1000),
                   borderColor: 'rgb(251, 146, 60)',
                   backgroundColor: 'rgba(251, 146, 60, 0.5)',
                   borderWidth: 1,
                   pointRadius: 0
               }
           ]
       }; 
    };
    
    return <Line options={options} data={mapLineData()} /> ;
}
