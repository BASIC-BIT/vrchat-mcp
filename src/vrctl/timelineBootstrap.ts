export interface VrctlCategory {
  id: number;
  name: string;
  urlName?: string;
  icon?: string;
  description?: string;
}

export interface VrctlTag {
  id: number;
  name: string;
  urlName?: string;
  group?: number;
  tooltip?: string | null;
  icon?: string | null;
  visibleOnEvent?: boolean;
  visibleOnFilter?: boolean;
  eventsHiddenForNotLoggedIn?: boolean;
  tagHiddenForNotLoggedIn?: boolean;
}

export interface VrctlTimelineBootstrap {
  misc?: {
    categories?: VrctlCategory[];
    tags?: VrctlTag[];
  };
  personal?: {
    loggedIn?: boolean;
  };
}

export interface TimelineBootstrapParseResult {
  timeline: VrctlTimelineBootstrap;
  loggedIn: boolean | null;
}

function findTimelineObjectStart(html: string): number {
  const idx = html.indexOf('window.timeline');
  if (idx === -1) return -1;
  const eq = html.indexOf('=', idx);
  if (eq === -1) return -1;
  return html.indexOf('{', eq);
}

function extractJsonObject(html: string, start: number): string | null {
  if (start < 0 || start >= html.length) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < html.length; i += 1) {
    const ch = html[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') {
      depth += 1;
      continue;
    }
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return html.slice(start, i + 1);
      }
    }
  }
  return null;
}

export function parseTimelineBootstrap(html: string): TimelineBootstrapParseResult | null {
  const start = findTimelineObjectStart(html);
  if (start === -1) return null;
  const json = extractJsonObject(html, start);
  if (!json) return null;

  let timeline: VrctlTimelineBootstrap;
  try {
    timeline = JSON.parse(json) as VrctlTimelineBootstrap;
  } catch {
    return null;
  }
  const loggedIn =
    typeof timeline?.personal?.loggedIn === 'boolean' ? timeline.personal.loggedIn : null;
  return { timeline, loggedIn };
}
