import {
  users,
  tasks,
  otps,
  securityLogs,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type OTP,
  type SecurityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, lt, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateFailedAttempts(email: string, attempts: number): Promise<void>;
  lockUser(email: string): Promise<void>;
  unlockUser(email: string): Promise<void>;

  // OTP operations
  createOTP(email: string, code: string, expiresAt: Date): Promise<OTP>;
  getValidOTP(email: string, code: string): Promise<OTP | undefined>;
  incrementOTPAttempts(id: number): Promise<void>;
  markOTPAsUsed(id: number): Promise<void>;
  cleanupExpiredOTPs(): Promise<void>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number, userId: number): Promise<boolean>;
  getTaskAnalytics(userId: number): Promise<{ completed: number; pending: number; total: number }>;

  // Security operations
  logSecurityEvent(log: Omit<SecurityLog, 'id' | 'createdAt'>): Promise<void>;
  getSecurityLogs(userId: number, limit?: number): Promise<SecurityLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateFailedAttempts(email: string, attempts: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedAttempts: attempts,
        lastFailedAttempt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async lockUser(email: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isLocked: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async unlockUser(email: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        isLocked: false,
        failedAttempts: 0,
        lastFailedAttempt: null,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  // OTP operations
  async createOTP(email: string, code: string, expiresAt: Date): Promise<OTP> {
    const [otp] = await db
      .insert(otps)
      .values({ email, code, expiresAt })
      .returning();
    return otp;
  }

  async getValidOTP(email: string, code: string): Promise<OTP | undefined> {
    const [otp] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email),
          eq(otps.code, code),
          eq(otps.isUsed, false),
          gt(otps.expiresAt, new Date())
        )
      );
    return otp;
  }

  async incrementOTPAttempts(id: number): Promise<void> {
    const [otp] = await db.select().from(otps).where(eq(otps.id, id));
    if (otp) {
      await db
        .update(otps)
        .set({ attempts: (otp.attempts || 0) + 1 })
        .where(eq(otps.id, id));
    }
  }

  async markOTPAsUsed(id: number): Promise<void> {
    await db
      .update(otps)
      .set({ isUsed: true })
      .where(eq(otps.id, id));
  }

  async cleanupExpiredOTPs(): Promise<void> {
    await db.delete(otps).where(lt(otps.expiresAt, new Date()));
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask & { userId: number }): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getTaskAnalytics(userId: number): Promise<{ completed: number; pending: number; total: number }> {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const completed = userTasks.filter(task => task.isCompleted).length;
    const pending = userTasks.filter(task => !task.isCompleted).length;
    const total = userTasks.length;

    return { completed, pending, total };
  }

  // Security operations
  async logSecurityEvent(log: Omit<SecurityLog, 'id' | 'createdAt'>): Promise<void> {
    await db.insert(securityLogs).values(log);
  }

  async getSecurityLogs(userId: number, limit: number = 50): Promise<SecurityLog[]> {
    return await db
      .select()
      .from(securityLogs)
      .where(eq(securityLogs.userId, userId))
      .orderBy(desc(securityLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
