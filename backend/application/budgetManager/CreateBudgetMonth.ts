import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

export interface CreateBudgetMonthInput {
  userId: string;
  year: number;
  month: number;
}

/**
 * Crea un nuevo presupuesto mensual para un usuario.
 *
 * @param {IBudgetMonthRepository} repo - Repositorio de presupuestos.
 * @param {CreateBudgetMonthInput} input - Datos del presupuesto a crear.
 * @returns {Promise<BudgetMonth>} Presupuesto creado.
 * @throws {Error} Si ya existe un presupuesto para ese usuario, año y mes.
 */
export const createBudgetMonth = async (
  repo: IBudgetMonthRepository,
  input: CreateBudgetMonthInput,
): Promise<BudgetMonth> => {
  const existing = await repo.findByUserAndMonth(input.userId, input.year, input.month);
  if (existing) {
    throw new Error(
      `Ya existe un presupuesto para el mes ${input.month}/${input.year} de este usuario.`,
    );
  }
  return repo.create(input);
};
