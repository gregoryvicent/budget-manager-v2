import { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

export interface ISavingsGoalRepository {
  findByUserAndType(userId: string, type: GoalType): Promise<SavingsGoal | null>;
  create(data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">): Promise<SavingsGoal>;
}
