import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {Session} from "next-auth";

export interface IUser {
    theme: string;
    email: string;
    solarManIsOn: boolean;
    solarManAppId: string;
    solarManAppSecret: string;
    solarManAppEmail: string;
    solarManAppPw: string;
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

    static mapFromDb(dbUser: any): IUser {
        return {
            email: dbUser.email,
            theme: dbUser.theme,
            solarManAppId: dbUser.solarManAppId,
            solarManAppSecret: dbUser.solarManAppSecret,
            solarManAppEmail: dbUser.solarManAppEmail,
            solarManAppPw: dbUser.solarManAppPw,
            solarManIsOn: dbUser.solarManIsOn
        } as IUser;
    }

    static async saveUser(session: Session, user: IUser) {
        const supabase = this.getClient();
        const {error} = await supabase
            .from('user')
            .update({
                theme: user.theme,
                solarManAppId: user.solarManAppId,
                solarManAppSecret: user.solarManAppSecret,
                solarManAppEmail: user.solarManAppEmail,
                solarManAppPw: user.solarManAppPw,
                solarManIsOn: user.solarManIsOn
            })
            .eq("email", session.user!.email);
    }
}