import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

/**
 * Retorna las entradas de gasto de un presupuesto mensual, opcionalmente filtradas por tipo.
 *
 * @param {IExpenseEntryRepository} repo - Repositorio de gastos.
 * @param {string} budgetMonthId - ID del presupuesto mensual.
 * @param {ExpenseType} [type] - Tipo de gasto (FIXED o VARIABLE). Si se omite, retorna todos.
 * @returns {Promise<ExpenseEntry[]>} Lista de gastos.
 */
export const getExpenseEntries = async (
  repo: IExpenseEntryRepository,
  budgetMonthId: string,
  type?: ExpenseType,
): Promise<ExpenseEntry[]> => {
  return repo.findByBudgetMonth(budgetMonthId, type);
};
