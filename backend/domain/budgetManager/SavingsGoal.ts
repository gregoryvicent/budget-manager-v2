export type GoalType = "SAVINGS" | "INVESTMENT";

export interface SavingsGoal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  goalAmount: number;
  createdAt: Date;
}
