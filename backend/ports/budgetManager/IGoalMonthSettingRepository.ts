import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

export interface IGoalMonthSettingRepository {
  findById(id: string): Promise<GoalMonthSetting | null>;
  findByGoalAndMonth(savingsGoalId: string, budgetMonthId: string): Promise<GoalMonthSetting | null>;
  findByBudgetMonth(budgetMonthId: string): Promise<GoalMonthSetting[]>;
  findByGoal(savingsGoalId: string): Promise<GoalMonthSetting[]>;
  create(data: Pick<GoalMonthSetting, "savingsGoalId" | "budgetMonthId" | "allocationPct">): Promise<GoalMonthSetting>;
  update(id: string, data: Partial<Pick<GoalMonthSetting, "allocationPct" | "amountContributed">>): Promise<GoalMonthSetting>;
  delete(id: string): Promise<void>;
}
