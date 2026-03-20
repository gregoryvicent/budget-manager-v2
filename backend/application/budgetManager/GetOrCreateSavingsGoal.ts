import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

const DEFAULT_TITLES: Record<GoalType, string> = {
  SAVINGS: "Fondo de emergencia",
  INVESTMENT: "Inversiones",
};

const DEFAULT_GOAL_AMOUNTS: Record<GoalType, number> = {
  SAVINGS: 2000,
  INVESTMENT: 5000,
};

/**
 * Retorna la meta de ahorro para un usuario y tipo; la crea con valores por defecto si no existe.
 *
 * @param {ISavingsGoalRepository} repo - Repositorio de metas.
 * @param {string} userId - ID del usuario.
 * @param {GoalType} type - Tipo de meta (SAVINGS o INVESTMENT).
 * @returns {Promise<SavingsGoal>} Meta encontrada o recién creada.
 */
export const getOrCreateSavingsGoal = async (
  repo: ISavingsGoalRepository,
  userId: string,
  type: GoalType,
): Promise<SavingsGoal> => {
  const existing = await repo.findByUserAndType(userId, type);
  if (existing) return existing;
  return repo.create({
    userId,
    type,
    title: DEFAULT_TITLES[type],
    goalAmount: DEFAULT_GOAL_AMOUNTS[type],
  });
};
