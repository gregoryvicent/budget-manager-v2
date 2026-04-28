import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

/**
 * Creates a new savings goal and automatically assigns it to the given budget month.
 *
 * @param {ISavingsGoalRepository} savingsGoalRepo - Savings goal repository.
 * @param {IGoalMonthSettingRepository} goalMonthSettingRepo - Goal month setting repository.
 * @param {string} userId - Owner user ID.
 * @param {GoalType} type - SAVINGS or INVESTMENT.
 * @param {string} title - Goal title.
 * @param {number} goalAmount - Target amount.
 * @param {string} budgetMonthId - Budget month to assign the goal to.
 * @returns {Promise<{ goal: SavingsGoal; setting: GoalMonthSetting }>} The created goal and its month assignment.
 */
export const createSavingsGoal = async (
  savingsGoalRepo: ISavingsGoalRepository,
  goalMonthSettingRepo: IGoalMonthSettingRepository,
  userId: string,
  type: GoalType,
  title: string,
  goalAmount: number,
  budgetMonthId: string,
): Promise<{ goal: SavingsGoal; setting: GoalMonthSetting }> => {
  const goal = await savingsGoalRepo.create({ userId, type, title, goalAmount });

  const setting = await goalMonthSettingRepo.create({
    savingsGoalId: goal.id,
    budgetMonthId,
    allocationPct: 0,
  });

  return { goal, setting };
};
