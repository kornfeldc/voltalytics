"use client";
import React from "react";
import SolarManDayChartContainer from "@/app/components/solarMan/solarManDayChartContainer";
import moment from "moment";

export default function SolarManDayPage({params}: { params: any }) {
    return (
        <div className={"mt-4 px-0.5"}>
            <h1 className={"text-center pb-2"}>{moment(params.day).format("DD.MM.YYYY")}</h1>
            <SolarManDayChartContainer day={params.day} showWholeDay={true}></SolarManDayChartContainer>
        </div>
    );
}
