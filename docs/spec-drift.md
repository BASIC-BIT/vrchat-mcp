# Spec drift and generator compatibility

The community [VRChat specification](https://github.com/vrchatapi/specification) describes
observed API behavior. The live API remains the source of truth. This record distinguishes
current API discrepancies, upstream fixes, and local generator problems. Recheck dated
observations before relying on them for substantive changes.

## Generation input, 2026-09-08

- Published source: https://vrchat.community/openapi.yaml
- OpenAPI 3.0.3, document version 1.20.9.
- Downloaded bundle SHA-256: `67595df7176ed1690a05ce0603427ea94c72234226cf77f880735ddd48cd5cb5`.
- Audited upstream main: [`5542b9951b2872a0735e30d6ca0e47509814b346`](https://github.com/vrchatapi/specification/commit/5542b9951b2872a0735e30d6ca0e47509814b346).
  The audited definitions agree with the bundle; this is not a byte-equivalence claim.

Download the bundle to the gitignored `specs/vrchat-openapi.yaml`, then run
`npm run generate:schemas`, `npm run generate:test-schemas`, and
`npm run generate:tools-docs`. Record its version/hash when refreshing. The published URL is
mutable; compare the hash when reproducing this checkpoint. Do not manually edit generated
schemas or the downloaded spec. Generator compatibility changes belong in
`scripts/postprocess-schemas.ts`; endpoint-specific parser selection belongs in
`src/services/api/client.ts`.

## Fixed upstream or corrected locally

| Historical workaround                                                                       | Current disposition                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing `group-instance-announcement-create` and `group-instance-bypass-avatar-performance` | Both exist upstream and in the fresh live permission catalog. Removed local enum injection. Upstream includes 28 enum values including `*`; GET returns 27 permission records.                           |
| Two-element `World.instances` tuples                                                        | Upstream now documents triples: instance ID, occupancy, language metadata. Four live public worlds corroborated triples. Removed the unbounded-array workaround; retained exact length 3.                |
| Missing calendar `occurrenceKind`                                                           | Upstream now models `single`, `series`, `occurrence`. Generated parsing rejects unknown/malformed JSON values before deletion. The curated `single_event` name and missing-field legacy behavior remain. |
| Sparse world-search packages                                                                | Already modeled by `LimitedWorld` / `LimitedUnityPackage`. Our search consumer used `World`; it now uses `LimitedWorld`. Removed optional `UnityPackage.id`/`assetVersion` patches.                      |

Raw authenticated `GET /worlds?search=Black+Cat&n=5&offset=0` returned 30 packages across five
worlds. Every package had only `created_at`, `platform`, and `unityVersion`. This complete
package object is representative:

```json
{ "created_at": null, "platform": "android", "unityVersion": "2017.4.15f1" }
```

A raw detail GET for the same public Black Cat world returned 22 complete packages. Earlier
detail reads across four worlds found 75 complete packages. The search response is evidence
for selecting the existing limited schema, not for loosening the full package schema.

## Retained generator compatibility

`openapi-zod-client` 1.18.3 still drops `nullable: true` siblings on ID references. Upstream
already declares these nullable; do not report them as missing spec declarations:

- `CalendarEvent.imageId`
- `Group.transferTargetId`
- `GroupPost.editorId` and `imageId`
- `Instance.categoryId`

The postprocessor preserves those nulls. Fresh group/calendar reads confirmed explicit nulls;
GroupPost null handling also has a historical regression fixture. `Instance.categoryId` is a
newly modeled nullable field whose generated validator otherwise rejected the declared null.

The generated `NotificationEmpty` branch must be strict. Its upstream
`additionalProperties: false` constraint means only `{}` matches. The generator otherwise
strips any populated object to `{}`, swallowing sent-invite details and notification-v2 data
before later union branches run. A scoped postprocess correction and payload-preservation
regressions cover this.

Zod 3-to-4 `z.record` signatures (including formatter-split calls), the Node `File` runtime
workaround, and removal of generated `@ts-nocheck` remain local toolchain concerns.

## Current API discrepancies and clarifications

### Full favorite-world packages can have `created_at: null`

Reproduced twice on 2026-09-08 via raw authenticated `GET /worlds/favorites?n=5&offset=0`.
The response contained 32 full package entries; two had null creation timestamps, while every
package included `id` and `assetVersion`. This differs from upstream's non-null optional
`UnityPackage.created_at`, used by `FavoritedWorld`. Retain only the timestamp-nullability
patch. The live search response above is a separate, already-modeled case.

### Favorite-world `n` is not a reliable upper bound

Raw single requests on 2026-09-08 returned 2 entries for `n=1`, 4 for `n=2`, and 8 for `n=5`,
all with offset 0 and HTTP 200. There was no local pagination or unrolling. The spec describes
`n` as the number of objects to return. The underlying expansion mechanism is unverified;
this evidence does not establish replacement offset or pagination rules.

### Invite request `instanceId` needs the full location

Historical live comparison on 2026-08-02: `POST /invite/{userId}` with a full
`worldId:instanceId` returned 200; a bare instance ID returned `400 Invalid location`.
`InviteRequest` still references the shared bare `InstanceID` without explaining this
endpoint-specific requirement. The curated invite builder already supplies the full location.

A non-delivering probe on 2026-09-08 first confirmed the nil recipient ID was nonexistent
(GET 404). Both bare and full synthetic destinations then returned 403 because the recipient
was not a friend. That ordering masks location validation, so it does not refresh the earlier
200/400 comparison. No real recipient was invited. Do not change the shared InstanceID:
`inviteMyselfTo` uses separate worldId and instanceId path parameters.

### `canRequestInvite: true` is rejected for group creation

Reverified 2026-09-08 in an owned one-member test group. New members-only group creation with
`true` returned HTTP 400: `Cannot add canRequestInvite to non-private instances` (API message
punctuation omitted here). False and omitted each returned 200 with `canRequestInvite: false`.
Both created instances were immediately hard closed; subsequent GETs confirmed past closedAt,
hardClose true, active false, and zero occupants. No invites or announcements were sent.

Upstream already describes private invite+ and rejection for friends. Clarify the group case
and true-versus-false distinction on CreateInstanceRequest. Do not generalize this test into
an invariant of all Instance responses or claim every other creation type was tested.

### Role permission prerequisites are enforced

Reverified 2026-09-08 using one temporary, unassigned role in the owned test group:

| PUT permissions                               | Result                                       |
| --------------------------------------------- | -------------------------------------------- |
| `group-members-remove` alone                  | 400, missing required `group-members-manage` |
| `group-bans-manage` alone                     | 400, same prerequisite                       |
| Either permission plus `group-members-manage` | 200                                          |

The fresh GET permission catalog independently lists the prerequisite in `dependsOn`.
Upstream now exposes this field, but describes it vaguely. Clarify prerequisite direction
and enforcement instead of proposing a duplicate field. The temporary role was deleted;
a follow-up GET verified the original role list and permissions. Existing roles were not edited.

### Avatar `acknowledgements` can be null

A raw authenticated `GET /avatars/{avatarId}` on 2026-09-08 at 09:26:31 UTC returned HTTP 200
with an explicitly present `acknowledgements: null`. Upstream Avatar declares this optional
field as a non-null string. That already broke avatar detail parsing before this refresh;
it is a newly discovered existing discrepancy. A narrow response-only postprocessor patch
allows null. No avatar metadata was changed for this read.

## Pending avatar validation

- `UpdateAvatarRequest.description` still has minLength 1. Whether an update can clear it to
  an empty string remains unverified; an empty returned description alone would not prove it.
- The shared `ReleaseStatus` includes `all`, historically introduced as a search filter.
  Its validity on avatar writes remains unverified. The curated metadata editor continues to
  accept only public/private/hidden. A local restriction is not proof of server rejection.

Use a user-selected disposable, non-active avatar for any write probes and restore its state.
Do not publish these hypotheses as confirmed defects.

## Existing upstream work and non-issues

Existing-instance calendar linking remains covered by [issue #596](https://github.com/vrchatapi/specification/issues/596)
and [PR #597](https://github.com/vrchatapi/specification/pull/597), still open at audit time.
Retain the scoped local operation fallback until the upstream operation is published.

The 2026-09-08 duplicate audit examined all returned upstream issue/PR titles and bodies plus
candidate searches including comments. Related historical items include #156 (sparse search
examples in a different bug), #266/#341 (package URL nullability), #595 (dependsOn), and
#85/#240 (releaseStatus search flag/shared enum). No direct duplicate was found for the
remaining candidate reports; search results are point-in-time, not proof of universal absence.
Upstream issue drafts remain local and unfiled.

User-status colors are client UI presentation, not a REST schema defect.
