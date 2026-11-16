import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "starter", "pro", "seasonal"]).default("free").notNull(),
  creditsBalance: int("creditsBalance").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productName: varchar("productName", { length: 180 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  channel: varchar("channel", { length: 40 }).notNull(),
  objective: varchar("objective", { length: 80 }).notNull(),
  tone: varchar("tone", { length: 50 }).notNull(),
  occasion: varchar("occasion", { length: 80 }).notNull(),
  status: mysqlEnum("status", ["draft", "generated", "archived"]).default("generated").notNull(),
  isFavorite: int("isFavorite").default(0).notNull(),
  inputData: text("inputData").notNull(),
  resultData: text("resultData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userCreatedIdx: index("campaigns_user_created_idx").on(table.userId, table.createdAt),
  userStatusIdx: index("campaigns_user_status_idx").on(table.userId, table.status),
}));

export const contentItems = mysqlTable("contentItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 50 }).notNull(),
  channel: varchar("channel", { length: 40 }).notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  productName: varchar("productName", { length: 180 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  body: text("body").notNull(),
  isFavorite: int("isFavorite").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userCreatedIdx: index("content_user_created_idx").on(table.userId, table.createdAt),
}));

export const creditLedger = mysqlTable("creditLedger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  operation: varchar("operation", { length: 80 }).notNull(),
  requestId: varchar("requestId", { length: 100 }),
  amount: int("amount").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  status: mysqlEnum("status", ["reserved", "completed", "refunded", "failed"]).default("completed").notNull(),
  resultData: text("resultData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userCreatedIdx: index("credits_user_created_idx").on(table.userId, table.createdAt),
  requestIdx: uniqueIndex("credits_request_unique_idx").on(table.userId, table.requestId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;
export type CreditLedger = typeof creditLedger.$inferSelect;
export type InsertCreditLedger = typeof creditLedger.$inferInsert;
