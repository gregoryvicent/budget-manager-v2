import { NextRequest, NextResponse } from "next/server";
import { getSavingsGoals } from "@/backend/application/budgetManager/GetSavingsGoals";
import { createSavingsGoal } from "@/backend/application/budgetManager/GetOrCreateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { requireAuth } from "@/lib/apiAuth";
import type { GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

const repo = new PrismaSavingsGoalRepository();

/**
 * Returns all savings goals for the authenticated user.
 * Optionally filtered by ?type=SAVINGS|INVESTMENT.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const type = new URL(req.url).searchParams.get("type") as GoalType | null;

    const goals = type
      ? await repo.findByUserAndType(userId, type)
      : await getSavingsGoals(repo, userId);

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
 * Creates a new savings goal for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { type, title, goalAmount } = body as {
      type?: GoalType;
      title?: string;
      goalAmount?: number;
    };

    if (!type || !title || goalAmount === undefined) {
      return NextResponse.json(
        { error: "Los campos type, title y goalAmount son requeridos." },
        { status: 400 },
      );
    }

    if (type !== "SAVINGS" && type !== "INVESTMENT") {
      return NextResponse.json(
        { error: "El campo type debe ser SAVINGS o INVESTMENT." },
        { status: 400 },
      );
    }

    const goal = await createSavingsGoal(repo, userId, type, title, goalAmount);
    return NextResponse.json(goal, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
