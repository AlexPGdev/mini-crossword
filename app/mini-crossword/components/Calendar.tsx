"use client";

import { memo, useMemo } from "react"
import { useRouter } from "next/navigation";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

let weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildCalendar(streaks: any[]) {
    let currentMonth = -1
    let currentYear = -1
    let expectedDay: number | null = null

    const months: any[] = []

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
        const date = new Date(streak.date)
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


        currentMonthObj.days.push({
            day,
            streak,
        })

        expectedDay = day + 1

        const next = streaks[index + 1]
        const nextDate = next
            ? new Date(next.date)
            : null

        const isDifferentMonth =
            !nextDate ||
            nextDate.getMonth() !== month ||
            nextDate.getFullYear() !== year

        if (isDifferentMonth) {
            if (streak.date > Date.now()) {
                const lastDay = new Date(year, month + 1, 0).getDate()

                while (expectedDay <= lastDay) {
                    appendPlaceholder(expectedDay, year, month)
                    expectedDay++
                }
            }
        }
    })

    return {
        months
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
            
            {!months || months.length === 0 && (
                <>
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <Skeleton key={idx} width={'100%'} height={450} className="rounded-full" baseColor="#27272a" highlightColor="#3c3c3e" borderRadius={"1rem"} />
                    ))}
                </>
            )}

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

                                let bg =
                                    "bg-zinc-600 shadow-inner shadow-zinc-200/50"

                                if (streak.isSolved) {
                                    bg =
                                        "bg-green-700 shadow-inner shadow-green-200/50"
                                } else if (streak.hasProgress && !streak.isSolved) {
                                    bg =
                                        "bg-yellow-600 shadow-inner shadow-yellow-200/50"
                                }

                                const label =
                                    new Date(`${streak.puzzleId.slice(0, 4)}/${streak.puzzleId.slice(4, 6)}/${streak.puzzleId.slice(6, 8)}`).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: 'short',
                                        day: "numeric",
                                    }).replace(',', '')

                                return (
                                    <div
                                        key={
                                            streak.puzzleId
                                        }
                                        className={`h-13 w-13 flex items-center justify-center text-[12px] text-center font-semibold rounded-xl cursor-pointer select-none ${bg} hover:scale-110 hover:brightness-110 transition-all`}
                                        onClick={() => {handleTileClick(streak); router.push(`?crossword=${streak.puzzleId}`)}}
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