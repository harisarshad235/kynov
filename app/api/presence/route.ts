import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface PresenceRecord {
  userId: string;
  email?: string;
  name: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: number;
}

// Global server-side registry (shared across all incoming requests in the server process)
declare global {
  // eslint-disable-next-line no-var
  var __kynov_presence_store: Map<string, PresenceRecord> | undefined;
}

if (!globalThis.__kynov_presence_store) {
  globalThis.__kynov_presence_store = new Map<string, PresenceRecord>();
}

// 25 seconds TTL for active online status across browsers and tabs
const PRESENCE_TTL_MS = 25000;

function pruneStaleEntries(store: Map<string, PresenceRecord>) {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now - record.lastSeen > PRESENCE_TTL_MS || record.status === 'OFFLINE') {
      store.delete(key);
    }
  }
}

export async function GET(req: NextRequest) {
  const store = globalThis.__kynov_presence_store!;
  pruneStaleEntries(store);

  const onlineUserIds = Array.from(store.values()).map((u) => u.userId);
  const onlineEmails = Array.from(store.values())
    .map((u) => u.email?.toLowerCase())
    .filter(Boolean) as string[];
  const activeUsers = Array.from(store.values());

  return NextResponse.json(
    { onlineUserIds, onlineEmails, activeUsers },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const store = globalThis.__kynov_presence_store!;
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
    let status: 'ONLINE' | 'AWAY' | 'OFFLINE' = body.status || 'ONLINE';

    // If userId not provided directly, try session resolution
    if (!userId || !email) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser) {
          if (!userId) userId = sessionUser.id;
          if (!email) email = sessionUser.email?.toLowerCase();
          if (!name || name === 'Team Member') name = sessionUser.name;
        }
      } catch {}
    }

    if (userId) {
      if (status === 'OFFLINE') {
        store.delete(userId);
      } else {
        store.set(userId, {
          userId,
          email,
          name,
          status,
          lastSeen: Date.now(),
        });
      }
    }

    pruneStaleEntries(store);

    const onlineUserIds = Array.from(store.values()).map((u) => u.userId);
    const onlineEmails = Array.from(store.values())
      .map((u) => u.email?.toLowerCase())
      .filter(Boolean) as string[];
    const activeUsers = Array.from(store.values());

    return NextResponse.json(
      { success: true, onlineUserIds, onlineEmails, activeUsers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/presence:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update presence' },
      { status: 500 }
    );
  }
}
