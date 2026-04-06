"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

interface PuzzleContextType {
    loadPuzzles: () => Promise<void>
    puzzles: any[]
    stats: any
    getPuzzleById: (id: string) => Promise<any>
    saveProgress: (crosswordId: string, grid: (string | null )[][], timeSpent: number, checkGridCount: number, revealedLetterCount: number) => Promise<number>
}

const PuzzleContent = createContext<PuzzleContextType | undefined>(undefined)

export const PuzzlesProvider = ({ children }: { children: React.ReactNode }) => {
    const [puzzles, setPuzzles] = useState<any[]>([])

    function useAverageComplete(puzzles: any[]) {
        return puzzles.reduce((acc, curr) => {
            if (curr.isSolved) {
                return acc + curr.timer;
            }
            return acc;
        }, 0) / puzzles.filter((p) => p.isSolved).length;
    }

    let fastest = { timer: Infinity }

    function useFastestComplete(puzzles: any[]) {
        if(!puzzles.find((p) => p.isSolved)) {
            return { timer: 0, puzzleId: "" }
        } else {
            return puzzles.reduce((acc, curr) => {
                if (curr.isSolved && curr.timer < fastest.timer) {
                    fastest = curr;
                    return curr;
                }
                return acc;
            }, {});
        }
    }

    function lastCompleted(puzzles: any[]) {
        const solved = puzzles.filter((p) => p.isSolved && p.updatedAt)
        if (!solved.length) {
            return { updatedAt: null, puzzleId: "", date: "" }
        }

        const latest = solved.reduce((acc, curr) => {
            const accTime = new Date(acc.updatedAt).getTime()
            const currTime = new Date(curr.updatedAt).getTime()
            return currTime > accTime ? curr : acc
        }, solved[0])

        return {
            updatedAt: latest.updatedAt,
            puzzleId: latest.puzzleId,
            date: latest.date ?? latest.updatedAt,
        }
    }

    const averageComplete = useAverageComplete(puzzles);
    const fastestComplete = useFastestComplete(puzzles);
    const lastCompletedPuzzle = lastCompleted(puzzles);
    

    const stats = useMemo(
        () => ({
            total: puzzles.length,
            completed: puzzles.filter((p) => p.isSolved).length,
            averageComplete: averageComplete || 0,
            fastestComplete: fastestComplete || { timer: 1, puzzleId: "", date: "" },
            lastCompleted: lastCompletedPuzzle,
        }),
        [puzzles, averageComplete, fastestComplete, lastCompletedPuzzle]
    );

    const loadPuzzles = useCallback(async () => {
        const response = await fetch("/api/puzzles")
        const data = await response.json()

        const sortedData = [...data].sort((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);

            if (aDate.getFullYear() !== bDate.getFullYear()) {
                return bDate.getFullYear() - aDate.getFullYear();
            }
            if (aDate.getMonth() !== bDate.getMonth()) {
                return bDate.getMonth() - aDate.getMonth();
            }
            return aDate.getDate() - bDate.getDate();
        });

        setPuzzles(sortedData)
    }, [])

    const getPuzzleById = useCallback(async (id: string) => {
        const response = await fetch(`/api/puzzles/${id}`)
        return response.json()
    }, [])

    const saveProgress = async (crosswordId: string, grid: (string | null)[][], timeSpent: number, checkGridCount: number, revealedLetterCount: number) => {
        const response = await fetch("/api/progress", {
            method: "POST",
            body: JSON.stringify({
                puzzleId: `bostonglobe-mini-${crosswordId}`,
                filledGrid: grid,
                timeSpent: timeSpent,
                checkGridCount: checkGridCount,
                revealedLetterCount: revealedLetterCount
            })
        });

        const data = await response.json();

        if(data.timer > 0){
            setPuzzles(prev => {
                const newPuzzles = [...prev];
                const index = newPuzzles.findIndex(p => p.puzzleId === crosswordId);
                newPuzzles[index].hasProgress = true;
                newPuzzles[index].updatedAt = new Date();
                return newPuzzles;
            });
        }

        if(data.isCompleted){
            setPuzzles(prev => {
                const newPuzzles = [...prev];
                const index = newPuzzles.findIndex(p => p.puzzleId === crosswordId);
                newPuzzles[index].isSolved = true;
                newPuzzles[index].timer = data.timer;
                newPuzzles[index].updatedAt = new Date();
                return newPuzzles;
            });
        }

        return data.timer;

    }

    const value = useMemo(() => ({ 
        loadPuzzles, 
        puzzles,
        stats,
        getPuzzleById,
        saveProgress
    }), [loadPuzzles, puzzles, stats, getPuzzleById, saveProgress])

    return <PuzzleContent.Provider value={value}>{children}</PuzzleContent.Provider>
}

export const usePuzzles = () => {
    const context = useContext(PuzzleContent)
    if (context === undefined) {
        throw new Error("usePuzzles must be used within a PuzzlesProvider")
    }
    return context
}