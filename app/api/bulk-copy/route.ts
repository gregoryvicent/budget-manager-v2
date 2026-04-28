import { NextRequest, NextResponse } from "next/server";
import { bulkCopyItems } from "@/backend/application/budgetManager/BulkCopyItems";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";
import { withIdempotency } from "@/lib/withIdempotency";
import type { CopyCategory } from "@/backend/application/budgetManager/BulkCopyItems";

const incomeRepo = new PrismaIncomeEntryRepository();
const expenseRepo = new PrismaExpenseEntryRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

const VALID_CATEGORIES: CopyCategory[] = ["INCOME", "FIXED_EXPENSE", "VARIABLE_EXPENSE"];

/**
 * Copies selected items from a source budget month to a target budget month.
 * Supports idempotency via the Idempotency-Key header.
 */
export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const { userId } = await requireAuth();
    const body = await req.json();
    const { sourceBudgetMonthId, targetBudgetMonthId, category, itemIds } = body as {
      sourceBudgetMonthId?: string;
      targetBudgetMonthId?: string;
      category?: string;
      itemIds?: string[];
    };

    if (!sourceBudgetMonthId || !targetBudgetMonthId || !category || !itemIds) {
      return NextResponse.json(
        { error: "Los campos sourceBudgetMonthId, targetBudgetMonthId, category e itemIds son requeridos." },
        { status: 400 },
      );
    }

    if (!VALID_CATEGORIES.includes(category as CopyCategory)) {
      return NextResponse.json(
        { error: "La categoría debe ser INCOME, FIXED_EXPENSE o VARIABLE_EXPENSE." },
        { status: 400 },
      );
    }

    const [sourceBudget, targetBudget] = await Promise.all([
      budgetRepo.findById(sourceBudgetMonthId),
      budgetRepo.findById(targetBudgetMonthId),
    ]);

    if (!sourceBudget || sourceBudget.userId !== userId || !targetBudget || targetBudget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const { response } = await withIdempotency({
      idempotencyKey,
      handler: async () => {
        const result = await bulkCopyItems(incomeRepo, expenseRepo, {
          sourceBudgetMonthId,
          targetBudgetMonthId,
          category: category as CopyCategory,
          itemIds,
        });
        return NextResponse.json(result, { status: 201 });
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
