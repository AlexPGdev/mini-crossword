"use client";

import { memo, useMemo } from "react"
import { useRouter } from "next/navigation";

let weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildCalendar(streaks: any[]) {
    let currentMonth = -1
    let currentYear = -1
    let expectedDay: number | null = null

    const months: any[] = []

    // stats
    let total = 0
    let completed = 0
    let completedToday = 0
    let inProgress = 0
    let fastestComplete = Infinity
    let fastestCompleteDate = ""
    let averageComplete = 0

    const today = new Date()

    let currentMonthObj: any = null

    const appendPlaceholder = (day: number, year: number, month: number) => {
        currentMonthObj.days.push({
            placeholder: true,
            locked: true,
            day,
            year,
            month,
        })
    }

    streaks.forEach((streak, index) => {
        const date = new Date(streak.puzzleDetails.publicationTime)
        const month = date.getMonth()
        const year = date.getFullYear()
        const day = date.getDate()

        // NEW MONTH
        if (month !== currentMonth || year !== currentYear) {
            // fill previous month
            if (expectedDay !== null && currentMonthObj) {
                const lastDay = new Date(
                    currentYear,
                    currentMonth + 1,
                    0
                ).getDate()

                while (expectedDay <= lastDay) {
                    appendPlaceholder(expectedDay, currentYear, currentMonth)
                    expectedDay++
                }
            }

            currentMonth = month
            currentYear = year

            currentMonthObj = {
                month,
                year,
                days: [],
            }

            months.push(currentMonthObj)

            // fill start gap
            const firstWeekday = (date.getDay() + 6) % 7
            for (let i = 0; i < firstWeekday; i++) {
                currentMonthObj.days.push({ placeholder: true })
            }

            expectedDay = 1
        }

        // fill missing days before current
        while (expectedDay! < day) {
            appendPlaceholder(expectedDay!, year, month)
            expectedDay!++
        }

        // === TILE LOGIC ===
        total++

        if (streak.playDetails?.playProgress) {
            const playState =
                streak.playDetails.playProgress.playState

            if (playState === "completed") {
                completed++

                const completionDate = new Date(
                    streak.playDetails.updatedAt
                )

                if (
                    completionDate.getFullYear() ===
                        today.getFullYear() &&
                    completionDate.getMonth() === today.getMonth() &&
                    completionDate.getDate() === today.getDate()
                ) {
                    completedToday++
                }

                if (
                    streak.playDetails.screenTimeSeconds <
                    fastestComplete
                ) {
                    fastestComplete =
                        streak.playDetails.screenTimeSeconds

                    fastestCompleteDate =
                        streak.puzzleDetails.title
                            .split(", ")
                            .slice(1)
                            .join(" ")
                            .replace(/,/g, "")
                }

                averageComplete +=
                    streak.playDetails.screenTimeSeconds
            } else if (playState === "inProgress") {
                inProgress++
            }
        }

        currentMonthObj.days.push({
            day,
            streak,
        })

        expectedDay = day + 1

        const next = streaks[index + 1]
        const nextDate = next
            ? new Date(next.puzzleDetails.publicationTime)
            : null

        const isDifferentMonth =
            !nextDate ||
            nextDate.getMonth() !== month ||
            nextDate.getFullYear() !== year

        if (isDifferentMonth) {
            if (streak.puzzleDetails.publicationTime > Date.now()) {
                const lastDay = new Date(year, month + 1, 0).getDate()

                while (expectedDay <= lastDay) {
                    appendPlaceholder(expectedDay, year, month)
                    expectedDay++
                }
            }
        }
    })

    return {
        months,
        stats: {
            total,
            completed,
            completedToday,
            inProgress,
            fastestComplete:
                fastestComplete === Infinity ? 0 : fastestComplete,
            fastestCompleteDate,
            averageComplete,
        },
    }
}

interface CalendarProps {
    onTileClick: (streak: any) => void;
    streaks: any[];
}

export const Calendar = memo(function Calendar ({ onTileClick, streaks }: CalendarProps) {
    const router = useRouter();

    const {
        months
    } = useMemo(() => buildCalendar(streaks), [streaks])

    const handleTileClick = (streak: any) => {
        onTileClick(streak)
    }

    return (
        <div className="grid grid-cols-3 gap-4 w-full select-none transition-all">
            
            {months.flatMap((month, idx) => {
                const firstDate = new Date(month.year, month.month, 1)

                return (
                    <div
                        key={idx}
                        className="flex flex-col rounded-2xl bg-zinc-700 hover:brightness-110 transition-all"
                    >
                        <div className="bg-zinc-800 rounded-tl-2xl rounded-tr-2xl py-2 shadow-inner shadow-zinc-200/30">
                            <h3 className="text-center text-xl font-bold text-zinc-300">
                                {firstDate.toLocaleString("en-US", {
                                    month: "long",
                                })}{" "}
                                {month.year}
                            </h3>

                            <div className="grid grid-cols-7 px-2 text-zinc-400">
                                {weekDays.map((d) => (
                                    <div
                                        key={d}
                                        className="text-center font-bold"
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* GRID */}
                        <div className="grid grid-cols-7 gap-2 p-4">

                            {/* Days */}
                            {month.days.map((dayObj: any, i: number) => {

                                if (dayObj.placeholder && dayObj.locked) {
                                    const date = new Date(dayObj.year, dayObj.month, dayObj.day)

                                    if(date.getTime() < Date.now()) return null;

                                    const label = date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })

                                    return (
                                        <div
                                            key={`locked-${i}`}
                                            className="relative h-13 w-13 flex flex-col items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-300 border border-white/20 pointer-events-none select-none"
                                        >
                                            <div className="text-[12px] font-semibold mt-1 text-center opacity-60">
                                                {label.replace(',', '')}
                                            </div>

                                            <div className="absolute text-xl">
                                                🔒
                                            </div>
                                        </div>
                                    )
                                }

                                if (dayObj.placeholder) {
                                    return (
                                        <div
                                            key={`ph-${i}`}
                                            className="h-12 bg-zinc-800/40 rounded invisible"
                                        />
                                    )
                                }

                                const streak = dayObj.streak
                                const play =
                                    streak.playDetails?.playProgress
                                        ?.playState

                                let bg =
                                    "bg-zinc-600 shadow-inner shadow-zinc-200/50"

                                if (play === "completed") {
                                    bg =
                                        "bg-green-700 shadow-inner shadow-green-200/50"
                                } else if (play === "inProgress") {
                                    bg =
                                        "bg-yellow-600 shadow-inner shadow-yellow-200/50"
                                }

                                const label =
                                    streak.puzzleDetails.title
                                        .split(", ")
                                        .slice(1)
                                        .join(" ")
                                        .replace(/,/g, "")

                                return (
                                    <div
                                        key={
                                            streak.puzzleDetails.puzzleId
                                        }
                                        className={`h-13 w-13 flex items-center justify-center text-[12px] text-center font-semibold rounded-xl cursor-pointer select-none ${bg} hover:scale-110 hover:brightness-110 transition-all`}
                                        onClick={() => {handleTileClick(streak); router.push(`?crossword=${`${streak.puzzleDetails.puzzleId}`.split('mini-')[1]}`)}}
                                    >
                                        {label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
})