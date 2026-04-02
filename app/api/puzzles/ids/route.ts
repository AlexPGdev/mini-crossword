export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { date: "desc" },
    select: { id: true }
  });

  return NextResponse.json(puzzles.map((p: { id: string }) => p.id));
}