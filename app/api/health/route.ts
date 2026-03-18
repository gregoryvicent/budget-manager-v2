import { NextResponse } from "next/server";
import { prisma } from "@/backend/adapters/db/prisma/prisma.client";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", database: "disconnected", message },
      { status: 503 }
    );
  }
}
