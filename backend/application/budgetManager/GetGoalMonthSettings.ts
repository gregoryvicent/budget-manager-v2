import { IGoalMonthSettingRepository } from "@/backend/ports/budgetManager/IGoalMonthSettingRepository";
import { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

/**
 * Retorna configuraciones mensuales de metas filtradas por presupuesto o por meta.
 * Se debe proporcionar al menos uno de los dos parámetros.
 *
 * @param {IGoalMonthSettingRepository} repo - Repositorio de configuraciones.
 * @param {{ budgetMonthId?: string; savingsGoalId?: string }} filter - Filtros de búsqueda.
 * @returns {Promise<GoalMonthSetting[]>} Lista de configuraciones.
 * @throws {Error} Si no se proporciona ningún filtro.
 */
export const getGoalMonthSettings = async (
  repo: IGoalMonthSettingRepository,
  filter: { budgetMonthId?: string; savingsGoalId?: string },
): Promise<GoalMonthSetting[]> => {
  if (filter.budgetMonthId) return repo.findByBudgetMonth(filter.budgetMonthId);
  if (filter.savingsGoalId) return repo.findByGoal(filter.savingsGoalId);
  throw new Error("Se requiere budgetMonthId o savingsGoalId como filtro.");
};
