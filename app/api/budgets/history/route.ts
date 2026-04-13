import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { getBudgetHistory } from "@/backend/application/budgetManager/GetBudgetHistory";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";

const budgetRepo = new PrismaBudgetMonthRepository();
const incomeRepo = new PrismaIncomeEntryRepository();
const expenseRepo = new PrismaExpenseEntryRepository();

/**
 * Returns aggregated monthly income and expense summaries for the authenticated
 * user in the specified year.
 *
 * @query year - Calendar year to retrieve history for (required, must be a valid integer).
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const yearParam = req.nextUrl.searchParams.get("year");
    if (!yearParam) {
      return NextResponse.json(
        { error: "El parámetro year es requerido." },
        { status: 400 },
      );
    }

    const year = Number(yearParam);
    if (!Number.isInteger(year)) {
      return NextResponse.json(
        { error: "El parámetro year debe ser un número entero válido." },
        { status: 400 },
      );
    }

    const summaries = await getBudgetHistory(
      budgetRepo,
      incomeRepo,
      expenseRepo,
      userId,
      year,
    );

    return NextResponse.json(summaries);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
