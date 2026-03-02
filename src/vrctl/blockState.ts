/**
 * Shared 403 cooldown / circuit-breaker state for vrc.tl requests.
 *
 * Both VrctlClient and VrctlAuthManager reference the same instance so that
 * a 403 from either path blocks all outbound vrc.tl traffic until the
 * cooldown expires.
 */
export interface VrctlBlockStateDeps {
  /** Override Date.now() for testing. */
  now?: () => number;
}

export class VrctlBlockState {
  private blockedUntilMs: number | null = null;
  private nowFn: () => number;

  constructor(deps: VrctlBlockStateDeps = {}) {
    this.nowFn = deps.now ?? (() => Date.now());
  }

  /** Returns true when requests should be refused. */
  isBlocked(): boolean {
    if (this.blockedUntilMs === null) return false;
    if (this.nowFn() >= this.blockedUntilMs) {
      this.blockedUntilMs = null;
      return false;
    }
    return true;
  }

  /** ISO timestamp of the current block expiry, or null. */
  get blockedUntil(): string | null {
    if (!this.isBlocked()) return null;
    return new Date(this.blockedUntilMs!).toISOString();
  }

  /** Activate the circuit breaker for `cooldownMs` milliseconds. */
  block(cooldownMs: number): void {
    this.blockedUntilMs = this.nowFn() + cooldownMs;
  }

  /** Clear the block (e.g. after manual reset / cache invalidation). */
  clear(): void {
    this.blockedUntilMs = null;
  }
}

/** Shared singleton used by VrctlClient and VrctlAuthManager. */
export const vrctlBlockState = new VrctlBlockState();
