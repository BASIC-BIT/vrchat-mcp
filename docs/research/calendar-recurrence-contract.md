# Calendar recurrence contract, 2026-09-09

Observed 07:00:04-07:00:19 UTC in a freshly verified owned one-member test group.
Every fixture was a new draft, accessType group, notifications false. No instances,
followers, publication, or announcements were requested.

| Operation                                            | Observation                                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create daily series, count 3                         | HTTP200, parent retained series kind and recurrence; three draft children were listed.                                                                                                      |
| Edit one child title                                 | Only that child changed; sibling and parent titles remained unchanged.                                                                                                                      |
| Edit parent description                              | Ordinary sibling inherited description; previously customized child retained its old description.                                                                                           |
| Parent title update omitting recurrence              | Stored schedule was unchanged.                                                                                                                                                              |
| Replace recurrence end with afterDate local datetime | HTTP200 with null response body; parent GET proved the new end was stored. Old child IDs later returned404, replacement children appeared.                                                  |
| recurrence:null                                      | Definite HTTP400. Curated client rejects clearing locally; omission preserves recurrence. No claim that null deletes or converts anything.                                                  |
| Cleanup                                              | Conductor freshly verified draft ownership, deleted only the new parent (HTTP200 at07:02:57 UTC), read all six known IDs as404, and verified zero active fixture entries in the month list. |

Recovery receipts are local operational notes, not tracked research artifacts.
The initial probe incorrectly classified its own definite HTTP400 exception as
indeterminate and paused cleanup. The checked-in probe preserves status, performs
fresh owner/draft verification, and deletes only its recorded new parent. No failed
mutation was retried. Automatic approval initially blocked cleanup; a narrower
parent-only action with fresh evidence was approved and completed.

Local policy validates named Intl timezones, positive intervals/counts, weekly-only
unique weekdays, and real offset-free end datetimes. This is client policy, not a
claim that every Intl timezone is supported by VRChat. Omitted end is indefinite
per the upstream schema. The client does not implement recurrence generation.

## Curated-path and DST validation

Observed 15:11:41-15:11:50 UTC after fresh owner and one-member checks. The
probe created one new draft series through the real curated create builder and
core transport, recorded the raw returned ID before assertions, and parsed that
exact response with `CalendarEvent.partial()`, matching the service parser.
The create service wrapper and MCP handler remain covered by local tests.

The two generated draft children both represented 09:00 local in
`America/Indiana/Indianapolis`: October 31 was `13:00Z` at UTC-04:00 and
November 1 was `14:00Z` at UTC-05:00. This verifies the tested daily schedule
across that DST transition. It does not establish gap/fold handling or every
timezone rule.

The real curated update service accepted an explicit `targetKind: series` title
edit, and a parent read showed the new title. Both children also inherited it.
The same service rejected `recurrence: null` locally before a wire write. The
probe freshly rechecked the recorded parent ID, group ownership, and draft status,
then deleted only that parent. The delete returned HTTP200; October and November
queries both returned no remaining children (`cleanupRemaining: 0`).

## Limitations

The live check covers one daily two-occurrence series and one DST boundary.
Gap/fold behavior, month-end recurrence, leap-year behavior, and end-date
inclusivity remain unverified. The client validates inputs and passes scheduling
to VRChat; it does not implement a second recurrence engine.
