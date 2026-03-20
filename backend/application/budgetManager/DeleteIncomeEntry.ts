import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

/**
 * Elimina una entrada de ingreso por su ID.
 *
 * @param {IIncomeEntryRepository} repo - Repositorio de ingresos.
 * @param {string} id - ID del ingreso a eliminar.
 * @returns {Promise<IncomeEntry>} Datos del ingreso eliminado.
 * @throws {Error} Si el ingreso no existe.
 */
export const deleteIncomeEntry = async (
  repo: IIncomeEntryRepository,
  id: string,
): Promise<IncomeEntry> => {
  const existing = await repo.findById(id);
  if (!existing) throw new Error(`Ingreso con id ${id} no encontrado.`);
  return repo.delete(id);
};
