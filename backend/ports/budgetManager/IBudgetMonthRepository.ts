import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

export interface IBudgetMonthRepository {
  findByUserAndMonth(userId: string, year: number, month: number): Promise<BudgetMonth | null>;
  create(data: Pick<BudgetMonth, "userId" | "year" | "month">): Promise<BudgetMonth>;
}
