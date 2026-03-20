import { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";

export interface IExpenseEntryRepository {
  findByBudgetMonth(budgetMonthId: string, type?: ExpenseType): Promise<ExpenseEntry[]>;
  findById(id: string): Promise<ExpenseEntry | null>;
  createMany(entries: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">[]): Promise<void>;
  create(data: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">): Promise<ExpenseEntry>;
  update(id: string, data: Partial<Pick<ExpenseEntry, "name" | "amount">>): Promise<ExpenseEntry>;
  delete(id: string): Promise<ExpenseEntry>;
}
