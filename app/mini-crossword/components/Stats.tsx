"use client"

import { memo, useEffect } from "react"
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface StatsProps {
    stats: any;
}

export const Stats = memo(function Stats({ stats }: StatsProps) {

    useEffect(() => {
        console.log(stats)
    }, [stats])

    return (
        <div className="flex bg-zinc-800 w-full rounded-2xl justify-between overflow-hidden select-none shadow-inner shadow-zinc-200/30">
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completed</p>
                {!stats.completed && !stats.total ? (
                    <>                    
                        <Skeleton count={1} width={80} height={20} className="my-1" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                        <Skeleton count={1} width={80} height={10} className="my-1" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                    </>
                ) : (
                    <>
                        <p className="text-2xl text-green-600 font-bold italic">{stats.completed}</p>
                        <p className="text-sm text-zinc-400">of {stats.total} total</p>
                    </>
                )}
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completetion Rate</p>
                {!stats.completed && !stats.total ? (
                    <Skeleton count={1} width={80} height={24} className="my-1" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                ) : (
                    <p className="text-2xl text-green-600 font-bold italic">{(stats.completed / stats.total * 100).toFixed(2)}%</p>
                )}
                <p className="text-sm text-zinc-400">overall</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Avg Time</p>
                {!stats.completed && !stats.total ? (
                    <Skeleton count={1} width={80} height={24} className="my-1" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                ) : (
                    <p className="text-2xl text-green-600 font-bold italic">{Math.floor(stats.averageComplete/60) < 10 ? "0" + Math.floor(stats.averageComplete/60) : Math.floor(stats.averageComplete/60)}:{Math.round(stats.averageComplete%60) < 10 ? "0" + Math.round(stats.averageComplete%60) : Math.round(stats.averageComplete%60)}</p>
                )}
                <p className="text-sm text-zinc-400">per puzzle</p>
            </div>
            <div className="flex flex-col w-1/4 items-center p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Best Time</p>
                {!stats.completed && !stats.total ? (
                    <Skeleton count={1} width={80} height={24} className="my-1" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                ) : (
                    <p className="text-2xl text-green-600 font-bold italic">{Math.floor(stats.fastestComplete.timer/60) < 10 ? "0" + Math.floor(stats.fastestComplete.timer/60) : Math.floor(stats.fastestComplete.timer/60)}:{Math.round(stats.fastestComplete.timer%60) < 10 ? "0" + Math.round(stats.fastestComplete.timer%60) : Math.round(stats.fastestComplete.timer%60)}</p>
                )}
                {stats.fastestComplete.date && (
                    <a className="text-sm text-blue-200/80 cursor-pointer hover:underline" href={`/mini-crossword?crossword=${stats.fastestComplete.puzzleId}`}>{new Date(stats.fastestComplete.date).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</a>
                )}
            </div>
        </div>
    )
})