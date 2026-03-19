import { memo } from "react"

export const ProgressBar = memo(function ProgressBar() {
    return (
        <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-2">
            <div className="flex justify-between w-full">
                <p className="text-sm text-zinc-300 uppercase">Progress To Completion</p>
                <p className="text-sm text-zinc-300 uppercase"><span className="text-green-600">102</span> / 748</p>
            </div>
            <div className="flex w-full h-4 bg-zinc-600 rounded-full mt-2 overflow-hidden">
                <div className="flex h-full bg-green-600 text-center items-center justify-center" style={{ width: "13.64%" }}>
                    <span className="text-sm text-zinc-200">100</span>
                </div>
                <div className="flex h-full bg-green-800 text-center items-center justify-center" style={{ width: "2%" }}>
                    <span className="text-sm text-zinc-200">2</span>
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