import { and, desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { campaigns, contentItems, creditLedger, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && (process.env.DATABASE_URL || ENV.databaseUrl)) {
    try {
      _db = drizzle(process.env.DATABASE_URL || ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const normalized = user[field] ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (user.plan !== undefined) { values.plan = user.plan; updateSet.plan = user.plan; }
  if (user.creditsBalance !== undefined) { values.creditsBalance = user.creditsBalance; updateSet.creditsBalance = user.creditsBalance; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function listCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.updatedAt));
}

export async function getCampaign(userId: number, id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId))).limit(1);
  return result[0];
}

export async function countCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function countContent(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(contentItems).where(eq(contentItems.userId, userId));
  return Number(result[0]?.count ?? 0);
}

export async function listContent(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentItems).where(eq(contentItems.userId, userId)).orderBy(desc(contentItems.createdAt));
}

export async function listCredits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creditLedger).where(eq(creditLedger.userId, userId)).orderBy(desc(creditLedger.createdAt)).limit(30);
}

export async function countCompletedCreditsSince(userId: number, since: Date) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sql<number>`coalesce(sum(abs(${creditLedger.amount})), 0)` })
    .from(creditLedger)
    .where(and(eq(creditLedger.userId, userId), eq(creditLedger.status, "completed"), gte(creditLedger.createdAt, since)));
  return Number(result[0]?.total ?? 0);
}

export async function reserveCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.update(users).set({ creditsBalance: sql`${users.creditsBalance} - ${amount}` }).where(and(eq(users.id, userId), sql`${users.creditsBalance} >= ${amount}`));
  if (!result[0] || result[0].affectedRows !== 1) return null;
  const user = await getUserById(userId);
  return user?.creditsBalance ?? null;
}

export async function refundCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ creditsBalance: sql`${users.creditsBalance} + ${amount}` }).where(eq(users.id, userId));
}

export async function addCreditEntry(values: typeof creditLedger.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.insert(creditLedger).values(values);
}

export async function updateCreditEntry(userId: number, requestId: string, values: Partial<typeof creditLedger.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(creditLedger).set(values).where(and(eq(creditLedger.userId, userId), eq(creditLedger.requestId, requestId)));
}

export async function getCreditRequest(userId: number, requestId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creditLedger).where(and(eq(creditLedger.userId, userId), eq(creditLedger.requestId, requestId))).limit(1);
  return result[0];
}

export async function finalizeCampaignGeneration(userId: number, requestId: string, values: typeof campaigns.$inferInsert, result: unknown, balanceAfter: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const inserted = await tx.insert(campaigns).values(values);
    const campaignId = Number(inserted[0].insertId);
    const payload = { campaignId, result, balanceAfter };
    await tx.update(creditLedger).set({ status: "completed", resultData: JSON.stringify(payload) }).where(and(eq(creditLedger.userId, userId), eq(creditLedger.requestId, requestId), eq(creditLedger.status, "reserved")));
    return payload;
  });
}

export async function finalizeContentGeneration(userId: number, requestId: string, values: typeof contentItems.$inferInsert, result: unknown, balanceAfter: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async tx => {
    const inserted = await tx.insert(contentItems).values(values);
    const id = Number(inserted[0].insertId);
    const payload = { id, ...(result as Record<string, unknown>), balanceAfter };
    await tx.update(creditLedger).set({ status: "completed", resultData: JSON.stringify(payload) }).where(and(eq(creditLedger.userId, userId), eq(creditLedger.requestId, requestId), eq(creditLedger.status, "reserved")));
    return payload;
  });
}

export async function insertCampaign(values: typeof campaigns.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(campaigns).values(values);
  return Number(result[0].insertId);
}

export async function updateCampaign(userId: number, id: number, values: Partial<typeof campaigns.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(campaigns).set(values).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
  return getCampaign(userId, id);
}

export async function deleteCampaign(userId: number, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(campaigns).where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
}

export async function insertContent(values: typeof contentItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(contentItems).values(values);
  return Number(result[0].insertId);
}
