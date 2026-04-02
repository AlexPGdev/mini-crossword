import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

  const token = (await cookies()).get("user_token")?.value;

  const user = token
    ? await prisma.user.findUnique({ where: { token } })
    : null;

  const puzzles = await prisma.puzzle.findMany({
    orderBy: { date: "desc" },
    select: { id: true, date: true, data: true }
  });

  let progressList: any[] = [];

  if (user) {
    progressList = await prisma.progress.findMany({
      where: {
        userId: user.id
      },
      select: {
        puzzleId: true,
        isCompleted: true,
        timer: true
      }
    });
  }

  const progressMap = new Map(
    progressList.map(p => [p.puzzleId, p])
  );

  const result = puzzles.map(puzzle => {
    const progress = progressMap.get(puzzle.id);

    const datePart = puzzle.id.split("-").pop();

    return {
      puzzleId: datePart,
      date: puzzle.date,
      hasProgress: !!progress,
      isSolved: progress?.isCompleted ?? false,
      timer: progress?.timer ?? null
    };
  });

  return NextResponse.json(result);
}