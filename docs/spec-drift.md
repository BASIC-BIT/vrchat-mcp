# Spec Drift

`specs/vrchat-openapi.yaml` is the **community** OpenAPI description
([vrchatapi/specification](https://github.com/vrchatapi/specification)), not one VRChat
publishes. It is reverse-engineered and maintained by volunteers, so it drifts from the live API
continuously and permanently. That is expected, not a bug in the spec.

**The live API is the source of truth — not the spec, and not this file.** This is a log of
divergences we have actually observed, with dates and evidence, so nobody re-investigates the same
thing from scratch.

Every entry is a point-in-time observation and can go stale. VRChat may change behavior, the
community spec may catch up, and a workaround recorded here may become unnecessary or actively
wrong. **Before making a substantive change that depends on an entry, re-verify it against the
live API and update the entry with what you found.** An old date is a reason for suspicion, not
confidence.

Add an entry whenever you find a new divergence, including ones you decide not to work around.
Where a fix is needed, prefer `scripts/postprocess-schemas.ts` over editing the spec:
`specs/vrchat-openapi.yaml` is gitignored, so spec edits are local-only and vanish on a fresh
clone.

---

## Confirmed divergences

### `GroupPermissions` enum is incomplete
*Observed 2026-08-02, not re-verified since · patched in `postprocess-schemas.ts`*

Spec lists 25 values. `GET /groups/{groupId}/permissions` returns **27**, the extras being
`group-instance-announcement-create` and `group-instance-bypass-avatar-performance`. Any role
update using them failed zod validation before reaching VRChat.

### `Group.transferTargetId` is nullable
*Observed 2026-08-02, not re-verified since · patched in `postprocess-schemas.ts`*

Spec types it as a non-null `UserID`. Groups with no pending ownership transfer return `null`,
which failed the whole `getGroup` parse and took `vrchat_group_profile` down with it.

### `InviteRequest.instanceId` needs the worldId prefix
*Observed 2026-08-02, not re-verified since · handled in `services/invites/curated.ts`*

The spec describes `InstanceID` as the bare instance part
(`12345~hidden(usr_…)~region(eu)`). `POST /invite/{userId}` rejects that form with
`400: Invalid location` and requires the **full** `worldId:instanceId~…` string.

Verified live: full string → `200`, worldId stripped → `400`.

### Role permissions have undocumented prerequisites
*Observed 2026-08-02, not re-verified since*

Not a schema issue — the API enforces dependencies the spec never mentions.
`group-members-remove` and `group-bans-manage` both require `group-members-manage` on the same
role, otherwise `PUT /groups/{groupId}/roles/{roleId}` returns
`400: Role missing required permissions: group-members-manage`.

### `UserStatus` has no color mapping
*Observed 2026-08-02, not re-verified since*

The spec defines the enum but says nothing about colors, because they are a client-UI concept.
For reference: **Join Me = blue, Active = green, Ask Me = orange, Busy = red.**

### Existing instances can be linked to calendar events with an undocumented `PUT`
*Observed and re-verified 2026-08-31 · handled by the curated instance linker*

The community spec has no update operation for an existing instance. The live API accepts
`PUT /instances/{worldId}:{instanceId}` with `{"calendarEntryId":"cal_..."}` and returns the
updated `Instance`. `PATCH` on the same path returned `405`.

VRChat returned `400` when the event was outside its link window, with the rule that an event
must start within six hours or have ended within the previous six hours. Moving the test event
inside that window made the same `PUT` return `200`. Sending `{"calendarEntryId":null}` also
returned `200` and removed the link, but the curated tool intentionally exposes linking only.

Verified live with an owned disposable test group, event, and group-only instance. No invitation
or announcement was sent. Because the endpoint is missing from the spec, `core/client.ts` carries
a narrow operation fallback until the community spec catches up. Raw access is blocked and the
curated tool sends only `calendarEntryId` after checking the configured group allowlist and both
objects' ownership.

---

## Suspected, not yet verified

### `UpdateAvatarRequest.description` minLength
Spec declares `minLength: 1`, which would make an empty description an invalid request and leave
no way to clear one. BASIC reports descriptions are effectively optional in practice, so
`vrchat_avatar_update` deliberately does **not** enforce a minimum and lets VRChat decide. If a
`description: ""` write is ever seen failing, record the result here and add the constraint.
