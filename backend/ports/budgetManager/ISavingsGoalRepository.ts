import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

export interface ISavingsGoalRepository {
  findByUser(userId: string): Promise<SavingsGoal[]>;
  findById(id: string): Promise<SavingsGoal | null>;
  findByUserAndType(userId: string, type: GoalType): Promise<SavingsGoal | null>;
  create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">): Promise<SavingsGoal>;
  update(id: string, data: Partial<Pick<SavingsGoal, "title" | "goalAmount">>): Promise<SavingsGoal>;
}
