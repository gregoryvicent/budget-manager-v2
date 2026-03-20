import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export interface UpdateIncomeEntryInput {
  name?: string;
  amount?: number;
}

/**
 * Actualiza una entrada de ingreso existente.
 *
 * @param {IIncomeEntryRepository} repo - Repositorio de ingresos.
 * @param {string} id - ID del ingreso a actualizar.
 * @param {UpdateIncomeEntryInput} input - Campos a actualizar.
 * @returns {Promise<IncomeEntry>} Ingreso actualizado.
 * @throws {Error} Si el ingreso no existe.
 */
export const updateIncomeEntry = async (
  repo: IIncomeEntryRepository,
  id: string,
  input: UpdateIncomeEntryInput,
): Promise<IncomeEntry> => {
  const existing = await repo.findById(id);
  if (!existing) throw new Error(`Ingreso con id ${id} no encontrado.`);
  return repo.update(id, input);
};
