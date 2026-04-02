// app/api/puzzles/ids/route.ts
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { date: "desc" },
    select: { id: true }
  });

  return NextResponse.json(puzzles.map(p => p.id));
}