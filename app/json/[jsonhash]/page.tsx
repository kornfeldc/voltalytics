"use client";
import {useRouter} from "next/navigation";
import React from "react";
import Button from "@/app/components/button";
import ReactJson from "react-json-view";

export default function JsonPage({params}: { params: any }) {
    const router = useRouter();
    const jsonHash = params.jsonhash;

    const json = JSON.parse(window.localStorage.getItem(jsonHash)!);

    const back = () => {
        router.back();
    }

    return (
        <div className="flex flex-col h-screen p-4 pb-20">
            <div className={"flex-grow overflow-auto mb-4"}>
                <ReactJson theme={"ashes"} src={json}/>
            </div>
            <div className={"flex-shrink-0"}>
                <Button onClick={() => back()}>Back</Button>
            </div>
        </div>
    )
}
