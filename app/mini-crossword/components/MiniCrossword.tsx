"use client";

import { HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";


interface MiniCrosswordProps {
    grid: any;
    onHomeClick: () => void;
}

export function MiniCrossword({ grid, onHomeClick }: MiniCrosswordProps) {

    const router = useRouter();

    return (
        <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-4 gap-y-5">
            <div className="flex justify-between border-b-2 border-zinc-600 pb-5">
                <div className="flex items-center">
                    <HomeIcon className="h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center cursor-pointer stroke-zinc-400 hover:stroke-zinc-100 transition-all" onClick={() => { onHomeClick(); router.push('/mini-crossword')}} />
                    <p className="font-bold pl-3 mr-5 h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center">00:05</p>
                    <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Result</span></button>
                    <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Info</span></button>
                </div>
                <button className="flex text-zinc-400 mr-5 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Settings</span></button>
            </div>

            <div className="flex w-full gap-x-10">
                <div className="grid rounded-2xl overflow-hidden grid-cols-5 grid-rows-5">
                    {grid.layout.map((item: number, index: number) => {
                        return (
                            item === 0 ? (
                                <div className="w-20 h-20 bg-black border-1 border-zinc-800" key={index}></div>
                            ) : (
                                <div className="w-20 h-20 bg-zinc-700 border-1 border-zinc-800" key={index}>
                                    <div className="flex h-full w-full items-center justify-center text-5xl">{grid.solution[index]}</div>
                                </div>
                            )
                        )
                    })}
                </div>

                <div className="flex flex-col gap-y-5">
                    <div className="flex gap-x-60 border-b-1 border-zinc-600 pb-5">
                        <div className="flex flex-col gap-y-1">
                            <p className="text-sm uppercase font-bold text-zinc-300 gap">Across</p>
                            {grid.clues.across.map((item: string, index: number) => {
                                return (
                                    <p className="text-sm text-zinc-300 ml-2" key={index}><span className="font-bold">{index + 1}.</span> {item}</p>
                                )
                            })}
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <p className="text-sm uppercase font-bold text-zinc-300">Down</p>
                            {grid.clues.down.map((item: string, index: number) => {
                                return (
                                    <p className="text-sm text-zinc-300 ml-2" key={index}><span className="font-bold">{index + 1}.</span> {item}</p>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-2">
                        <p className="text-sm uppercase font-bold text-zinc-300">Multiplayer</p>
                        <button className="flex w-fit bg-green-600/33 rounded-lg border-1 border-green-600 text-center contents-center justify-center items-center cursor-pointer hover:bg-green-600 transition-all">
                            <span className="px-6 py-2 text-green-400 text-sm hover:text-green-100">+ Create Room</span>
                        </button>
                        <div className="flex gap-x-2 items-center h-[40px]">
                            <input className="w-full h-full bg-zinc-800 rounded-lg border-1 border-zinc-600 text-sm text-zinc-300 p-2 focus:outline-1 focus:outline-zinc-400" placeholder="Enter code" />
                            <button className="flex h-full rounded-lg border-1 border-zinc-600 text-center contents-center justify-center items-center cursor-pointer hover:bg-zinc-600 transition-all">
                                <span className="px-6 text-zinc-300 text-sm hover:text-zinc-200">Join</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}