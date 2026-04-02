"use client"

import { useRouter } from "next/navigation";
import { LoginModal } from "./LoginModal";
import { useState } from "react";

interface HeaderProps {
    onLogin: (token: string) => void;
}

export function Header({ onLogin }: HeaderProps) {
    const router = useRouter();

    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <div className="flex border-b-2 h-full border-zinc-800 w-full pb-2 select-none justify-between">
            <h1 className="text-5xl font-extrabold tracking-wide w-fit cursor-pointer hover:scale-101 hover:brightness-110 transition-all" onClick={() => { router.push('/mini-crossword') }}>Mini <span className="text-green-600 italic font-[cursive]">Crossword</span></h1>

            <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onApply={onLogin} />

            <div className="flex items-center">
                <button 
                    type="button" 
                    className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all items-center" 
                    onClick={() => { setLoginOpen(true) }}
                >
                    <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-base">Login</span>
                </button>
            </div>
        </div>
    )
}