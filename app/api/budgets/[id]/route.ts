import { NextRequest, NextResponse } from "next/server";
import { getBudgetMonthById } from "@/backend/application/budgetManager/GetBudgetMonthById";
import { deleteBudgetMonth } from "@/backend/application/budgetManager/DeleteBudgetMonth";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";

const repo = new PrismaBudgetMonthRepository();

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const budget = await getBudgetMonthById(repo, id);
    return NextResponse.json(budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const budget = await deleteBudgetMonth(repo, id);
    return NextResponse.json(budget);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
