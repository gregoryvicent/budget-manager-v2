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

  /**
   * Finds a user by email including the passwordHash field.
   *
   * @param {string} email - The email address to search for
   * @returns {Promise<(User & { passwordHash: string | null }) | null>} User with passwordHash or null
   */
  async findByEmailWithPassword(email: string): Promise<(User & { passwordHash: string | null }) | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: Pick<User, "email" | "name">): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Creates a new user with a hashed password.
   *
   * @param {object} data - The user data including email, name, and passwordHash
   * @returns {Promise<User>} The created user
   */
  async createWithPassword(data: { email: string; name: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Partial<Pick<User, "email" | "name">>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}
