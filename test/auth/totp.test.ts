import { describe, expect, it } from 'vitest';
import { decodeBase32Secret, generateTotp } from '../../src/auth/totp.js';

// RFC 6238 Appendix B, SHA-1 seed: ASCII "12345678901234567890".
const RFC_SECRET_BASE32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('totp', () => {
  it('decodes the RFC 6238 seed from base32', () => {
    expect(decodeBase32Secret(RFC_SECRET_BASE32)?.toString('ascii')).toBe('12345678901234567890');
  });

  it('matches the RFC 6238 SHA-1 vectors truncated to 6 digits', () => {
    const secret = decodeBase32Secret(RFC_SECRET_BASE32)!;
    expect(generateTotp(secret, 59_000)).toBe('287082');
    expect(generateTotp(secret, 1_111_111_109_000)).toBe('081804');
    expect(generateTotp(secret, 1_111_111_111_000)).toBe('050471');
    expect(generateTotp(secret, 1_234_567_890_000)).toBe('005924');
    expect(generateTotp(secret, 2_000_000_000_000)).toBe('279037');
  });

  it("accepts VRChat's space-grouped lowercase secret form", () => {
    const grouped = 'gezd gnbv gy3t qojq gezd gnbv gy3t qojq';
    expect(decodeBase32Secret(grouped)).toEqual(decodeBase32Secret(RFC_SECRET_BASE32));
  });

  it('rejects values that are not base32', () => {
    expect(decodeBase32Secret('not-base32!')).toBeNull();
    expect(decodeBase32Secret('GEZ1')).toBeNull();
    expect(decodeBase32Secret('   ')).toBeNull();
  });
});
