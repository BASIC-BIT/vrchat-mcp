import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CCN_THRESHOLD = 20;
const LENGTH_THRESHOLD = 200;
const PARAM_THRESHOLD = 8;

function runOrThrow(
  command: string,
  args: string[],
  options: { cwd?: string; shell?: boolean } = {}
): void {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    cwd: options.cwd,
    shell: options.shell,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status && result.status !== 0) {
    const out = String(result.stdout ?? '').trim();
    const err = String(result.stderr ?? '').trim();
    if (out) process.stderr.write(`${out}\n`);
    if (err) process.stderr.write(`${err}\n`);
    throw new Error(`${command} exited with code ${result.status}`);
  }
}

function runNpmOrThrow(args: string[]): void {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    runOrThrow(process.execPath, [npmExecPath, ...args]);
    return;
  }
  // Fallback for non-npm execution.
  runOrThrow('npm', args, { shell: process.platform === 'win32' });
}

function ensureDistBuilt(): void {
  const distMarker = path.join('dist', 'src', 'index.js');
  if (existsSync(distMarker)) return;
  runNpmOrThrow(['run', 'build']);
}

function main(): void {
  ensureDistBuilt();

  // Analyze compiled JS to avoid TS parser edge-cases.
  const args = [
    '-m',
    'lizard',
    '-l',
    'javascript',
    '-C',
    String(CCN_THRESHOLD),
    '-L',
    String(LENGTH_THRESHOLD),
    '-a',
    String(PARAM_THRESHOLD),
    '-i',
    '0',
    '-w',
    '-x',
    'dist/src/generated/*',
    'dist',
  ];

  // lizard prints warnings to stdout; keep stderr for the wrapper status line.
  const result = spawnSync('python', args, { encoding: 'utf8' });
  const out = String(result.stdout ?? '').trim();
  const err = String(result.stderr ?? '').trim();

  if (result.error) {
    throw result.error;
  }

  if (result.status && result.status !== 0) {
    if (out) process.stderr.write(`${out}\n`);
    if (err) process.stderr.write(`${err}\n`);
    process.exitCode = result.status;
    return;
  }

  // No warnings means no output (with -w).
  process.stderr.write(
    `lizard: OK (ccn<=${CCN_THRESHOLD}, length<=${LENGTH_THRESHOLD}, params<=${PARAM_THRESHOLD})\n`
  );
}

main();
