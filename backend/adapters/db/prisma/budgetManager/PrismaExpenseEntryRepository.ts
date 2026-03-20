import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

export class PrismaExpenseEntryRepository implements IExpenseEntryRepository {
  async findByBudgetMonth(budgetMonthId: string, type?: ExpenseType): Promise<ExpenseEntry[]> {
    const rows = await prisma.expenseEntry.findMany({
      where: { budgetMonthId, ...(type ? { type } : {}) },
    });
    return rows.map(r => ({ ...r, amount: r.amount.toNumber() }));
  }

  async findById(id: string): Promise<ExpenseEntry | null> {
    const row = await prisma.expenseEntry.findUnique({ where: { id } });
    if (!row) return null;
    return { ...row, amount: row.amount.toNumber() };
  }

  async createMany(entries: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">[]): Promise<void> {
    await prisma.expenseEntry.createMany({ data: entries });
  }

  async create(data: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">): Promise<ExpenseEntry> {
    const row = await prisma.expenseEntry.create({ data });
    return { ...row, amount: row.amount.toNumber() };
  }

  async update(id: string, data: Partial<Pick<ExpenseEntry, "name" | "amount">>): Promise<ExpenseEntry> {
    const row = await prisma.expenseEntry.update({ where: { id }, data });
    return { ...row, amount: row.amount.toNumber() };
  }

  async delete(id: string): Promise<ExpenseEntry> {
    const row = await prisma.expenseEntry.delete({ where: { id } });
    return { ...row, amount: row.amount.toNumber() };
  }
}
