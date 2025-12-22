import { createHash, randomUUID } from 'node:crypto';
import { getConfig } from '../config/index.js';
import { stableStringify } from '../utils/stableStringify.js';

const confirmations = new Map<
  string,
  {
    action: string;
    payloadHash: string;
    expiresAt: number;
  }
>();

function readTtlMs(): number {
  return getConfig().confirmations.ttlMs;
}

function hashPayload(payload: unknown): string {
  const serialized = stableStringify(payload);
  return createHash('sha256').update(serialized).digest('hex');
}

function cleanupExpired(now = Date.now()): void {
  for (const [id, entry] of confirmations.entries()) {
    if (entry.expiresAt <= now) confirmations.delete(id);
  }
}

export function createConfirmation(action: string, payload: unknown): { confirmId: string; expiresAt: string } {
  cleanupExpired();
  const confirmId = randomUUID();
  const expiresAtMs = Date.now() + readTtlMs();
  confirmations.set(confirmId, {
    action,
    payloadHash: hashPayload(payload),
    expiresAt: expiresAtMs,
  });
  return { confirmId, expiresAt: new Date(expiresAtMs).toISOString() };
}

export function consumeConfirmation(
  confirmId: string,
  action: string,
  payload: unknown,
): { ok: true } | { ok: false; reason: string } {
  cleanupExpired();
  const entry = confirmations.get(confirmId);
  if (!entry) {
    return { ok: false, reason: 'Confirmation token not found or expired.' };
  }
  if (entry.action !== action) {
    return { ok: false, reason: 'Confirmation token action mismatch.' };
  }
  if (entry.payloadHash !== hashPayload(payload)) {
    return { ok: false, reason: 'Confirmation token payload mismatch.' };
  }
  confirmations.delete(confirmId);
  return { ok: true };
}

export function resetConfirmationsForTest(): void {
  confirmations.clear();
}
