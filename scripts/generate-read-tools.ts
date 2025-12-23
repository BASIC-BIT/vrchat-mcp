import fs from 'node:fs/promises';
import path from 'node:path';
import { fetch } from 'undici';
import YAML from 'yaml';

const SPEC_PATH = process.env.VRCHAT_MCP_SPEC_PATH ?? 'specs/vrchat-openapi.yaml';
const SPEC_URL = process.env.VRCHAT_MCP_SPEC_URL ?? 'https://vrchat.community/openapi.yaml';
const INVENTORY_PATH = 'docs/read-tools.md';
const MAP_PATH = 'docs/read-tools-map.md';

const toToolName = (name) => name.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');

const CURATED_TOOL_MAP = new Map([
  ['getConfig', toToolName('vrchat.config.get')],
  ['getSystemTime', toToolName('vrchat.system.time')],
  ['getCurrentUser', toToolName('vrchat.me')],
  ['getFriends', toToolName('vrchat.friends.list')],
  ['getFriendStatus', toToolName('vrchat.friends.status')],
  ['getUser', toToolName('vrchat.users.get')],
  ['getUserByName', toToolName('vrchat.users.getByName')],
  ['searchUsers', toToolName('vrchat.users.search')],
  ['getUserGroups', toToolName('vrchat.users.groups.list')],
  ['getUserGroupRequests', toToolName('vrchat.users.groups.requests')],
  ['getUserRepresentedGroup', toToolName('vrchat.users.groups.represented')],
  ['getWorld', toToolName('vrchat.worlds.get')],
  ['getActiveWorlds', toToolName('vrchat.worlds.active')],
  ['getRecentWorlds', toToolName('vrchat.worlds.recent')],
  ['searchWorlds', toToolName('vrchat.worlds.search')],
  ['getFavoritedWorlds', toToolName('vrchat.worlds.favorites')],
  ['getInstance', toToolName('vrchat.instances.get')],
  ['getInstanceByShortName', toToolName('vrchat.instances.getByShortName')],
  ['getRecentLocations', toToolName('vrchat.instances.recent')],
  ['getGroup', toToolName('vrchat.groups.get')],
  ['searchGroups', toToolName('vrchat.groups.search')],
  ['getGroupMembers', toToolName('vrchat.groups.members.list')],
  ['getGroupMember', toToolName('vrchat.groups.members.get')],
  ['getGroupRoles', toToolName('vrchat.groups.roles.list')],
  ['getGroupPermissions', toToolName('vrchat.groups.permissions.list')],
  ['getGroupAnnouncements', toToolName('vrchat.groups.announcements.get')],
  ['getGroupPosts', toToolName('vrchat.groups.posts.list')],
  ['getGroupInstances', toToolName('vrchat.groups.instances.list')],
  ['getGroupCalendarEvents', toToolName('vrchat.group.events.list')],
  ['getGroupCalendarEvent', toToolName('vrchat.group.event.get')],
  ['getNotifications', toToolName('vrchat.notifications.list')],
  ['getNotification', toToolName('vrchat.notifications.get')],
  ['getCalendarEvents', toToolName('vrchat.calendar.events.list')],
  ['getFeaturedCalendarEvents', toToolName('vrchat.calendar.featured.list')],
  ['getFollowedCalendarEvents', toToolName('vrchat.calendar.followed.list')],
  ['searchCalendarEvents', toToolName('vrchat.calendar.search')],
  ['getInviteMessages', toToolName('vrchat.invite_messages.list')],
  ['getInviteMessage', toToolName('vrchat.invite_messages.get')],
  ['getAvatar', toToolName('vrchat.avatars.get')],
  ['searchAvatars', toToolName('vrchat.avatars.search')],
  ['getFavoritedAvatars', toToolName('vrchat.avatars.favorites')],
  ['getFavorites', toToolName('vrchat.favorites.list')],
  ['getFavoriteGroups', toToolName('vrchat.favorite_groups.list')],
  ['getFavoriteLimits', toToolName('vrchat.favorites.limits')],
]);

