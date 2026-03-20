import { NextRequest, NextResponse } from "next/server";
import { updateSavingsGoal } from "@/backend/application/budgetManager/UpdateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";

const repo = new PrismaSavingsGoalRepository();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, goalAmount } = body as { title?: string; goalAmount?: number };

    const goal = await updateSavingsGoal(repo, id, { title, goalAmount });
    return NextResponse.json(goal);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("no encontrada") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
