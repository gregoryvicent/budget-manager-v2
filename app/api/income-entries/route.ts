import { NextRequest, NextResponse } from "next/server";
import { getIncomeEntries } from "@/backend/application/budgetManager/GetIncomeEntries";
import { createIncomeEntry } from "@/backend/application/budgetManager/CreateIncomeEntry";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";

const repo = new PrismaIncomeEntryRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId");

    if (!budgetMonthId) {
      return NextResponse.json(
        { error: "El parámetro budgetMonthId es requerido." },
        { status: 400 },
      );
    }

    const entries = await getIncomeEntries(repo, budgetMonthId);
    return NextResponse.json(entries);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const entry = await createIncomeEntry(repo, { budgetMonthId, name, amount });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
