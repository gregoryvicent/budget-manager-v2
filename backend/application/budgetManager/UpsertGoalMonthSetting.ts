import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

/**
 * Creates or updates the monthly setting for a goal and recalculates
 * the parent goal's totalContributed cache.
 *
 * @param {IGoalMonthSettingRepository} repo - Goal month setting repository.
 * @param {ISavingsGoalRepository} goalRepo - Savings goal repository (for recalc).
 * @param {string} savingsGoalId - Goal ID.
 * @param {string} budgetMonthId - Budget month ID.
 * @param {number} allocationPct - Percentage of income allocated.
 * @param {number | null} [amountContributed] - Actual contributed amount.
 * @returns {Promise<GoalMonthSetting>} The created or updated setting.
 */
export const upsertGoalMonthSetting = async (
  repo: IGoalMonthSettingRepository,
  goalRepo: ISavingsGoalRepository,
  savingsGoalId: string,
  budgetMonthId: string,
  allocationPct: number,
  amountContributed?: number | null,
): Promise<GoalMonthSetting> => {
  const existing = await repo.findByGoalAndMonth(savingsGoalId, budgetMonthId);

  const updateData: Partial<Pick<GoalMonthSetting, "allocationPct" | "amountContributed">> = { allocationPct };
  if (amountContributed !== undefined) updateData.amountContributed = amountContributed;

  let setting: GoalMonthSetting;
  if (existing) {
    setting = await repo.update(existing.id, updateData);
  } else {
    setting = await repo.create({ savingsGoalId, budgetMonthId, allocationPct });
    if (amountContributed !== undefined && amountContributed !== null) {
      setting = await repo.update(setting.id, { amountContributed });
    }
  }

  // Recalculate the parent goal's totalContributed cache.
  await goalRepo.recalcTotalContributed(savingsGoalId);

  return setting;
};
