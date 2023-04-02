import React from "react";

export default function Card({
                                 children,
                             }: {
    children: React.ReactNode
}) {
    return (
        <div className="
        rounded-md overflow-hidden shadow-lg  p-4 
        bg-gray-100
        dark:bg-gray-900 dark:shadow-slate-800 dark:shadow-md
        w-full 
        md:w-96
        ">
            {children}
        </div>
    );
}