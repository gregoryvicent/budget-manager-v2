import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

export class PrismaBudgetMonthRepository implements IBudgetMonthRepository {
  async findByUserAndMonth(userId: string, year: number, month: number): Promise<BudgetMonth | null> {
    return prisma.budgetMonth.findUnique({
      where: { uq_budget_month_per_user: { userId, year, month } },
    });
  }

  async create(data: Pick<BudgetMonth, "userId" | "year" | "month">): Promise<BudgetMonth> {
    return prisma.budgetMonth.create({ data });
  }
}
