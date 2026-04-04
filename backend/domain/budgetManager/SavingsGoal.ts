export type GoalType = "SAVINGS" | "INVESTMENT";

export interface SavingsGoal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  goalAmount: number;
  totalContributed: number;
  startYear: number;
  startMonth: number;
  archivedYear: number | null;
  archivedMonth: number | null;
  createdAt: Date;
  updatedAt: Date;
}
