import { fetch, Headers } from 'undici';
import { getConfig } from '../config/index.js';
import { vrctlAuthManager } from './auth.js';

export interface VrctlClientDeps {
  fetchImpl?: typeof fetch;
  siteUrl?: string;
  apiBaseUrl?: string;
  userAgent?: string;
  auth?: {
    getCookieHeader: (url: string) => Promise<string>;
    setCookiesFromResponse: (url: string, setCookieHeaders: string[]) => Promise<void>;
  };
}

export class VrctlClient {
  private fetchImpl: typeof fetch;
  private siteUrl: URL;
  private apiBaseUrl: URL;
  private userAgent: string;
  private auth: NonNullable<VrctlClientDeps['auth']>;

  constructor(deps: VrctlClientDeps = {}) {
    const config = getConfig();
    this.fetchImpl = deps.fetchImpl ?? fetch;
    this.siteUrl = new URL(deps.siteUrl ?? config.vrctl.siteUrl);
    this.apiBaseUrl = new URL(deps.apiBaseUrl ?? config.vrctl.apiBaseUrl);
    this.userAgent = deps.userAgent ?? config.vrctl.userAgent;
    this.auth = deps.auth ?? {
      getCookieHeader: (url) => vrctlAuthManager.getCookieHeader(url),
      setCookiesFromResponse: (url, setCookieHeaders) =>
        vrctlAuthManager.setCookiesFromResponse(url, setCookieHeaders),
    };
  }

  buildSiteUrl(pathname: string, query?: Record<string, string | undefined>): string {
    const url = new URL(pathname, this.siteUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  buildApiUrl(pathname: string, query?: Record<string, string | undefined>): string {
    const url = new URL(pathname, this.apiBaseUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        url.searchParams.set(k, v);
      }
    }
    return url.toString();
  }

  private async request(
    url: string,
    options: { accept: string }
  ): Promise<{ status: number; bodyText: string }> {
    const headers = new Headers();
    headers.set('user-agent', this.userAgent);
    headers.set('accept', options.accept);
    const cookieHeader = await this.auth.getCookieHeader(url);
    if (cookieHeader) headers.set('cookie', cookieHeader);

    const res = await this.fetchImpl(url, { method: 'GET', headers });
    const setCookieHeaders = res.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length) {
      await this.auth.setCookiesFromResponse(url, setCookieHeaders);
    }
    const bodyText = await res.text();
    return { status: res.status, bodyText };
  }

  async getSiteHtml(pathname: string, query?: Record<string, string | undefined>): Promise<string> {
    const url = this.buildSiteUrl(pathname, query);
    const { status, bodyText } = await this.request(url, { accept: 'text/html,*/*;q=0.8' });
    if (status < 200 || status >= 300) {
      throw new Error(`vrc.tl HTML request failed (${status})`);
    }
    return bodyText;
  }

  async getApiJson<T = unknown>(
    pathname: string,
    query?: Record<string, string | undefined>
  ): Promise<T> {
    const url = this.buildApiUrl(pathname, query);
    const { status, bodyText } = await this.request(url, { accept: 'application/json,*/*;q=0.8' });
    let data: unknown = null;
    try {
      data = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      // keep null
    }

    if (status < 200 || status >= 300) {
      const message =
        data && typeof data === 'object' && 'exception' in (data as Record<string, unknown>)
          ? String((data as Record<string, unknown>).exception)
          : 'Request failed';
      throw new Error(`vrc.tl API request failed (${status}): ${message}`);
    }
    return data as T;
  }
}

export function createVrctlClient(deps: VrctlClientDeps = {}): VrctlClient {
  return new VrctlClient(deps);
}

export const vrctlClient = createVrctlClient();
