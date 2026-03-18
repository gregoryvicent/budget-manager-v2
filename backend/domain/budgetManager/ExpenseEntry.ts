export type ExpenseType = "FIXED" | "VARIABLE";

export interface ExpenseEntry {
  id: string;
  budgetMonthId: string;
  name: string;
  amount: number;
  type: ExpenseType;
  createdAt: Date;
  updatedAt: Date;
}
