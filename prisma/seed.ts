import { PrismaClient } from "@prisma/client";
import puzzles from "../public/newPuzzles2.json" with { type: "json" };
import streaks from "../public/streaks.json" with { type: "json" };


const prisma = new PrismaClient();


async function main() {
  await prisma.puzzle.createMany({
    data: puzzles.map((puzzle) => ({
      id: puzzle.puzzleId,
      date: new Date(`${puzzle.puzzleId.split('-')[2]?.slice(0,4)}/${puzzle.puzzleId.split('-')[2]?.slice(4,6)}/${puzzle.puzzleId.split('-')[2]?.slice(6)}`),
      data: puzzle
    })),
    skipDuplicates: true
  });

  // Create the specific user
  const user = await prisma.user.upsert({
    where: { token: "cmnhu81h10000x16xntvbrwcj" },
    update: {},
    create: { token: "cmnhu81h10000x16xntvbrwcj" }
  });

  // Process streaks to mark as completed
  for (const streak of streaks.streakInfo) {
    if (streak.playDetails && streak.playDetails.playProgress.playState === "completed") {
      const puzzleId = streak.puzzleDetails.puzzleId.replace("crossword-", "");
      const puzzle = await prisma.puzzle.findUnique({
        where: { id: puzzleId }
      });

      if (puzzle) {
        await prisma.progress.upsert({
          where: {
            userId_puzzleId: { userId: user.id, puzzleId: puzzleId }
          },
          update: {
            filledGrid: (puzzle.data as any).grid,
            timer: streak.playDetails.screenTimeSeconds,
            isCompleted: true
          },
          create: {
            userId: user.id,
            puzzleId: puzzleId,
            filledGrid: (puzzle.data as any).grid,
            timer: streak.playDetails.screenTimeSeconds,
            isCompleted: true
          }
        });
      }
    }
  }
}

main();