async function loadSpec() {
  try {
    return await fs.readFile(SPEC_PATH, 'utf8');
  } catch {
    const res = await fetch(SPEC_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch spec (${res.status}) from ${SPEC_URL}`);
    }
    const text = await res.text();
    await fs.mkdir(path.dirname(SPEC_PATH), { recursive: true });
    await fs.writeFile(SPEC_PATH, text, 'utf8');
    return text;
  }
}

function derefParam(p, componentsParams) {
  if (!p) return null;
  if (p.$ref) {
    const key = p.$ref.split('/').pop();
    return componentsParams?.[key] ?? p;
  }
  return p;
}

function collectParams(pathItem, op, componentsParams) {
  const raw = [...(pathItem?.parameters ?? []), ...(op?.parameters ?? [])];
  const out = [];
  const seen = new Set();
  for (const p of raw) {
    const rp = derefParam(p, componentsParams);
    if (!rp || !rp.name || !rp.in) continue;
    const key = `${rp.in}:${rp.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(rp);
  }
  return out;
}

function paramType(schema) {
  if (!schema) return '';
  if (schema.type === 'array') {
    const itemType = schema.items?.type ?? 'any';
    return `array<${itemType}>`;
  }
  return schema.type ?? '';
}

function summarize(text) {
  if (!text) return '';
  return String(text).replace(/\s+/g, ' ').slice(0, 200);
}

function suggestToolName(opId) {
  if (CURATED_TOOL_MAP.has(opId)) return CURATED_TOOL_MAP.get(opId);
  return `vrchat_read_${opId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function main() {
  const specText = await loadSpec();
  const spec = YAML.parse(specText);
  const componentsParams = spec.components?.parameters ?? {};
  const info = spec.info ?? {};

  const ops = [];
  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(pathItem)) {
      if (method !== 'get') continue;
      if (!op?.operationId) continue;
      const params = collectParams(pathItem, op, componentsParams).map((p) => ({
        name: p.name,
        in: p.in,
        required: Boolean(p.required),
        description: p.description ?? '',
        type: paramType(p.schema),
      }));
      const summary = summarize(op.summary ?? (op.description ? String(op.description).split('\n')[0] : ''));
      const tags = Array.isArray(op.tags) ? op.tags : ['misc'];
      const auth = Array.isArray(op.security) ? op.security.length > 0 : Boolean(spec.security);
      ops.push({
        operationId: op.operationId,
        path: pathKey,
        summary,
        tags,
        params,
        auth,
        deprecated: Boolean(op.deprecated),
        suggestedTool: suggestToolName(op.operationId),
      });
    }
  }

  const grouped = new Map();
  for (const op of ops) {
    for (const tag of op.tags) {
      const key = tag ?? 'misc';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(op);
    }
  }

  const now = new Date().toISOString();
  let md = '';
  md += '# Read Tools Inventory (GET endpoints)\n\n';
  md += `Source: ${SPEC_PATH} (downloaded ${now})\n\n`;
  md += `Spec: ${info.title ?? 'VRChat API'} (${info.version ?? 'unknown'})\n\n`;
  md += `Total GET operations: ${ops.length}\n\n`;
  const tags = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
  for (const tag of tags) {
    const list = grouped.get(tag).sort((a, b) => a.operationId.localeCompare(b.operationId));
    md += `## Tag: ${tag} (${list.length})\n\n`;
    for (const op of list) {
      md += `### ${op.operationId}\n`;
      md += `- method: GET\n`;
      md += `- path: ${op.path}\n`;
      if (op.summary) md += `- summary: ${op.summary}\n`;
      md += `- auth: ${op.auth ? 'yes' : 'no'}\n`;
      if (op.deprecated) md += `- deprecated: yes\n`;
      if (op.params.length) {
        md += `- params:\n`;
        for (const p of op.params) {
          const desc = p.description ? p.description.replace(/\s+/g, ' ').slice(0, 160) : '';
          const type = p.type ? ` (${p.type})` : '';
          md += `  - ${p.name} [${p.in}]${p.required ? ' (required)' : ''}${type}${desc ? ` - ${desc}` : ''}\n`;
        }
      } else {
        md += `- params: none\n`;
      }
      md += '\n';
    }
  }

  await fs.mkdir(path.dirname(INVENTORY_PATH), { recursive: true });
  await fs.writeFile(INVENTORY_PATH, md, 'utf8');

  let map = '';
  map += '# Read Tools Map (GET endpoints)\n\n';
  map += `Source: ${SPEC_PATH} (downloaded ${now})\n\n`;
  map += `Spec: ${info.title ?? 'VRChat API'} (${info.version ?? 'unknown'})\n\n`;
  map += `Total GET operations: ${ops.length}\n\n`;
  map += 'Legend: suggested tool names default to `vrchat_read_<operationId>` unless a curated ergonomic tool exists.\n\n';
  for (const tag of tags) {
    const list = grouped.get(tag).sort((a, b) => a.operationId.localeCompare(b.operationId));
    map += `## Tag: ${tag} (${list.length})\n\n`;
    for (const op of list) {
      map += `- ${op.operationId} -> ${op.suggestedTool} (${op.path})\n`;
    }
    map += '\n';
  }

  await fs.writeFile(MAP_PATH, map, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
