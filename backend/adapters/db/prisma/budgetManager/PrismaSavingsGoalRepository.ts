import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

/**
 * Prisma implementation of the savings goal repository.
 * Supports multiple goals per user per type with soft-archive.
 */
export class PrismaSavingsGoalRepository implements ISavingsGoalRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toModel(row: any): SavingsGoal {
    return {
      ...row,
      goalAmount: row.goalAmount.toNumber(),
      totalContributed: row.totalContributed.toNumber(),
      startYear: row.startYear,
      startMonth: row.startMonth,
      archivedYear: row.archivedYear ?? null,
      archivedMonth: row.archivedMonth ?? null,
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

  /**
   * Returns goals that are active for the given year/month.
   * A goal is active if:
   * - Its start date is on or before the given month
   * - It has no archive date, or its archive date is after the given month
   */
  async findActiveByUserAndType(userId: string, type: GoalType, year: number, month: number): Promise<SavingsGoal[]> {
    const rows = await prisma.savingsGoal.findMany({
      where: {
        userId,
        type,
        AND: [
          // Started on or before this month
          {
            OR: [
              { startYear: { lt: year } },
              { startYear: year, startMonth: { lte: month } },
            ],
          },
          // Not archived yet, or archived after this month
          {
            OR: [
              { archivedYear: null },
              { archivedYear: { gt: year } },
              { archivedYear: year, archivedMonth: { gt: month } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(r => this.toModel(r));
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    const row = await prisma.savingsGoal.findUnique({ where: { id } });
    if (!row) return null;
    return this.toModel(row);
  }

  async create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount" | "startYear" | "startMonth">): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.create({ data });
    return this.toModel(row);
  }

  async update(id: string, data: Partial<Pick<SavingsGoal, "title" | "goalAmount">>): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.update({ where: { id }, data });
    return this.toModel(row);
  }

  async archive(id: string, year: number, month: number): Promise<SavingsGoal> {
    const row = await prisma.savingsGoal.update({
      where: { id },
      data: { archivedYear: year, archivedMonth: month },
    });
    return this.toModel(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.savingsGoal.delete({ where: { id } });
  }

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
