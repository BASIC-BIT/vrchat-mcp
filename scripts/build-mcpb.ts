import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerAllTools } from '../src/tools/registerAllTools.js';

type PackageJson = {
  name: string;
  version: string;
  description: string;
  homepage?: string;
  repository?: { url?: string };
  license?: string;
  engines?: { node?: string };
};

type ZipEntry = {
  relativePath: string;
  fullPath: string;
  mode: number;
};

type ManifestTool = {
  name: string;
  description?: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const mcpbRoot = path.join(repoRoot, 'mcpb');
const buildRoot = path.join(mcpbRoot, 'build');
const stageRoot = path.join(buildRoot, 'vrchat-mcp');
const zipFileMode = 0o100644;
const zip16Limit = 0xffff;
const zip32Limit = 0xffffffff;

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i += 1) {
  let c = i;
  for (let j = 0; j < 8; j += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { date: number; time: number } {
  const year = Math.max(date.getFullYear(), 1980);
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

async function copyFileIfExists(source: string, target: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
  }
}

async function copyDirectoryIfExists(source: string, target: string): Promise<void> {
  try {
    await fs.cp(source, target, { recursive: true });
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
  }
}

async function copyRequiredDirectory(source: string, target: string): Promise<void> {
  try {
    await fs.cp(source, target, { recursive: true });
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') {
      const relativeSource = path.relative(repoRoot, source) || source;
      throw new Error(
        `Required directory ${relativeSource} is missing. Run npm run build before building the MCPB bundle.`
      );
    }
    throw err;
  }
}

function restoreEnv(previous: Map<string, string | undefined>): void {
  for (const [key, value] of previous.entries()) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

async function collectManifestTools(): Promise<ManifestTool[]> {
  const envOverrides = new Map<string, string>([
    ['VRCHAT_MCP_ENABLE_RAW_CALL', 'false'],
  ]);
  const previousEnv = new Map<string, string | undefined>();
  for (const key of envOverrides.keys()) {
    previousEnv.set(key, process.env[key]);
  }

  try {
    for (const [key, value] of envOverrides.entries()) {
      process.env[key] = value;
    }

    const tools = new Map<string, ManifestTool>();
    const collector = {
      registerTool: (name: string, config: { description?: string }) => {
        tools.set(name, {
          name,
          description: config.description,
        });
      },
    } as unknown as Parameters<typeof registerAllTools>[0];

    await registerAllTools(collector);
    return [...tools.values()].sort((a, b) => a.name.localeCompare(b.name));
  } finally {
    restoreEnv(previousEnv);
  }
}

async function listFiles(root: string, current = root): Promise<ZipEntry[]> {
  const entries: ZipEntry[] = [];
  const dirents = await fs.readdir(current, { withFileTypes: true });
  dirents.sort((a, b) => a.name.localeCompare(b.name));

  for (const dirent of dirents) {
    const fullPath = path.join(current, dirent.name);
    if (dirent.isDirectory()) {
      entries.push(...(await listFiles(root, fullPath)));
      continue;
    }
    if (!dirent.isFile()) continue;

    const relativePath = path.relative(root, fullPath).split(path.sep).join('/');
    entries.push({ relativePath, fullPath, mode: zipFileMode });
  }

  return entries;
}

async function writeZip(sourceDir: string, outputPath: string): Promise<void> {
  const entries = await listFiles(sourceDir);
  if (entries.length > zip16Limit) {
    throw new Error(
      `Archive contains ${entries.length} entries, which exceeds the ZIP32 limit of ${zip16Limit}. ZIP64 support is required.`
    );
  }

  const centralDirectory: Buffer[] = [];
  let offset = 0;
  const now = dosDateTime(new Date());
  const output = await fs.open(outputPath, 'w');
  let completed = false;

  try {
    for (const entry of entries) {
      const name = Buffer.from(entry.relativePath, 'utf8');
      const data = await fs.readFile(entry.fullPath);
      if (name.length > zip16Limit) {
        throw new Error(`Archive entry path is too long for ZIP32: ${entry.relativePath}`);
      }
      if (data.length > zip32Limit || offset > zip32Limit) {
        throw new Error('Archive exceeds ZIP32 size limits. ZIP64 support is required.');
      }

      const crc = crc32(data);
      const local = Buffer.alloc(30);
      local.writeUInt32LE(0x04034b50, 0);
      local.writeUInt16LE(20, 4);
      local.writeUInt16LE(0, 6);
      local.writeUInt16LE(0, 8);
      local.writeUInt16LE(now.time, 10);
      local.writeUInt16LE(now.date, 12);
      local.writeUInt32LE(crc, 14);
      local.writeUInt32LE(data.length, 18);
      local.writeUInt32LE(data.length, 22);
      local.writeUInt16LE(name.length, 26);
      local.writeUInt16LE(0, 28);

      await output.write(local);
      await output.write(name);
      await output.write(data);

      const central = Buffer.alloc(46);
      central.writeUInt32LE(0x02014b50, 0);
      central.writeUInt16LE(20, 4);
      central.writeUInt16LE(20, 6);
      central.writeUInt16LE(0, 8);
      central.writeUInt16LE(0, 10);
      central.writeUInt16LE(now.time, 12);
      central.writeUInt16LE(now.date, 14);
      central.writeUInt32LE(crc, 16);
      central.writeUInt32LE(data.length, 20);
      central.writeUInt32LE(data.length, 24);
      central.writeUInt16LE(name.length, 28);
      central.writeUInt16LE(0, 30);
      central.writeUInt16LE(0, 32);
      central.writeUInt16LE(0, 34);
      central.writeUInt16LE(0, 36);
      central.writeUInt32LE(((entry.mode & 0xffff) << 16) >>> 0, 38);
      central.writeUInt32LE(offset, 42);
      centralDirectory.push(central, name);

      offset += local.length + name.length + data.length;
    }

    const centralOffset = offset;
    const centralSize = centralDirectory.reduce((total, chunk) => total + chunk.length, 0);
    if (centralOffset > zip32Limit || centralSize > zip32Limit) {
      throw new Error('Archive exceeds ZIP32 central directory limits. ZIP64 support is required.');
    }

    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(centralOffset, 16);
    end.writeUInt16LE(0, 20);

    for (const chunk of centralDirectory) {
      await output.write(chunk);
    }
    await output.write(end);
    completed = true;
  } finally {
    await output.close();
    if (!completed) {
      await fs.rm(outputPath, { force: true });
    }
  }
}

function repositoryUrl(pkg: PackageJson): string {
  return (
    pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') ??
    'https://github.com/BASIC-BIT/vrchat-mcp'
  );
}

async function stageBundle(pkg: PackageJson): Promise<string> {
  await fs.rm(buildRoot, { recursive: true, force: true });
  await fs.mkdir(path.join(stageRoot, 'server'), { recursive: true });

  await copyRequiredDirectory(path.join(repoRoot, 'dist'), path.join(stageRoot, 'server', 'dist'));
  await copyFileIfExists(path.join(repoRoot, 'package.json'), path.join(stageRoot, 'package.json'));
  await copyFileIfExists(
    path.join(repoRoot, 'package-lock.json'),
    path.join(stageRoot, 'package-lock.json')
  );
  await copyFileIfExists(path.join(repoRoot, 'README.md'), path.join(stageRoot, 'README.md'));
  await copyFileIfExists(path.join(repoRoot, 'LICENSE'), path.join(stageRoot, 'LICENSE'));
  await copyFileIfExists(
    path.join(repoRoot, 'docs', 'privacy.md'),
    path.join(stageRoot, 'docs', 'privacy.md')
  );
  await copyFileIfExists(path.join(repoRoot, 'assets', 'logo.svg'), path.join(stageRoot, 'assets', 'logo.svg'));
  await copyDirectoryIfExists(path.join(repoRoot, 'skills'), path.join(stageRoot, 'skills'));
  const tools = await collectManifestTools();

  const manifest = {
    manifest_version: '0.3',
    name: 'vrchat-mcp',
    display_name: 'VRChat MCP',
    version: pkg.version,
    description: pkg.description,
    long_description:
      'Unofficial local Model Context Protocol server for VRChat friends, worlds, groups, events, notifications, status, invites, avatars, and local VRCX history. Authentication stays on your machine.',
    author: {
      name: 'BASICBIT',
      email: 'basic@basicbit.net',
      url: 'https://github.com/BASIC-BIT',
    },
    repository: {
      type: 'git',
      url: repositoryUrl(pkg),
    },
    homepage: pkg.homepage ?? 'https://github.com/BASIC-BIT/vrchat-mcp#readme',
    documentation: 'https://github.com/BASIC-BIT/vrchat-mcp#readme',
    support: 'https://github.com/BASIC-BIT/vrchat-mcp/issues',
    server: {
      type: 'node',
      entry_point: 'server/dist/bin/cli.js',
      mcp_config: {
        command: 'node',
        args: ['${__dirname}/server/dist/bin/cli.js'],
        env: {},
      },
    },
    tools,
    keywords: ['vrchat', 'mcp', 'model-context-protocol', 'vrcx', 'gaming', 'social-vr'],
    license: pkg.license ?? 'MIT',
    privacy_policies: ['https://github.com/BASIC-BIT/vrchat-mcp/blob/main/docs/privacy.md'],
    compatibility: {
      platforms: [process.platform],
      runtimes: {
        node: pkg.engines?.node ?? '>=24.15.0',
      },
    },
  };

  await fs.writeFile(path.join(stageRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return stageRoot;
}

async function main(): Promise<void> {
  const pkg = await readJson<PackageJson>(path.join(repoRoot, 'package.json'));
  const outputPath = path.join(mcpbRoot, `vrchat-mcp-${pkg.version}-${process.platform}-${process.arch}.mcpb`);

  const staged = await stageBundle(pkg);
  execSync('npm ci --omit=dev', { cwd: staged, stdio: 'inherit' });
  await writeZip(staged, outputPath);

  console.error(`MCPB bundle written to ${path.relative(repoRoot, outputPath)}`);
}

await main();
