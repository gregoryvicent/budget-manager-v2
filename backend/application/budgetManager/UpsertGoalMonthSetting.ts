import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

/**
 * Crea o actualiza la configuración mensual de una meta para un presupuesto dado.
 *
 * @param {IGoalMonthSettingRepository} repo - Repositorio de configuraciones.
 * @param {string} savingsGoalId - ID de la meta de ahorro.
 * @param {string} budgetMonthId - ID del presupuesto mensual.
 * @param {number} allocationPct - Porcentaje del ingreso destinado a la meta.
 * @returns {Promise<GoalMonthSetting>} Configuración creada o actualizada.
 */
export const upsertGoalMonthSetting = async (
  repo: IGoalMonthSettingRepository,
  savingsGoalId: string,
  budgetMonthId: string,
  allocationPct: number,
): Promise<GoalMonthSetting> => {
  const existing = await repo.findByGoalAndMonth(savingsGoalId, budgetMonthId);
  if (existing) return repo.update(existing.id, { allocationPct });
  return repo.create({ savingsGoalId, budgetMonthId, allocationPct });
};
