"use client";
import AwattarCard from "@/app/components/awattar/awattarCard";
import {useRouter} from "next/navigation";
import React from "react";
import PullToRefresh from "@/app/components/pullToRefresh";


export default function DashboardPage() {
    const router = useRouter();

    const gotoAwattar = () => {
        router.push("/awattar");
    }

    return (
        <div className="p-4 "
             onClick={gotoAwattar}>
            <PullToRefresh></PullToRefresh>
            <AwattarCard/>
        </div>
    )
}
