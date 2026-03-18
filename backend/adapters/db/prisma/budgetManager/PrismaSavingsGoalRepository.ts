import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  async findByUserAndType(userId: string, type: GoalType): Promise<SavingsGoal | null> {
    const row = await prisma.savingsGoal.findUnique({
      where: { uq_goal_type_per_user: { userId, type } },
    });
    if (!row) return null;
    return { ...row, goalAmount: row.goalAmount.toNumber() };
  }

  async create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.create({ data });
    return { ...row, goalAmount: row.goalAmount.toNumber() };
  }
}
