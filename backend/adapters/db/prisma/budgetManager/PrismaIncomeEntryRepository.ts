import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export class PrismaIncomeEntryRepository implements IIncomeEntryRepository {
  async findByBudgetMonth(budgetMonthId: string): Promise<IncomeEntry[]> {
    const rows = await prisma.incomeEntry.findMany({ where: { budgetMonthId } });
    return rows.map(r => ({ ...r, amount: r.amount.toNumber() }));
  }

  async createMany(entries: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">[]): Promise<void> {
    await prisma.incomeEntry.createMany({ data: entries });
  }
}
