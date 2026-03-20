import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

export interface CreateExpenseEntryInput {
  budgetMonthId: string;
  name: string;
  amount: number;
  type: ExpenseType;
}

/**
 * Crea una nueva entrada de gasto en un presupuesto mensual.
 *
 * @param {IExpenseEntryRepository} repo - Repositorio de gastos.
 * @param {CreateExpenseEntryInput} input - Datos del gasto.
 * @returns {Promise<ExpenseEntry>} Gasto creado.
 */
export const createExpenseEntry = async (
  repo: IExpenseEntryRepository,
  input: CreateExpenseEntryInput,
): Promise<ExpenseEntry> => {
  return repo.create(input);
};
