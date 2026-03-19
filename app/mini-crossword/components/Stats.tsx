import { memo } from "react"

export const Stats = memo(function Stats() {
    return (
        <div className="flex bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between">
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
                <p className="text-sm text-zinc-300 uppercase">Completed</p>
                <p className="text-2xl text-green-600 font-bold italic">102</p>
                <p className="text-sm text-zinc-400">of 748 total</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
                <p className="text-sm text-zinc-300 uppercase">Completetion Rate</p>
                <p className="text-2xl text-green-600 font-bold italic">13.64%</p>
                <p className="text-sm text-zinc-400">overall</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2">
                <p className="text-sm text-zinc-300 uppercase">Avg Time</p>
                <p className="text-2xl text-green-600 font-bold italic">4:21</p>
                <p className="text-sm text-zinc-400">per puzzle</p>
            </div>
            <div className="flex flex-col w-1/4 items-center p-2">
                <p className="text-sm text-zinc-300 uppercase">Best Time</p>
                <p className="text-2xl text-green-600 font-bold italic">0:20</p>
                <p className="text-sm text-zinc-400">Mar 10, 2026</p>
            </div>
        </div>
    )
})