import { memo } from "react"

interface ProgressBarProps {
    streaks: any[];
}

export const ProgressBar = memo(function ProgressBar({ streaks }: ProgressBarProps) {

    const total = streaks.length
    const completed = streaks.filter((streak: any) => streak.playDetails?.playProgress?.playState === "completed").length
    const completedToday = streaks.filter((streak: any) => streak.playDetails?.playProgress?.playState === "completed" && (new Date(streak.playDetails?.updatedAt).getDate() === new Date().getDate() && new Date(streak.playDetails?.updatedAt).getMonth() === new Date().getMonth() && new Date(streak.playDetails?.updatedAt).getFullYear() === new Date().getFullYear())).length

    return (
        <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-2 select-none hover:bg-zinc-700/40 hover:brightness-120 transition-all">
            <div className="flex justify-between w-full">
                <p className="text-sm text-zinc-300 uppercase tracking-wider">Progress To Completion</p>
                <p className="text-sm text-zinc-300 uppercase"><span className="text-green-600">{completed}</span> / {total}</p>
            </div>
            <div className="flex w-full h-4 bg-zinc-600 rounded-full mt-2 overflow-hidden">
                <div className="flex h-full bg-green-600 text-center items-center justify-center" style={{ width: `${((completed-completedToday) / total * 100).toFixed(2)}%` }}>
                    <span className="text-sm text-zinc-200">{(completed-completedToday) > 0 && (completed-completedToday)}</span>
                </div>
                <div className="flex h-full bg-green-800 text-center items-center justify-center" style={{ width: `${((completedToday) / total * 100).toFixed(2)}%` }}>
                    <span className="text-sm text-zinc-200">{completedToday > 0 && completedToday}</span>
                </div>
            </div>
            <div className="flex gap-x-6">
                <div className="flex items-center gap-x-2 mt-3 text-xs text-zinc-300">
                    <div className=" w-2 h-2 bg-green-600 rounded-xs"></div>
                    <p className="text-zinc-400">Completed</p>
                </div>
                <div className="flex items-center gap-x-2 mt-3 text-xs text-zinc-300">
                    <div className=" w-2 h-2 bg-green-800 rounded-xs"></div>
                    <p className="text-zinc-400">Completed Today</p>
                </div>
            </div>
        </div>
    )
})