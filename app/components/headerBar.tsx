"use client";
import React from "react";
import {BoltIcon, UserCircleIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import {useSession} from "next-auth/react";
import Image from "next/image";

export default function HeaderBar() {

    const {version} = require('@/package.json');
    const {data: session} = useSession();
    // const session = {} as any;

    return (
        <div className="flex bg-slate-50 shadow-md shadow-slate-300
            dark:bg-slate-950 dark:shadow-slate-900 dark:text-slate-300">
            <Link
                href="/dashboard"
                className="grow pl-2 flex content-center justify-center
                ">
                <BoltIcon className="p-2 pt-3 h-12 w-12 text-amber-400"></BoltIcon>
                <h1 className="text-2xl self-center text-slate-700 dark:text-slate-300">
                    <span className="tracking-widest">voltalytics</span>
                    <span className="ml-2 text-xs font-thin">{version}</span>
                </h1>
            </Link>
            <Link href="/user">
                {session?.user?.image &&
                    (
                        <Image
                            width={2}
                            height={2} 
                            quality={100}
                            className={"w-8 h-8 rounded-full mr-3 my-2 bg-amber-400 border-2 border-amber-400"}
                            src={session.user.image}
                            alt={session.user.name!}/>
                    )
                }
                {!session?.user?.image &&
                    <UserCircleIcon className="p-2 mr-3 h-12 w-12 text-amber-400"></UserCircleIcon>
                }
            </Link>
        </div>
    );
}