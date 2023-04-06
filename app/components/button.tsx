import React, {MouseEvent} from "react";

export default function Button ({
                    children, onClick
                }: {
    children: React.ReactNode,
    onClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(event);
        }
    };
    
    return (
        <button 
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-md"
            onClick={handleClick}>
            {children}
        </button>
    )
}