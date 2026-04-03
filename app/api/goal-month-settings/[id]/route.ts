import { NextRequest, NextResponse } from "next/server";
import { PrismaGoalMonthSettingRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaGoalMonthSettingRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaGoalMonthSettingRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Updates a goal month setting by ID, verifying ownership via budget month.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const existing = await repo.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: `Configuración con id ${id} no encontrada.` },
        { status: 404 },
      );
    }

    // Verify ownership through the budget month
    const budget = await budgetRepo.findById(existing.budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { allocationPct, amountContributed } = body as {
      allocationPct?: number;
      amountContributed?: number | null;
    };

    const setting = await repo.update(id, { allocationPct, amountContributed });
    return NextResponse.json(setting);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
