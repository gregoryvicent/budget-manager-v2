import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";

/**
 * Deletes a savings goal by ID.
 *
 * @param {ISavingsGoalRepository} repo - Savings goal repository.
 * @param {string} id - Goal ID to delete.
 * @returns {Promise<void>}
 */
export const deleteSavingsGoal = async (
  repo: ISavingsGoalRepository,
  id: string,
): Promise<void> => {
  await repo.delete(id);
};
