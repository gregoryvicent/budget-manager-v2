import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

export interface IGoalMonthSettingRepository {
  findByGoalAndMonth(savingsGoalId: string, budgetMonthId: string): Promise<GoalMonthSetting | null>;
  create(data: Pick<GoalMonthSetting, "savingsGoalId" | "budgetMonthId" | "allocationPct">): Promise<GoalMonthSetting>;
}
