import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for session management)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isLocked: boolean("is_locked").default(false),
  failedAttempts: integer("failed_attempts").default(0),
  lastFailedAttempt: timestamp("last_failed_attempt"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP storage table
export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security logs table
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: varchar("email"),
  action: varchar("action").notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  description: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type OTP = typeof otps.$inferSelect;
export type SecurityLog = typeof securityLogs.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type OTPVerification = z.infer<typeof otpVerificationSchema>;
