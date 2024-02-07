"use client";
import React, {useEffect, useState} from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import Button from "@/app/components/button";
import Info from "@/app/components/info";
import {Db, IUser} from "@/app/classes/db";

export default function UserPage() {
    const {data: session} = useSession();
    const [user, setUser] = useState<IUser>();

    useEffect(() => {
        const fetchUser = async () => {
            if (!session) return;
            const fetchedUser = await Db.getUser(session);
            if (fetchedUser) setUser(fetchedUser);
        };

        fetchUser().then(() => {
        });
    }, [session]);

    const save = () => {
        if (!user || !session) return;
        Db.saveUser(session, user).then(() => {
        });
    }

    const getInfoText = () => session
        ? `Signed in as ${session?.user?.email}`
        : `If you want to use additional features, like "SolarMan" integration, 
        you'll have to sign in with your google account`;

    const renderButton = () => session
        ? (<Button onClick={() => signOut()}>Sign Out</Button>)
        : (<Button onClick={() => signIn()}>Sign In</Button>);

    const renderForm = () => session && user
        ? (
            <div className="mt-4">
                <div>
                    <input type="checkbox" checked={user.solarManIsOn}
                           onChange={e => setUser({...user, solarManIsOn: e.target.checked})}/> Use SolarMan
                </div>
                {user.solarManIsOn &&
                    <div>
                        <div className="mt-2">
                            <input
                                className="custom-input w-full"
                                type="text"
                                value={user.solarManAppId}
                                placeholder="App Id"
                                onChange={e => setUser({...user, solarManAppId: e.target.value})}/>
                        </div>
                        <div className="mt-2">
                            <input
                                className="custom-input w-full"
                                type="text"
                                value={user.solarManAppSecret}
                                placeholder="App Secret"
                                onChange={e => setUser({...user, solarManAppSecret: e.target.value})}/>
                        </div>
                        <div className="mt-2">
                            <input
                                className="custom-input w-full"
                                type="text"
                                value={user.solarManAppEmail}
                                placeholder="App Email"
                                onChange={e => setUser({...user, solarManAppEmail: e.target.value})}/>
                        </div>
                        <div className="mt-2">
                            <input
                                className="custom-input w-full"
                                type="password"
                                value={user.solarManAppPw}
                                placeholder="App Password (SHA256)"
                                onChange={e => setUser({...user, solarManAppPw: e.target.value})}/>
                        </div>
                        <div className="mt-2">
                            <Button onClick={() => save()}>Save</Button>
                        </div>
                    </div>
                }
            </div>
        )
        : null;

    return (
        <div className="p-4">
            <div className="mb-4">
                <Info>{getInfoText()}</Info>
            </div>
            <div>{renderButton()}</div>
            {renderForm()}
        </div>
    );
}
