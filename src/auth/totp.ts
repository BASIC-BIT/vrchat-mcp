import { createHmac } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode an RFC 4648 base32 TOTP secret. Accepts the space-grouped lowercase form VRChat shows
 * when enrolling an authenticator. Returns null when the value does not decode; callers must not
 * echo the input back, because it is the secret.
 */
export function decodeBase32Secret(input: string): Buffer | null {
  const normalized = input.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;
    buffer = ((buffer << 5) | index) & 0xffff;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes.length > 0 ? Buffer.from(bytes) : null;
}

/** RFC 6238 TOTP: HMAC-SHA1, 30-second step, 6 digits. */
export function generateTotp(secret: Buffer, timeMs = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 30_000)));
  const hmac = createHmac('sha1', secret).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, '0');
}
