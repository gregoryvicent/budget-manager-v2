import { NextRequest, NextResponse } from "next/server";
import { updateExpenseEntry } from "@/backend/application/budgetManager/UpdateExpenseEntry";
import { deleteExpenseEntry } from "@/backend/application/budgetManager/DeleteExpenseEntry";
import { PrismaExpenseEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository";

const repo = new PrismaExpenseEntryRepository();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, amount } = body as { name?: string; amount?: number };

    const entry = await updateExpenseEntry(repo, id, { name, amount });
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
    const entry = await deleteExpenseEntry(repo, id);
    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
