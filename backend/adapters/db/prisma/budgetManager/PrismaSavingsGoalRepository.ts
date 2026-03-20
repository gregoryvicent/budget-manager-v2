import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  async findByUser(userId: string): Promise<SavingsGoal[]> {
    const rows = await prisma.savingsGoal.findMany({ where: { userId } });
    return rows.map(r => ({ ...r, goalAmount: r.goalAmount.toNumber() }));
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const row = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!row) return null;
    return { ...row, goalAmount: row.goalAmount.toNumber() };
  }

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

  async update(id: string, data: Partial<Pick<SavingsGoal, "title" | "goalAmount">>): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.update({ where: { id }, data });
    return { ...row, goalAmount: row.goalAmount.toNumber() };
  }
}
