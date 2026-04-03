import { NextRequest, NextResponse } from "next/server";
import { getBudgetMonthById } from "@/backend/application/budgetManager/GetBudgetMonthById";
import { deleteBudgetMonth } from "@/backend/application/budgetManager/DeleteBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaBudgetMonthRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Returns a budget month by ID, verifying ownership.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const budget = await getBudgetMonthById(repo, id);

    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    return NextResponse.json(budget);
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

/**
 * Deletes a budget month by ID, verifying ownership.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const budget = await getBudgetMonthById(repo, id);

    if (budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const deleted = await deleteBudgetMonth(repo, id);
    return NextResponse.json(deleted);
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
