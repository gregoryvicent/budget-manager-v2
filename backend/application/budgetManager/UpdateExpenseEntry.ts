import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry } from "@/backend/domain/budgetManager/ExpenseEntry";

export interface UpdateExpenseEntryInput {
  name?: string;
  amount?: number;
}

/**
 * Actualiza una entrada de gasto existente.
 *
 * @param {IExpenseEntryRepository} repo - Repositorio de gastos.
 * @param {string} id - ID del gasto a actualizar.
 * @param {UpdateExpenseEntryInput} input - Campos a actualizar.
 * @returns {Promise<ExpenseEntry>} Gasto actualizado.
 * @throws {Error} Si el gasto no existe.
 */
export const updateExpenseEntry = async (
  repo: IExpenseEntryRepository,
  id: string,
  input: UpdateExpenseEntryInput,
): Promise<ExpenseEntry> => {
  const existing = await repo.findById(id);
  if (!existing) throw new Error(`Gasto con id ${id} no encontrado.`);
  return repo.update(id, input);
};
