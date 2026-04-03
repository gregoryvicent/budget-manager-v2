import { NextRequest, NextResponse } from "next/server";
import { updateExpenseEntry } from "@/backend/application/budgetManager/UpdateExpenseEntry";
import { deleteExpenseEntry } from "@/backend/application/budgetManager/DeleteExpenseEntry";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaExpenseEntryRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Updates an expense entry by ID, verifying ownership via budget month.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const entry = await repo.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: `Gasto con id ${id} no encontrado.` },
        { status: 404 },
      );
    }

    const budget = await budgetRepo.findById(entry.budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, amount } = body as { name?: string; amount?: number };
    const updated = await updateExpenseEntry(repo, id, { name, amount });
    return NextResponse.json(updated);
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
 * Deletes an expense entry by ID, verifying ownership via budget month.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const entry = await repo.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: `Gasto con id ${id} no encontrado.` },
        { status: 404 },
      );
    }

    const budget = await budgetRepo.findById(entry.budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const deleted = await deleteExpenseEntry(repo, id);
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
