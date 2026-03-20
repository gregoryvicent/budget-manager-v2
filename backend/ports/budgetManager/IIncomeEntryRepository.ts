import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export interface IIncomeEntryRepository {
  findByBudgetMonth(budgetMonthId: string): Promise<IncomeEntry[]>;
  findById(id: string): Promise<IncomeEntry | null>;
  createMany(entries: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">[]): Promise<void>;
  create(data: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">): Promise<IncomeEntry>;
  update(id: string, data: Partial<Pick<IncomeEntry, "name" | "amount">>): Promise<IncomeEntry>;
  delete(id: string): Promise<IncomeEntry>;
}
