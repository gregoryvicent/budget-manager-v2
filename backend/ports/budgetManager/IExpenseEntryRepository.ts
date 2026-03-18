import { ExpenseEntry } from "@/backend/domain/budgetManager/ExpenseEntry";

export interface IExpenseEntryRepository {
  findByBudgetMonth(budgetMonthId: string): Promise<ExpenseEntry[]>;
  createMany(entries: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">[]): Promise<void>;
}
