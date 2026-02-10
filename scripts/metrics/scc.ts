import { spawnSync } from 'node:child_process';

const MAX_FILE_CODE_LINES = 600;
const MAX_FILE_COMPLEXITY = 150;

const ROOTS = ['src', 'bin'] as const;
const EXCLUDE_PREFIXES = ['src/generated/'] as const;

type SccFile = {
  Location?: string;
  Code?: number;
  Complexity?: number;
  Lines?: number;
};

type SccLanguage = {
  Name?: string;
  Code?: number;
  Complexity?: number;
  Lines?: number;
  Files?: SccFile[];
};

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/');
}

function isExcludedFile(location: string): boolean {
  const normalized = normalizePath(location);
  return EXCLUDE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function runSccJson(): SccLanguage[] {
  const args = [
    '--ci',
    '--format',
    'json',
    '--by-file',
    '--include-ext',
    'ts,tsx,mts',
    '--exclude-dir',
    'src/generated',
    ...ROOTS,
  ];

  const result = spawnSync('scc', args, { encoding: 'utf8' });
  if (result.error) {
    throw result.error;
  }
  if (typeof result.stdout !== 'string' || !result.stdout.trim()) {
    throw new Error('scc produced no output');
  }
  return JSON.parse(result.stdout) as SccLanguage[];
}

function flattenFiles(languages: SccLanguage[]): SccFile[] {
  const files: SccFile[] = [];
  for (const lang of languages) {
    if (!Array.isArray(lang.Files)) continue;
    for (const file of lang.Files) {
      if (!file || typeof file !== 'object') continue;
      const location = typeof file.Location === 'string' ? file.Location : '';
      if (!location) continue;
      if (isExcludedFile(location)) continue;
      files.push(file);
    }
  }
  return files;
}

function compareNumbersDesc(a: number, b: number): number {
  return b - a;
}

function main(): void {
  const languages = runSccJson();
  const files = flattenFiles(languages);

  const violations = files
    .map((file) => {
      const location = normalizePath(String(file.Location ?? ''));
      const code = Number(file.Code ?? 0);
      const complexity = Number(file.Complexity ?? 0);
      const lines = Number(file.Lines ?? 0);
      return {
        location,
        code,
        complexity,
        lines,
        overCode: code > MAX_FILE_CODE_LINES,
        overComplexity: complexity > MAX_FILE_COMPLEXITY,
      };
    })
    .filter((entry) => entry.overCode || entry.overComplexity);

  const maxCode = files.reduce((acc, file) => Math.max(acc, Number(file.Code ?? 0)), 0);
  const maxComplexity = files.reduce((acc, file) => Math.max(acc, Number(file.Complexity ?? 0)), 0);

  if (violations.length === 0) {
    // Keep this concise for CI logs.
    process.stderr.write(
      `scc: OK (${files.length} files). maxCode=${maxCode}, maxComplexity=${maxComplexity}\n`
    );
    return;
  }

  const worstByComplexity = [...violations]
    .sort((a, b) => compareNumbersDesc(a.complexity, b.complexity))
    .slice(0, 10);
  const worstByCode = [...violations]
    .sort((a, b) => compareNumbersDesc(a.code, b.code))
    .slice(0, 10);

  process.stderr.write(
    `scc: violations detected (maxFileCode=${MAX_FILE_CODE_LINES}, maxFileComplexity=${MAX_FILE_COMPLEXITY})\n`
  );
  process.stderr.write('Top by complexity:\n');
  for (const entry of worstByComplexity) {
    process.stderr.write(
      `  ${entry.complexity} complexity, ${entry.code} code: ${entry.location}\n`
    );
  }
  process.stderr.write('Top by code lines:\n');
  for (const entry of worstByCode) {
    process.stderr.write(
      `  ${entry.code} code, ${entry.complexity} complexity: ${entry.location}\n`
    );
  }
  process.exitCode = 1;
}

main();
