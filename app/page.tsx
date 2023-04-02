"use client";
import {Inter} from 'next/font/google'
import {useRouter} from "next/navigation";

const inter = Inter({subsets: ['latin']})

export default function Home() {

    const router = useRouter();
    router.push("/dashboard");

    return (
        <main></main>
    )
}
