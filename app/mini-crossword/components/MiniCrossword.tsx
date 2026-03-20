"use client";

import { Crossword } from "@/app/types/Crossword";
import { HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface MiniCrosswordProps {
    onHomeClick: () => void;
}

export function MiniCrossword({ onHomeClick }: MiniCrosswordProps) {
    const router = useRouter();

    const [grid, setGrid] = useState<(string | null)[]>(Array(25).fill(null));
    const [selectedTile, setSelectedTile] = useState<number | null>(null);
    const [highlightMode, setHighlightMode] = useState<"row" | "column">("row");
    const [highlightedTiles, setHighlightedTiles] = useState<number[]>([]);

    const gridRef = useRef<(string | null)[]>(grid);
    const selectedTileRef = useRef<number | null>(null);
    const highlightModeRef = useRef<"row" | "column">("row");
    const currentCrosswordRef = useRef<Crossword>({
        size: 0,
        layout: [
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1
        ],
        clues: {
            "across": [], 
            "down": []
        },
        solution: []
    });

    let [currentCrossword, setCurrentCrossword] = useState<Crossword>({
        size: 0,
        layout: [
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1
        ],
        clues: {
            "across": [], 
            "down": []
        },
        solution: []
    });

    useEffect(() => {
        fetch("/crosswords.json")
            .then((response) => response.json())
            .then((data) => {
                setCurrentCrossword(data[0]);
            })
    }, []);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

    useEffect(() => {
        selectedTileRef.current = selectedTile;
    }, [selectedTile]);

    useEffect(() => {
        highlightModeRef.current = highlightMode;
    }, [highlightMode]);

    useEffect(() => {
        currentCrosswordRef.current = currentCrossword;
    }, [currentCrossword]);

    useEffect(() => {
        function handleKeyPress(e: KeyboardEvent) {
            const selected = selectedTileRef.current;
            const mode = highlightModeRef.current;
            if (selected === null) return; // No tile selected

            if (e.key === 'Backspace') {
                setGrid(prevGrid => {
                    const newGrid = [...prevGrid];
                    newGrid[selected] = null;
                    return newGrid;
                });

                const previousIndex = moveSelectionPrev(selected, mode);
                if (previousIndex !== null) {
                    setSelectedTile(previousIndex);
                    setHighlightedTiles(getHighlightedTiles(previousIndex, mode));
                }

                return;
            }

            if (e.key === ' ') {
                e.preventDefault();
                const nextMode = mode === 'row' ? 'column' : 'row';
                setHighlightMode(nextMode);
                setHighlightedTiles(getHighlightedTiles(selected, nextMode));
                return;
            }

            if (e.key.includes('Arrow')) {
                e.preventDefault();

                if (e.key === 'ArrowLeft') {
                    if (mode === 'column') {
                        setHighlightMode('row');
                        setHighlightedTiles(getHighlightedTiles(selected, 'row'));
                        return;
                    }

                    const previousIndex = moveSelectionPrev(selected, mode);
                    if (previousIndex !== null) {
                        setSelectedTile(previousIndex);
                        setHighlightedTiles(getHighlightedTiles(previousIndex, mode));
                    }
                } else if (e.key === 'ArrowRight') {
                    if (mode === 'column') {
                        setHighlightMode('row');
                        setHighlightedTiles(getHighlightedTiles(selected, 'row'));
                        return;
                    }

                    const nextIndex = moveSelectionNext(selected, mode);
                    if (nextIndex !== null) {
                        setSelectedTile(nextIndex);
                        setHighlightedTiles(getHighlightedTiles(nextIndex, mode));
                    }
                } else if (e.key === 'ArrowUp') {
                    if (mode === 'row') {
                        setHighlightMode('column');
                        setHighlightedTiles(getHighlightedTiles(selected, 'column'));
                        return;
                    }

                    const previousIndex = moveSelectionPrev(selected, mode);
                    if (previousIndex !== null) {
                        setSelectedTile(previousIndex);
                        setHighlightedTiles(getHighlightedTiles(previousIndex, mode));
                    }
                } else if (e.key === 'ArrowDown') {
                    if (mode === 'row') {
                        setHighlightMode('column');
                        setHighlightedTiles(getHighlightedTiles(selected, 'column'));
                        return;
                    }

                    const nextIndex = moveSelectionNext(selected, mode);
                    if (nextIndex !== null) {
                        setSelectedTile(nextIndex);
                        setHighlightedTiles(getHighlightedTiles(nextIndex, mode));
                    }
                }

                return;
            }

            const key = e.key.toUpperCase();
            if (!/^[A-Z]$/.test(key)) return;

            setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                newGrid[selected] = key;
                return newGrid;
            });

            const nextIndex = moveSelectionNextAuto(selected, mode);
            if (nextIndex !== null) {
                setSelectedTile(nextIndex);
                setHighlightedTiles(getHighlightedTiles(nextIndex, mode));
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    function moveSelectionNextAuto(currentIndex: number, mode: "row" | "column"): number | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword.size) return null;

        const size = crossword.size;
        const startRow = Math.floor(currentIndex / size);
        const startCol = currentIndex % size;
        let searchOrder: number[] = [];

        if (mode === "row") {
            for (let c = startCol + 1; c < size; c++) {
                searchOrder.push(startRow * size + c);
            }
            for (let c = 0; c < startCol; c++) {
                searchOrder.push(startRow * size + c);
            }
            for (let r = startRow + 1; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    searchOrder.push(r * size + c);
                }
            }
            for (let r = 0; r < startRow; r++) {
                for (let c = 0; c < size; c++) {
                    searchOrder.push(r * size + c);
                }
            }
        } else {
            for (let r = startRow + 1; r < size; r++) {
                searchOrder.push(r * size + startCol);
            }
            for (let r = 0; r < startRow; r++) {
                searchOrder.push(r * size + startCol);
            }
            for (let c = startCol + 1; c < size; c++) {
                for (let r = 0; r < size; r++) {
                    searchOrder.push(r * size + c);
                }
            }
            for (let c = 0; c < startCol; c++) {
                for (let r = 0; r < size; r++) {
                    searchOrder.push(r * size + c);
                }
            }
        }

        for (let index of searchOrder) {
            if (crossword.layout[index] === 1 && gridRef.current[index] === null) {
                return index;
            }
        }

        return null;
    }

    function moveSelectionNext(currentIndex: number, mode: "row" | "column"): number | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword.size) return null;

        const size = crossword.size;
        const row = Math.floor(currentIndex / size);
        const col = currentIndex % size;

        if (mode === "row") {
            for (let c = col + 1; c < size; c++) {
                const idx = row * size + c;
                if (crossword.layout[idx] === 1) return idx;
            }
            return null;
        }

        for (let r = row + 1; r < size; r++) {
            const idx = r * size + col;
            if (crossword.layout[idx] === 1) return idx;
        }
        return null;
    }

    function moveSelectionPrev(currentIndex: number, mode: "row" | "column"): number | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword.size) return null;

        const size = crossword.size;
        const row = Math.floor(currentIndex / size);
        const col = currentIndex % size;

        if (mode === "row") {
            for (let c = col - 1; c >= 0; c--) {
                const idx = row * size + c;
                if (crossword.layout[idx] === 1) return idx;
            }
            return null;
        }

        for (let r = row - 1; r >= 0; r--) {
            const idx = r * size + col;
            if (crossword.layout[idx] === 1) return idx;
        }
        return null;
    }

    function getHighlightedTiles(index: number, mode: "row" | "column") {
        const crossword = currentCrosswordRef.current;
        if (!crossword.size) return [];

        const size = crossword.size;
        const row = Math.floor(index / size);
        const col = index % size;

        const tiles: number[] = [];

        if (mode === "row") {
            for (let i = 0; i < size; i++) {
                const tileIndex = row * size + i;
                if (crossword.layout[tileIndex] === 1) tiles.push(tileIndex);
            }
        } else {
            for (let i = 0; i < size; i++) {
                const tileIndex = i * size + col;
                if (crossword.layout[tileIndex] === 1) tiles.push(tileIndex);
            }
        }

        return tiles;
    }

    function handleTileClick(index: number) {
        if (selectedTile === index) {
            const newMode = highlightMode === "row" ? "column" : "row";
            setHighlightMode(newMode);
            setHighlightedTiles(getHighlightedTiles(index, newMode));
        } else {
            setSelectedTile(index);
            setHighlightedTiles(getHighlightedTiles(index, highlightMode));
        }
    }

    const highlightedSet = useMemo(() => new Set(highlightedTiles), [highlightedTiles]);    

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
                <div className="grid rounded-2xl overflow-hidden select-none border border-zinc-800" style={{ gridTemplateColumns: `repeat(${currentCrossword.size}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${currentCrossword.size}, minmax(0, 1fr))` }}>
                    {currentCrossword.layout.map((item: number, index: number) => {
                        const size = currentCrossword.size;
                        const row = Math.floor(index / size);
                        const col = index % size;
                        const isLastRow = row === size - 1;
                        const isLastCol = col === size - 1;

                        return (
                            <div
                                className={`w-20 h-20 ${!isLastRow ? "border-b border-black" : ""} ${!isLastCol ? "border-r border-black" : ""} flex items-center justify-center ${
                                    selectedTile === index 
                                        ? "bg-zinc-400/100"
                                        : highlightedSet.has(index)
                                        ? "bg-zinc-400/50"
                                        : item === 0
                                        ? "bg-black"
                                        : "bg-zinc-700"
                                }`}
                                key={index}
                                onMouseDown={() => item === 1 && handleTileClick(index)}
                            >
                                <div className="letter flex h-full w-full items-center justify-center text-5xl text-shadow-md text-shadow-black/50">
                                    {grid[index]}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex flex-col gap-y-5">
                    <div className="flex gap-x-60 border-b-1 border-zinc-600 pb-5">
                        <div className="flex flex-col gap-y-1">
                            <p className="text-sm uppercase font-bold text-zinc-300 gap">Across</p>
                            {currentCrossword.clues.across.map((item: string, index: number) => {
                                return (
                                    <p className="text-sm text-zinc-300 ml-2" key={index}><span className="font-bold">{index + 1}.</span> {item}</p>
                                )
                            })}
                        </div>
                        <div className="flex flex-col gap-y-1">
                            <p className="text-sm uppercase font-bold text-zinc-300">Down</p>
                            {currentCrossword.clues.down.map((item: string, index: number) => {
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