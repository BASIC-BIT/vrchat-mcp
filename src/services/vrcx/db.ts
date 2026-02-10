import Database from 'better-sqlite3';

export type VrcxDb = Database.Database;

export function withVrcxDb<T>(dbPath: string, fn: (db: VrcxDb) => T): T {
  const db = new Database(dbPath, { readonly: true, fileMustExist: true, timeout: 1000 });
  try {
    // Extra belt-and-suspenders safety: prevent writes even if readonly is bypassed.
    db.pragma('query_only = 1');
    return fn(db);
  } finally {
    db.close();
  }
}
