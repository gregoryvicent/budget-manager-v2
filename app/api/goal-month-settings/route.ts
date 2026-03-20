import { NextRequest, NextResponse } from "next/server";
import { getGoalMonthSettings } from "@/backend/application/budgetManager/GetGoalMonthSettings";
import { upsertGoalMonthSetting } from "@/backend/application/budgetManager/UpsertGoalMonthSetting";
import { PrismaGoalMonthSettingRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaGoalMonthSettingRepository";

const repo = new PrismaGoalMonthSettingRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const budgetMonthId = searchParams.get("budgetMonthId") ?? undefined;
    const savingsGoalId = searchParams.get("savingsGoalId") ?? undefined;

    const settings = await getGoalMonthSettings(repo, { budgetMonthId, savingsGoalId });
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Se requiere") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const setting = await upsertGoalMonthSetting(repo, savingsGoalId, budgetMonthId, allocationPct);
    return NextResponse.json(setting);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
