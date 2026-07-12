import { Pool, PoolClient, QueryResult } from 'pg';

// TypeScript interfaces for type safety
export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  tier?: string;
  experience_level?: string;
  goals?: string;
  assessment_result?: any;
  stripe_customer_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tier {
  name: string;
  price_cents: number;
}

export interface Membership {
  id: number;
  user_id: number;
  tier: string;
  status: string;
  price_cents: number;
  billing_cycle: string;
  stripe_subscription_id?: string;
  renewal_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: number;
  instructor_id: number;
  title: string;
  description?: string;
  scheduled_time?: Date;
  duration_minutes?: number;
  student_ids: number[];
  status: string;
  recording_url?: string;
  location?: string;
  outcome_notes?: string;
  type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: number;
  membership_id: number;
  user_id: number;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method?: string;
  external_transaction_id?: string;
  transaction_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PremiumFeature {
  id: number;
  user_id: number;
  feature_name: string;
  is_enabled: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Analytic {
  id: number;
  user_id: number;
  metric_name: string;
  metric_value: number;
  recorded_date: Date;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  notification_type: string;
  title?: string;
  message?: string;
  status: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Content {
  id: number;
  creator_id: number;
  title: string;
  description?: string;
  content_type: string;
  category?: string;
  difficulty_level?: string;
  duration_minutes?: number;
  status: string;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Progress {
  id: number;
  user_id: number;
  content_id: number;
  status: string;
  completion_percentage?: number;
  last_accessed_at?: Date;
  completed_at?: Date;
  notes?: string;
  score?: number;
  created_at: Date;
  updated_at: Date;
}

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a query against the database
 */
export async function query<T extends Record<string, any> = Record<string, any>>(text: string, params?: any[]): Promise<QueryResult<T>> {
  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error, { text, params });
    throw error;
  }
}

/**
 * Execute a transaction with multiple queries
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get user by email
 */
export async function getUser(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, password_hash, first_name, last_name, phone, tier, experience_level, goals, assessment_result, is_active, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<User | null> {
  const result = await query<User>(
    `SELECT id, email, password_hash, first_name, last_name, phone, tier, experience_level, goals, assessment_result, is_active, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  passwordHash: string,
  firstName?: string,
  lastName?: string,
  phone?: string,
  experienceLevel?: string,
  goals?: string
): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, experience_level, goals, tier)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, email, password_hash, first_name, last_name, phone, tier, experience_level, goals, assessment_result, is_active, created_at, updated_at`,
    [email, passwordHash, firstName, lastName, phone, experienceLevel, goals, 'free']
  );
  return result.rows[0];
}

/**
 * Get membership tiers (tier pricing lookup)
 * Returns an object mapping tier names to their price in cents
 */
export function getMembershipTiers(): Tier[] {
  return [
    { name: 'free', price_cents: 0 },
    { name: 'pro', price_cents: 9900 }, // $99/month
    { name: 'enterprise', price_cents: 29900 }, // $299/month
  ];
}

/**
 * Get user's membership
 */
export async function getUserMembership(userId: number): Promise<Membership | null> {
  const result = await query<Membership>(
    `SELECT id, user_id, tier, status, price_cents, billing_cycle, renewal_date, created_at, updated_at
     FROM memberships WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Create a membership for a user
 */
export async function createMembership(
  userId: number,
  tier: 'free' | 'pro' | 'enterprise',
  priceCents: number,
  billingCycle: 'monthly' | 'annual' = 'monthly',
  renewalDate?: Date
): Promise<Membership> {
  // Input validation for tier parameter
  const validTiers = ['free', 'pro', 'enterprise'];
  if (!validTiers.includes(tier)) {
    throw new Error(`Invalid tier: ${tier}. Must be one of: ${validTiers.join(', ')}`);
  }

  const validBillingCycles = ['monthly', 'annual'];
  if (!validBillingCycles.includes(billingCycle)) {
    throw new Error(`Invalid billing cycle: ${billingCycle}. Must be one of: ${validBillingCycles.join(', ')}`);
  }

  const result = await query<Membership>(
    `INSERT INTO memberships (user_id, tier, status, price_cents, billing_cycle, renewal_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, tier, status, price_cents, billing_cycle, renewal_date, created_at, updated_at`,
    [userId, tier, 'active', priceCents, billingCycle, renewalDate]
  );
  return result.rows[0];
}

/**
 * Update membership status
 */
export async function updateMembershipStatus(membershipId: number, status: string): Promise<Membership> {
  const validStatuses = ['active', 'inactive', 'suspended', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const result = await query<Membership>(
    `UPDATE memberships SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, user_id, tier, status, price_cents, billing_cycle, renewal_date, created_at, updated_at`,
    [status, membershipId]
  );
  return result.rows[0];
}

/**
 * Create a training session
 */
export async function createSession(
  instructorId: number,
  title: string,
  description?: string,
  scheduledTime?: Date,
  durationMinutes?: number,
  studentIds: number[] = []
): Promise<Session> {
  const result = await query<Session>(
    `INSERT INTO sessions (instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at`,
    [instructorId, title, description, scheduledTime, durationMinutes, studentIds, 'scheduled']
  );
  return result.rows[0];
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: number): Promise<Session | null> {
  const result = await query<Session>(
    `SELECT id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at
     FROM sessions WHERE id = $1`,
    [sessionId]
  );
  return result.rows[0] || null;
}

/**
 * Update session recording URL
 */
export async function updateSessionRecordingUrl(sessionId: number, recordingUrl: string): Promise<Session> {
  const result = await query<Session>(
    `UPDATE sessions SET recording_url = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at`,
    [recordingUrl, sessionId]
  );
  return result.rows[0];
}

/**
 * Get available sessions by date and optional type
 */
export async function getAvailableSessionsByDate(date: string, type?: string): Promise<Session[]> {
  let query_text = `
    SELECT id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at
    FROM sessions
    WHERE DATE(scheduled_time) = $1
    AND (student_ids IS NULL OR array_length(student_ids, 1) IS NULL)
  `;

  const params: any[] = [date];

  if (type) {
    query_text += ` AND type = $2`;
    params.push(type);
  }

  query_text += ` ORDER BY scheduled_time ASC`;

  const result = await query<Session>(query_text, params);
  return result.rows;
}

/**
 * Book a session for a student
 */
export async function bookSession(sessionId: number, studentId: number): Promise<Session> {
  const result = await query<Session>(
    `UPDATE sessions
     SET student_ids = CASE
       WHEN student_ids IS NULL THEN ARRAY[$1]::bigint[]
       ELSE array_append(student_ids, $1)
     END,
     updated_at = NOW()
     WHERE id = $2
     RETURNING id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at`,
    [studentId, sessionId]
  );
  return result.rows[0];
}

/**
 * Get sessions booked by a student
 */
export async function getStudentBookedSessions(studentId: number): Promise<Session[]> {
  const result = await query<Session>(
    `SELECT id, instructor_id, title, description, scheduled_time, duration_minutes, student_ids, status, recording_url, location, outcome_notes, type, created_at, updated_at
     FROM sessions
     WHERE student_ids && ARRAY[$1]::bigint[]
     ORDER BY scheduled_time DESC`,
    [studentId]
  );
  return result.rows;
}

/**
 * Create a payment record
 */
export async function createPayment(
  membershipId: number,
  userId: number,
  amountCents: number,
  paymentMethod?: string,
  externalTransactionId?: string
): Promise<Payment> {
  const result = await query<Payment>(
    `INSERT INTO payments (membership_id, user_id, amount_cents, currency, status, payment_method, external_transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, membership_id, user_id, amount_cents, currency, status, payment_method, external_transaction_id, transaction_date, created_at, updated_at`,
    [membershipId, userId, amountCents, 'USD', 'pending', paymentMethod, externalTransactionId]
  );
  return result.rows[0];
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: number): Promise<Payment | null> {
  const result = await query<Payment>(
    `SELECT id, membership_id, user_id, amount_cents, currency, status, payment_method, external_transaction_id, transaction_date, created_at, updated_at
     FROM payments WHERE id = $1`,
    [paymentId]
  );
  return result.rows[0] || null;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(paymentId: number, status: string): Promise<Payment> {
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validPaymentStatuses.includes(status)) {
    throw new Error(`Invalid payment status: ${status}. Must be one of: ${validPaymentStatuses.join(', ')}`);
  }

  const result = await query<Payment>(
    `UPDATE payments SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, membership_id, user_id, amount_cents, currency, status, payment_method, external_transaction_id, transaction_date, created_at, updated_at`,
    [status, paymentId]
  );
  return result.rows[0];
}

/**
 * Get user's premium features
 */
export async function getUserPremiumFeatures(userId: number): Promise<PremiumFeature[]> {
  const result = await query<PremiumFeature>(
    `SELECT id, user_id, feature_name, is_enabled, expires_at, created_at, updated_at
     FROM premium_features WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
}

/**
 * Enable a premium feature for a user
 */
export async function enablePremiumFeature(
  userId: number,
  featureName: string,
  expiresAt?: Date
): Promise<PremiumFeature> {
  const result = await query<PremiumFeature>(
    `INSERT INTO premium_features (user_id, feature_name, is_enabled, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, feature_name, is_enabled, expires_at, created_at, updated_at`,
    [userId, featureName, true, expiresAt]
  );
  return result.rows[0];
}

/**
 * Record an analytics metric
 */
export async function recordAnalytic(
  userId: number,
  metricName: string,
  metricValue: number,
  recordedDate?: Date
): Promise<Analytic> {
  const result = await query<Analytic>(
    `INSERT INTO analytics (user_id, metric_name, metric_value, recorded_date)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, metric_name, metric_value, recorded_date, created_at`,
    [userId, metricName, metricValue, recordedDate || new Date()]
  );
  return result.rows[0];
}

/**
 * Get user analytics by metric name
 */
export async function getUserAnalytics(userId: number, metricName: string): Promise<Analytic[]> {
  const result = await query<Analytic>(
    `SELECT id, user_id, metric_name, metric_value, recorded_date, created_at
     FROM analytics WHERE user_id = $1 AND metric_name = $2
     ORDER BY recorded_date DESC`,
    [userId, metricName]
  );
  return result.rows;
}

/**
 * Send a notification
 */
export async function sendNotification(
  userId: number,
  notificationType: string,
  title: string,
  message: string
): Promise<Notification> {
  const result = await query<Notification>(
    `INSERT INTO notifications (user_id, notification_type, title, message, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, notification_type, title, message, status, is_read, created_at, updated_at`,
    [userId, notificationType, title, message, 'sent']
  );
  return result.rows[0];
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId: number): Promise<Notification[]> {
  const result = await query<Notification>(
    `SELECT id, user_id, notification_type, title, message, status, is_read, created_at, updated_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  const result = await query<Notification>(
    `UPDATE notifications SET is_read = true, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, notification_type, title, message, status, is_read, created_at, updated_at`,
    [notificationId]
  );
  return result.rows[0];
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  action: string,
  userId?: number,
  resourceType?: string,
  resourceId?: number,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<AuditLog> {
  const result = await query<AuditLog>(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at`,
    [userId, action, resourceType, resourceId, JSON.stringify(details) || null, ipAddress, userAgent]
  );
  return result.rows[0];
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: number, limit: number = 50): Promise<AuditLog[]> {
  const result = await query<AuditLog>(
    `SELECT id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at
     FROM audit_logs WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

/**
 * Get total drill count
 */
export async function getTotalDrillCount(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM content WHERE content_type = 'drill'`
  );
  return parseInt(result.rows[0]?.count || '0', 10);
}

/**
 * Get user's completed drill count
 */
export async function getUserCompletedDrillCount(userId: number): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM progress
     WHERE user_id = $1
     AND content_id IN (SELECT id FROM content WHERE content_type = 'drill')
     AND completed_at IS NOT NULL`,
    [userId]
  );
  return parseInt(result.rows[0]?.count || '0', 10);
}

/**
 * Get user's average quiz score
 */
export async function getUserAverageQuizScore(userId: number): Promise<number | null> {
  const result = await query<{ avg_score: number | null }>(
    `SELECT AVG(completion_percentage) as avg_score FROM progress
     WHERE user_id = $1
     AND content_id IN (SELECT id FROM content WHERE content_type = 'quiz')
     AND completed_at IS NOT NULL`,
    [userId]
  );
  const avgScore = result.rows[0]?.avg_score;
  return avgScore ? Math.round(avgScore) : null;
}

/**
 * Get user's progress summary
 */
export async function getUserProgressSummary(userId: number): Promise<{
  total_drills: number;
  completed_drills: number;
  quiz_score: number | null;
}> {
  const [totalDrills, completedDrills, quizScore] = await Promise.all([
    getTotalDrillCount(),
    getUserCompletedDrillCount(userId),
    getUserAverageQuizScore(userId),
  ]);

  return {
    total_drills: totalDrills,
    completed_drills: completedDrills,
    quiz_score: quizScore,
  };
}

/**
 * Close database connections (should be called on app shutdown)
 */
export async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

export { pool };
export type { Pool, PoolClient };
