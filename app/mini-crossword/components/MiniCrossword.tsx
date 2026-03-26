"use client";

import { Crossword } from "@/app/types/Crossword";
import { ChevronLeft, ChevronRight, HomeIcon, MoveLeft, MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsModal } from "./SettingsModal";
import { useSettings } from "../hooks/useSettings";

interface MiniCrosswordProps {
    onHomeClick: () => void;
}

function formatMmSs(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MiniCrossword({ onHomeClick }: MiniCrosswordProps) {
    const { settings } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const crosswordId = searchParams.get("crossword");

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
    const [highlightMode, setHighlightMode] = useState<"row" | "column">("row");
    const [highlightedTiles, setHighlightedTiles] = useState<{ row: number; col: number }[]>([]);
    const [correctLetters, setCorrectLetters] = useState<Set<string>>(new Set());
    const [incorrectLetters, setIncorrectLetters] = useState<Set<string>>(new Set());
    const [isSolved, setIsSolved] = useState<boolean>(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const isSolvedRef = useRef(false);
    const [formatedTitle, setFormatedTitle] = useState<string>("");
    const [enabled, setEnabled] = useState<boolean>(false);
    const [isPreviousEnabled, setIsPreviousEnabled] = useState<boolean>(false);
    const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);
    const [direction, setDirection] = useState(1);
    const selectedTileRef = useRef<{ row: number; col: number } | null>(null);
    const highlightModeRef = useRef<"row" | "column">("row");
    const incorrectLettersRef = useRef<Set<string>>(new Set());
    const currentCrosswordRef = useRef<Crossword>({
        puzzleId: "",
        size: 0,
        grid: [],
        clues: {
            across: [],
            down: []
        }
    });

    let [currentCrossword, setCurrentCrossword] = useState<Crossword>({
        puzzleId: "",
        size: 0,
        grid: [],
        clues: {
            across: [],
            down: []
        }
    });

    const [grid, setGrid] = useState<(string | null)[][]>([[]]);
    const gridRef = useRef<(string | null)[][]>([[]]);

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
                setElapsedSeconds(0);
            });
    }, [crosswordId]);

    const isAnimationsEnabled = settings.animationsEnabled;

    useEffect(() => {
        isSolvedRef.current = isSolved;
    }, [isSolved]);

    useEffect(() => {
        if (!currentCrossword?.puzzleId || isSolved) return;

        const id = window.setInterval(() => {
            setElapsedSeconds((s) => s + 1);
        }, 1000);

        return () => window.clearInterval(id);
    }, [currentCrossword?.puzzleId, isSolved]);

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
        incorrectLettersRef.current = incorrectLetters;
    }, [incorrectLetters]);

    useEffect(() => {
        currentCrosswordRef.current = currentCrossword;

        if (currentCrossword && currentCrossword.puzzleId) {
            console.log(currentCrossword.puzzleId)
            let puzzleDateRaw = `${currentCrossword?.puzzleId?.split("-")[2]?.slice(0, 4)}/${currentCrossword?.puzzleId?.split("-")[2]?.slice(4, 6)}/${currentCrossword?.puzzleId?.split("-")[2]?.slice(6, 8)}`;

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
                if (isSolvedRef.current) return;

                if (e.ctrlKey) {
                    console.log('ctrl+backspace')
                    console.log(incorrectLetters)
                    removeIncorrectLetters();
                } else {
                    console.log('backspace')
                    setGrid(prev => {
                        const newGrid = prev.map(r => [...r]);
                        newGrid[row] && (newGrid[row][col] = null);
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

                    const prevPos = moveSelectionPrevWithinClue(selected, mode);
                    if (prevPos) {
                        setSelectedTile(prevPos);
                        setHighlightedTiles(getHighlightedTiles(prevPos, mode));
                    }
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

            if (isSolvedRef.current) return;

            console.log("key", key)

            setGrid(prev => {
                const newGrid = prev.map(r => [...r]);
                newGrid[row] && (newGrid[row][col] = key);
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

        if (solvedTiles.length > 0 && areArraysEqual(filledTiles, solvedTiles)) {
            console.log('finished')

            checkGrid();
            setIsSolved(true);

            if (enabled && (isPreviousEnabled || isNextEnabled)) {
                setDirection(isNextEnabled ? 1 : -1);
                router.push(`/mini-crossword?crossword=${isNextEnabled ? nextCrossword : previousCrossword}`, { scroll: false });
            }
        }

    }, [grid]);

    const areArraysEqual = (arrA: any[], arrB: any[]) => {
        const isLengthEqual = arrA.length === arrB.length
        if (!isLengthEqual) { return false; }

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
                const solutionCell = puzzle.grid[r]?.[c];
                const userCell = userGrid[r]?.[c];

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

    function removeIncorrectLetters() {
        if (isSolvedRef.current) return;

        const userGrid = gridRef.current;
        const puzzle = currentCrosswordRef.current;
        const incorrect = incorrectLettersRef.current;

        if (!userGrid || !puzzle?.grid) return;
        if (!incorrect || incorrect.size === 0) return;

        const nextGrid = userGrid.map((r) => [...r]);

        incorrect.forEach((key) => {
            const [rStr, cStr] = key.split("-");
            const r = Number(rStr);
            const c = Number(cStr);

            if (!Number.isFinite(r) || !Number.isFinite(c)) return;
            if (!nextGrid[r]) return;
            if (nextGrid[r][c] === "#") return;

            nextGrid[r][c] = null;
        });

        setIncorrectLetters(new Set());

        gridRef.current = nextGrid;
        setGrid(nextGrid);
    }

    function moveSelectionNextAuto(
        current: { row: number; col: number },
        mode: "row" | "column"
    ): { position: { row: number; col: number }; mode: "row" | "column" } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row: startRow, col: startCol } = current;

        let currentClue: ({ number: number; row: number; col: number; answer: string; clue: string } & { type: 'across' | 'down' }) | null = null;

        if (mode === 'row') {
            const acrossClues = crossword.clues.across.filter(c => c.row === startRow && c.col <= startCol);
            const sorted = acrossClues.sort((a, b) => b.col - a.col);
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'across' } as any;
            }
        } else {
            const downClues = crossword.clues.down.filter(c => c.col === startCol && c.row <= startRow);
            const sorted = downClues.sort((a, b) => b.row - a.row);
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'down' } as any;
            }
        }

        if (currentClue) {
            const clueCells: { row: number; col: number }[] = [];
            if (currentClue.type === 'across') {
                for (let c = currentClue.col; c < size && crossword.grid[currentClue.row]?.[c] !== '#'; c++) {
                    clueCells.push({ row: currentClue.row, col: c });
                }
            } else {
                for (let r = currentClue.row; r < size && crossword.grid[r]?.[currentClue.col] !== '#'; r++) {
                    clueCells.push({ row: r, col: currentClue.col });
                }
            }

            const currentIndex = clueCells.findIndex(pos => pos.row === startRow && pos.col === startCol);
            if (currentIndex >= 0) {
                for (let i = currentIndex + 1; i < clueCells.length; i++) {
                    const pos = clueCells[i];
                    if (pos && gridRef.current[pos.row]?.[pos.col] === null) {
                        return {
                            position: pos,
                            mode: currentClue.type === 'across' ? 'row' : 'column',
                        };
                    }
                }

                for (let i = 0; i < currentIndex; i++) {
                    const pos = clueCells[i];
                    if (pos && gridRef.current[pos.row]?.[pos.col] === null) {
                        return {
                            position: pos,
                            mode: currentClue.type === 'across' ? 'row' : 'column',
                        };
                    }
                }
            }
        }

        const allClues: (Crossword['clues']['across'][number] & { type: 'across' | 'down' })[] = [
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

        const getFirstEmptyInClue = (clue: Crossword['clues']['across'][number] & { type: 'across' | 'down' }) => {
            if (clue.type === 'across') {
                for (let c = clue.col; c < size && crossword.grid[clue.row]?.[c] !== '#'; c++) {
                    if (gridRef.current[clue.row]?.[c] === null) {
                        return { row: clue.row, col: c };
                    }
                }
            } else {
                for (let r = clue.row; r < size && crossword.grid[r]?.[clue.col] !== '#'; r++) {
                    if (gridRef.current[r]?.[clue.col] === null) {
                        return { row: r, col: clue.col };
                    }
                }
            }
            return null;
        };

        const currentClueIndex = currentClue
            ? allClues.findIndex(c => c.number === currentClue!.number && c.type === currentClue!.type)
            : -1;

        for (let i = 1; i <= allClues.length; i++) {
            const idx = (currentClueIndex + i + allClues.length) % allClues.length;
            const nextClue = allClues[idx];
            const nextPos = getFirstEmptyInClue(nextClue as any);
            if (nextPos) {
                return {
                    position: nextPos,
                    mode: nextClue?.type === 'across' ? 'row' : 'column',
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
                if (crossword.grid[row]?.[c] !== "#") {
                    return { row, col: c };
                }
            }
            return null;
        }

        for (let r = row + 1; r < size; r++) {
            if (crossword.grid[r]?.[col] !== "#") {
                return { row: r, col };
            }
        }

        return null;
    }

    function moveSelectionPrev(current: { row: number; col: number }, mode: "row" | "column"): { row: number; col: number } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const { row, col } = current;

        if (mode === "row") {
            for (let c = col - 1; c >= 0; c--) {
                if (crossword.grid[row]?.[c] !== "#") {
                    return { row, col: c };
                }
            }
            return null;
        }

        for (let r = row - 1; r >= 0; r--) {
            if (crossword.grid[r]?.[col] !== "#") {
                return { row: r, col };
            }
        }

        return null;
    }

    function moveSelectionPrevWithinClue(
        current: { row: number; col: number },
        mode: "row" | "column"
    ): { row: number; col: number } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row: currentRow, col: currentCol } = current;

        if (mode === "row") {
            const acrossClues = crossword.clues.across
                .filter(c => c.row === currentRow && c.col <= currentCol)
                .sort((a, b) => b.col - a.col);

            const clue = acrossClues[0] as any;
            if (!clue) return moveSelectionPrev(current, mode);

            const clueCells: { row: number; col: number }[] = [];
            for (let c = clue.col; c < size && crossword.grid[clue.row]?.[c] !== "#"; c++) {
                clueCells.push({ row: clue.row, col: c });
            }

            const currentIndex = clueCells.findIndex(pos => pos.row === currentRow && pos.col === currentCol);
            if (currentIndex <= 0) return null;
            return clueCells[currentIndex - 1] ?? null;
        }

        const downClues = crossword.clues.down
            .filter(c => c.col === currentCol && c.row <= currentRow)
            .sort((a, b) => b.row - a.row);

        const clue = downClues[0] as any;
        if (!clue) return moveSelectionPrev(current, mode);

        const clueCells: { row: number; col: number }[] = [];
        for (let r = clue.row; r < size && crossword.grid[r]?.[clue.col] !== "#"; r++) {
            clueCells.push({ row: r, col: clue.col });
        }

        const currentIndex = clueCells.findIndex(pos => pos.row === currentRow && pos.col === currentCol);
        if (currentIndex <= 0) return null;
        return clueCells[currentIndex - 1] ?? null;
    }

    function getHighlightedTiles(current: { row: number; col: number }, mode: "row" | "column") {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return [];

        const size = crossword.size;
        const { row, col } = current;

        if (mode === "row") {
            const acrossClues = crossword.clues.across
                .filter(c => c.row === row && c.col <= col)
                .sort((a, b) => b.col - a.col);

            const clue = acrossClues[0];
            if (!clue) return [];

            const tiles: { row: number; col: number }[] = [];
            for (let c = clue.col; c < size && crossword.grid[clue.row]?.[c] !== "#"; c++) {
                tiles.push({ row: clue.row, col: c });
            }
            return tiles;
        }

        const downClues = crossword.clues.down
            .filter(c => c.col === col && c.row <= row)
            .sort((a, b) => b.row - a.row);

        const clue = downClues[0];
        if (!clue) return [];

        const tiles: { row: number; col: number }[] = [];
        for (let r = clue.row; r < size && crossword.grid[r]?.[clue.col] !== "#"; r++) {
            tiles.push({ row: r, col: clue.col });
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
            const acrossClues = currentCrossword.clues.across.filter(c => c.row === row && c.col <= col);
            const clue = acrossClues.sort((a, b) => b.col - a.col)[0];
            return clue;
        } else {
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
            for (let c = clue.col; c < crossword.size && crossword.grid[clue.row]?.[c] !== "#"; c++) {
                if (grid[clue.row]?.[c] === null) {
                    isFilled = false;
                    break;
                }
            }
            if (isFilled) across.add(`${clue.row}-${clue.col}-${clue.number}`);
        });

        crossword.clues.down.forEach((clue) => {
            let isFilled = true;
            for (let r = clue.row; r < crossword.size && crossword.grid[r]?.[clue.col] !== "#"; r++) {
                if (grid[r]?.[clue.col] === null) {
                    isFilled = false;
                    break;
                }
            }
            if (isFilled) down.add(`${clue.row}-${clue.col}-${clue.number}`);
        });

        return { across, down };
    }, [currentCrossword, grid]);

    const timerLabel = formatMmSs(elapsedSeconds);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={crosswordId}
                initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >

                <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

                <div className="flex flex-col bg-zinc-800 w-full max-w-full min-w-0 shadow-inner shadow-zinc-200/30 rounded-2xl justify-between px-3 py-3 sm:px-5 sm:py-4 gap-y-4 sm:gap-y-5 overflow-x-hidden" style={{ scrollbarWidth: "none" }}>
                    <div className="flex flex-col gap-3 border-b-2 border-zinc-600 pb-3 sm:pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-2">
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-2 sm:gap-x-4">
                            <div className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 rounded-full shadow-inner shadow-zinc-200/30 active:bg-zinc-500 transition-all shrink-0 p-2">
                                <HomeIcon onClick={() => { onHomeClick(); router.push('/mini-crossword') }} />
                            </div>
                            <p className="font-bold min-h-[20px] w-fit tabular-nums tracking-tight flex items-center justify-center text-sm sm:text-base" aria-live="polite" aria-label={`Elapsed time ${timerLabel}`}>
                                {timerLabel}
                            </p>
                            <button type="button" className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0"><span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-base">Result</span></button>
                            <button type="button" className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0"><span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-base">Info</span></button>
                        </div>
                        {isSolved && (
                            <p className="text-center text-xs sm:text-sm order-last w-full sm:order-none sm:w-auto sm:max-w-[12rem] md:max-w-none md:flex-1 md:px-2"><span className="text-green-600">Congratulations!</span><br /> You solved the crossword in {timerLabel}</p>
                        )}
                        <button type="button" className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0 sm:ml-auto" onClick={() => setSettingsOpen(true)}><span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-base">Settings</span></button>
                    </div>

                    <div className="flex flex-col xl:flex-row w-full gap-8 xl:gap-10 xl:items-start min-w-0">
                        <div className="flex flex-col items-stretch text-center gap-4 w-full min-w-0 xl:shrink-0 xl:w-auto xl:max-w-full">
                            <div
                                className="w-full max-w-[min(100%,22rem)] sm:max-w-sm md:max-w-md overflow-hidden lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl aspect-square mx-auto xl:mx-0 rounded-2xl"
                            >
                                <div className="relative h-full w-full">
                                    {highlightedTiles.length > 0 && (
                                        isAnimationsEnabled && (
                                                <motion.div
                                                    layout
                                                    className="absolute bg-zinc-400/40 rounded-md z-11 pointer-events-none"
                                                    style={{
                                                        top: `${(highlightedTiles[0] ? highlightedTiles[0].row : 0) / currentCrossword.size * 100}%`,
                                                        left: `${(highlightedTiles[0] ? highlightedTiles[0].col : 0) / currentCrossword.size * 100}%`,
                                                        width:
                                                            highlightMode === "row"
                                                                ? `${(highlightedTiles.length / currentCrossword.size) * 100}%`
                                                                : `${(1 / currentCrossword.size) * 98}%`,
                                                        height:
                                                            highlightMode === "column"
                                                                ? `${(highlightedTiles.length / currentCrossword.size) * 100}%`
                                                                : `${(1 / currentCrossword.size) * 98}%`,
                                                    }}
                                                    transition={{ duration: isAnimationsEnabled ? 0.3 : 0, type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                        )
                                    )}

                                    {/* Actual grid */}
                                    <div
                                        className="grid h-full w-full rounded-2xl overflow-hidden select-none border-1 border-zinc-800 relative z-10"
                                        style={{
                                            gridTemplateColumns: `repeat(${currentCrossword?.size || 0}, minmax(0, 1fr))`,
                                            gridTemplateRows: `repeat(${currentCrossword?.size || 0}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {currentCrossword?.grid?.map((rowArr: string[], row: number) => {
                                            const size = currentCrossword.size;

                                            return rowArr.map((cell: string, col: number) => {
                                                const index = row * size + col;
                                                const isLastRow = row === size - 1;
                                                const isLastCol = col === size - 1;

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`min-h-20 min-w-20 relative
                                                    ${!isLastRow ? "border-b border-black" : ""} 
                                                    ${!isLastCol ? "border-r border-black" : ""} 
                                                    flex items-center justify-center
                                                    ${
                                                        cell === "#"
                                                            ? "bg-black"
                                                            : (!isAnimationsEnabled && selectedTile?.row === row && selectedTile?.col === col)
                                                            ? "bg-zinc-400"
                                                            : (!isAnimationsEnabled && highlightedSet.has(`${row}-${col}`))
                                                            ? "bg-zinc-400/50"
                                                            : "bg-zinc-700"
                                                        }`}
                                                        onMouseDown={() => cell !== "#" && handleTileClick(row, col)}
                                                    >
                                                        {/* Animated selected tile */}
                                                        {(isAnimationsEnabled && selectedTile?.row === row && selectedTile?.col === col) && (
                                                            <motion.div
                                                                layoutId="selectedTile"
                                                                className="absolute inset-0 bg-zinc-400 rounded-sm z-9"
                                                                transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                                                            />
                                                        )}

                                                        {/* Clue number */}
                                                        {clueNumbers.has(`${row}-${col}`) && (
                                                            <div className="absolute top-0 left-0 text-[10px] sm:text-xs md:text-sm text-zinc-300 font-bold p-0.5 sm:p-1 leading-none z-10">
                                                                {clueNumbers.get(`${row}-${col}`)}
                                                            </div>
                                                        )}

                                                        {/* Letter */}
                                                        <div
                                                            className={`relative z-10 flex ${settings.cursiveFont && "font-[cursive]"} h-full w-full items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-shadow-md text-shadow-black/50 
                                                        ${correctLetters.has(`${row}-${col}`)
                                                                    ? "text-green-400"
                                                                    : incorrectLetters.has(`${row}-${col}`)
                                                                        ? "text-red-400"
                                                                        : "text-white"
                                                                }`}
                                                        >
                                                            {cell !== "#" ? grid[row]?.[col] : ""}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-x-2 border-b-1 border-zinc-600 pb-4 sm:pb-5 min-w-0">
                                <div className="shrink-0">
                                    <button type="button" className="cursor-pointer bg-zinc-600/30 hover:bg-zinc-600 p-2 px-6 rounded-full shadow-inner shadow-zinc-200/30 hover:shadow-inner active:bg-zinc-500 transition-all" title="Previous Crossword" onClick={() => changePuzzle(-1)}>
                                        <MoveLeft className="size-[18px] sm:size-6" />
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base px-2 min-w-0 truncate" title={formatedTitle}>{formatedTitle}</p>
                                <div className="shrink-0">
                                    <button type="button" className="cursor-pointer bg-zinc-600/30 hover:bg-zinc-600 p-2 px-6 rounded-full shadow-inner shadow-zinc-200/30 hover:shadow-inner active:bg-zinc-500 transition-all" title="Next Crossword" onClick={() => changePuzzle(1)}>
                                        <MoveRight className="size-[18px] sm:size-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-5 min-w-0 text-left sm:text-center xl:text-center">
                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-x-6 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-bold text-left">Auto-advance on solve</p>
                                        <p className="text-left text-zinc-400 text-sm">Jump to the next puzzle when you finish</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEnabled(!enabled)}
                                        className={`${enabled ? "bg-green-500" : "bg-zinc-400"
                                            } relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none self-start sm:self-auto`}
                                    >
                                        <span
                                            className={`${enabled ? "translate-x-6" : "translate-x-1"
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {enabled && (
                                        <motion.div
                                            key="enabled"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex transition-all shadow-inner shadow-zinc-200/30 rounded-full overflow-hidden">
                                                    <button
                                                        className={`flex w-1/2 justify-center cursor-pointer ${isPreviousEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} hover:bg-zinc-600 p-2 border-r-1 border-zinc-600 ${isPreviousEnabled ? "shadow-inner shadow-zinc-200/30" : ""} hover:shadow-inner hover:shadow-zinc-200/30 active:bg-zinc-500 transition-all`}
                                                        title="Previous Crossword"
                                                        onClick={() => { setIsPreviousEnabled(!isPreviousEnabled); setIsNextEnabled(false) }}
                                                    >
                                                        <ChevronLeft /> Previous
                                                    </button>
                                                    <button
                                                        className={`flex w-1/2 justify-center cursor-pointer ${isNextEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} hover:bg-zinc-600 p-2 border-l-1 border-zinc-600 ${isNextEnabled ? "shadow-inner shadow-zinc-200/30" : ""} hover:shadow-inner hover:shadow-zinc-200/30 active:bg-zinc-500 transition-all`}
                                                        title="Previous Crossword"
                                                        onClick={() => { setIsNextEnabled(!isNextEnabled); setIsPreviousEnabled(false) }}
                                                    >
                                                        Next <ChevronRight />
                                                    </button>
                                                </div>
                                                {(isPreviousEnabled || isNextEnabled) ? (
                                                    <p className="mt-[-10px] text-sm text-zinc-400">Goes to the <span className="font-bold">{isPreviousEnabled ? "previous" : "next"}</span> crossword after solving</p>
                                                ) : (
                                                    <p className="mt-[-10px] text-sm text-zinc-400">Choose where to go after solving</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex flex-col gap-y-5 w-fit">
                            <div className="flex gap-10 sm:gap-x-8 lg:gap-x-20 border-b-1 border-zinc-600 pb-4 sm:pb-5 select-none text-left min-w-0">
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm uppercase font-bold text-zinc-300 gap shrink-0">Across</p>
                                    {(currentCrossword && currentCrossword.clues.across) && (
                                        currentCrossword.clues.across.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.across.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "row")} key={index} className="min-w-0">
                                                    <p className={`text-xs sm:text-sm text-zinc-300 p-1 px-2 transition-opacity break-words hyphens-auto ${item === currentClue ? 'bg-zinc-600 rounded-2xl shadow-inner shadow-zinc-200/30' : ''} ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm uppercase font-bold text-zinc-300 shrink-0">Down</p>
                                    {(currentCrossword && currentCrossword.clues.down) && (
                                        currentCrossword.clues.down.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.down.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "column")} key={index} className="min-w-0">
                                                    <p className={`text-xs sm:text-sm text-zinc-300 p-1 px-2 transition-opacity break-words hyphens-auto ${item === currentClue ? 'bg-zinc-600 rounded-2xl shadow-inner shadow-zinc-200/30' : ''} ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:gap-x-8 lg:gap-x-20 border-b-1 border-zinc-600 pb-4 sm:pb-6 select-none text-left min-w-0">
                                <p className="text-sm uppercase font-bold text-zinc-300">Assist</p>
                                <div className="flex gap-10 sm:gap-x-8 lg:gap-x-20 select-none text-left min-w-0">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-1.5 items-center text-center">
                                            <kbd className="flex w-15 h-8 items-center justify-center text-md font-semibold rounded-md bg-black/20 shadow-inner shadow-zinc-200/20 border border-zinc-600">CTRL</kbd>
                                            <span className="text-zinc-300">+</span>
                                            <kbd className="flex w-15 h-8 items-center justify-center text-md font-semibold rounded-md bg-black/20 shadow-inner shadow-zinc-200/20 border border-zinc-600">C</kbd> 
                                            <span>{"->"}</span>
                                            <button type="button" className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0" onClick={checkGrid}>
                                                <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-sm">Check Grid</span>
                                            </button>
                                        </div>
                                        <div>
                                        <div className="flex gap-1.5 items-center text-center">
                                            <kbd className="flex w-15 h-8 items-center justify-center text-md font-semibold rounded-md bg-black/20 shadow-inner shadow-zinc-200/20 border border-zinc-600">CTRL</kbd>
                                            <span>+</span>
                                            <kbd className="flex w-15 h-8 items-center justify-center text-md font-semibold rounded-md bg-black/20 shadow-inner shadow-zinc-200/20 border border-zinc-600">
                                                <MoveLeft />
                                            </kbd> 
                                            <span>{"->"}</span>
                                            <button type="button" className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0" onClick={removeIncorrectLetters}>
                                                <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-xs sm:text-sm">Clear all incorrect letters (after check)</span>
                                            </button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-2">
                                <p className="text-sm uppercase font-bold text-zinc-300">Multiplayer</p>
                                <button className="flex w-fit bg-green-700 rounded-full text-center contents-center justify-center items-center shadow-inner shadow-green-200/50 hover:shadow-green-300/30 cursor-pointer hover:bg-green-600 transition-all">
                                    <span className="px-6 py-2 text-green-200 text-sm hover:text-green-100">+ Create Room</span>
                                </button>
                                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center min-h-[40px]">
                                    <input className="w-full min-h-[40px] bg-zinc-700/80 rounded-full text-sm text-zinc-300 p-2 px-6 focus:outline-1 focus:outline-zinc-400 min-w-0 shadow-inner shadow-zinc-200/30 hover:bg-zinc-600 hover:shadow-zinc-300/30 transition-all" placeholder="Enter code" />
                                    <button className="flex w-fit bg-zinc-700 rounded-full text-center contents-center justify-center items-center shadow-inner shadow-zinc-200/30 hover:shadow-zinc-300/30 cursor-pointer hover:bg-zinc-600 transition-all">
                                        <span className="px-6 py-2 text-zinc-300 text-sm hover:text-zinc-100">Join</span>
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