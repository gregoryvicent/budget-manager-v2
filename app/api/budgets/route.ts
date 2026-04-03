import { NextRequest, NextResponse } from "next/server";
import { getBudgetMonths } from "@/backend/application/budgetManager/GetBudgetMonths";
import { createBudgetMonth } from "@/backend/application/budgetManager/CreateBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaBudgetMonthRepository();

/**
 * Returns all budget months for the authenticated user.
 */
export async function GET(_req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const budgets = await getBudgetMonths(repo, userId);
    return NextResponse.json(budgets);
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
 * Creates a new budget month for the authenticated user.
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

    const budget = await createBudgetMonth(repo, { userId, year, month });
    return NextResponse.json(budget, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Ya existe") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
