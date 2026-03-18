import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/backend/application/budgetManager/CreateUser";
import { PrismaUserRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaUserRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body as { email?: string; name?: string };

    if (!email || !name) {
      return NextResponse.json(
        { error: "Los campos email y name son requeridos." },
        { status: 400 },
      );
    }

    const user = await createUser(new PrismaUserRepository(), { email, name });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("ya está en uso") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
