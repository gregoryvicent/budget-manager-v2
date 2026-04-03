import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBudgetMonth } from "@/backend/application/budgetManager/GetOrCreateBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaBudgetMonthRepository();

/**
 * Gets or creates a budget month for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { year, month } = body as { year?: number; month?: number };

    if (year === undefined || month === undefined) {
      return NextResponse.json(
        { error: "Los campos year y month son requeridos." },
        { status: 400 },
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "El campo month debe estar entre 1 y 12." },
        { status: 400 },
      );
    }

    const budget = await getOrCreateBudgetMonth(repo, userId, year, month);
    return NextResponse.json(budget);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
