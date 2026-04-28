import { NextRequest, NextResponse } from "next/server";
import { getSavingsGoals, getAssignedSavingsGoals, getUnassignedSavingsGoals } from "@/backend/application/budgetManager/GetSavingsGoals";
import { createSavingsGoal } from "@/backend/application/budgetManager/GetOrCreateSavingsGoal";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { PrismaGoalMonthSettingRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaGoalMonthSettingRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { requireAuth } from "@/lib/apiAuth";
import { withIdempotency } from "@/lib/withIdempotency";
import type { GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

const repo = new PrismaSavingsGoalRepository();
const goalMonthSettingRepo = new PrismaGoalMonthSettingRepository();
const budgetRepo = new PrismaBudgetMonthRepository();

/**
 * Returns all savings goals for the authenticated user.
 * Supports filtering:
 *   ?type=SAVINGS|INVESTMENT&budgetMonthId=xxx  → goals assigned to that month
 *   ?type=SAVINGS|INVESTMENT&unassignedFor=xxx  → goals NOT assigned to that month
 *   ?type=SAVINGS|INVESTMENT                    → all goals of that type
 *   (no params)                                 → all goals
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as GoalType | null;
    const budgetMonthId = searchParams.get("budgetMonthId");
    const unassignedFor = searchParams.get("unassignedFor");

    if (type && budgetMonthId) {
      const goals = await getAssignedSavingsGoals(repo, userId, type, budgetMonthId);
      return NextResponse.json(goals);
    }

    if (type && unassignedFor) {
      const goals = await getUnassignedSavingsGoals(repo, userId, type, unassignedFor);
      return NextResponse.json(goals);
    }

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
 * Creates a new savings goal for the authenticated user and assigns it to the given budget month.
 * Body: { type, title, goalAmount, budgetMonthId }
 * Supports idempotency via the Idempotency-Key header.
 */
export async function POST(req: NextRequest) {
  try {
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const { userId } = await requireAuth();
    const body = await req.json();
    const { type, title, goalAmount, budgetMonthId } = body as {
      type?: GoalType;
      title?: string;
      goalAmount?: number;
      budgetMonthId?: string;
    };

    if (!type || !title || goalAmount === undefined || !budgetMonthId) {
      return NextResponse.json(
        { error: "Los campos type, title, goalAmount y budgetMonthId son requeridos." },
        { status: 400 },
      );
    }

    if (type !== "SAVINGS" && type !== "INVESTMENT") {
      return NextResponse.json(
        { error: "El campo type debe ser SAVINGS o INVESTMENT." },
        { status: 400 },
      );
    }

    // Validate that the budget month exists and belongs to the user
    const budget = await budgetRepo.findById(budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "El budgetMonthId proporcionado no es válido o no pertenece al usuario." },
        { status: 400 },
      );
    }

    const { response } = await withIdempotency({
      idempotencyKey,
      handler: async () => {
        const result = await createSavingsGoal(
          repo, goalMonthSettingRepo, userId, type, title, goalAmount, budgetMonthId,
        );
        return NextResponse.json(result, { status: 201 });
      },
    });
    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
