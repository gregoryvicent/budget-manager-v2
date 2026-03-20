import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

const toGoalMonthSetting = (row: {
  id: string; savingsGoalId: string; budgetMonthId: string;
  allocationPct: { toNumber(): number };
  amountContributed: { toNumber(): number } | null;
  createdAt: Date; updatedAt: Date;
}): GoalMonthSetting => ({
  ...row,
  allocationPct: row.allocationPct.toNumber(),
  amountContributed: row.amountContributed?.toNumber() ?? null,
});

export class PrismaGoalMonthSettingRepository implements IGoalMonthSettingRepository {
  async findByGoalAndMonth(savingsGoalId: string, budgetMonthId: string): Promise<GoalMonthSetting | null> {
    const row = await prisma.goalMonthSetting.findUnique({
      where: { uq_goal_settings_per_month: { savingsGoalId, budgetMonthId } },
    });
    return row ? toGoalMonthSetting(row) : null;
  }

  async findByBudgetMonth(budgetMonthId: string): Promise<GoalMonthSetting[]> {
    const rows = await prisma.goalMonthSetting.findMany({ where: { budgetMonthId } });
    return rows.map(toGoalMonthSetting);
  }

  async findByGoal(savingsGoalId: string): Promise<GoalMonthSetting[]> {
    const rows = await prisma.goalMonthSetting.findMany({ where: { savingsGoalId } });
    return rows.map(toGoalMonthSetting);
  }

  async create(data: Pick<GoalMonthSetting, "savingsGoalId" | "budgetMonthId" | "allocationPct">): Promise<GoalMonthSetting> {
    const row = await prisma.goalMonthSetting.create({ data });
    return toGoalMonthSetting(row);
  }

  async update(id: string, data: Partial<Pick<GoalMonthSetting, "allocationPct" | "amountContributed">>): Promise<GoalMonthSetting> {
    const row = await prisma.goalMonthSetting.update({ where: { id }, data });
    return toGoalMonthSetting(row);
  }
}
