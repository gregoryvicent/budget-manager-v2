import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

/**
 * Creates a new savings goal for the given user.
 *
 * @param {ISavingsGoalRepository} repo - Savings goal repository.
 * @param {string} userId - Owner user ID.
 * @param {GoalType} type - SAVINGS or INVESTMENT.
 * @param {string} title - Goal title.
 * @param {number} goalAmount - Target amount.
 * @returns {Promise<SavingsGoal>} The newly created goal.
 */
export const createSavingsGoal = async (
  repo: ISavingsGoalRepository,
  userId: string,
  type: GoalType,
  title: string,
  goalAmount: number,
): Promise<SavingsGoal> => {
  return repo.create({ userId, type, title, goalAmount });
};
