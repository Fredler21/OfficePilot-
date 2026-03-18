import { getDb } from '@/lib/db';

export type PlanTier = 'free' | 'pro' | 'business';

export interface UserPlan {
  userId: string;
  tier: PlanTier;
  messagesUsedToday: number;
  dailyLimit: number;
  canUsePremium: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, { dailyMessages: number; maxPdfs: number; label: string }> = {
  free:     { dailyMessages: 20,        maxPdfs: 1,         label: 'Free' },
  pro:      { dailyMessages: 200,       maxPdfs: 10,        label: 'Pro' },
  business: { dailyMessages: Infinity,  maxPdfs: Infinity,  label: 'Business' },
};

export function getUserPlan(userId: string): UserPlan {
  const db = getDb();

  // Ensure user exists
  db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(userId);

  // Get plan from user_preferences
  const planRow = db.prepare(
    `SELECT value FROM user_preferences WHERE user_id = ? AND key = 'plan_tier'`
  ).get(userId) as { value: string } | undefined;

  const tier = (planRow?.value ?? 'free') as PlanTier;
  const limits = PLAN_LIMITS[tier] ?? PLAN_LIMITS.free;

  // Count today's messages for this user
  const today = new Date().toISOString().slice(0, 10);
  const countRow = db.prepare(`
    SELECT COUNT(*) as cnt FROM messages m
    JOIN sessions s ON m.session_id = s.id
    WHERE s.user_id = ? AND m.role = 'user' AND date(m.created_at) = ?
  `).get(userId, today) as { cnt: number };

  return {
    userId,
    tier,
    messagesUsedToday: countRow.cnt,
    dailyLimit: limits.dailyMessages,
    canUsePremium: tier !== 'free',
  };
}

export function setUserPlan(userId: string, tier: PlanTier) {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(userId);
  db.prepare(`
    INSERT INTO user_preferences (id, user_id, key, value)
    VALUES (lower(hex(randomblob(16))), ?, 'plan_tier', ?)
    ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value
  `).run(userId, tier);
}

export function isWithinDailyLimit(plan: UserPlan): boolean {
  if (plan.dailyLimit === Infinity) return true;
  return plan.messagesUsedToday < plan.dailyLimit;
}
