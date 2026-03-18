import { User } from "@/backend/domain/budgetManager/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: Pick<User, "email" | "name">): Promise<User>;
}
