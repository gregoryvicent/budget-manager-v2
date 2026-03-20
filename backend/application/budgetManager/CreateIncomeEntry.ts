import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export interface CreateIncomeEntryInput {
  budgetMonthId: string;
  name: string;
  amount: number;
}

/**
 * Crea una nueva entrada de ingreso en un presupuesto mensual.
 *
 * @param {IIncomeEntryRepository} repo - Repositorio de ingresos.
 * @param {CreateIncomeEntryInput} input - Datos del ingreso.
 * @returns {Promise<IncomeEntry>} Ingreso creado.
 */
export const createIncomeEntry = async (
  repo: IIncomeEntryRepository,
  input: CreateIncomeEntryInput,
): Promise<IncomeEntry> => {
  return repo.create(input);
};
