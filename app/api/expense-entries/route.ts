import { NextRequest, NextResponse } from "next/server";
import { getExpenseEntries } from "@/backend/application/budgetManager/GetExpenseEntries";
import { createExpenseEntry } from "@/backend/application/budgetManager/CreateExpenseEntry";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";
import { withIdempotency } from "@/lib/withIdempotency";
import type { ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

const repo = new PrismaExpenseEntryRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

/**
 * Returns expense entries for a budget month, verifying ownership.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId");
    const type = searchParams.get("type") as ExpenseType | null;

    if (!budgetMonthId) {
      return NextResponse.json(
        { error: "El parámetro budgetMonthId es requerido." },
        { status: 400 },
      );
    }

    const budget = await budgetRepo.findById(budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const entries = await getExpenseEntries(repo, budgetMonthId, type ?? undefined);
    return NextResponse.json(entries);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates an expense entry, verifying ownership of the budget month.
 * Supports idempotency via the Idempotency-Key header.
 */
export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const { userId } = await requireAuth();
    const body = await req.json();
    const { budgetMonthId, name, amount, type } = body as {
      budgetMonthId?: string;
      name?: string;
      amount?: number;
      type?: ExpenseType;
    };

    if (!budgetMonthId || !name || amount === undefined || !type) {
      return NextResponse.json(
        { error: "Los campos budgetMonthId, name, amount y type son requeridos." },
        { status: 400 },
      );
    }

    if (type !== "FIXED" && type !== "VARIABLE") {
      return NextResponse.json(
        { error: "El campo type debe ser FIXED o VARIABLE." },
        { status: 400 },
      );
    }

    const budget = await budgetRepo.findById(budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const { response } = await withIdempotency({
      idempotencyKey,
      handler: async () => {
        const entry = await createExpenseEntry(repo, { budgetMonthId, name, amount, type });
        return NextResponse.json(entry, { status: 201 });
      },
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
