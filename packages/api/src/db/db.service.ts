import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DbService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://wise2_prod_user:wise2_prod_secure_2026@localhost:5432/wise2_core_prod',
    });
  }

  async query(text: string, params?: any[]) {
    try {
      return await this.pool.query(text, params);
    } catch (err) {
      console.error('DB Query Error:', err);
      throw err;
    }
  }

  async getUser(userId: string) {
    const res = await this.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows[0];
  }

  async getUserByEmail(email: string) {
    const res = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  async createUser(email: string, passwordHash: string, firstName?: string, lastName?: string) {
    const id = `user_${Date.now()}`;
    const res = await this.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [id, email, passwordHash, firstName, lastName]
    );
    return res.rows[0];
  }

  async updateUserProfile(userId: string, firstName?: string, lastName?: string, avatarUrl?: string) {
    const res = await this.query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), avatar_url = COALESCE($3, avatar_url) WHERE id = $4 RETURNING *',
      [firstName, lastName, avatarUrl, userId]
    );
    return res.rows[0];
  }

  async close() {
    await this.pool.end();
  }
}
