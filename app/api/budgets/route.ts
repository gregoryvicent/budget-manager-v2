import { NextRequest, NextResponse } from "next/server";
import { getBudgetMonths } from "@/backend/application/budgetManager/GetBudgetMonths";
import { createBudgetMonth } from "@/backend/application/budgetManager/CreateBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";

const repo = new PrismaBudgetMonthRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") ?? undefined;

    const budgets = await getBudgetMonths(repo, userId);
    return NextResponse.json(budgets);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, year, month } = body as {
      userId?: string;
      year?: number;
      month?: number;
    };

    if (!userId || year === undefined || month === undefined) {
      return NextResponse.json(
        { error: "Los campos userId, year y month son requeridos." },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Ya existe") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
