import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry } from "@/backend/domain/budgetManager/ExpenseEntry";

/**
 * Elimina una entrada de gasto por su ID.
 *
 * @param {IExpenseEntryRepository} repo - Repositorio de gastos.
 * @param {string} id - ID del gasto a eliminar.
 * @returns {Promise<ExpenseEntry>} Datos del gasto eliminado.
 * @throws {Error} Si el gasto no existe.
 */
export const deleteExpenseEntry = async (
  repo: IExpenseEntryRepository,
  id: string,
): Promise<ExpenseEntry> => {
  const existing = await repo.findById(id);
  if (!existing) throw new Error(`Gasto con id ${id} no encontrado.`);
  return repo.delete(id);
};
