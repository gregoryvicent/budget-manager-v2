import { NextRequest, NextResponse } from "next/server";
import { getOrCreateBudgetMonth } from "@/backend/application/budgetManager/GetOrCreateBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";

const repo = new PrismaBudgetMonthRepository();

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

    const budget = await getOrCreateBudgetMonth(repo, userId, year, month);
    return NextResponse.json(budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
