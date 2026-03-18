import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

export class PrismaGoalMonthSettingRepository implements IGoalMonthSettingRepository {
  async findByGoalAndMonth(savingsGoalId: string, budgetMonthId: string): Promise<GoalMonthSetting | null> {
    const row = await prisma.goalMonthSetting.findUnique({
      where: { uq_goal_settings_per_month: { savingsGoalId, budgetMonthId } },
    });
    if (!row) return null;
    return {
      ...row,
      allocationPct: row.allocationPct.toNumber(),
      amountContributed: row.amountContributed?.toNumber() ?? null,
    };
  }

  async create(data: Pick<GoalMonthSetting, "savingsGoalId" | "budgetMonthId" | "allocationPct">): Promise<GoalMonthSetting> {
    const row = await prisma.goalMonthSetting.create({ data });
    return {
      ...row,
      allocationPct: row.allocationPct.toNumber(),
      amountContributed: row.amountContributed?.toNumber() ?? null,
    };
  }
}
