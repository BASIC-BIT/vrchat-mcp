# Spec Drift

`specs/vrchat-openapi.yaml` is the **community** OpenAPI description
([vrchatapi/specification](https://github.com/vrchatapi/specification)), not one VRChat
publishes. It is reverse-engineered and maintained by volunteers, so it drifts from the live API
continuously and permanently. That is expected, not a bug in the spec.

**This file is the source of truth wherever the two disagree.** Consult it before trusting a spec
constraint, and add an entry whenever you find a new divergence — including ones you decide not to
work around, so the next person doesn't re-investigate.

Live API behavior always wins over the spec. Where a fix is needed, prefer
`scripts/postprocess-schemas.ts` over editing the spec: `specs/vrchat-openapi.yaml` is gitignored,
so spec edits are local-only and vanish on a fresh clone.

---

## Confirmed divergences

### `GroupPermissions` enum is incomplete
*Found 2026-08-02 · patched in `postprocess-schemas.ts`*

Spec lists 25 values. `GET /groups/{groupId}/permissions` returns **27**, the extras being
`group-instance-announcement-create` and `group-instance-bypass-avatar-performance`. Any role
update using them failed zod validation before reaching VRChat.

### `Group.transferTargetId` is nullable
*Found 2026-08-02 · patched in `postprocess-schemas.ts`*

Spec types it as a non-null `UserID`. Groups with no pending ownership transfer return `null`,
which failed the whole `getGroup` parse and took `vrchat_group_profile` down with it.

### `InviteRequest.instanceId` needs the worldId prefix
*Found 2026-08-02 · handled in `services/invites/curated.ts`*

The spec describes `InstanceID` as the bare instance part
(`12345~hidden(usr_…)~region(eu)`). `POST /invite/{userId}` rejects that form with
`400: Invalid location` and requires the **full** `worldId:instanceId~…` string.

Verified live: full string → `200`, worldId stripped → `400`.

### Role permissions have undocumented prerequisites
*Found 2026-08-02*

Not a schema issue — the API enforces dependencies the spec never mentions.
`group-members-remove` and `group-bans-manage` both require `group-members-manage` on the same
role, otherwise `PUT /groups/{groupId}/roles/{roleId}` returns
`400: Role missing required permissions: group-members-manage`.

### `UserStatus` has no color mapping
*Found 2026-08-02*

The spec defines the enum but says nothing about colors, because they are a client-UI concept.
For reference: **Join Me = blue, Active = green, Ask Me = orange, Busy = red.**

---

## Suspected, not yet verified

### `UpdateAvatarRequest.description` minLength
Spec declares `minLength: 1`, which would make an empty description an invalid request and leave
no way to clear one. BASIC reports descriptions are effectively optional in practice, so
`vrchat_avatar_update` deliberately does **not** enforce a minimum and lets VRChat decide. If a
`description: ""` write is ever seen failing, record the result here and add the constraint.
