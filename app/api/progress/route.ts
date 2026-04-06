export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { puzzleId, filledGrid, timeSpent } = await req.json();

  const puzzle = await prisma.puzzle.findFirst({
    where: {
      id: puzzleId
    }
  });

  if (!puzzle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  };

  const token = (await cookies()).get("user_token")?.value;

  const user = token
    ? await prisma.user.findUnique({ where: { token } })
    : null;

  const solution = (puzzle.data as any).grid;

  const result = filledGrid.map((row: string[], rowIndex: number) =>
    row.map((cell: string, colIndex: number) => {
      if (solution[rowIndex][colIndex] === "#") {
        return "#";
      }

      if (!cell) return null;

      return cell === solution[rowIndex][colIndex];
    })
  );

  const isSolved = result.every((row: boolean[]) =>
    row.every((cell: boolean | string) => cell === true || cell === "#")
  );

  if(user) {
    const progress = await prisma.progress.upsert({
      where: {
        userId_puzzleId: { userId: user.id, puzzleId }
      },
      update: {
        filledGrid,
        timer: timeSpent,
        isCompleted: isSolved
      },
      create: {
        userId: user.id,
        puzzleId,
        filledGrid,
        timer: timeSpent,
        isCompleted: isSolved,
        updatedAt: new Date()
      }
    });
  
    return NextResponse.json(progress);
  } else {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

}