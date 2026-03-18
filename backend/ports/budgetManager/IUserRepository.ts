import { User } from "@/backend/domain/budgetManager/User";

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Pick<User, "email" | "name">): Promise<User>;
  update(id: string, data: Partial<Pick<User, "email" | "name">>): Promise<User>;
  delete(id: string): Promise<User>;
}
