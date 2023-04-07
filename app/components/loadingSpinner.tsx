import React from "react";

export default function LoadingSpinner({text}: {text?: string} = { text: "" }) {
    return (
        <div
            className="inline-block text-slate-700 dark:text-slate-400 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" >
                {text}  
              </span >
        </div>
    )
}