import './globals.css'
import React from "react";
import HeaderBar from "@/app/components/headerBar";

export const metadata = {
    title: 'voltalytics',
    description: 'from kornfled with love'
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className="
            font-light
            bg-slate-200
            dark:bg-gray-950 dark:text-slate-200
            ">
        <header>
            <HeaderBar></HeaderBar>
        </header>
        <section>
            {children}
        </section>
        </body>
        </html>
    )
}
