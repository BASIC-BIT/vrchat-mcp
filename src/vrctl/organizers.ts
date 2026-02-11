import { z } from 'zod';
import { buildCacheKey, cacheManager } from '../services/cache.js';
import { createVrctlClient, type VrctlClient } from './client.js';
import { getConfig } from '../config/index.js';

const OrganizerSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string().optional(),
    shortCode: z.string().optional(),
    vrcGroup: z.string().optional(),
    discordInv: z.string().optional(),
    logo: z.string().nullable().optional(),
    banner: z.string().nullable().optional(),
    isSupporter: z.boolean().optional(),
    providesInstances: z.boolean().optional(),
    showOnlyIfFavourite: z.boolean().optional(),
  })
  .passthrough();

export type VrctlOrganizerRecord = z.infer<typeof OrganizerSchema>;

export interface VrctlOrganizerSummary {
  name: string;
  slug?: string;
  shortCode?: string;
  vrcGroupUrl?: string;
  vrchatGroupId?: string;
  discordInv?: string;
  isSupporter?: boolean;
  providesInstances?: boolean;
  showOnlyIfFavourite?: boolean;
}

export interface VrctlOrganizersServiceDeps {
  client?: Pick<VrctlClient, 'getApiJson'>;
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function extractVrchatGroupId(vrcGroupUrl?: string): string | undefined {
  if (!vrcGroupUrl) return undefined;
  const match = /(grp_[A-Za-z0-9-]+)/.exec(vrcGroupUrl);
  return match ? match[1] : undefined;
}

function summaryFromOrganizer(org: VrctlOrganizerRecord): VrctlOrganizerSummary {
  return {
    name: org.name,
    slug: org.slug,
    shortCode: org.shortCode,
    vrcGroupUrl: org.vrcGroup,
    vrchatGroupId: extractVrchatGroupId(org.vrcGroup),
    discordInv: org.discordInv,
    isSupporter: org.isSupporter,
    providesInstances: org.providesInstances,
    showOnlyIfFavourite: org.showOnlyIfFavourite,
  };
}

function scoreMatch(haystack: string, needle: string): number {
  if (!needle) return 0;
  if (haystack === needle) return 100;
  if (haystack.startsWith(needle)) return 80;
  if (haystack.includes(needle)) return 60;
  return 0;
}

export class VrctlOrganizersService {
  private client: Pick<VrctlClient, 'getApiJson'>;

  constructor(deps: VrctlOrganizersServiceDeps = {}) {
    this.client = deps.client ?? createVrctlClient();
  }

  async listOrganizersCached(): Promise<VrctlOrganizerRecord[]> {
    const config = getConfig();
    if (!config.vrctl.enabled) {
      throw new Error(
        'vrc.tl tools are disabled. Set vrctl.enabled=true (or VRCHAT_MCP_VRCTL_ENABLED=1).'
      );
    }

    const cacheKey = buildCacheKey('vrctl:organizers', {});
    const ttlMs = 10 * 60_000;

    return await cacheManager.getOrSet(cacheKey, ttlMs, ['vrctl:organizers'], async () => {
      const data = await this.client.getApiJson('/organizers');
      const arr = z.array(OrganizerSchema).parse(data);
      return arr;
    });
  }

  async searchOrganizers(
    query: string,
    maxResults = 20
  ): Promise<{ total: number; matches: VrctlOrganizerSummary[] }> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { total: 0, matches: [] };
    }
    const needle = normalize(trimmed);
    const orgs = await this.listOrganizersCached();

    const scored = orgs
      .map((org) => {
        const fields = [org.name, org.slug, org.shortCode, org.vrcGroup]
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
          .map(normalize);
        let score = 0;
        for (const field of fields) {
          score = Math.max(score, scoreMatch(field, needle));
        }
        const groupId = extractVrchatGroupId(org.vrcGroup);
        if (groupId) {
          score = Math.max(score, scoreMatch(normalize(groupId), needle));
        }
        return { org, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.org.name.localeCompare(b.org.name));

    const limited = scored.slice(0, Math.max(1, Math.min(100, maxResults)));
    return {
      total: scored.length,
      matches: limited.map((entry) => summaryFromOrganizer(entry.org)),
    };
  }

  async getOrganizerProfile(input: {
    vrchatGroupId?: string;
    slug?: string;
    shortCode?: string;
  }): Promise<VrctlOrganizerSummary | null> {
    const { vrchatGroupId, slug, shortCode } = input;
    const orgs = await this.listOrganizersCached();

    if (vrchatGroupId) {
      const norm = normalize(vrchatGroupId);
      const found = orgs.find((o) => normalize(extractVrchatGroupId(o.vrcGroup) ?? '') === norm);
      return found ? summaryFromOrganizer(found) : null;
    }

    if (slug) {
      const norm = normalize(slug);
      const found = orgs.find((o) => normalize(o.slug ?? '') === norm);
      return found ? summaryFromOrganizer(found) : null;
    }

    if (shortCode) {
      const norm = normalize(shortCode);
      const found = orgs.find((o) => normalize(o.shortCode ?? '') === norm);
      return found ? summaryFromOrganizer(found) : null;
    }

    return null;
  }
}

export function createVrctlOrganizersService(
  deps: VrctlOrganizersServiceDeps = {}
): VrctlOrganizersService {
  return new VrctlOrganizersService(deps);
}

export const vrctlOrganizersService = createVrctlOrganizersService();
