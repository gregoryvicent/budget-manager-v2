import { NextRequest, NextResponse } from "next/server";
import { getSavingsGoals } from "@/backend/application/budgetManager/GetSavingsGoals";
import { getOrCreateSavingsGoal } from "@/backend/application/budgetManager/GetOrCreateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { requireAuth } from "@/lib/apiAuth";
import type { GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

const repo = new PrismaSavingsGoalRepository();

/**
 * Returns all savings goals for the authenticated user.
 */
export async function GET(_req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const goals = await getSavingsGoals(repo, userId);
    return NextResponse.json(goals);
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
 * Gets or creates a savings goal for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { type } = body as { type?: GoalType };

    if (!type) {
      return NextResponse.json(
        { error: "El campo type es requerido." },
        { status: 400 },
      );
    }

    if (type !== "SAVINGS" && type !== "INVESTMENT") {
      return NextResponse.json(
        { error: "El campo type debe ser SAVINGS o INVESTMENT." },
        { status: 400 },
      );
    }

    const goal = await getOrCreateSavingsGoal(repo, userId, type);
    return NextResponse.json(goal);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
