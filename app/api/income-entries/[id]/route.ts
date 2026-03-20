import { NextRequest, NextResponse } from "next/server";
import { updateIncomeEntry } from "@/backend/application/budgetManager/UpdateIncomeEntry";
import { deleteIncomeEntry } from "@/backend/application/budgetManager/DeleteIncomeEntry";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";

const repo = new PrismaIncomeEntryRepository();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, amount } = body as { name?: string; amount?: number };

    const entry = await updateIncomeEntry(repo, id, { name, amount });
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const entry = await deleteIncomeEntry(repo, id);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
