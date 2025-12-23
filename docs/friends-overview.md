# Friends Overview (Location-Centric)

`vrchat_friends_overview` is designed to mirror the VRChat social tab: it groups your online
friends by location and includes instance details per location.

## Inputs
- `includeOffline` (boolean, optional): include offline friends in counts. Defaults to true.
- `status` / `statusFilter` (string or string[], optional): filter by status (e.g., `active`, `busy`, `offline`, `online`).
- `minInstanceUserCount` (number, optional): only include locations where the instance has at least this many users.
- `instanceDetailLevel` (`summary` | `full`, optional): controls how much of the instance payload is returned. Defaults to `summary`.

## Outputs (high level)
- `totals.all`: counts for the full friends list (unfiltered).
- `totals.filtered`: counts after status filter + minInstanceUserCount are applied.
- `locations`: array of location buckets, sorted by `friendCount` desc.

Each location bucket contains:
- `location` (raw location string)
- `worldId`, `worldName`, `instanceId`
- `groupId`, `groupName`, `groupShortCode`
- `accessType`, `region`
- `instance` (summary by default, full if `instanceDetailLevel=full`)
- `friendCount`
- `friends`: `{ userId, displayName, status }[]`

## Notes
- If `minInstanceUserCount` is set, instance fetch failures are treated as errors (no partial results).
- Group/world names are best-effort enrichments from their respective APIs.
