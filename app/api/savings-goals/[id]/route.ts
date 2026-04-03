import { NextRequest, NextResponse } from "next/server";
import { updateSavingsGoal } from "@/backend/application/budgetManager/UpdateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaSavingsGoalRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Updates a savings goal by ID, verifying ownership.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    const goal = await repo.findById(id);
    if (!goal) {
      return NextResponse.json(
        { error: `Meta de ahorro con id ${id} no encontrada.` },
        { status: 404 },
      );
    }

    if (goal.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { title, goalAmount } = body as { title?: string; goalAmount?: number };
    const updated = await updateSavingsGoal(repo, id, { title, goalAmount });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrada") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
