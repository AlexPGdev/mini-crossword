export interface Crossword {
    size: number;
    layout: number[];
    clues: {
        across: string[];
        down: string[];
    };
    solution: string[];
}