import type { User, Prisma } from "../../generated/prisma/index.js";
type CreateUserData = Prisma.UserCreateInput;
type UpdateUserData = Prisma.UserUpdateInput;
type UserWithCompany = Prisma.UserGetPayload<{
    include: {
        Company: true;
    };
}>;
export declare class UserModel {
    static findAll(): Promise<User[]>;
    static findAllWithCompany(): Promise<UserWithCompany[]>;
    static findById(id: string): Promise<User | null>;
    static findByIdWithRelations(id: string): Promise<UserWithCompany | null>;
    static findByEmail(email: string): Promise<User | null>;
    static findByUsername(username: string): Promise<User | null>;
    static create(data: CreateUserData): Promise<User>;
    static update(id: string, data: UpdateUserData): Promise<User>;
    static delete(id: string): Promise<User>;
}
export default UserModel;
//# sourceMappingURL=User.d.ts.map