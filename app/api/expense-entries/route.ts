import { NextRequest, NextResponse } from "next/server";
import { getExpenseEntries } from "@/backend/application/budgetManager/GetExpenseEntries";
import { createExpenseEntry } from "@/backend/application/budgetManager/CreateExpenseEntry";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";
import { ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

const repo = new PrismaExpenseEntryRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId");
    const type = searchParams.get("type") as ExpenseType | null;

    if (!budgetMonthId) {
      return NextResponse.json(
        { error: "El parámetro budgetMonthId es requerido." },
        { status: 400 },
      );
    }

    const entries = await getExpenseEntries(repo, budgetMonthId, type ?? undefined);
    return NextResponse.json(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const entry = await createExpenseEntry(repo, { budgetMonthId, name, amount, type });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
