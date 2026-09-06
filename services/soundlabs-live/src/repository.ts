import type { Database } from './db.js';
import type { CrowdMode, LiveParticipantRole } from './domain.js';

export interface CreateSessionInput {
  ownerId: string;
  projectId: string;
  title: string;
  description?: string;
  crowdMode: CrowdMode;
}

export class LiveRepository {
  constructor(private readonly db: Database) {}

  async createCustomerRoom(input: { ownerId: string; projectName: string; roomTitle: string; crowdMode: CrowdMode }) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const project = await client.query(
        `INSERT INTO "SoundLabsProject" ("id","userId","name","mixerState","projectSize","createdAt","updatedAt")
         VALUES (gen_random_uuid()::text,$1,$2,'{}'::jsonb,0,now(),now()) RETURNING "id","name"`,
        [input.ownerId, input.projectName],
      );
      const room = await client.query(
        `INSERT INTO "SoundLabsLiveSession" ("projectId","ownerId","title","crowdMode")
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [project.rows[0].id, input.ownerId, input.roomTitle, input.crowdMode],
      );
      await client.query(
        `INSERT INTO "SoundLabsLiveParticipant" ("sessionId","userId","role","presence") VALUES ($1,$2,'OWNER','online')`,
        [room.rows[0].id, input.ownerId],
      );
      await client.query('COMMIT');
      return { project: project.rows[0], session: room.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getParticipant(sessionId: string, userId: string): Promise<{ role: LiveParticipantRole } | null> {
    const result = await this.db.query(
      `SELECT "role" FROM "SoundLabsLiveParticipant" WHERE "sessionId"=$1 AND "userId"=$2`,
      [sessionId, userId],
    );
    return result.rows[0] ?? null;
  }

  async getSnapshot(sessionId: string) {
    const [session, participants, tracks, versions, polls, suggestions, messages] = await Promise.all([
      this.db.query(`SELECT * FROM "SoundLabsLiveSession" WHERE "id"=$1`, [sessionId]),
      this.db.query(`SELECT p.*, u."name", u."email" FROM "SoundLabsLiveParticipant" p JOIN "User" u ON u."id"=p."userId" WHERE p."sessionId"=$1 ORDER BY p."joinedAt"`, [sessionId]),
      this.db.query(`SELECT * FROM "SoundLabsLiveTrack" WHERE "sessionId"=$1 ORDER BY "createdAt"`, [sessionId]),
      this.db.query(`SELECT v.* FROM "SoundLabsLiveTrackVersion" v JOIN "SoundLabsLiveTrack" t ON t."id"=v."trackId" WHERE t."sessionId"=$1 ORDER BY v."createdAt"`, [sessionId]),
      this.db.query(`SELECT * FROM "SoundLabsLivePoll" WHERE "sessionId"=$1 ORDER BY "createdAt" DESC LIMIT 20`, [sessionId]),
      this.db.query(`SELECT * FROM "SoundLabsLiveSuggestion" WHERE "sessionId"=$1 AND "moderationState"='APPROVED' ORDER BY "score" DESC,"createdAt" ASC LIMIT 50`, [sessionId]),
      this.db.query(`SELECT m.*,u."name" FROM "SoundLabsLiveMessage" m JOIN "User" u ON u."id"=m."userId" WHERE m."sessionId"=$1 AND m."moderationState"='APPROVED' ORDER BY m."createdAt" DESC LIMIT 100`, [sessionId]),
    ]);
    if (!session.rows[0]) return null;
    return { session: session.rows[0], participants: participants.rows, tracks: tracks.rows, versions: versions.rows, polls: polls.rows, suggestions: suggestions.rows, messages: messages.rows.reverse() };
  }

  async addMessage(sessionId: string, userId: string, text: string) {
    const result = await this.db.query(
      `INSERT INTO "SoundLabsLiveMessage" ("sessionId","userId","text") VALUES ($1,$2,$3) RETURNING *`,
      [sessionId, userId, text],
    );
    return result.rows[0];
  }

  async setRole(sessionId: string, userId: string, role: LiveParticipantRole) {
    const result = await this.db.query(
      `INSERT INTO "SoundLabsLiveParticipant" ("sessionId","userId","role") VALUES ($1,$2,$3)
       ON CONFLICT ("sessionId","userId") DO UPDATE SET "role"=EXCLUDED."role","lastSeenAt"=now() RETURNING *`,
      [sessionId, userId, role],
    );
    return result.rows[0];
  }
}
