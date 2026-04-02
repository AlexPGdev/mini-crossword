export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ crosswordId: string }> }
) {
  const { crosswordId } = await params;
  const { grid } = await req.json();
  const puzzle = await prisma.puzzle.findFirst({
    where: {
      id: `bostonglobe-mini-${crosswordId}`
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

  const result = grid.map((row: string[], rowIndex: number) =>
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

  if(isSolved && user) {
    await prisma.progress.upsert({
      where: {
        userId_puzzleId: { userId: user.id, puzzleId: puzzle.id }
      },
      update: {
        isCompleted: true
      },
      create: {
        userId: user.id,
        puzzleId: puzzle.id,
        filledGrid: grid,
        isCompleted: true
      }
    });
  }

  return NextResponse.json({
    result,
    isSolved
  });
}