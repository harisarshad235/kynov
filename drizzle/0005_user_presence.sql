-- Migration: 0005_user_presence
-- Creates a persistent presence table backed by Cloudflare D1 so that presence
-- state is shared across every Worker instance (stateless Workers can no longer
-- use globalThis).

CREATE TABLE IF NOT EXISTS user_presence (
  user_id   TEXT NOT NULL PRIMARY KEY,
  email     TEXT,
  name      TEXT NOT NULL DEFAULT 'Team Member',
  status    TEXT NOT NULL DEFAULT 'ONLINE', -- 'ONLINE' | 'AWAY' | 'OFFLINE'
  last_seen INTEGER NOT NULL               -- Unix timestamp in ms
);

CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence (last_seen);
