"use client";

import { Crossword } from "@/app/types/Crossword";
import { ChevronLeft, ChevronRight, HomeIcon, MoveLeft, MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsModal } from "./SettingsModal";
import { useSettings } from "../hooks/useSettings";
import { usePuzzles } from "../hooks/usePuzzles";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface MiniCrosswordProps {
    onHomeClick: () => void;
    allPuzzleIds: string[];
    userId: string | null;
}

function formatMmSs(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MiniCrossword({ onHomeClick, allPuzzleIds }: MiniCrosswordProps) {
    const { settings } = useSettings();
    const router = useRouter();
    const searchParams = useSearchParams();
    const crosswordId = searchParams.get("crossword");

    const { getPuzzleById, saveProgress } = usePuzzles();

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
        },
        timer: 0
    });

    let [currentCrossword, setCurrentCrossword] = useState<Crossword>({
        puzzleId: "",
        size: 0,
        grid: [],
        clues: {
            across: [],
            down: []
        },
        timer: 0
    });

    const [grid, setGrid] = useState<(string | null)[][]>([[]]);
    const gridRef = useRef<(string | null)[][]>([[]]);

    const [solvedGrid, setSolvedGrid] = useState<(string | null)[][]>([[]]);
    const solvedGridRef = useRef<(string | null)[][]>([[]]);

    const [keyHeld, setKeyHeld] = useState<{ ctrl: Boolean, c: Boolean, backspace: Boolean, l: Boolean, number: Boolean }>({ ctrl: false, c: false, backspace: false, l: false, number: false });
    const [showFinishedRipple, setShowFinishedRipple] = useState(false);
    const [showFinishedBanner, setShowFinishedBanner] = useState(false);

    const [invalidInput, setInvalidInput] = useState({ show: false, input: "" });

    let [previousCrossword, setPreviousCrossword] = useState<string | null>(null);
    let [nextCrossword, setNextCrossword] = useState<string | null>(null);

    const startTimeRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef(0);
    const [timerReady, setTimerReady] = useState(false);

    const [previousRipple, setPreviousRipple] = useState(false);
    const [nextRipple, setNextRipple] = useState(false);

    const [checkGridCount, setCheckGridCount] = useState(0);
    const [revealedLetterCount, setRevealedLetterCount] = useState(0);

    const checkGridCountRef = useRef(0);
    const revealedLetterCountRef = useRef(0);

    useEffect(() => {
        if (!crosswordId || allPuzzleIds.length === 0) return;

        getPuzzleById(crosswordId).then((puzzle: any) => {

            // Find index of current puzzle in the full ID list
            const currentIndex = allPuzzleIds.findIndex(id => id === puzzle.id);

            setPreviousCrossword(allPuzzleIds[currentIndex + 1]?.split('-')[2] || null);
            setNextCrossword(allPuzzleIds[currentIndex - 1]?.split('-')[2] || null);

            // Update grid and state
            setCurrentCrossword({
                ...puzzle,
                puzzleId: puzzle.id
            });
            // puzzle.timer is in seconds; store accumulated time in milliseconds
            accumulatedTimeRef.current = puzzle.timer * 1000;
            startTimeRef.current = Date.now();
            setGrid(puzzle.grid);
            setSolvedGrid(puzzle.filledGrid);
            setSelectedTile(null);
            setCorrectLetters(new Set());
            setIncorrectLetters(new Set());
            setIsSolved(puzzle.isCompleted);
            setElapsedSeconds(puzzle.timer);
            setSelectedTile(null);
            setHighlightedTiles([]);
            setPreviousRipple(false);
            setNextRipple(false);
            setCheckGridCount(puzzle.checkGridCount);
            setRevealedLetterCount(puzzle.revealedLetterCount);

            let puzzleDateRaw = `${puzzle?.id?.split("-")[2]?.slice(0, 4)}/${puzzle?.id?.split("-")[2]?.slice(4, 6)}/${puzzle?.id?.split("-")[2]?.slice(6, 8)}`;

            let puzzleDate = new Date(puzzleDateRaw);

            let formattedDate = puzzleDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            setFormatedTitle(formattedDate);
        });
    }, [crosswordId, allPuzzleIds]);

    const isAnimationsEnabled = settings.animationsEnabled;

    useEffect(() => {
        isSolvedRef.current = isSolved;
    }, [isSolved]);

    useEffect(() => {
        gridRef.current = grid;

        if (!currentCrossword?.puzzleId || !timerReady) return;

        const timeout = setTimeout(() => {
            saveProgress(
                crosswordId || "",
                gridRef.current,
                Math.floor(getCurrentTimeMs() / 1000),
                checkGridCountRef.current,
                revealedLetterCountRef.current
            );
        }, 1000);

        return () => clearTimeout(timeout);
    }, [grid, timerReady, checkGridCount, revealedLetterCount]);

    useEffect(() => {
        if (!currentCrossword?.puzzleId || isSolvedRef.current) return;

        const interval = setInterval(() => {
            saveProgress(
                crosswordId || "",
                gridRef.current,
                Math.floor(getCurrentTimeMs() / 1000),
                checkGridCountRef.current,
                revealedLetterCountRef.current
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [currentCrossword, isSolved, checkGridCount, revealedLetterCount]);

    useEffect(() => {
        solvedGridRef.current = solvedGrid;
    }, [solvedGrid]);

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
        checkGridCountRef.current = checkGridCount;
    }, [checkGridCount]);

    useEffect(() => {
        revealedLetterCountRef.current = revealedLetterCount;
    }, [revealedLetterCount]);

    useEffect(() => {
        currentCrosswordRef.current = currentCrossword;

        if (!currentCrossword?.puzzleId || isSolved) return;

        accumulatedTimeRef.current = currentCrossword.timer * 1000;
        startTimeRef.current = Date.now();

        setTimerReady(true);

        const interval = setInterval(() => {
            if (!startTimeRef.current || isSolvedRef.current) return;

            const current = accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
            setElapsedSeconds(Math.floor(current / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [currentCrossword]);

    useEffect(() => {
        const handleUnload = () => {
            navigator.sendBeacon("/api/progress", JSON.stringify({
                puzzleId: crosswordId,
                filledGrid: gridRef.current,
                timeSpent: Math.floor(getCurrentTimeMs() / 1000)
            }));
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => window.removeEventListener("beforeunload", handleUnload);
    }, []);

    useEffect(() => {

        function keyOf(pos: { row: number; col: number }) {
            return `${pos.row}-${pos.col}`;
        }

        function handleKeyPress(e: KeyboardEvent) {
            const selected = selectedTileRef.current;
            const mode = highlightModeRef.current;

            if (!selected) return;

            const { row, col } = selected;

            if(e.key === "Control"){
                setKeyHeld(prev => ({ ...prev, ctrl: true }));
            }
            else if(e.ctrlKey && e.key.toLowerCase() === "c"){
                setKeyHeld(prev => ({ ...prev, c: true }));
            }
            else if(e.ctrlKey && e.key === "Backspace"){
                setKeyHeld(prev => ({ ...prev, backspace: true }));
            }
            else if(e.ctrlKey && e.key.toLowerCase() === "l"){
                setKeyHeld(prev => ({ ...prev, l: true }));
            } else if(e.ctrlKey && e.key.match(/^[0-9]$/)) {
                setKeyHeld(prev => ({ ...prev, number: true }));
            }


            if (e.key === 'Backspace') {
                if (isSolvedRef.current) return;
                
                if (e.ctrlKey) {
                    e.preventDefault();
                    removeIncorrectLetters();
                } else {
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

            // When pressing tab it should move selection to the next clue, prioritizing across clues first, then down clues
            if (e.key === 'Tab') {
                e.preventDefault();

                const selected = selectedTileRef.current;
                if (!selected) return;

                const crossword = currentCrosswordRef.current;
                if (!crossword?.grid) return;

                const { row: startRow, col: startCol } = selected;
                const mode = highlightModeRef.current;

                // Determine current clue
                let currentClue: any = null;
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

                // Get all clues sorted across then down
                const allClues = [
                    ...crossword.clues.across.sort((a, b) => a.number - b.number).map(c => ({ ...c, type: 'across' })),
                    ...crossword.clues.down.sort((a, b) => a.number - b.number).map(c => ({ ...c, type: 'down' })),
                ];

                const currentClueIndex = currentClue ? allClues.findIndex(c => c.number === currentClue.number && c.type === currentClue.type) : -1;

                // Helper function to find first empty cell in a clue
                const getFirstEmptyInClue = (clue: any) => {
                    const size = crossword.size;
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

                // Cycle through clues starting from next one to find first with empty cell
                for (let i = 1; i <= allClues.length; i++) {
                    const idx = (currentClueIndex + i) % allClues.length;
                    const nextClue = allClues[idx];
                    const nextPos = getFirstEmptyInClue(nextClue);
                    if (nextPos) {
                        setSelectedTile(nextPos);
                        setHighlightMode(nextClue?.type === 'across' ? 'row' : 'column');
                        setHighlightedTiles(getHighlightedTiles(nextPos, nextClue?.type === 'across' ? 'row' : 'column'));
                        return;
                    }
                }

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

            if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
                e.preventDefault();
                revealLetter();
                return;
            }

            if (e.ctrlKey && e.key.match(/^[0-9]$/)) {
                e.preventDefault();
                const number = e.key;

                const { row, col } = selectedTileRef.current || { row: -1, col: -1 };

                let clue = null;

                if (highlightModeRef.current === 'row') {
                    const acrossClues = currentCrosswordRef.current.clues.across.filter(c => c.row === row && c.col <= col);
                    clue = acrossClues.sort((a, b) => b.col - a.col)[0];
                } else {
                    const downClues = currentCrosswordRef.current.clues.down.filter(c => c.col === col && c.row <= row);
                    clue = downClues.sort((a, b) => b.row - a.row)[0];
                }

                if((clue && parseInt(number) === clue?.number) && (selectedTileRef.current?.col === clue.col && selectedTileRef.current?.row === clue.row)) {
                    if(highlightModeRef.current === "row") {
                        if(!currentCrosswordRef.current.clues.down.find(c => c.number === parseInt(number))) {
                            return;
                        }
                    } else {
                        if(!currentCrosswordRef.current.clues.across.find(c => c.number === parseInt(number))) {
                            return;
                        }
                    }

                    if(selectedTileRef.current) {
                        const nextMode = highlightModeRef.current === 'row' ? 'column' : 'row';
                        setHighlightMode(nextMode);
                        setHighlightedTiles(getHighlightedTiles(selectedTileRef.current, nextMode));
                    }

                    return;
                }

                if(highlightModeRef.current === "row") {
                    const clue = currentCrosswordRef.current.clues.across.find(c => c.number === parseInt(number));
                    if (clue) {
                        handleClueClick(clue.row, clue.col, "row");
                    } else {
                        const clueDown = currentCrosswordRef.current.clues.down.find(c => c.number === parseInt(number));
                        if (clueDown) {
                            handleClueClick(clueDown.row, clueDown.col, "column");
                        }
                    }
                } else {
                    const clue = currentCrosswordRef.current.clues.down.find(c => c.number === parseInt(number));
                    if (clue) {
                        handleClueClick(clue.row, clue.col, "column");
                    } else {
                        const clueAcross = currentCrosswordRef.current.clues.across.find(c => c.number === parseInt(number));
                        if (clueAcross) {
                            handleClueClick(clueAcross.row, clueAcross.col, "row");
                        }
                    }
                }

                return;
            }

            const key = e.key.toUpperCase();
            if (!/^[A-Z]$/.test(key)){

                if(e.key === "Control" || e.key === "Backspace" || e.key === " " || e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Shift") return;

                setInvalidInput({ show: true, input: e.key });

                setTimeout(() => {
                    setInvalidInput({ show: false, input: "" });
                }, 1500);
                return;
            }

            if (isSolvedRef.current) return;

            if(!e.ctrlKey) {
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
    
                const nextSelection = moveSelectionNextAuto(selected, mode, true);
                if (nextSelection) {
                    setSelectedTile(nextSelection.position);
                    setHighlightMode(nextSelection.mode);
                    setHighlightedTiles(getHighlightedTiles(nextSelection.position, nextSelection.mode));
                }
            }

        }

        function handleKeyUp(e: KeyboardEvent) {
            if(e.key === "Control"){
                setKeyHeld(prev => ({ ...prev, ctrl: false }));
                setKeyHeld(prev => ({ ...prev, c: false }));
                setKeyHeld(prev => ({ ...prev, backspace: false }));
                setKeyHeld(prev => ({ ...prev, l: false }));
                setKeyHeld(prev => ({ ...prev, number: false }));
            }
            else if(e.key.toLowerCase() === "c"){
                setKeyHeld(prev => ({ ...prev, c: false }));
            }
            else if(e.key === "Backspace"){
                setKeyHeld(prev => ({ ...prev, backspace: false }));
            }
            else if(e.key.toLowerCase() === "l"){
                setKeyHeld(prev => ({ ...prev, l: false }));
            } else if(e.key.match(/^[0-9]$/)) {
                setKeyHeld(prev => ({ ...prev, number: false }));
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (isGridFull(grid)) {
            checkGrid(true);
        }
        
        if(!selectedTile && !isSolvedRef.current) {
            const nextSelection = moveSelectionNextAuto({row: -1, col: -1}, "row");
            if (nextSelection) {
                setSelectedTile(nextSelection.position);
                setHighlightMode(nextSelection.mode);
                setHighlightedTiles(getHighlightedTiles(nextSelection.position, nextSelection.mode));
            }
        }
    }, [grid]);

    function getCurrentTimeMs() {
        if (!startTimeRef.current) return accumulatedTimeRef.current;

        return accumulatedTimeRef.current + (Date.now() - startTimeRef.current);
    }

    function isGridFull(grid: (string | null)[][]) {
        return grid.every(row =>
            row.every(cell => cell === "#" || cell !== null)
        );
    }

    async function checkGrid(checkSolved: boolean = false) {
        const userGrid = gridRef.current;

        if (!userGrid || userGrid?.length === 1 || crosswordId === null) return;

        console.log(checkGridCountRef.current)

        if(checkGridCountRef.current >= 3 && !checkSolved) return;

        const solution = solvedGridRef.current;

        const newCorrect = new Set<string>();
        const newIncorrect = new Set<string>();

        const keyOf = (r: number, c: number) => `${r}-${c}`;

        userGrid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const key = keyOf(r, c);

                if (cell === solution?.[r]?.[c]) {
                    newCorrect.add(key);
                } else if (cell !== null) {
                    newIncorrect.add(key);
                }
            });
        });

        if(!checkSolved) {
            setCheckGridCount(prev => prev + 1);
        }

        if(checkSolved && !isSolvedRef.current) {
            if (newIncorrect.size === 0) {
                saveProgress(
                    crosswordId || "",
                    userGrid,
                    Math.floor(getCurrentTimeMs() / 1000),
                    checkGridCountRef.current,
                    revealedLetterCountRef.current
                ).then((time) => {
                    accumulatedTimeRef.current = time * 1000;
                    startTimeRef.current = Date.now();
                    setElapsedSeconds(time);
                });
                setIsSolved(true);
                setCorrectLetters(newCorrect);
                setShowFinishedRipple(true);
                setShowFinishedBanner(true);
                if(enabled && (isPreviousEnabled || isNextEnabled)) {
                    if(isPreviousEnabled) {
                        setPreviousRipple(true);
                    } else {
                        setNextRipple(true);
                    }
                }
                setTimeout(() => {
                    setShowFinishedRipple(false);

                    if (enabled && (isPreviousEnabled || isNextEnabled)) {
                        setDirection(isNextEnabled ? 1 : -1);
                        router.push(`/mini-crossword?crossword=${isNextEnabled ? nextCrossword : previousCrossword}`, { scroll: false });
                        setPreviousRipple(false);
                        setNextRipple(false);
                    }
                }, 1000);

                setTimeout(() => {
                    setShowFinishedBanner(false);
                }, 5000);

            }

        } else {
            setCorrectLetters(newCorrect);
            setIncorrectLetters(newIncorrect);
        }
    }

    function revealLetter() {
        const userGrid = gridRef.current;

        if (!userGrid || userGrid?.length === 1 || crosswordId === null) return;

        if(revealedLetterCountRef.current >= 2) return;

        const solution = solvedGridRef.current;

        let letter = solution?.[selectedTileRef?.current?.row || 0]?.[selectedTileRef?.current?.col || 0];

        if (letter === "#") return;

        setRevealedLetterCount(prev => prev + 1);

        setGrid(prev => {
            const newGrid = prev.map(r => [...r]);
            if (selectedTileRef.current) {
                const { row, col } = selectedTileRef.current;
                newGrid[row] && (newGrid[row][col] = letter || null);
            }
            return newGrid;
        });

        const nextSelection = moveSelectionNextAuto(selectedTileRef.current || { row: -1, col: -1 }, "row");
        if (nextSelection) {
            setSelectedTile(nextSelection.position);
            setHighlightMode(nextSelection.mode);
            setHighlightedTiles(getHighlightedTiles(nextSelection.position, nextSelection.mode));
        }
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

    /**
     * Automatically determines the next selection position after entering a letter.
     * Prioritizes moving to the next empty cell within the current clue (across or down),
     * then cycles through all clues to find the first empty cell in the next clue.
     * @param current - The current position {row, col}
     * @param mode - The current highlight mode ("row" for across, "column" for down)
     * @returns The next position and mode, or null if no empty cells found
     */
    function moveSelectionNextAuto(
        current: { row: number; col: number },
        mode: "row" | "column", 
        initial: boolean = false
    ): { position: { row: number; col: number }; mode: "row" | "column"; } | null {
        const crossword = currentCrosswordRef.current;
        if (!crossword?.grid) return null;

        const size = crossword.size;
        const { row: startRow, col: startCol } = current;

        // Determine the current clue based on mode and position
        let currentClue: ({ number: number; row: number; col: number; answer: string; clue: string } & { type: 'across' | 'down' }) | null = null;

        if (mode === 'row') {
            // Find across clues on the same row, starting at or before current column
            const acrossClues = crossword.clues.across.filter(c => c.row === startRow && c.col <= startCol);
            const sorted = acrossClues.sort((a, b) => b.col - a.col); // Sort by column descending to get the rightmost starting clue
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'across' } as any;
            }
        } else {
            // Find down clues on the same column, starting at or before current row
            const downClues = crossword.clues.down.filter(c => c.col === startCol && c.row <= startRow);
            const sorted = downClues.sort((a, b) => b.row - a.row); // Sort by row descending to get the bottommost starting clue
            if (sorted.length > 0) {
                currentClue = { ...sorted[0], type: 'down' } as any;
            }
        }

        if (currentClue) {
            // Get all cells in the current clue
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

            // Find current position in the clue cells
            const currentIndex = clueCells.findIndex(pos => pos.row === startRow && pos.col === startCol);
            const isClueFull = clueCells.every(pos => gridRef.current[pos.row]?.[pos.col] !== null);

            if (currentIndex >= 0) {
                if (isClueFull && initial) {
                    // If clue is fully filled, advance sequentially but don't wrap around
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < clueCells.length) {
                        const nextPos = clueCells[nextIndex];
                        return {
                            position: nextPos as { row: number; col: number },
                            mode: currentClue.type === 'across' ? 'row' : 'column',
                        };
                    }
                    // If at end of clue, fall through to search other clues for empty tiles
                } else {
                    // First, try to find next empty cell after current position
                    for (let i = currentIndex + 1; i < clueCells.length; i++) {
                        const pos = clueCells[i];
                        if (pos && gridRef.current[pos.row]?.[pos.col] === null) {
                            return {
                                position: pos,
                                mode: currentClue.type === 'across' ? 'row' : 'column',
                            };
                        }
                    }

                    // If no empty cells after, wrap around to beginning of clue
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
        }

        // If no empty cells in current clue, search all clues in order
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

        // Helper function to find first empty cell in a clue
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

        // Find index of current clue in the sorted list
        const currentClueIndex = currentClue
            ? allClues.findIndex(c => c.number === currentClue!.number && c.type === currentClue!.type)
            : -1;

        // Cycle through all clues starting from the next one
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
                    <AnimatePresence mode="wait">
                        {showFinishedBanner && (
                            <motion.div
                                key={`congrats`}
                                className="z-99 absolute left-0 right-0 p-2 px-40 pointer-events-none bg-green-700/80 backdrop-blur-sm rounded-2xl w-fit ml-auto mr-auto "
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 5 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div>
                                    <p className="text-2xl text-zinc-200 text-center">Congratulations!</p>
                                    <p className="text-sm text-zinc-200 text-center">You solved the crossword in {timerLabel}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="flex flex-col gap-3 border-b-2 border-zinc-600 pb-3 sm:pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-2 sm:gap-y-2">
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-2 sm:gap-x-4">
                            <div className="flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 rounded-full shadow-inner shadow-zinc-200/30 active:bg-zinc-500 transition-all shrink-0 p-2">
                                <HomeIcon onClick={() => { onHomeClick(); router.push('/mini-crossword') }} />
                            </div>
                            <p className="min-h-[20px] text-zinc-300 w-fit tabular-nums tracking-tight flex items-center justify-center text-xl" aria-live="polite" aria-label={`Elapsed time ${timerLabel}`}>
                                {timerLabel}
                            </p>
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

                                    {(!currentCrossword?.grid || currentCrossword?.grid.length === 0) && (
                                        <Skeleton width={"100%"} height={"100%"} baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                                    )}

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
                                                    items-center justify-center
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

                                                        {isAnimationsEnabled && (
                                                            <>                                                            
                                                                <AnimatePresence>
                                                                    {(highlightedSet.has(`${row}-${col}`) && cell !== "#") && (
                                                                        <motion.div
                                                                            layout
                                                                            className="absolute inset-0 z-0 bg-zinc-400/40"
                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                                            transition={{ duration: 0.25 }}
                                                                        />
                                                                    )}
                                                                </AnimatePresence>

                                                                {(selectedTile?.row === row && selectedTile?.col === col) && (
                                                                    <motion.div
                                                                        layoutId="selectedTile"
                                                                        className="absolute inset-0 bg-zinc-400 rounded-sm z-9"
                                                                        transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                                                                    />
                                                                )}
                                                            </>
                                                        )}

                                                        {/* Animated selected tile */}

                                                        {/* Clue number */}
                                                        {clueNumbers.has(`${row}-${col}`) && (
                                                            <div className="absolute top-0 left-0 text-md text-white sm:p-2 leading-none z-10">
                                                                {clueNumbers.get(`${row}-${col}`)}
                                                            </div>
                                                        )}

                                                        {/* Letter */}
                                                        {isAnimationsEnabled ? (
                                                            <AnimatePresence>
                                                                {(cell !== "#" && (/^[A-Z]$/.test( grid?.[row]?.[col] ?? "" ))) && (
                                                                    <motion.div
                                                                        layoutId={`letter-${crosswordId}-${row}-${col}`}
                                                                        className={`relative z-10 flex ${settings.cursiveFont && "font-[cursive]"} h-full w-full items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-shadow-md text-shadow-black/50 
                                                                                ${correctLetters.has(`${row}-${col}`)
                                                                                    ? "text-green-400"
                                                                                    : incorrectLetters.has(`${row}-${col}`)
                                                                                        ? "text-red-400"
                                                                                        : "text-white"
                                                                                }`
                                                                            }
                                                                        initial={{ scale: 0.1, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.1, opacity: 0 }}
                                                                        transition={{ duration: isAnimationsEnabled ? 0.2 : 0 }}
                                                                    >

                                                                        {cell !== "#" ? grid[row]?.[col] : ""}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        ) : (
                                                            <div
                                                                className={`relative z-10 flex ${settings.cursiveFont && "font-[cursive]"} h-full w-full items-center justify-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-shadow-md text-shadow-black/50 
                                                                    ${correctLetters.has(`${row}-${col}`)
                                                                        ? "text-green-400"
                                                                        : incorrectLetters.has(`${row}-${col}`)
                                                                            ? "text-red-400"
                                                                            : "text-white"
                                                                    }`
                                                                }
                                                            >
                                                                {cell !== "#" ? grid[row]?.[col] : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            });
                                        })}

                                        <AnimatePresence>
                                            {(showFinishedRipple) && selectedTile && (
                                                <motion.div
                                                    key="ripple"
                                                    className="absolute bg-green-300/30 rounded-full pointer-events-none"
                                                    style={{
                                                        top: `${(selectedTile.row * 100) / (currentCrossword?.size || 1)}%`,
                                                        left: `${(selectedTile.col * 100) / (currentCrossword?.size || 1)}%`,
                                                        width: `${100 / (currentCrossword?.size || 1)}%`,
                                                        height: `${100 / (currentCrossword?.size || 1)}%`,
                                                    }}
                                                    initial={{ scale: 0, opacity: 1 }}
                                                    animate={{ scale: 20, opacity: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            )}

                                            {invalidInput.show && (
                                                <motion.div
                                                    key={`invalid-${invalidInput.input}`}
                                                    className="z-99 absolute bottom-0 left-0 right-0 p-2 pointer-events-none bg-red-800 rounded-2xl w-fit ml-auto mr-auto mb-4"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <p className="text-sm text-zinc-300 text-center">Invalid Input:
                                                        <kbd className={`ml-2 border border-zinc-600 bg-zinc-800 text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>{invalidInput.input}</kbd>
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center gap-x-2 border-b-1 border-zinc-600 pb-4 sm:pb-5 min-w-0">
                                <div className="shrink-0">
                                    <button type="button" className="cursor-pointer bg-zinc-600/30 hover:bg-zinc-600 p-2 px-6 rounded-full shadow-inner shadow-zinc-200/30 hover:shadow-inner active:bg-zinc-500 transition-all" title="Previous Crossword" onClick={() => changePuzzle(-1)}>
                                        <MoveLeft className="size-[18px] sm:size-6" />
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base px-2 min-w-0 truncate" title={formatedTitle}>{formatedTitle ? formatedTitle : <Skeleton width={100} height={20} baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />}</p>
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
                                                        className={`relative w-1/2 justify-center cursor-pointer ${isPreviousEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} hover:bg-zinc-600 p-2 border-r-1 border-zinc-600 ${isPreviousEnabled ? "shadow-inner shadow-zinc-200/30" : ""} hover:shadow-inner hover:shadow-zinc-200/30 active:bg-zinc-500 transition-all`}
                                                        title="Previous Crossword"
                                                        onClick={() => { setIsPreviousEnabled(!isPreviousEnabled); setIsNextEnabled(false) }}
                                                    >
                                                        <div className="flex w-full justify-center">
                                                            <span className="flex z-10">
                                                                <ChevronLeft /> Previous
                                                            </span>

                                                            <AnimatePresence>
                                                                {previousRipple && (
                                                                    <motion.div
                                                                        key="ripple"
                                                                        className="absolute inset-0 bg-green-500/50 z-0 origin-right"
                                                                        initial={{ scaleX: 0 }}
                                                                        animate={{ scaleX: 1 }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </button>

                                                    <button
                                                        className={`relative w-1/2 justify-center text-center cursor-pointer ${isNextEnabled ? "bg-zinc-600" : "bg-zinc-600/30"} hover:bg-zinc-600 p-2 border-l-1 border-zinc-600 ${isNextEnabled ? "shadow-inner shadow-zinc-200/30" : ""} hover:shadow-inner hover:shadow-zinc-200/30 active:bg-zinc-500 transition-all`}
                                                        title="Previous Crossword"
                                                        onClick={() => { setIsNextEnabled(!isNextEnabled); setIsPreviousEnabled(false) }}
                                                    >
                                                        <div className="flex w-full justify-center">
                                                            <span className="flex z-10">
                                                                Next <ChevronRight />
                                                            </span>

                                                            <AnimatePresence>
                                                                {nextRipple && (
                                                                    <motion.div
                                                                        key="ripple"
                                                                        className="absolute inset-0 bg-green-500/50 z-0 origin-left"
                                                                        initial={{ scaleX: 0 }}
                                                                        animate={{ scaleX: 1 }}
                                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
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

                        <div className="flex flex-col gap-y-5 w-full">
                            <div className="flex gap-5 sm:gap-x-8 lg:gap-x-5 border-b-1 border-zinc-600 pb-4 sm:pb-5 select-none text-left min-w-0">
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm uppercase font-bold text-zinc-300 gap shrink-0 mb-1">Across</p>
                                    {(currentCrossword && currentCrossword.clues.across && currentCrossword.clues.across.length > 0) ? (
                                        currentCrossword.clues.across.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.across.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "row")} key={index} className="relative min-w-0">
                                                    <p className={`relative z-10 text-xs sm:text-sm text-zinc-300 p-1 px-2 transition-opacity break-words hyphens-auto ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                    <AnimatePresence mode="wait">
                                                        {item === currentClue && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-2xl shadow-inner shadow-zinc-200/30 bg-zinc-600"
                                                                initial={{ opacity: 0, width: 0 }}
                                                                animate={{ opacity: 1, width: "100%" }}
                                                                exit={{ opacity: 0, width: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <Skeleton count={5} width={150} height={20} className="mt-2" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm uppercase font-bold text-zinc-300 shrink-0 mb-1">Down</p>
                                    {(currentCrossword && currentCrossword.clues.down && currentCrossword.clues.down.length > 0) ? (
                                        currentCrossword.clues.down.map((item, index) => {
                                            const clueKey = `${item.row}-${item.col}-${item.number}`;
                                            const isComplete = completedClues.down.has(clueKey);
                                            return (
                                                <div onClick={() => handleClueClick(item.row, item.col, "column")} key={index} className="relative min-w-0">
                                                    <p className={`relative z-10 text-xs sm:text-sm text-zinc-300 p-1 px-2 transition-opacity break-words hyphens-auto ${isComplete ? 'opacity-45' : 'opacity-100'}`} key={index}><span className="font-bold">{item.number}.</span> {item.clue}</p>
                                                    <AnimatePresence mode="wait">
                                                        {item === currentClue && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-2xl shadow-inner shadow-zinc-200/30 bg-zinc-600"
                                                                initial={{ opacity: 0, width: 0 }}
                                                                animate={{ opacity: 1, width: "100%" }}
                                                                exit={{ opacity: 0, width: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <Skeleton count={5} width={150} height={20} className="mt-2" baseColor="#27272a" highlightColor="#3c3e3e" borderRadius={"0.5rem"} />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 sm:gap-x-8 lg:gap-x-10 sm:pb-6 select-none text-left min-w-0">
                                <p className="text-sm uppercase font-bold text-zinc-300">Assist</p>
                                <div className="flex select-none text-left min-w-0">
                                    <div className="flex flex-col gap-2 w-fit">
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2 mr-4">
                                                <kbd className={`border border-zinc-600 ${keyHeld.ctrl === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>CTRL</kbd>
                                                <span className="text-zinc-300">+</span>
                                                <kbd className={`border border-zinc-600 ${keyHeld.c === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>C</kbd>
                                            </div>

                                            <div className="flex items-center gap-4 w-72">
                                                <span>{"->"}</span>
                                                <button type="button" className="relative overflow-hidden flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0" onClick={() => checkGrid}>
                                                    <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-sm relative z-10">Check Grid</span>
                                                    <AnimatePresence>
                                                        {(keyHeld.ctrl && keyHeld.c) && (
                                                            <motion.div
                                                                key="ripple"
                                                                className={`absolute inset-0 ${checkGridCountRef.current >= 3 ? "bg-red-500/50" : "bg-white/30"} rounded-full`}
                                                                initial={{ scale: 0, opacity: 1 }}
                                                                animate={{ scale: 4, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                                <p>({3-checkGridCountRef.current} remaining)</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2 mr-4">
                                                <kbd className={`border border-zinc-600 ${keyHeld.ctrl === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>CTRL</kbd>
                                                <span className="text-zinc-300">+</span>
                                                <kbd className={`border border-zinc-600 ${keyHeld.l === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>L</kbd>
                                            </div>

                                            <div className="flex items-center gap-4 w-72">
                                                <span>{"->"}</span>
                                                <button type="button" className="relative overflow-hidden flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0" onClick={() => revealLetter()}>
                                                    <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-sm relative z-10">Reveal Letter</span>
                                                    <AnimatePresence>
                                                        {(keyHeld.ctrl && keyHeld.l) && (
                                                            <motion.div
                                                                key="ripple"
                                                                className={`absolute inset-0 ${revealedLetterCountRef.current >= 2 ? "bg-red-500/50" : "bg-white/30"} rounded-full`}
                                                                initial={{ scale: 0, opacity: 1 }}
                                                                animate={{ scale: 4, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                                <p>({2-revealedLetterCountRef.current} remaining)</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2 mr-4">
                                                <kbd className={`border border-zinc-600 ${ keyHeld.ctrl === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>CTRL</kbd>
                                                <span>+</span>
                                                <kbd className={`border border-zinc-600 ${ keyHeld.backspace === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>
                                                    <MoveLeft />
                                                </kbd> 
                                            </div>
                                            <div className="flex items-center gap-4 w-72">
                                                <span>{"->"}</span>
                                                <button type="button" className="relative overflow-hidden flex bg-zinc-600/30 cursor-pointer hover:bg-zinc-600 active:bg-zinc-500 rounded-full shadow-inner shadow-zinc-200/30 transition-all shrink-0" onClick={() => removeIncorrectLetters()}>
                                                    <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-xs sm:text-sm">Clear all incorrect letters</span>
                                                    <AnimatePresence>
                                                        {(keyHeld.ctrl && keyHeld.backspace) && (
                                                            <motion.div
                                                                key="ripple"
                                                                className="absolute inset-0 bg-white/30 rounded-full"
                                                                initial={{ scale: 0, opacity: 1 }}
                                                                animate={{ scale: 4, opacity: 0 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2 mr-4">
                                                <kbd className={`border border-zinc-600 ${keyHeld.ctrl === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>CTRL</kbd>
                                                <span className="text-zinc-300">+</span>
                                                <kbd className={`border border-zinc-600 ${keyHeld.number === true ? "bg-zinc-600/40 scale-95" : "" } text-[1em] font-semibold rounded-[3px] my-[2px] mx-[3px] py-[1px] px-[10px] transition-all text-nowrap`} style={{ boxShadow: "1px 0 1px 0 #292929, 0 2px 0 2px #101010, 0 2px 0 3px #444" }}>0-9</kbd>
                                            </div>

                                            <div className="flex items-center w-72">
                                                <span>{"->"}</span>
                                                <span className="p-1.5 px-2 sm:p-2 sm:px-4 text-sm sm:text-sm relative z-10">Highlight Clue</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="flex flex-col gap-y-2">
                                <p className="text-sm uppercase font-bold text-zinc-300">Multiplayer</p>
                                <button className="flex w-fit bg-green-700 rounded-full text-center contents-center justify-center items-center shadow-inner shadow-green-200/50 hover:shadow-green-300/30 cursor-pointer hover:bg-green-600 transition-all">
                                    <span className="px-6 py-2 text-green-200 text-sm hover:text-green-100">+ Create Room</span>
                                </button>
                                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center min-h-[40px] w-fit">
                                    <input className="w-full min-h-[40px] bg-zinc-700/80 rounded-full text-sm text-zinc-300 p-2 px-6 focus:outline-1 focus:outline-zinc-400 min-w-0 shadow-inner shadow-zinc-200/30 hover:bg-zinc-600 hover:shadow-zinc-300/30 transition-all" placeholder="Enter code" />
                                    <button className="flex w-fit bg-zinc-700 rounded-full text-center contents-center justify-center items-center shadow-inner shadow-zinc-200/30 hover:shadow-zinc-300/30 cursor-pointer hover:bg-zinc-600 transition-all">
                                        <span className="px-6 py-2 text-zinc-300 text-sm hover:text-zinc-100">Join</span>
                                    </button>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}