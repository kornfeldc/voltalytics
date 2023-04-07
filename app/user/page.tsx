"use client";
import React from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import Button from "@/app/components/button";
import Info from "@/app/components/info";

export default function UserPage() {
    const {data: session} = useSession();

    const getInfoText = () => session
        ? `Signed in as ${session?.user?.email}`
        : `If you want to use additional features, like "SolarMan" integration, you'll have to sign in with your google account`;

    const renderButton = () => session
        ? (<Button onClick={() => signOut()}>Sign Out</Button>)
        : (<Button onClick={() => signIn()}>Sign In</Button>);

    return (
        <div className="p-4">
            <div className="mb-4">
                <Info>{getInfoText()}</Info>
            </div>
            <div>{renderButton()}</div>
        </div>
    );
}
