import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

export interface IBudgetMonthRepository {
  findAll(): Promise<BudgetMonth[]>;
  findByUser(userId: string): Promise<BudgetMonth[]>;
  findById(id: string): Promise<BudgetMonth | null>;
  findByUserAndMonth(userId: string, year: number, month: number): Promise<BudgetMonth | null>;
  create(data: Pick<BudgetMonth, "userId" | "year" | "month">): Promise<BudgetMonth>;
  delete(id: string): Promise<BudgetMonth>;
}
