import { NextRequest, NextResponse } from "next/server";
import { getGoalMonthSettings } from "@/backend/application/budgetManager/GetGoalMonthSettings";
import { upsertGoalMonthSetting } from "@/backend/application/budgetManager/UpsertGoalMonthSetting";
import { PrismaGoalMonthSettingRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaGoalMonthSettingRepository";
import { PrismaBudgetMonthRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository";
import { PrismaSavingsGoalRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaSavingsGoalRepository";
import { requireAuth } from "@/lib/apiAuth";

const repo = new PrismaGoalMonthSettingRepository();
const budgetRepo = new PrismaBudgetMonthRepository();
const goalRepo = new PrismaSavingsGoalRepository();

/**
 * Returns goal month settings, verifying ownership via budget month or savings goal.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId") ?? undefined;
    const savingsGoalId = searchParams.get("savingsGoalId") ?? undefined;

    // Verify ownership through budget month if provided
    if (budgetMonthId) {
      const budget = await budgetRepo.findById(budgetMonthId);
      if (!budget || budget.userId !== userId) {
        return NextResponse.json(
          { error: "No tiene permiso para acceder a este recurso." },
          { status: 403 },
        );
      }
    }

    // Verify ownership through savings goal if provided
    if (savingsGoalId) {
      const goal = await goalRepo.findById(savingsGoalId);
      if (!goal || goal.userId !== userId) {
        return NextResponse.json(
          { error: "No tiene permiso para acceder a este recurso." },
          { status: 403 },
        );
      }
    }

    const settings = await getGoalMonthSettings(repo, { budgetMonthId, savingsGoalId });
    return NextResponse.json(settings);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
      const e = error as { status: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Se requiere") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * Upserts a goal month setting, verifying ownership of both budget month and savings goal.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const body = await req.json();
    const { savingsGoalId, budgetMonthId, allocationPct } = body as {
      savingsGoalId?: string;
      budgetMonthId?: string;
      allocationPct?: number;
    };

    if (!savingsGoalId || !budgetMonthId || allocationPct === undefined) {
      return NextResponse.json(
        { error: "Los campos savingsGoalId, budgetMonthId y allocationPct son requeridos." },
        { status: 400 },
      );
    }

    // Verify ownership of the budget month
    const budget = await budgetRepo.findById(budgetMonthId);
    if (!budget || budget.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    // Verify ownership of the savings goal
    const goal = await goalRepo.findById(savingsGoalId);
    if (!goal || goal.userId !== userId) {
      return NextResponse.json(
        { error: "No tiene permiso para acceder a este recurso." },
        { status: 403 },
      );
    }

    const setting = await upsertGoalMonthSetting(repo, savingsGoalId, budgetMonthId, allocationPct);
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
