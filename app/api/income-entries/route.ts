import { NextRequest, NextResponse } from "next/server";
import { getIncomeEntries } from "@/backend/application/budgetManager/GetIncomeEntries";
import { createIncomeEntry } from "@/backend/application/budgetManager/CreateIncomeEntry";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaIncomeEntryRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

/**
 * Returns income entries for a budget month, verifying ownership.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId");

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

    const entries = await getIncomeEntries(repo, budgetMonthId);
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
 * Creates an income entry, verifying ownership of the budget month.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { budgetMonthId, name, amount } = body as {
      budgetMonthId?: string;
      name?: string;
      amount?: number;
    };

    if (!budgetMonthId || !name || amount === undefined) {
      return NextResponse.json(
        { error: "Los campos budgetMonthId, name y amount son requeridos." },
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

    const entry = await createIncomeEntry(repo, { budgetMonthId, name, amount });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
