import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

/**
 * Returns all savings goals for a user.
 *
 * @param {ISavingsGoalRepository} repo - Savings goal repository.
 * @param {string} userId - User ID.
 * @returns {Promise<SavingsGoal[]>} All goals for the user.
 */
export const getSavingsGoals = async (
  repo: ISavingsGoalRepository,
  userId: string,
): Promise<SavingsGoal[]> => {
  return repo.findByUser(userId);
};

/**
 * Returns savings goals assigned to a specific budget month.
 *
 * @param {ISavingsGoalRepository} repo - Savings goal repository.
 * @param {string} userId - User ID.
 * @param {GoalType} type - SAVINGS or INVESTMENT.
 * @param {string} budgetMonthId - Budget month ID to filter by.
 * @returns {Promise<SavingsGoal[]>} Goals assigned to the given month.
 */
export const getAssignedSavingsGoals = async (
  repo: ISavingsGoalRepository,
  userId: string,
  type: GoalType,
  budgetMonthId: string,
): Promise<SavingsGoal[]> => {
  return repo.findAssignedByUserAndType(userId, type, budgetMonthId);
};

/**
 * Returns savings goals NOT assigned to a specific budget month.
 *
 * @param {ISavingsGoalRepository} repo - Savings goal repository.
 * @param {string} userId - User ID.
 * @param {GoalType} type - SAVINGS or INVESTMENT.
 * @param {string} budgetMonthId - Budget month ID to check against.
 * @returns {Promise<SavingsGoal[]>} Goals not assigned to the given month.
 */
export const getUnassignedSavingsGoals = async (
  repo: ISavingsGoalRepository,
  userId: string,
  type: GoalType,
  budgetMonthId: string,
): Promise<SavingsGoal[]> => {
  return repo.findUnassignedByUserAndType(userId, type, budgetMonthId);
};
