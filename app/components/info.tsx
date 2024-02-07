import React from "react";

export default function Info({
                                 children
                             }: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-slate-600 border-l-8 border-slate-800 text-slate-100 p-3 text-sm rounded-md">
            {children}
        </div>
    )
}