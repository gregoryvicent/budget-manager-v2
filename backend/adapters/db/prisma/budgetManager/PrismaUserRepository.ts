import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

export class PrismaUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Pick<User, "email" | "name">): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<Pick<User, "email" | "name">>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
