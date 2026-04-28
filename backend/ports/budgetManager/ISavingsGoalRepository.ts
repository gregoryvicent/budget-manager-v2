import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

export interface ISavingsGoalRepository {
  findByUser(userId: string): Promise<SavingsGoal[]>;
  findByUserAndType(userId: string, type: GoalType): Promise<SavingsGoal[]>;
  findAssignedByUserAndType(userId: string, type: GoalType, budgetMonthId: string): Promise<SavingsGoal[]>;
  findUnassignedByUserAndType(userId: string, type: GoalType, budgetMonthId: string): Promise<SavingsGoal[]>;
  findById(id: string): Promise<SavingsGoal | null>;
  create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">): Promise<SavingsGoal>;
  update(id: string, data: Partial<Pick<SavingsGoal, "title" | "goalAmount">>): Promise<SavingsGoal>;
  delete(id: string): Promise<void>;
  recalcTotalContributed(id: string): Promise<SavingsGoal>;
  sumContributedUpTo(id: string, year: number, month: number): Promise<number>;
}
