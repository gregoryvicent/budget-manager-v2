import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/backend/application/auth/RegisterUser";
import { PrismaUserRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaUserRepository";

const repo = new PrismaUserRepository();

/**
 * Handles user registration via POST request.
 * Creates a new user account with hashed password.
 *
 * @param {NextRequest} req - The incoming request with { name, email, password } body
 * @returns {Promise<NextResponse>} 201 on success, 409 for duplicate email, 400 for validation errors
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const user = await registerUser(repo, { name, email, password });
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido.";
    const status = message.includes("ya está en uso") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
