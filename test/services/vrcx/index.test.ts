import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {
  getUserRelationshipSummary,
  getVrcxStatus,
  getVrcxUserMemo,
  listRecentInstanceSessionsForActiveUser,
  listRecentWorldVisits,
  listUserRelationshipSessions,
} from '../../../src/services/vrcx/index.js';

describe('vrcx service', () => {
  let tempDir: string;
  let dbPath: string;

  const activeUserId = 'usr_11111111-1111-1111-1111-111111111111';
  const friendUserId = 'usr_22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vrchat-mcp-vrcx-'));
    dbPath = path.join(tempDir, 'VRCX.sqlite3');

    const db = new Database(dbPath);
    db.exec(`
      CREATE TABLE configs (key TEXT PRIMARY KEY, value TEXT);
      CREATE TABLE memos (user_id TEXT PRIMARY KEY, edited_at TEXT, memo TEXT);
      CREATE TABLE world_memos (world_id TEXT PRIMARY KEY, edited_at TEXT, memo TEXT);
      CREATE TABLE avatar_memos (avatar_id TEXT PRIMARY KEY, edited_at TEXT, memo TEXT);
      CREATE TABLE gamelog_location (
        id INTEGER PRIMARY KEY,
        created_at TEXT,
        location TEXT,
        world_id TEXT,
        world_name TEXT,
        time INTEGER,
        group_name TEXT
      );
      CREATE TABLE gamelog_join_leave (
        id INTEGER PRIMARY KEY,
        created_at TEXT,
        type TEXT,
        display_name TEXT,
        location TEXT,
        user_id TEXT,
        time INTEGER
      );
    `);

    db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
      'config:lastuserloggedin',
      activeUserId
    );
    db.prepare('INSERT INTO configs (key, value) VALUES (?, ?)').run(
      'config:vrcx_databaseversion',
      '13'
    );

    db.prepare('INSERT INTO memos (user_id, edited_at, memo) VALUES (?, ?, ?)').run(
      friendUserId,
      '2026-01-01T00:00:00.000Z',
      'Friend memo'
    );

    const now = Date.now();
    const loc1 =
      'wrld_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa:1~group(grp_bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)~region(use)';
    const loc2 = 'wrld_cccccccc-cccc-cccc-cccc-cccccccccccc:2~region(eu)';

    // Self session (active user)
    const selfLeave = new Date(now - 60_000).toISOString();
    db.prepare(
      'INSERT INTO gamelog_join_leave (created_at, type, display_name, location, user_id, time) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(selfLeave, 'OnPlayerLeft', 'Me', loc1, activeUserId, 60_000);
    db.prepare(
      'INSERT INTO gamelog_location (created_at, location, world_id, world_name, time, group_name) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      new Date(now - 120_000).toISOString(),
      loc1,
      'wrld_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'World A',
      60_000,
      'Group B'
    );

    // Friend sessions
    const friendLeave1 = new Date(now - 300_000).toISOString();
    const friendLeave2 = new Date(now - 900_000).toISOString();
    db.prepare(
      'INSERT INTO gamelog_join_leave (created_at, type, display_name, location, user_id, time) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(friendLeave1, 'OnPlayerLeft', 'Friend', loc1, friendUserId, 120_000);
    db.prepare(
      'INSERT INTO gamelog_join_leave (created_at, type, display_name, location, user_id, time) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(friendLeave2, 'OnPlayerLeft', 'Friend', loc2, friendUserId, 180_000);
    db.prepare(
      'INSERT INTO gamelog_location (created_at, location, world_id, world_name, time, group_name) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      new Date(now - 600_000).toISOString(),
      loc2,
      'wrld_cccccccc-cccc-cccc-cccc-cccccccccccc',
      'World C',
      180_000,
      null
    );

    db.close();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('reports status with active user and version', async () => {
    const status = await getVrcxStatus({ enabled: true, databasePath: dbPath, worldDbPath: '' });
    expect(status.enabled).toBe(true);
    expect(status.available).toBe(true);
    expect(status.activeUserId).toBe(activeUserId);
    expect(status.databaseVersion).toBe(13);
    expect(status.userPrefix).toMatch(/usr/i);
  });

  it('reads user memo', async () => {
    const memo = await getVrcxUserMemo({
      enabled: true,
      databasePath: dbPath,
      worldDbPath: '',
      userId: friendUserId,
    });
    expect(memo).toMatchObject({ ok: true, memo: 'Friend memo' });
  });

  it('lists recent world visits', async () => {
    const visits = await listRecentWorldVisits({
      enabled: true,
      databasePath: dbPath,
      worldDbPath: '',
      daysBack: 7,
      limit: 10,
    });
    expect(visits).toMatchObject({ ok: true });
    if (visits.ok) {
      expect(visits.visits.length).toBeGreaterThan(0);
      expect(visits.visits[0]).toHaveProperty('location');
    }
  });

  it('lists recent instance sessions for active user with computed joinTime', async () => {
    const sessions = await listRecentInstanceSessionsForActiveUser({
      enabled: true,
      databasePath: dbPath,
      worldDbPath: '',
      daysBack: 7,
      limit: 10,
    });
    expect(sessions).toMatchObject({ ok: true, activeUserId });
    if (sessions.ok) {
      expect(sessions.sessions.length).toBe(1);
      const s = sessions.sessions[0];
      expect(s.durationMs).toBe(60_000);
      expect(s.joinTime).toBeTruthy();
      expect(s.groupId).toMatch(/^grp_/);
      expect(s.worldName).toBe('World A');
    }
  });

  it('summarizes relationship stats for a userId', async () => {
    const summary = await getUserRelationshipSummary({
      enabled: true,
      databasePath: dbPath,
      worldDbPath: '',
      userId: friendUserId,
    });
    expect(summary).toMatchObject({ ok: true, resolvedBy: 'userId' });
    if (summary.ok) {
      expect(summary.joinCount).toBe(2);
      expect(summary.timeSpentMs).toBe(300_000);
      expect(summary.hasData).toBe(true);
    }
  });

  it('lists relationship sessions with world info', async () => {
    const result = await listUserRelationshipSessions({
      enabled: true,
      databasePath: dbPath,
      worldDbPath: '',
      userId: friendUserId,
      limit: 10,
    });
    expect(result).toMatchObject({ ok: true, resolvedBy: 'userId' });
    if (result.ok) {
      expect(result.sessions.length).toBe(2);
      expect(result.sessions[0]).toHaveProperty('worldName');
      expect(result.sessions[0]).toHaveProperty('joinTime');
    }
  });
});
