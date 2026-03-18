import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import { ExpenseEntry } from "@/backend/domain/budgetManager/ExpenseEntry";

export class PrismaExpenseEntryRepository implements IExpenseEntryRepository {
  async findByBudgetMonth(budgetMonthId: string): Promise<ExpenseEntry[]> {
    const rows = await prisma.expenseEntry.findMany({ where: { budgetMonthId } });
    return rows.map(r => ({ ...r, amount: r.amount.toNumber() }));
  }

  async createMany(entries: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">[]): Promise<void> {
    await prisma.expenseEntry.createMany({ data: entries });
  }
}
