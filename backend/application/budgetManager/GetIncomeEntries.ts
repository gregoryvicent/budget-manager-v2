import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

/**
 * Retorna todas las entradas de ingreso de un presupuesto mensual.
 *
 * @param {IIncomeEntryRepository} repo - Repositorio de ingresos.
 * @param {string} budgetMonthId - ID del presupuesto mensual.
 * @returns {Promise<IncomeEntry[]>} Lista de ingresos.
 */
export const getIncomeEntries = async (
  repo: IIncomeEntryRepository,
  budgetMonthId: string,
): Promise<IncomeEntry[]> => {
  return repo.findByBudgetMonth(budgetMonthId);
};
