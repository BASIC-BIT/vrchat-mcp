import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CCN_THRESHOLD = 20;
const LENGTH_THRESHOLD = 200;
const PARAM_THRESHOLD = 8;
const BUILD_COMMAND = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const BUILD_ARGS = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];

function runOrThrow(command: string, args: string[], cwd?: string): void {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    cwd,
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

function ensureDistBuilt(): void {
  const distMarker = path.join('dist', 'src', 'index.js');
  if (existsSync(distMarker)) return;
  runOrThrow(BUILD_COMMAND, BUILD_ARGS);
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
