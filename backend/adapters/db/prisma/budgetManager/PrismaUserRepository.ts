import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Pick<User, "email" | "name">): Promise<User> {
    return prisma.user.create({ data });
  }
}
