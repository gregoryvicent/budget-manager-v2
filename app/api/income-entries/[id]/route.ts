import { NextRequest, NextResponse } from "next/server";
import { updateIncomeEntry } from "@/backend/application/budgetManager/UpdateIncomeEntry";
import { deleteIncomeEntry } from "@/backend/application/budgetManager/DeleteIncomeEntry";
import { PrismaIncomeEntryRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";
import { withIdempotency } from "@/lib/withIdempotency";

const repo = new PrismaIncomeEntryRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Updates an income entry by ID, verifying ownership via budget month.
 * Supports idempotency via the Idempotency-Key header.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const { userId } = await requireAuth();
    const { id } = await params;

    const entry = await repo.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: `Ingreso con id ${id} no encontrado.` },
        { status: 404 },
      );
    }

    const budget = await budgetRepo.findById(entry.budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name, amount } = body as { name?: string; amount?: number };

    const { response } = await withIdempotency({
      idempotencyKey,
      handler: async () => {
        const updated = await updateIncomeEntry(repo, id, { name, amount });
        return NextResponse.json(updated);
      },
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * Deletes an income entry by ID, verifying ownership via budget month.
 * Supports idempotency via the Idempotency-Key header.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const { userId } = await requireAuth();
    const { id } = await params;

    const entry = await repo.findById(id);
    if (!entry) {
      return NextResponse.json(
        { error: `Ingreso con id ${id} no encontrado.` },
        { status: 404 },
      );
    }

    const budget = await budgetRepo.findById(entry.budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const { response } = await withIdempotency({
      idempotencyKey,
      handler: async () => {
        const deleted = await deleteIncomeEntry(repo, id);
        return NextResponse.json(deleted);
      },
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrado") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
