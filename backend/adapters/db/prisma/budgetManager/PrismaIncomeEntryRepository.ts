import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export class PrismaIncomeEntryRepository implements IIncomeEntryRepository {
  async findByBudgetMonth(budgetMonthId: string): Promise<IncomeEntry[]> {
    const rows = await prisma.incomeEntry.findMany({ where: { budgetMonthId } });
    return rows.map(r => ({ ...r, amount: r.amount.toNumber() }));
  }

  async findById(id: string): Promise<IncomeEntry | null> {
    const row = await prisma.incomeEntry.findUnique({ where: { id } });
    if (!row) return null;
    return { ...row, amount: row.amount.toNumber() };
  }

  async createMany(entries: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">[]): Promise<void> {
    await prisma.incomeEntry.createMany({ data: entries });
  }

  async create(data: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">): Promise<IncomeEntry> {
    const row = await prisma.incomeEntry.create({ data });
    return { ...row, amount: row.amount.toNumber() };
  }

  async update(id: string, data: Partial<Pick<IncomeEntry, "name" | "amount">>): Promise<IncomeEntry> {
    const row = await prisma.incomeEntry.update({ where: { id }, data });
    return { ...row, amount: row.amount.toNumber() };
  }

  async delete(id: string): Promise<IncomeEntry> {
    const row = await prisma.incomeEntry.delete({ where: { id } });
    return { ...row, amount: row.amount.toNumber() };
  }
}
