# Gallery image editing and deletion research

Researched 2026-09-07 against repository head `d45475f69bd3cbc0ef59be90c7816be943dd3d8c`.
Scope: existing tool surface and source inspection. No VRChat writes or deletions were performed.

Implementation follow-up: the approved design adds `vrchat_gallery_images` and
`vrchat_gallery_image_delete` locally. See [curated tools](curated-tools.md) for the new contract.
The findings below describe the research baseline, not a claim that the new tools are deployed.

## Findings

The repository has a dedicated **personal-gallery upload** tool, but no dedicated gallery-image
edit or delete wrapper. Deletion is exposed through the generic `vrchat_delete` router. Group
gallery settings can be edited through `vrchat_write`; that is different from editing an image's
pixels or replacing an existing image. Sources: [curated upload registration](../src/tools/curated/uploads.ts),
[generated write/delete registration](../src/core/writeToolRegistry.ts), and
[generated operation catalog](tools.md).

| Intent | Existing operation / tool | Scope and identifiers |
| --- | --- | --- |
| Find personal gallery images | `vrchat_read`, `getFiles` | Query `tag: "gallery"`, with `n` and `offset`; returned objects are files. |
| Inspect one file | `vrchat_read`, `getFile` | `params.fileId`; includes file versions. |
| Upload new personal gallery image | Local source: `vrchat_gallery_image_upload` | Absolute `imagePath`; creates an account-gallery file and returns `fileId`. |
| Delete personal gallery file | `vrchat_delete`, `deleteFile` | `params.fileId`; `DELETE /file/{fileId}` deletes the File object, not merely a group gallery entry. |
| List group gallery images | `vrchat_read`, `getGroupGalleryImages` | `groupId`, `groupGalleryId`; optional pagination and `approved` filter. |
| Add existing file to group gallery | `vrchat_write`, `addGroupGalleryImage` | `groupId`, `groupGalleryId`, body `{ "fileId": "file_..." }`. |
| Remove one group gallery image | `vrchat_delete`, `deleteGroupGalleryImage` | `groupId`, `groupGalleryId`, **`groupGalleryImageId`**. This is a distinct ID from `fileId`. |
| Edit group gallery settings | `vrchat_write`, `updateGroupGallery` | `groupId`, `groupGalleryId`; gallery name, description, members-only flag and role permissions. |
| Reorder group gallery images | `vrchat_write`, `setGroupGalleryFileOrder` | Body `{ "galleryId": "...", "ids": ["file_..."] }`; IDs are File IDs in the local schema. |
| Delete entire group gallery | `vrchat_delete`, `deleteGroupGallery` | `groupId`, `groupGalleryId`; broader than removing one image. |

Operation names and routes: [tool catalog](tools.md). Detailed local request shapes and endpoint
descriptions: [community spec](../specs/vrchat-openapi.yaml), sections `/files`, `/file/{fileId}`,
`/files/order`, and `/groups/{groupId}/galleries/...`. The spec is gitignored and may not exist on a
fresh checkout. Tracked schemas preserve the [gallery request and response types](../src/generated/vrchat-schemas.ts),
including separate `GroupGalleryImage.id` and `GroupGalleryImage.fileId` fields. These are source
facts about the tool definitions, not proof that every upstream endpoint currently behaves as described.

## What editing does and does not cover

