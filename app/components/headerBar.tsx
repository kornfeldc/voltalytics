import React from "react";
import {BoltIcon} from "@heroicons/react/24/solid";
import Link from "next/link";

export default function HeaderBar() {

    const { version } = require('@/package.json');
    
    return (
        <Link 
            href="/dashboard"
            className="pl-6 shadow-md flex content-center
                bg-slate-50 shadow-slate-300 
                dark:bg-slate-950 dark:shadow-slate-900 dark:text-slate-300
            ">
            <BoltIcon className="p-2 h-14 w-14 text-amber-400"></BoltIcon>
            <h1 className="text-2xl self-center">
                voltalytics
                <span className="ml-2 text-xs">{version}</span>
            </h1>
        </Link>
    );
}