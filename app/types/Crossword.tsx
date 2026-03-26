export interface Crossword {
    puzzleId: string;
    size: number;
    grid: string[][];
    clues: {
        across: { 
            number: number; row: number; col: number; answer: string; clue: string 
        }[];
        down: { 
            number: number; row: number; col: number; answer: string; clue: string 
        }[];
    };
}