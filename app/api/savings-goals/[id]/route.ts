import { NextRequest, NextResponse } from "next/server";
import { updateSavingsGoal } from "@/backend/application/budgetManager/UpdateSavingsGoal";
import { deleteSavingsGoal } from "@/backend/application/budgetManager/DeleteSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaSavingsGoalRepository();

type Params = { params: Promise<{ id: string }> };

/**
 * Verifies ownership and returns the goal or a 404/403 response.
 */
async function findOwnedGoal(userId: string, id: string) {
  const goal = await repo.findById(id);
  if (!goal) return { error: "Meta no encontrada.", status: 404 };
  if (goal.userId !== userId) return { error: "No tiene permiso.", status: 403 };
  return { goal };
}

/**
 * Returns a savings goal with accumulated contributions up to ?year=&month=.
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const result = await findOwnedGoal(userId, id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const { searchParams } = new URL(req.url);
    const year  = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));
    if (!year || !month) {
      return NextResponse.json(result.goal);
    }
    const contributedUpTo = await repo.sumContributedUpTo(id, year, month);
    return NextResponse.json({ ...result.goal, contributedUpTo });
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
 * Updates a savings goal by ID.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const result = await findOwnedGoal(userId, id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Deletes a savings goal by ID (cascades to GoalMonthSettings).
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    const result = await findOwnedGoal(userId, id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    await deleteSavingsGoal(repo, id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
