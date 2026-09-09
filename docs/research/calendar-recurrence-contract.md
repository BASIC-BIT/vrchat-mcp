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

## Limitations

Final curated-path live verification and a separate two-occurrence DST experiment
were blocked by automatic approval review before execution. Unit tests verify the
curated request path, and the raw live experiment above verifies the observed
protocol behavior. DST offsets, gap/fold handling, month-end, leap-year behavior,
and end-date inclusivity remain unverified. Do not claim a fully live-validated
curated recurrence lifecycle until that additional authorized check succeeds.

The prepared final probe uses the real curated create builder and core transport,
records the raw returned ID before assertions, then parses that exact response with
CalendarEvent.partial(), matching the service response parser. The create service
wrapper and MCP handler remain covered by local tests, not this live step. Updates
use the real curated service. The probe verifies two draft children and records whether their dates match 09:00 local,
13:00Z on October 31 and 14:00Z on November 1, before its title update. A differing UTC schedule is recorded as a discrepancy and does not skip the independent title/null checks or cleanup. It does not run
a second scheduling engine.
