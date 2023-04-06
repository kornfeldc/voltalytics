import React from "react";
import {BoltIcon} from "@heroicons/react/24/outline";
import {UserCircleIcon} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function HeaderBar() {

    const { version } = require('@/package.json');
    
    return (
        <div className="flex bg-slate-50 shadow-md shadow-slate-300
            dark:bg-slate-950 dark:shadow-slate-900 dark:text-slate-300">
            <Link 
                href="/dashboard"
                className="grow pl-2  flex content-center
                ">
                <BoltIcon className="p-2 h-12 w-12 text-amber-400"></BoltIcon>
                <h1 className="text-2xl self-center text-slate-700 dark:text-slate-300">
                    <span className="tracking-widest">voltalytics</span>
                    <span className="ml-2 text-xs font-thin">{version}</span>
                </h1>
            </Link>
            <Link href="/user">
                <UserCircleIcon className="p-2 mr-3 h-12 w-12 text-amber-400"></UserCircleIcon>
            </Link>
        </div>
    );
}