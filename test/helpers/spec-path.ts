import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function resolveSpecPath(fromMetaUrl: string): string {
  const primary = new URL('../../specs/vrchat-openapi.yaml', fromMetaUrl);
  if (existsSync(primary)) {
    return fileURLToPath(primary);
  }

  const fallback = new URL('../fixtures/spec.yaml', fromMetaUrl);
  return fileURLToPath(fallback);
}
