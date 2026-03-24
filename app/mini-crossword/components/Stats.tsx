import { memo } from "react"

interface StatsProps {
    streaks: any[];
}

export const Stats = memo(function Stats({ streaks }: StatsProps) {
    const total = streaks.length
    const completed = streaks.filter((streak: any) => streak.playDetails?.playProgress?.playState === "completed").length

    const averageComplete = streaks.reduce((acc: number, curr: any) => {
        if (curr.playDetails?.playProgress?.playState === "completed") {
            return acc + curr.playDetails?.screenTimeSeconds
        }
        return acc
    }, 0) / streaks.filter((streak: any) => streak.playDetails?.playProgress?.playState === "completed").length

    let fastest = 99999

    const fastestComplete = streaks.reduce((acc: any, curr: any) => {
        if (curr.playDetails?.playProgress?.playState === "completed" && curr.playDetails?.screenTimeSeconds < fastest) {
            fastest = curr.playDetails?.screenTimeSeconds
            return curr
        }
        return acc
    }, {})
    

    return (
        <div className="flex bg-zinc-800 w-full rounded-2xl justify-between overflow-hidden select-none shadow-inner shadow-zinc-200/30">
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completed</p>
                <p className="text-2xl text-green-600 font-bold italic">{completed}</p>
                <p className="text-sm text-zinc-400">of {total} total</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Completetion Rate</p>
                <p className="text-2xl text-green-600 font-bold italic">{(completed / total * 100).toFixed(2)}%</p>
                <p className="text-sm text-zinc-400">overall</p>
            </div>
            <div className="flex flex-col w-1/4 items-center border-r-2 border-zinc-600 p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Avg Time</p>
                <p className="text-2xl text-green-600 font-bold italic">{Math.floor(averageComplete/60)}:{Math.round(averageComplete%60)}</p>
                <p className="text-sm text-zinc-400">per puzzle</p>
            </div>
            <div className="flex flex-col w-1/4 items-center p-2 hover:bg-zinc-700/20 hover:brightness-120 transition-all">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Best Time</p>
                <p className="text-2xl text-green-600 font-bold italic">{Math.floor(fastestComplete.playDetails?.screenTimeSeconds/60)}:{Math.round(fastestComplete.playDetails?.screenTimeSeconds%60)}</p>
                <p className="text-sm text-zinc-400">{new Date(fastestComplete.puzzleDetails?.publicationTime).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}</p>
            </div>
        </div>
    )
})