"use client";
import React from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import Button from "@/app/components/button";
import Card from "@/app/components/card";
import Info from "@/app/components/info";

export default function UserPage() {
    const {data: session} = useSession();

    if (session)
        return (
            <div className="p-4">
                <div className="mb-4">
                    <Info>Signed in as {session?.user?.email}</Info>
                </div>
                <Button onClick={() => signOut()}>Sign Out</Button>
            </div>
        );

    return (
        <div className="p-4">
            <div className="mb-4">
                <Info>If you want to use additional features, like "SolarMan" integration, you'll have to sign in with your google account</Info>
            </div>
            <Button onClick={() => signIn()}>Sign In</Button>
        </div>
    );
}