The official VRChat Wiki documents a **64-photo limit** for the personal Photo Gallery. This is
the documented product limit, not an API quota tested in this investigation. Source:
[VRChat Wiki: Photo Gallery](https://wiki.vrchat.com/wiki/Inventory#Photo_Gallery), checked by the
coordinating agent on 2026-09-07. The personal account gallery is the upload pool used before
attaching returned image files to posts or events; group gallery entries are separate records
referencing files. Do not interpret the personal 64-photo limit as a verified group-gallery entry
limit. Sources: [curated upload documentation](curated-tools.md) and
[group gallery image schema](../src/generated/vrchat-schemas.ts).

`UpdateGroupGalleryRequest` defines `name`, `description`, `membersOnly`, `roleIdsToAutoApprove`,
`roleIdsToManage`, `roleIdsToSubmit`, and `roleIdsToView`. There is no image-content field or
individual image update operation in the inspected catalog/spec. Sources:
[tracked schemas](../src/generated/vrchat-schemas.ts) and [tool catalog](tools.md).

The generic file pipeline includes `createFileVersion`, `startFileDataUpload`, and
`finishFileDataUpload`, but their existence does **not** establish a supported personal-gallery
image replacement workflow. Whether the live gallery accepts such replacements, whether consumers
follow a new version, and whether references survive replacement are unverified. Sources:
[file operation catalog](tools.md) and [local spec](../specs/vrchat-openapi.yaml).

A possible replacement workflow is to edit a local image, upload it as a new file, and update the
consumer or group gallery entry to reference the new file. This is an inference from the separate
upload/add/delete operations, not a verified atomic edit feature. Existing personal File deletion
should not be treated as equivalent to group-gallery removal; effects on posts, events, other
references, and orphan cleanup remain unverified. Sources:
[upload result schema](../src/models/uploads.ts), [group image schema](../src/generated/vrchat-schemas.ts),
and [local endpoint descriptions](../specs/vrchat-openapi.yaml).

## Connected runtime differs from this checkout

The coordinating agent checked the connected server with `vrchat_operations` (`query: "gallery"`
and `query: "file"`, `view: "all"`) and `vrchat_operation_details` on 2026-09-07. That runtime
advertised `deleteFile`, `deleteGroupGalleryImage`, `updateGroupGallery`, `setGroupGalleryFileOrder`,
and `getFiles` with the shapes above. These read-only metadata calls establish advertised
availability, not successful upstream mutation behavior.

The coordinating agent also successfully called `vrchat_read` with `operationId: "getFiles"`,
`params: { "tag": "gallery", "n": 1, "offset": 0 }`, selecting `id`, `tags`, and `name`.
The live response contained one File tagged `gallery`; its personal identifier is omitted here.
This confirms the personal-gallery read path on the connected server at research time.

The connected tool registry did not contain `vrchat_gallery_image_upload`, and its metadata
advertised the generic `uploadImage` and `uploadGalleryImage` operations as available. In contrast,
this checkout registers `vrchat_gallery_image_upload`, restricts `uploadImage` to that curated
wrapper, and blocks legacy `uploadGalleryImage`. Sources: the coordinating agent's connected
registry/operation metadata observations in this research task;
[local upload registration](../src/tools/curated/uploads.ts),
[operation policy](../src/core/operationPolicy.ts), and
[generated overrides](../src/core/generatedToolOverrides.ts).
The runtime revision/configuration was not established. Do not assume this checkout describes the
running server, or that advertised generic upload routes can transport multipart image files.

## Guard behavior and verification limits

The generic delete router calls `callOperation` directly and supplies destructive tool annotations.
It does not implement a curated `confirmId` handshake. Availability depends on generated-tool
configuration and operation policy. Sources: [write router](../src/core/writeToolRegistry.ts),
[write schema](../src/schemas/write.ts), and [availability computation](../src/core/generatedOperations.ts).

The shared client enforces write-disable configuration and checks the group allowlist for writes
whose operation includes a `groupId` path or parameter. This covers the group-gallery paths above.
However, `setGroupGalleryFileOrder` is `PUT /files/order` with a `galleryId` body and no `groupId`
parameter, so that operation does not pass through the client's group allowlist branch as currently
implemented. This is a local code observation, not a demonstrated upstream authorization bypass.
Sources: [`isGroupOperation` and `enforceOperationPolicy`](../src/core/client.ts) and
[`GroupGalleryFileOrderRequest`](../src/generated/vrchat-schemas.ts).

No live image deletion, image replacement, reference-survival test, or permission test was run.
The repo explicitly treats the community spec as fallible and live API behavior as authoritative:
[spec drift policy](spec-drift.md). Future implementation should verify the narrowly intended
mutation with an explicitly authorized disposable image rather than infer behavior from the spec.

Documentation-only validation: `npm test -- test/core/write-tool-registry.test.ts test/core/write-block.test.ts`
passed on 2026-09-07, 2 files and 10 tests. No application source was changed.
