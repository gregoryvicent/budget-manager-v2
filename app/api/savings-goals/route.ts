import { NextRequest, NextResponse } from "next/server";
import { getSavingsGoals } from "@/backend/application/budgetManager/GetSavingsGoals";
import { getOrCreateSavingsGoal } from "@/backend/application/budgetManager/GetOrCreateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

const repo = new PrismaSavingsGoalRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "El parámetro userId es requerido." },
        { status: 400 },
      );
    }

    const goals = await getSavingsGoals(repo, userId);
    return NextResponse.json(goals);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type } = body as { userId?: string; type?: GoalType };

    if (!userId || !type) {
      return NextResponse.json(
        { error: "Los campos userId y type son requeridos." },
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
