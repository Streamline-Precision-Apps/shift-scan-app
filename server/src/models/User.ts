import prisma from "../lib/prisma.js";
import type { User, Prisma } from "../../generated/prisma/index.js";

// Use Prisma generated types
type CreateUserData = Prisma.UserCreateInput;
type UpdateUserData = Prisma.UserUpdateInput;

// You can also create more specific types if needed
type UserWithCompany = Prisma.UserGetPayload<{
  include: { Company: true }
}>;

type UserCreateManyData = Prisma.UserCreateManyInput;

export class UserModel {
  // Get all users
  static async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { startDate: "desc" },
    });
  }

  // Get all users with company info
  static async findAllWithCompany(): Promise<UserWithCompany[]> {
    return await prisma.user.findMany({
      include: { Company: true },
      orderBy: { startDate: "desc" },
    });
  }

  // Get user by ID
  static async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // Get user by ID with relations
  static async findByIdWithRelations(id: string): Promise<UserWithCompany | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: { Company: true },
    });
  }

  // Get user by email
  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Get user by username
  static async findByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  // Create a new user
  static async create(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  // Update user
  static async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // Delete user
  static async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }
}

export default UserModel;
