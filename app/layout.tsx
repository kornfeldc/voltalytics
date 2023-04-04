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
        <link rel="manifest" href="../manifest.json"></link>
        <body className="
            font-light
            bg-slate-200
            dark:bg-gray-950 dark:text-slate-200
            ">
        <header className="sticky top-0 z-50">
            <HeaderBar></HeaderBar>
        </header>
        <main className="relative">
            {children}
        </main>
        </body>
        </html>
    )
}
