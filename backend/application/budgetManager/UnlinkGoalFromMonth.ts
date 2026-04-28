import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";

/**
 * Unlinks a savings goal from a specific month by deleting the GoalMonthSetting,
 * then recalculates the parent goal's totalContributed.
 *
 * @param {IGoalMonthSettingRepository} goalMonthSettingRepo - Goal month setting repository.
 * @param {ISavingsGoalRepository} savingsGoalRepo - Savings goal repository.
 * @param {string} settingId - The GoalMonthSetting ID to remove.
 * @returns {Promise<void>}
 * @throws {Error} If the GoalMonthSetting is not found.
 */
export const unlinkGoalFromMonth = async (
  goalMonthSettingRepo: IGoalMonthSettingRepository,
  savingsGoalRepo: ISavingsGoalRepository,
  settingId: string,
): Promise<void> => {
  const setting = await goalMonthSettingRepo.findById(settingId);
  if (!setting) {
    throw new Error(`GoalMonthSetting not found: ${settingId}`);
  }

  const { savingsGoalId } = setting;

  await goalMonthSettingRepo.delete(settingId);
  await savingsGoalRepo.recalcTotalContributed(savingsGoalId);
};
