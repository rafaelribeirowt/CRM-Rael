import { eq } from "drizzle-orm";
import { User } from "../../../Domain/Auth/Models/User";
import { IUserRepository } from "../../../Application/Contracts/Repositories/IUserRepository";
import { db } from "../Drizzle/client";
import { users, UserRow } from "../Schemas/users";

function toDomain(row: UserRow): User {
  return new User({
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class DrizzleUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    await db
      .insert(users)
      .values({
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          updatedAt: new Date(),
        },
      });
  }

  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.email, email));
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await db.select().from(users);
    return rows.map(toDomain);
  }

  async findAllByTenantId(tenantId: string): Promise<User[]> {
    const rows = await db.select().from(users).where(eq(users.tenantId, tenantId));
    return rows.map(toDomain);
  }

  async countByTenantId(tenantId: string): Promise<number> {
    const rows = await db.select().from(users).where(eq(users.tenantId, tenantId));
    return rows.length;
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}
