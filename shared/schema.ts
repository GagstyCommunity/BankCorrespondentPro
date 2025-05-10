import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("csp"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CSP model
export const csps = pgTable("csps", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull(),
  panNumber: text("pan_number"),
  education: text("education"),
  photo: text("photo_url"),
  location: jsonb("location").notNull(), // GeoJSON Point
  score: integer("score").default(100),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  workingCapital: real("working_capital").default(0),
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  cspId: integer("csp_id").notNull().references(() => csps.id),
  type: text("type").notNull(), // deposit, withdrawal, transfer
  amount: real("amount").notNull(),
  status: text("status").notNull().default("completed"),
  customerPhone: text("customer_phone"),
  customerName: text("customer_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  location: jsonb("location"), // GeoJSON Point for location verification
  riskScore: integer("risk_score").default(0),
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),
});

// Audit model
export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  cspId: integer("csp_id").notNull().references(() => csps.id),
  auditorId: integer("auditor_id").notNull().references(() => users.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("scheduled"), // scheduled, in-progress, completed, failed
  notes: text("notes"),
  photos: jsonb("photos"), // Array of photo URLs
  videos: jsonb("videos"), // Array of video URLs
  location: jsonb("location"), // GeoJSON Point
  rating: integer("rating"), // 1-5 star rating
  issues: jsonb("issues"), // Array of issues found
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alerts model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  cspId: integer("csp_id").references(() => csps.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  type: text("type").notNull(), // fraud, compliance, system
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new, acknowledged, resolved, false_positive
  assignedTo: integer("assigned_to").references(() => users.id),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Registration applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  aadhaarNumber: text("aadhaar_number").notNull(),
  address: text("address").notNull(),
  education: text("education").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  notes: text("notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User activity logs
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // sms, whatsapp, email, system
  status: text("status").notNull().default("unread"), // unread, read
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting CSPs
export const insertCspSchema = createInsertSchema(csps).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting transactions
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting audits
export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting alerts
export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Schema for inserting applications
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

// Schema for inserting activity logs
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CSP = typeof csps.$inferSelect;
export type InsertCSP = z.infer<typeof insertCspSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
