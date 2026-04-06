export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ crosswordId: string }> }
) {
  req;
  const { crosswordId } = await params;
  const token = (await cookies()).get("user_token")?.value;

  const user = token
    ? await prisma.user.findUnique({ where: { token } })
    : null;

  const puzzle = await prisma.puzzle.findFirst({
    where: {
      id: `bostonglobe-mini-${crosswordId}`
    }
  });

  if (!puzzle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = puzzle.data as any;

  let progress = null;

  if (user) {
    progress = await prisma.progress.findUnique({
      where: {
        userId_puzzleId: {
          userId: user.id,
          puzzleId: puzzle.id
        }
      }
    });
  }



  // 🧩 Base grid (hidden solution)
  const emptyGrid = data.grid.map((row: string[]) =>
    row.map((cell: string) => (cell === "#" ? "#" : null))
  );

  // 🧠 Use saved progress if available
  const filledGrid = progress?.filledGrid || emptyGrid;

  // 🧠 2. Remove answers from clues
  // const sanitizeClues = (clues: any[]) =>
  //   clues.map(({ answer, ...rest }) => rest);

  // const sanitizedClues = {
  //   across: sanitizeClues(data.clues.across),
  //   down: sanitizeClues(data.clues.down)
  // };

  // 🚀 3. Return safe data
  // return NextResponse.json({
  //   id: puzzle.id,
  //   date: puzzle.date,
  //   grid: filledGrid,
  //   clues: sanitizedClues,
  //   size: data.size,
  //   timer: progress?.timer || 0,
  //   isCompleted: progress?.isCompleted || false
  // });

  return NextResponse.json({
    id: puzzle.id,
    date: puzzle.date,
    filledGrid: data.grid,
    grid: filledGrid,
    clues: data.clues,
    size: data.size,
    timer: progress?.timer || 0,
    isCompleted: progress?.isCompleted || false,
    checkGridCount: progress?.checkGridCount || 0,
    revealedLetterCount: progress?.revealedLetterCount || 0,
  });

}