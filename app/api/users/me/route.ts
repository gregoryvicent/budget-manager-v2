import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { deleteUser } from "@/backend/application/users/DeleteUser";
import { PrismaUserRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaUserRepository";

const repo = new PrismaUserRepository();

/**
 * Deletes the authenticated user's account and all associated data via cascade.
 */
export async function DELETE() {
  try {
    const { userId } = await requireAuth();
    await deleteUser(repo, userId);
    return NextResponse.json({ message: "Cuenta eliminada exitosamente." }, { status: 200 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
