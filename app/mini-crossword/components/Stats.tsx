"use client"

import { memo } from "react"

interface StatsProps {
    stats: any;
}

export const Stats = memo(function Stats({ stats }: StatsProps) {

    return (
        <div className="flex bg-zinc-800 w-full rounded-2xl justify-between overflow-hidden select-none shadow-inner shadow-zinc-200/30">
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completed</p>
                <p className="text-2xl text-green-600 font-bold italic">{stats.completed}</p>
                <p className="text-sm text-zinc-400">of {stats.total} total</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completetion Rate</p>
                <p className="text-2xl text-green-600 font-bold italic">{(stats.completed / stats.total * 100).toFixed(2)}%</p>
                <p className="text-sm text-zinc-400">overall</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Avg Time</p>
                <p className="text-2xl text-green-600 font-bold italic">{Math.floor(stats.averageComplete/60)}:{Math.round(stats.averageComplete%60)}</p>
                <p className="text-sm text-zinc-400">per puzzle</p>
            </div>
            <div className="flex flex-col w-1/4 items-center p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Best Time</p>
                <p className="text-2xl text-green-600 font-bold italic">{Math.floor(stats.fastestComplete.timer/60)}:{Math.round(stats.fastestComplete.timer%60)}</p>
                <a className="text-sm text-blue-200/80 cursor-pointer hover:underline" href={`/mini-crossword?crossword=${stats.fastestComplete.puzzleId}`}>{new Date(stats.fastestComplete.date).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</a>
            </div>
        </div>
    )
})