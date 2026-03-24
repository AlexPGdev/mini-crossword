const fs = require("fs");

function convertPuzzle(puzzle) {
  const size = puzzle.size;
  const layout = puzzle.layout;

  // Split letters and clues
  const solved = puzzle.solvedGrid;
  const cluesArray = solved[solved.length - 1];
  const letters = solved.slice(0, solved.length - 1);

  // Build grid
  let letterIndex = 0;
  const grid = [];

  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;

      if (layout[idx] === 0) {
        row.push("#");
      } else {
        row.push(letters[letterIndex++]);
      }
    }
    grid.push(row);
  }

  // Helper to check bounds
  const inBounds = (r, c) => r >= 0 && r < size && c >= 0 && c < size;

  const across = [];
  const down = [];

  let clueIndexAcross = 0;
  let clueIndexDown = 0;

  // Split clues by direction
  const acrossClues = Array.isArray(cluesArray) ? cluesArray.filter(c => c.clueDirection === "across") : [];
  const downClues = Array.isArray(cluesArray) ? cluesArray.filter(c => c.clueDirection === "down") : [];

  // Extract ACROSS
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (
        grid[r][c] !== "#" &&
        (c === 0 || grid[r][c - 1] === "#")
      ) {
        let word = "";
        let col = c;

        while (col < size && grid[r][col] !== "#") {
          word += grid[r][col];
          col++;
        }

        const clue = acrossClues[clueIndexAcross++];

        across.push({
          number: parseInt(clue && clue.clueNum),
          row: r,
          col: c,
          answer: word,
          clue: clue && clue.clue
        });
      }
    }
  }

  // Extract DOWN
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (
        grid[r][c] !== "#" &&
        (r === 0 || grid[r - 1][c] === "#")
      ) {
        let word = "";
        let row = r;

        while (row < size && grid[row][c] !== "#") {
          word += grid[row][c];
          row++;
        }

        const clue = downClues[clueIndexDown++];

        down.push({
          number: parseInt(clue && clue.clueNum),
          row: r,
          col: c,
          answer: word,
          clue: clue && clue.clue
        });
      }
    }
  }

  return {
    puzzleId: puzzle.puzzleId.replace("crossword-", ""),
    size,
    grid,
    clues: {
      across,
      down
    }
  };
}

// Example usage
const input = JSON.parse(fs.readFileSync("./public/puzzles.json", "utf-8"));
const output = input.map(convertPuzzle);

fs.writeFileSync("output.json", JSON.stringify(output, null, 2));

console.log("Conversion complete!");