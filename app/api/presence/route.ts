import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

export interface PresenceRecord {
  userId: string;
  email?: string;
  name: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: number;
}

// 45 seconds TTL — heartbeat fires every 4s, so 45s allows ~10 missed beats (e.g. background tab throttling)
const PRESENCE_TTL_MS = 45_000;

// ---------------------------------------------------------------------------
// D1 helper — gets the bound D1 database from the Cloudflare context.
// ---------------------------------------------------------------------------
function getD1() {
  try {
    const { env } = getCloudflareContext();
    return (env as any).apextrack_db ?? (env as any).kynov_db ?? (env as any).DB ?? null;
  } catch {
    return null;
  }
}

// Fallback table creation (only triggered if a query fails with missing table)
async function ensureTableFallback(db: any) {
  try {
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS user_presence (user_id TEXT NOT NULL PRIMARY KEY, email TEXT, name TEXT NOT NULL DEFAULT 'Team Member', status TEXT NOT NULL DEFAULT 'ONLINE', last_seen INTEGER NOT NULL)`
    ).run();
    await db.prepare(
      `CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence (last_seen)`
    ).run();
  } catch (e) {
    console.error('[presence ensureTableFallback]', e);
  }
}

// ---------------------------------------------------------------------------
// Read all currently-online users from D1
// ---------------------------------------------------------------------------
async function readPresence(db: any): Promise<PresenceRecord[]> {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  try {
    const result = await db
      .prepare(
        `SELECT user_id, email, name, status, last_seen FROM user_presence WHERE last_seen > ? AND status != 'OFFLINE' ORDER BY last_seen DESC`
      )
      .bind(cutoff)
      .all();

    return (result.results ?? []).map((row: any) => ({
      userId: String(row.user_id),
      email: row.email ? String(row.email).toLowerCase().trim() : undefined,
      name: String(row.name || 'Team Member').trim(),
      status: row.status as PresenceRecord['status'],
      lastSeen: Number(row.last_seen),
    }));
  } catch (err: any) {
    if (String(err?.message || '').includes('no such table')) {
      await ensureTableFallback(db);
      return [];
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Upsert a single user's presence record into D1
// ---------------------------------------------------------------------------
async function upsertPresence(
  db: any,
  userId: string,
  email: string,
  name: string,
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
) {
  const now = Date.now();

  try {
    if (status === 'OFFLINE') {
      await db.prepare(`DELETE FROM user_presence WHERE user_id = ?`).bind(userId).run();
    } else {
      await db
        .prepare(
          `INSERT INTO user_presence (user_id, email, name, status, last_seen) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, name = excluded.name, status = excluded.status, last_seen = excluded.last_seen`
        )
        .bind(userId, email || null, name, status, now)
        .run();
    }

    // Best-effort cleanup of rows older than 90 seconds
    const pruneCutoff = now - 90_000;
    await db.prepare(`DELETE FROM user_presence WHERE last_seen <= ?`).bind(pruneCutoff).run();
  } catch (err: any) {
    if (String(err?.message || '').includes('no such table')) {
      await ensureTableFallback(db);
      // Retry once after table creation
      if (status !== 'OFFLINE') {
        await db
          .prepare(
            `INSERT INTO user_presence (user_id, email, name, status, last_seen) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, name = excluded.name, status = excluded.status, last_seen = excluded.last_seen`
          )
          .bind(userId, email || null, name, status, now)
          .run();
      }
      return;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Shape the final response payload
// ---------------------------------------------------------------------------
function buildPayload(records: PresenceRecord[]) {
  const onlineUserIds = records.map((r) => r.userId);
  const onlineEmails = records
    .map((r) => r.email?.toLowerCase().trim())
    .filter(Boolean) as string[];
  const onlineNames = records
    .map((r) => r.name.toLowerCase().trim())
    .filter(Boolean) as string[];

  return { onlineUserIds, onlineEmails, onlineNames, activeUsers: records };
}

const NO_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
} as const;

// ---------------------------------------------------------------------------
// GET — return who is currently online
// ---------------------------------------------------------------------------
export async function GET(_req: NextRequest) {
  try {
    const db = getD1();
    if (!db) {
      return NextResponse.json(
        { onlineUserIds: [], onlineEmails: [], onlineNames: [], activeUsers: [] },
        { headers: NO_CACHE }
      );
    }

    const records = await readPresence(db);
    return NextResponse.json(buildPayload(records), { headers: NO_CACHE });
  } catch (err: any) {
    console.error('[presence GET]', err);
    return NextResponse.json(
      { onlineUserIds: [], onlineEmails: [], onlineNames: [], activeUsers: [] },
      { headers: NO_CACHE }
    );
  }
}

// ---------------------------------------------------------------------------
// POST — heartbeat / status change
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const db = getD1();

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      try {
        const text = await req.text();
        if (text) body = JSON.parse(text);
      } catch {}
    }

    let userId = body.userId ? String(body.userId).trim() : '';
    let email = body.email ? String(body.email).trim().toLowerCase() : '';
    let name = body.name ? String(body.name).trim() : 'Team Member';
    const status: 'ONLINE' | 'AWAY' | 'OFFLINE' = body.status || 'ONLINE';

    // Resolve from session if caller didn't supply identifiers
    if (!userId || !email) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser) {
          if (!userId) userId = sessionUser.id;
          if (!email) email = sessionUser.email?.toLowerCase() ?? '';
          if (!name || name === 'Team Member') name = sessionUser.name;
        }
      } catch {}
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        {
          success: true,
          onlineUserIds: [userId],
          onlineEmails: email ? [email] : [],
          onlineNames: [name.toLowerCase().trim()],
          activeUsers: [
            { userId, email, name, status, lastSeen: Date.now() },
          ],
        },
        { headers: NO_CACHE }
      );
    }

    await upsertPresence(db, userId, email, name, status);
    const records = await readPresence(db);

    return NextResponse.json({ success: true, ...buildPayload(records) }, { headers: NO_CACHE });
  } catch (err: any) {
    console.error('[presence POST]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to update presence' },
      { status: 500 }
    );
  }
}
