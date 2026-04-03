import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

/**
 * Prisma implementation of the savings goal repository.
 * Supports multiple goals per user per type.
 */
export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  private toModel(row: { goalAmount: { toNumber(): number }; totalContributed: { toNumber(): number }; [k: string]: unknown }): SavingsGoal {
    return {
      ...(row as unknown as SavingsGoal),
      goalAmount: row.goalAmount.toNumber(),
      totalContributed: row.totalContributed.toNumber(),
    };
  }

  async findByUser(userId: string): Promise<SavingsGoal[]> {
    const rows = await prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
    return rows.map(r => this.toModel(r));
  }

  async findByUserAndType(userId: string, type: GoalType): Promise<SavingsGoal[]> {
    const rows = await prisma.savingsGoal.findMany({
      where: { userId, type },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(r => this.toModel(r));
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const row = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!row) return null;
    return this.toModel(row);
  }

  async create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.create({ data });
    return this.toModel(row);
  }

  async update(id: string, data: Partial<Pick<SavingsGoal, "title" | "goalAmount">>): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.update({ where: { id }, data });
    return this.toModel(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.savingsGoal.delete({ where: { id } });
  }

  /**
   * Recalculates totalContributed by summing all GoalMonthSetting.amountContributed
   * for this goal and persisting the result.
   */
  async recalcTotalContributed(id: string): Promise<SavingsGoal> {
    const agg = await prisma.goalMonthSetting.aggregate({
      where: { savingsGoalId: id, amountContributed: { not: null } },
      _sum: { amountContributed: true },
    });
    const total = agg._sum.amountContributed?.toNumber() ?? 0;
    const row = await prisma.savingsGoal.update({
      where: { id },
      data: { totalContributed: total },
    });
    return this.toModel(row);
  }

  /**
   * Sums amountContributed for a goal up to and including the given year/month.
   * Joins through BudgetMonth to filter by date.
   */
  async sumContributedUpTo(id: string, year: number, month: number): Promise<number> {
    const settings = await prisma.goalMonthSetting.findMany({
      where: {
        savingsGoalId: id,
        amountContributed: { not: null },
        budgetMonth: {
          OR: [
            { year: { lt: year } },
            { year, month: { lte: month } },
          ],
        },
      },
      select: { amountContributed: true },
    });
    return settings.reduce((sum, s) => sum + (s.amountContributed?.toNumber() ?? 0), 0);
  }
}
