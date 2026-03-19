"use client"

import { useRouter } from "next/navigation";

export function Header() {

    const router = useRouter();

    return (
        <div className="flex flex-col border-b-2 h-full border-zinc-800 w-full pb-2 select-none">
            <h1 className="text-5xl font-extrabold tracking-wide w-fit cursor-pointer hover:scale-101 hover:brightness-110 transition-all" onClick={() => { router.push('/mini-crossword') }}>Mini <span className="text-green-600 italic font-[cursive]">Crossword</span></h1>
        </div>
    )
}