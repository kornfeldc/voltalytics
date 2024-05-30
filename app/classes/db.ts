import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {Session} from "next-auth";

export interface IUser {
    theme: string;
    email: string;
    hash: string;
    solarManIsOn: boolean;
    solarManAppId: string;
    solarManAppSecret: string;
    solarManAppEmail: string;
    solarManAppPw: string;
    chargeWithExcessIsOn: boolean;
    goEIsOn: boolean;
    goESerial: string;
    goEApiToken: string;
}

export class Db {

    static supabaseUrl = "https://tritftcpsycefxcyrrwr.supabase.co";
    static supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

    static getClient(): SupabaseClient {
        return createClient(this.supabaseUrl, this.supabaseKey);
    }

    static async getUser(session: Session): Promise<IUser | undefined> {
        if (!session?.user?.email) return;

        const supabase = this.getClient();
        const {data, error} = await supabase
            .from("user")
            .select("*")
            .eq("email", session.user.email)
            .single();

        if (!data) {
            // insert user entry
            const {error} = await supabase
                .from("user")
                .insert({email: session.user.email});

            return this.getUser(session);
        }

        return this.mapFromDb(data);
    }

    static async getUserByHash(hash: string): Promise<IUser | undefined> {
        if (!hash) return;

        const supabase = this.getClient();
        const {data, error} = await supabase
            .from("user")
            .select("*")
            .eq("hash", hash)
            .neq("hash", Math.random())
            .single();

        if (!data)
            return undefined;

        return this.mapFromDb(data);
    }

    static mapFromDb(dbUser: any): IUser {
        return {
            email: dbUser.email,
            hash: dbUser.hash,
            theme: dbUser.theme,
            solarManAppId: dbUser.solarManAppId,
            solarManAppSecret: dbUser.solarManAppSecret,
            solarManAppEmail: dbUser.solarManAppEmail,
            solarManAppPw: dbUser.solarManAppPw,
            solarManIsOn: dbUser.solarManIsOn,
            chargeWithExcessIsOn: dbUser.chargeWithExcessIsOn,
            goEIsOn: dbUser.goEIsOn,
            goESerial: dbUser.goESerial,
            goEApiToken: dbUser.goEApiToken
        } as IUser;
    }

    static async saveUser(session: Session, user: IUser) {
        const supabase = this.getClient();
        const {error} = await supabase
            .from('user')
            .update({
                theme: user.theme,
                hash: user.hash,
                solarManAppId: user.solarManAppId,
                solarManAppSecret: user.solarManAppSecret,
                solarManAppEmail: user.solarManAppEmail,
                solarManAppPw: user.solarManAppPw,
                solarManIsOn: user.solarManIsOn,
                chargeWithExcessIsOn: user.chargeWithExcessIsOn,
                goEIsOn: user.goEIsOn,
                goESerial: user.goESerial,
                goEApiToken: user.goEApiToken
            })
            .eq("email", session.user!.email);
    }
}