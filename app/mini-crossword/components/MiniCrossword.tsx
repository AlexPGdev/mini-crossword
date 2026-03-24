"use client";

import { Crossword, Clue } from "@/app/types/Crossword";
import { ArrowLeft, ChevronLeft, ChevronRight, HomeIcon, MoveLeft, MoveRight, ToggleLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface MiniCrosswordProps {
    onHomeClick: () => void;
}

export function MiniCrossword({ onHomeClick }: MiniCrosswordProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const crosswordId = searchParams.get("crossword");

    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
    const [highlightMode, setHighlightMode] = useState<"row" | "column">("row");
    const [highlightedTiles, setHighlightedTiles] = useState<{ row: number; col: number }[]>([]);
    const [correctLetters, setCorrectLetters] = useState<Set<string>>(new Set());
    const [incorrectLetters, setIncorrectLetters] = useState<Set<string>>(new Set());
    const [isSolved, setIsSolved] = useState<boolean>(false);
    const [formatedTitle, setFormatedTitle] = useState<string>("");
    const [enabled, setEnabled] = useState<boolean>(false);
    const [isPreviousEnabled, setIsPreviousEnabled] = useState<boolean>(false);
    const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);
    const [direction, setDirection] = useState(1);
    const selectedTileRef = useRef<{ row: number; col: number } | null>(null);
    const highlightModeRef = useRef<"row" | "column">("row");
    const currentCrosswordRef = useRef<Crossword>({
        puzzleId: "",
        size: 0,
        grid : [],
        clues: {
            across: [], 
            down: []
        }
    });
    
    let [currentCrossword, setCurrentCrossword] = useState<Crossword>({
        puzzleId: "",
        size: 0,
        grid : [],
        clues: {
            across: [], 
            down: []
        }
    });

    const [grid, setGrid] = useState<(string | null)[][]>([]);
    const gridRef = useRef<(string | null)[][]>(grid);

    let [previousCrossword, setPreviousCrossword] = useState<string | null>(null);
    let [nextCrossword, setNextCrossword] = useState<string | null>(null);

    useEffect(() => {
        if (!crosswordId) return;

        fetch("/newPuzzles.json")
            .then((response) => response.json())
            .then((data) => {
                const puzzle = data.find(
                    (item: any) =>
                        item.puzzleId === `bostonglobe-mini-${crosswordId}`
                );

                let currentCrosswordIndex = data.findIndex((item: any) => item.puzzleId === `bostonglobe-mini-${crosswordId}`);
                let previousCrosswordIndex = currentCrosswordIndex + 1;
                let nextCrosswordIndex = currentCrosswordIndex - 1;

                setPreviousCrossword(data[previousCrosswordIndex]?.puzzleId.split('-')[2]);
                setNextCrossword(data[nextCrosswordIndex]?.puzzleId.split('-')[2]);

                setCurrentCrossword(puzzle);
                setGrid(puzzle.grid.map((row: string[]) => row.map(cell => (cell === "#" ? "#" : null))));
                setSelectedTile(null);
                setCorrectLetters(new Set());
                setIncorrectLetters(new Set());
                setIsSolved(false);
            });
    }, [crosswordId]);

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

        if(currentCrossword && currentCrossword.puzzleId){
            console.log(currentCrossword.puzzleId)
            let puzzleDateRaw = `${currentCrossword.puzzleId.split("-")[2].slice(0, 4)}/${currentCrossword.puzzleId.split("-")[2].slice(4, 6)}/${currentCrossword.puzzleId.split("-")[2].slice(6, 8)}`;
    
            let puzzleDate = new Date(puzzleDateRaw);
    
            let formattedDate = puzzleDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
    
            setFormatedTitle(formattedDate);
        }
        
    }, [currentCrossword]);

    useEffect(() => {
        function keyOf(pos: { row: number; col: number }) {
            return `${pos.row}-${pos.col}`;
        }

        function handleKeyPress(e: KeyboardEvent) {
            const selected = selectedTileRef.current;
            const mode = highlightModeRef.current;

            if (!selected) return;

            const { row, col } = selected;

            if (e.key === 'Backspace') {
                setGrid(prev => {
                    const newGrid = prev.map(r => [...r]);
                    newGrid[row][col] = null;
                    return newGrid;
                });

                setCorrectLetters(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(keyOf(selected));
                    return newSet;
                });

                setIncorrectLetters(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(keyOf(selected));
                    return newSet;
                });

                const prevPos = moveSelectionPrev(selected, mode);
                if (prevPos) {
                    setSelectedTile(prevPos);
                    setHighlightedTiles(getHighlightedTiles(prevPos, mode));
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

                    const prevPos = moveSelectionPrev(selected, mode);
                    if (prevPos) {
                        setSelectedTile(prevPos);
                        setHighlightedTiles(getHighlightedTiles(prevPos, mode));
                    }
                }

                else if (e.key === 'ArrowRight') {
                    if (mode === 'column') {
                        setHighlightMode('row');
                        setHighlightedTiles(getHighlightedTiles(selected, 'row'));
                        return;
                    }

                    const nextPos = moveSelectionNext(selected, mode);
                    if (nextPos) {
                        setSelectedTile(nextPos);
                        setHighlightedTiles(getHighlightedTiles(nextPos, mode));
                    }
                }

                else if (e.key === 'ArrowUp') {
                    if (mode === 'row') {
                        setHighlightMode('column');
                        setHighlightedTiles(getHighlightedTiles(selected, 'column'));
                        return;
                    }

                    const prevPos = moveSelectionPrev(selected, mode);
                    if (prevPos) {
                        setSelectedTile(prevPos);
                        setHighlightedTiles(getHighlightedTiles(prevPos, mode));
                    }
                }

                else if (e.key === 'ArrowDown') {
                    if (mode === 'row') {
                        setHighlightMode('column');
                        setHighlightedTiles(getHighlightedTiles(selected, 'column'));
                        return;
                    }

                    const nextPos = moveSelectionNext(selected, mode);
                    if (nextPos) {
                        setSelectedTile(nextPos);
                        setHighlightedTiles(getHighlightedTiles(nextPos, mode));
                    }
                }

                return;
            }

            if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
                e.preventDefault();
                checkGrid();
                return;
            }

            const key = e.key.toUpperCase();
            if (!/^[A-Z]$/.test(key)) return;

            // Set letter
            setGrid(prev => {
                const newGrid = prev.map(r => [...r]);
                newGrid[row][col] = key;
                return newGrid;
            });

            // Reset correctness
            setCorrectLetters(prev => {
                const newSet = new Set(prev);
                newSet.delete(keyOf(selected));
                return newSet;
            });

            setIncorrectLetters(prev => {
                const newSet = new Set(prev);
                newSet.delete(keyOf(selected));
                return newSet;
            });

            // Move forward automatically
            const nextSelection = moveSelectionNextAuto(selected, mode);
            if (nextSelection) {
                setSelectedTile(nextSelection.position);
                setHighlightMode(nextSelection.mode);
                setHighlightedTiles(getHighlightedTiles(nextSelection.position, nextSelection.mode));
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        console.log('asd')

        const flatGrid = gridRef.current.flat();
        const filledTiles = flatGrid.filter(item => item !== null);

        const solvedTiles = currentCrosswordRef.current.grid?.flat() ?? [];

        console.log(filledTiles)
        console.log(solvedTiles)

        if(solvedTiles.length > 0 && areArraysEqual(filledTiles, solvedTiles)) {
            console.log('finished')

            checkGrid();
            setIsSolved(true);

            if(enabled && (isPreviousEnabled || isNextEnabled)) {
                setDirection(isNextEnabled ? 1 : -1);
                router.push(`/mini-crossword?crossword=${isNextEnabled ? nextCrossword : previousCrossword}`, { scroll: false });
            }
        }

    }, [grid]);

    const areArraysEqual = (arrA: any[], arrB: any[]) => {
        const isLengthEqual = arrA.length === arrB.length
        if (!isLengthEqual) {return false;}

        let isEqual = true;
        for (let i = 0; i < arrA.length; i++) {
        if (arrA[i] !== arrB[i]) {
            return false;
        }
        }
        return isEqual;
    }

    function checkGrid() {
        const userGrid = gridRef.current;
        const puzzle = currentCrosswordRef.current;

        if (!userGrid || !puzzle?.grid) return;

        const newCorrect = new Set<string>();
        const newIncorrect = new Set<string>();

        const keyOf = (r: number, c: number) => `${r}-${c}`;

        for (let r = 0; r < puzzle.size; r++) {
            for (let c = 0; c < puzzle.size; c++) {
                const solutionCell = puzzle.grid[r][c];
                const userCell = userGrid[r][c];

                // skip black squares
                if (solutionCell === "#") continue;

                const key = keyOf(r, c);

                if (userCell === solutionCell) {
                    newCorrect.add(key);
                } else if (userCell !== null && userCell !== undefined) {
                    newIncorrect.add(key);
                }
            }
        }

        setCorrectLetters(newCorrect);
        setIncorrectLetters(newIncorrect);

        console.log(newCorrect, newIncorrect)
    }

    function moveSelectionNextAuto(
        current: { row: number; col: number },
        mode: "row" | "column"
    ): { position: { row: number; col: number }; mode: "row" | "column" } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row: startRow, col: startCol } = current;

        // Determine current clue and its type
        let currentClue: (Clue & { type: 'across' | 'down' }) | null = null;

        if (mode === 'row') {
            const acrossClues = crossword.clues.across.filter(c => c.row === startRow && c.col <= startCol);
            const sorted = acrossClues.sort((a, b) => b.col - a.col);
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'across' };
            }
        } else {
            const downClues = crossword.clues.down.filter(c => c.col === startCol && c.row <= startRow);
            const sorted = downClues.sort((a, b) => b.row - a.row);
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'down' };
            }
        }

        // Try to continue in the same clue first
        if (currentClue) {
            const clueCells: { row: number; col: number }[] = [];
            if (currentClue.type === 'across') {
                for (let c = currentClue.col; c < size && crossword.grid[currentClue.row][c] !== '#'; c++) {
                    clueCells.push({ row: currentClue.row, col: c });
                }
            } else {
                for (let r = currentClue.row; r < size && crossword.grid[r][currentClue.col] !== '#'; r++) {
                    clueCells.push({ row: r, col: currentClue.col });
                }
            }

            const currentIndex = clueCells.findIndex(pos => pos.row === startRow && pos.col === startCol);
            if (currentIndex >= 0) {
                for (let i = currentIndex + 1; i < clueCells.length; i++) {
                    const pos = clueCells[i];
                    if (gridRef.current[pos.row][pos.col] === null) {
                        return {
                            position: pos,
                            mode: currentClue.type === 'across' ? 'row' : 'column',
                        };
                    }
                }
            }
        }

        // Build clue order as: all across clues (ascending), then all down clues (ascending)
        const allClues: (Clue & { type: 'across' | 'down' })[] = [
            ...[...crossword.clues.across]
                .sort((a, b) => a.number - b.number)
                .map(clue => ({ ...clue, type: 'across' as const })),
            ...[...crossword.clues.down]
                .sort((a, b) => a.number - b.number)
                .map(clue => ({ ...clue, type: 'down' as const })),
        ];

        if (allClues.length === 0) {
            return null;
        }

        const getFirstEmptyInClue = (clue: Clue & { type: 'across' | 'down' }) => {
            if (clue.type === 'across') {
                for (let c = clue.col; c < size && crossword.grid[clue.row][c] !== '#'; c++) {
                    if (gridRef.current[clue.row][c] === null) {
                        return { row: clue.row, col: c };
                    }
                }
            } else {
                for (let r = clue.row; r < size && crossword.grid[r][clue.col] !== '#'; r++) {
                    if (gridRef.current[r][clue.col] === null) {
                        return { row: r, col: clue.col };
                    }
                }
            }
            return null;
        };

        const currentClueIndex = currentClue
            ? allClues.findIndex(c => c.number === currentClue!.number && c.type === currentClue!.type)
            : -1;

        // Check clues after current clue, then wrap to start
        for (let i = 1; i <= allClues.length; i++) {
            const idx = (currentClueIndex + i + allClues.length) % allClues.length;
            const nextClue = allClues[idx];
            const nextPos = getFirstEmptyInClue(nextClue);
            if (nextPos) {
                return {
                    position: nextPos,
                    mode: nextClue.type === 'across' ? 'row' : 'column',
                };
            }
        }

        return null;
    }

    function moveSelectionNext(current: { row: number; col: number }, mode: "row" | "column"): { row: number; col: number } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row, col } = current;

        if (mode === "row") {
            for (let c = col + 1; c < size; c++) {
                if (crossword.grid[row][c] !== "#") {
                    return { row, col: c };
                }
            }
            return null;
        }

        for (let r = row + 1; r < size; r++) {
            if (crossword.grid[r][col] !== "#") {
                return { row: r, col };
            }
        }

        return null;
    }

    function moveSelectionPrev(current: { row: number; col: number }, mode: "row" | "column"): { row: number; col: number } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row, col } = current;

        if (mode === "row") {
            for (let c = col - 1; c >= 0; c--) {
                if (crossword.grid[row][c] !== "#") {
                    return { row, col: c };
                }
            }
            return null;
        }

        for (let r = row - 1; r >= 0; r--) {
            if (crossword.grid[r][col] !== "#") {
                return { row: r, col };
            }
        }

        return null;
    }

    function getHighlightedTiles(current: { row: number; col: number }, mode: "row" | "column") {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return [];

        const size = crossword.size;
        const { row, col } = current;

        const tiles: { row: number; col: number }[] = [];

        if (mode === "row") {
            for (let c = 0; c < size; c++) {
                if (crossword.grid[row][c] !== "#") {
                    tiles.push({ row, col: c });
                }
            }
        } else {
            for (let r = 0; r < size; r++) {
                if (crossword.grid[r][col] !== "#") {
                    tiles.push({ row: r, col });
                }
            }
        }

        return tiles;
    }

    function handleTileClick(row: number, col: number) {
        const isSame =
            selectedTile?.row === row && selectedTile?.col === col;

        if (isSame) {
            const newMode = highlightMode === "row" ? "column" : "row";
            setHighlightMode(newMode);
            setHighlightedTiles(getHighlightedTiles({ row, col }, newMode));
        } else {
            setSelectedTile({ row, col });
            setHighlightedTiles(getHighlightedTiles({ row, col }, highlightMode));
        }
    }

    function handleClueClick(row: number, col: number, mode: "row" | "column") {
        const isSame =
            selectedTile?.row === row && selectedTile?.col === col;

        if (isSame) {
            setHighlightMode(mode);
            setHighlightedTiles(getHighlightedTiles({ row, col }, mode));
        } else {
            setSelectedTile({ row, col });
            setHighlightMode(mode);
            setHighlightedTiles(getHighlightedTiles({ row, col }, mode));
        }
    }

    function changePuzzle(offset: number) {
        if (!crosswordId) return;

        setDirection(offset);

        router.push(`/mini-crossword?crossword=${offset > 0 ? nextCrossword : previousCrossword}`, { scroll: false });
    }

    const highlightedSet = useMemo(
        () => new Set(highlightedTiles.map(t => `${t.row}-${t.col}`)),
        [highlightedTiles]
    );

    const clueNumbers = useMemo(() => {
        const map = new Map<string, number>();
        if (currentCrossword?.clues) {
            currentCrossword.clues.across.forEach(clue => {
                map.set(`${clue.row}-${clue.col}`, clue.number);
            });
            currentCrossword.clues.down.forEach(clue => {
                map.set(`${clue.row}-${clue.col}`, clue.number);
            });
        }
        return map;
    }, [currentCrossword]);

    const currentClue = useMemo(() => {
        if (!selectedTile || !currentCrossword?.clues) return null;

        const { row, col } = selectedTile;

        if (highlightMode === 'row') {
            // Find across clue starting at or before col in same row
            const acrossClues = currentCrossword.clues.across.filter(c => c.row === row && c.col <= col);
            // The last one before or at col (largest col)
            const clue = acrossClues.sort((a, b) => b.col - a.col)[0];
            return clue;
        } else {
            // Down
            const downClues = currentCrossword.clues.down.filter(c => c.col === col && c.row <= row);
            const clue = downClues.sort((a, b) => b.row - a.row)[0];
            return clue;
        }
    }, [selectedTile, highlightMode, currentCrossword]);

    const completedClues = useMemo(() => {
        const crossword = currentCrossword;
        if (!crossword?.grid || !grid.length) {
            return { across: new Set<string>(), down: new Set<string>() };
        }

        const across = new Set<string>();
        const down = new Set<string>();

        crossword.clues.across.forEach((clue) => {
            let isFilled = true;
            for (let c = clue.col; c < crossword.size && crossword.grid[clue.row][c] !== "#"; c++) {
                if (grid[clue.row]?.[c] === null) {
                    isFilled = false;
                    break;
                }
            }
            if (isFilled) across.add(`${clue.row}-${clue.col}-${clue.number}`);
        });

        crossword.clues.down.forEach((clue) => {
            let isFilled = true;
            for (let r = clue.row; r < crossword.size && crossword.grid[r][clue.col] !== "#"; r++) {
                if (grid[r]?.[clue.col] === null) {
                    isFilled = false;
                    break;
                }
            }
            if (isFilled) down.add(`${clue.row}-${clue.col}-${clue.number}`);
        });

        return { across, down };
    }, [currentCrossword, grid]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={crosswordId}
                initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col bg-zinc-800 w-full border-1 border-zinc-600 rounded-2xl justify-between px-5 py-4 gap-y-5">
                    <div className="flex justify-between border-b-2 border-zinc-600 pb-4 items-center h-[60px]">
                        <div className="flex items-center">
                            <HomeIcon className="h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center cursor-pointer stroke-zinc-400 hover:stroke-zinc-100 transition-all" onClick={() => { onHomeClick(); router.push('/mini-crossword')}} />
                            <p className="font-bold pl-3 mr-5 h-[20px] w-fit pr-3 border-r-2 border-zinc-600 flex items-center justify-center">00:05</p>
                            <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Result</span></button>
                            <button className="flex text-zinc-400 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Info</span></button>
                        </div>
                        {isSolved && (
                            <p className="text-center"><span className="text-green-600">Congratulations!</span><br /> You solved the crossword in 00:05</p>
                        )}
                        <button className="flex text-zinc-400 mr-5 cursor-pointer hover:bg-zinc-600 rounded-sm hover:text-zinc-200 transition-all"><span className="p-2 px-4">Settings</span></button>
                    </div>

                    <div className="flex w-full gap-x-10">
                        <div className="flex flex-col text-center gap-4">
                            <div className="grid rounded-2xl overflow-hidden select-none border border-zinc-800" style={{ gridTemplateColumns: `repeat(${currentCrossword ? currentCrossword.size : 0}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${currentCrossword ? currentCrossword.size : 0}, minmax(0, 1fr))` }}>
                                {currentCrossword?.grid?.map((rowArr: string[], row: number) => {
                                    const size = currentCrossword.size;

                                    return rowArr.map((cell: string, col: number) => {
                                        const index = row * size + col;
                                        const isLastRow = row === size - 1;
                                        const isLastCol = col === size - 1;

                                        return (
                                            <div
                                                key={index}
                                                className={`w-20 h-20 relative
                                                    ${!isLastRow ? "border-b border-black" : ""} 
                                                    ${!isLastCol ? "border-r border-black" : ""} 
                                                    flex items-center justify-center 
                                                    ${
                                                        selectedTile?.row === row && selectedTile?.col === col
                                                            ? "bg-zinc-400"
                                                            : highlightedSet.has(`${row}-${col}`)
                                                            ? "bg-zinc-400/50"
                                                            : cell === "#"
                                                            ? "bg-black"
                                                            : "bg-zinc-700"
                                                    }`}
                                                onMouseDown={() => cell !== "#" && handleTileClick(row, col)}
                                            >
                                                {clueNumbers.has(`${row}-${col}`) && (
                                                    <div className="absolute top-0 left-0 text-md text-zinc-300 font-bold p-1">
                                                        {clueNumbers.get(`${row}-${col}`)}
                                                    </div>
                                                )}
                                                <div
                                                    className={`letter flex h-full w-full items-center justify-center text-5xl text-shadow-md text-shadow-black/50 
                                                        ${
                                                            correctLetters.has(`${row}-${col}`)
                                                                ? "text-green-400"
                                                                : incorrectLetters.has(`${row}-${col}`)
                                                                ? "text-red-400"
                                                                : "text-white"
                                                        }`}
                                                >
                                                    {cell !== "#" ? grid[row][col] : ""}
                                                </div>
                                            </div>
                                        );
                                    });
                                })}
                            </div>
                            
                            <div className="flex justify-between items-center gap-x-2 border-b-1 border-zinc-600 pb-5">
                                <div>
                                    <button className="cursor-pointer border-zinc-600 bg-zinc-600/30 border-1 hover:bg-zinc-600 p-2 rounded-xl transition-all" title="Previous Crossword" onClick={() => changePuzzle(-1)}>
                                        <MoveLeft />
                                    </button>
                                </div>
                                <p>{formatedTitle}</p>
                                <div>
                                    <button className="cursor-pointer border-zinc-600 bg-zinc-600/30 border-1 hover:bg-zinc-600 p-2 rounded-xl transition-all" title="Next Crossword" onClick={() => changePuzzle(1)}>
                                        <MoveRight />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-5 ">
                                <div className="flex gap-x-10 items-center justify-between">
                                    <div>
                                        <p className="font-bold text-left">Auto-advance on solve</p>
                                        <p className="text-left text-zinc-400 text-sm">Jump to the next puzzle when you finish</p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setEnabled(!enabled)}
                                        className={`${
                                        enabled ? "bg-green-500" : "bg-zinc-400"
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                    >
                                        <span
                                            className={`${
                                                enabled ? "translate-x-6" : "translate-x-1"
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                </div>

                                {enabled && (
                                    <>                        
                                        <div className="flex transition-all">
                                            <button 
                                                className={`flex w-1/2 justify-center cursor-pointer border-zinc-600 ${isPreviousEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} border-1 hover:bg-zinc-600 p-2 rounded-l-xl transition-all`} 
                                                title="Previous Crossword"
                                                onClick={() => {setIsPreviousEnabled(!isPreviousEnabled); setIsNextEnabled(false)}}
                                            >
                                                <ChevronLeft /> Previous
                                            </button>
                                            <button 
                                                className={`flex w-1/2 justify-center cursor-pointer border-zinc-600 ${isNextEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} border-1 hover:bg-zinc-600 p-2 rounded-r-xl transition-all`}
                                                title="Previous Crossword"
                                                onClick={() => {setIsNextEnabled(!isNextEnabled); setIsPreviousEnabled(false)}}
                                            >
                                                Next <ChevronRight />
                                            </button>
                                        </div>
                                        {(isPreviousEnabled || isNextEnabled) ? (
                                            <p className="mt-[-10px] text-sm text-zinc-400">Goes to the <span className="font-bold">{isPreviousEnabled ? "previous" : "next"}</span> crossword after solving</p>
                                        ) : (
                                            <p className="mt-[-10px] text-sm text-zinc-400">Choose where to go after solving</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-5">
                            <div className="flex gap-x-10 border-b-1 border-zinc-600 pb-5 select-none">
                                <div className="flex flex-col">
                                    <p className="text-sm uppercase font-bold text-zinc-300 gap">Across</p>
                                    {(currentCrossword && currentCrossword.clues.across) && (
                                        currentCrossword.clues.across.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.across.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "row")} key={index}>
                                                    <p className={`text-sm text-zinc-300 p-1 px-2 transition-opacity ${item === currentClue ? 'bg-zinc-600 rounded-2xl' : ''} ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm uppercase font-bold text-zinc-300">Down</p>
                                    {(currentCrossword && currentCrossword.clues.down) && (
                                        currentCrossword.clues.down.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.down.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "column")} key={index}>
                                                    <p className={`text-sm text-zinc-300 p-1 px-2 transition-opacity ${item === currentClue ? 'bg-zinc-600 rounded-2xl' : ''} ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                </div>
                                            )
                                        })
                                    )}
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
            </motion.div>
        </AnimatePresence>
    )
}