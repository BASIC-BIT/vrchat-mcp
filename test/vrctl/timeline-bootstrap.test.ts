import { describe, it, expect } from 'vitest';
import { parseTimelineBootstrap } from '../../src/vrctl/timelineBootstrap.js';

describe('vrc.tl timeline bootstrap parser', () => {
  it('extracts window.timeline JSON and loggedIn state', () => {
    const html = `<!doctype html><html><body>
      <script>
        window.timeline = {"misc":{"categories":[{"id":1,"name":"Music","urlName":"music"}],"tags":[{"id":1,"name":"NSFW","eventsHiddenForNotLoggedIn":true,"tagHiddenForNotLoggedIn":true}]},"personal":{"loggedIn":false}};
      </script>
    </body></html>`;

    const parsed = parseTimelineBootstrap(html);
    expect(parsed).not.toBeNull();
    expect(parsed!.loggedIn).toBe(false);
    expect(parsed!.timeline.misc?.categories?.[0]?.id).toBe(1);
    expect(parsed!.timeline.misc?.tags?.[0]?.name).toBe('NSFW');
  });

  it('returns null when window.timeline is missing', () => {
    const parsed = parseTimelineBootstrap('<html><body>nope</body></html>');
    expect(parsed).toBeNull();
  });
});
