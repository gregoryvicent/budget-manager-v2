import { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";

export interface IIncomeEntryRepository {
  findByBudgetMonth(budgetMonthId: string): Promise<IncomeEntry[]>;
  createMany(entries: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">[]): Promise<void>;
}
