import { NextRequest, NextResponse } from "next/server";
import { PrismaGoalMonthSettingRepository } from "@/backend/adapters/db/prisma/budgetManager/PrismaGoalMonthSettingRepository";

const repo = new PrismaGoalMonthSettingRepository();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { allocationPct, amountContributed } = body as {
      allocationPct?: number;
      amountContributed?: number | null;
    };

    const setting = await repo.update(id, { allocationPct, amountContributed });
    return NextResponse.json(setting);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
