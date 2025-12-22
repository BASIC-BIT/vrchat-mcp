# Read Tools Inventory (GET endpoints)

Source: specs/vrchat-openapi.yaml (downloaded 2025-12-20T23:33:01.494Z)

Spec: VRChat API Documentation (1.20.5)

Total GET operations: 120

## Tag: authentication (7)

### checkUserExists
- method: GET
- path: /auth/exists
- summary: Check User Exists
- auth: no
- params:
  - email [query] (string) - Filter by email.
  - displayName [query] (string) - Filter by displayName.
  - username [query] (string) - Filter by Username.
  - excludeUserId [query] (string) - Exclude by UserID.

### confirmEmail
- method: GET
- path: /auth/confirmEmail
- summary: Confirm Email
- auth: no
- params:
  - id [query] (required) (string) - Target user for which to verify email.
  - verify_email [query] (required) (string) - Token to verify email.

### getCurrentUser
- method: GET
- path: /auth/user
- summary: Login and/or Get Current User Info
- auth: yes
- params: none

### getGlobalAvatarModerations
- method: GET
- path: /auth/user/avatarmoderations
- summary: Get Global Avatar Moderations
- auth: yes
- params: none

### getRecoveryCodes
- method: GET
- path: /auth/user/twofactorauth/otp
- summary: Get 2FA Recovery codes
- auth: yes
- params: none

### verifyAuthToken
- method: GET
- path: /auth
- summary: Verify Auth Token
- auth: yes
- params: none

### verifyLoginPlace
- method: GET
- path: /auth/verifyLoginPlace
- summary: Verify Login Place
- auth: no
- params:
  - userId [query] (string) - Filter by UserID.
  - token [query] (required) (string) - Token to verify login attempt.

## Tag: avatars (7)

### getAvatar
- method: GET
- path: /avatars/{avatarId}
- summary: Get Avatar
- auth: yes
- params:
  - avatarId [path] (required) - Must be a valid avatar ID.

### getAvatarStyles
- method: GET
- path: /avatarStyles
- summary: Get Avatar Styles
- auth: no
- params: none

### getFavoritedAvatars
- method: GET
- path: /avatars/favorites
- summary: List Favorited Avatars
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - search [query] (string) - Filters by world name.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.
  - userId [query] (string) - Target user to see information on, admin-only.

### getImpostorQueueStats
- method: GET
- path: /avatars/impostor/queue/stats
- summary: Get Impostor Queue Stats
- auth: yes
- params: none

### getLicensedAvatars
- method: GET
- path: /avatars/licensed
- summary: List Licensed Avatars
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getOwnAvatar
- method: GET
- path: /users/{userId}/avatar
- summary: Get Own Avatar
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### searchAvatars
- method: GET
- path: /avatars
- summary: Search Avatars
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - user [query] (string) - Set to `me` for searching own avatars.
  - userId [query] (string) - Filter by UserID.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.

## Tag: calendar (7)

### getCalendarEvents
- method: GET
- path: /calendar
- summary: List calendar events
- auth: yes
- params:
  - date [query] (string) - The month to search in.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getFeaturedCalendarEvents
- method: GET
- path: /calendar/featured
- summary: List featured calendar events
- auth: yes
- params:
  - date [query] (string) - The month to search in.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getFollowedCalendarEvents
- method: GET
- path: /calendar/following
- summary: List followed calendar events
- auth: yes
- params:
  - date [query] (string) - The month to search in.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getGroupCalendarEvent
- method: GET
- path: /calendar/{groupId}/{calendarId}
- summary: Get a calendar event
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - calendarId [path] (required) (string) - Must be a valid calendar ID.

### getGroupCalendarEventICS
- method: GET
- path: /calendar/{groupId}/{calendarId}.ics
- summary: Download calendar event as ICS
- auth: no
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - calendarId [path] (required) (string) - Must be a valid calendar ID.

### getGroupCalendarEvents
- method: GET
- path: /calendar/{groupId}
- summary: List a group's calendar events
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - date [query] (string) - The month to search in.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### searchCalendarEvents
- method: GET
- path: /calendar/search
- summary: Search for calendar events
- auth: yes
- params:
  - searchTerm [query] (required) (string) - Search term for calendar events.
  - utcOffset [query] (integer) - The offset from UTC in hours of the client or authenticated user.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

## Tag: economy (20)

### getActiveLicenses
- method: GET
- path: /economy/licenses/active
- summary: Get Active Licenses
- auth: yes
- params: none

### getBalance
- method: GET
- path: /user/{userId}/balance
- summary: Get Balance
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getBalanceEarnings
- method: GET
- path: /user/{userId}/balance/earnings
- summary: Get Balance Earnings
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getBulkGiftPurchases
- method: GET
- path: /user/bulk/gift/purchases
- summary: Get Bulk Gift Purchases
- auth: yes
- params:
  - mostRecent [query] (boolean)

### getCurrentSubscriptions
- method: GET
- path: /auth/user/subscription
- summary: Get Current Subscriptions
- auth: yes
- params: none

### getEconomyAccount
- method: GET
- path: /user/{userId}/economy/account
- summary: Get Economy Account
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getLicenseGroup
- method: GET
- path: /licenseGroups/{licenseGroupId}
- summary: Get License Group
- auth: yes
- params:
  - licenseGroupId [path] (required) (string) - Must be a valid license group ID.

### getProductListing
- method: GET
- path: /listing/{productId}
- summary: Get Product Listing
- auth: yes
- params:
  - productId [path] (required) (string) - Must be a valid product ID.
  - hydrate [query] (boolean) - Populates some fields and changes types of others for certain objects.

### getProductListings
- method: GET
- path: /user/{userId}/listings
- summary: Get User Product Listings
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - hydrate [query] (boolean) - Populates some fields and changes types of others for certain objects.
  - groupId [query] (string) - Must be a valid group ID.
  - active [query] (boolean) - Filter for users' listings and inventory bundles.

### getRecentSubscription
- method: GET
- path: /user/subscription/recent
- summary: Get Recent Subscription
- auth: yes
- params: none

### getSteamTransaction
- method: GET
- path: /Steam/transactions/{transactionId}
- summary: Get Steam Transaction
- auth: yes
- deprecated: yes
- params:
  - transactionId [path] (required) (string) - Must be a valid transaction ID.

### getSteamTransactions
- method: GET
- path: /Steam/transactions
- summary: List Steam Transactions
- auth: yes
- params: none

### getStore
- method: GET
- path: /economy/store
- summary: Get Store
- auth: yes
- params:
  - storeId [query] (required)
  - hydrateListings [query] (boolean) - Listings fields will be populated.
  - hydrateProducts [query] (boolean) - Products fields will be populated.

### getStoreShelves
- method: GET
- path: /economy/store/shelves
- summary: Get Store Shelves
- auth: yes
- params:
  - storeId [query] (required)
  - hydrateListings [query] (boolean) - Listings fields will be populated.
  - fetch [query]

### getSubscriptions
- method: GET
- path: /subscriptions
- summary: List Subscriptions
- auth: yes
- params: none

### getTiliaStatus
- method: GET
- path: /tilia/status
- summary: Get Tilia Status
- auth: yes
- params: none

### getTiliaTos
- method: GET
- path: /user/{userId}/tilia/tos
- summary: Get Tilia TOS Agreement Status
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getTokenBundles
- method: GET
- path: /tokenBundles
- summary: List Token Bundles
- auth: yes
- params: none

### getUserCreditsEligible
- method: GET
- path: /users/{userId}/credits/eligible
- summary: Get User Credits Eligiblity
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - subscriptionId [query] (required) (string)

### getUserSubscriptionEligible
- method: GET
- path: /users/{userId}/subscription/eligible
- summary: Get User Subscription Eligiblity
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - steamId [query] (string) - The Steam ID of the user.

## Tag: favorites (4)

### getFavoriteGroup
- method: GET
- path: /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}
- summary: Show Favorite Group
- auth: yes
- params:
  - favoriteGroupType [path] (required) (string) - The type of group to fetch, must be a valid FavoriteType.
  - favoriteGroupName [path] (required) (string) - The name of the group to fetch, must be a name of a FavoriteGroup.
  - userId [path] (required) (string) - Must be a valid user ID.

### getFavoriteGroups
- method: GET
- path: /favorite/groups
- summary: List Favorite Groups
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - userId [query] (string) - Target user to see information on, admin-only.
  - ownerId [query] (string) - The owner of whoms favorite groups to return. Must be a UserID.

### getFavoriteLimits
- method: GET
- path: /auth/user/favoritelimits
- summary: Get Favorite Limits
- auth: yes
- params: none

### getFavorites
- method: GET
- path: /favorites
- summary: List Favorites
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - type [query] (string) - The type of favorites to return, FavoriteType.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.

## Tag: files (8)

### downloadFileVersion
- method: GET
- path: /file/{fileId}/{versionId}
- summary: Download File Version
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.
  - versionId [path] (required) (integer) - Version ID of the asset.

### getAdminAssetBundle
- method: GET
- path: /adminassetbundles/{adminAssetBundleId}
- summary: Get AdminAssetBundle
- auth: yes
- params:
  - adminAssetBundleId [path] (required) (string) - Must be a valid admin asset bundle ID.

### getFile
- method: GET
- path: /file/{fileId}
- summary: Show File
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.

### getFileAnalysis
- method: GET
- path: /analysis/{fileId}/{versionId}
- summary: Get File Version Analysis
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.
  - versionId [path] (required) (integer) - Version ID of the asset.

### getFileAnalysisSecurity
- method: GET
- path: /analysis/{fileId}/{versionId}/security
- summary: Get File Version Analysis Security
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.
  - versionId [path] (required) (integer) - Version ID of the asset.

### getFileAnalysisStandard
- method: GET
- path: /analysis/{fileId}/{versionId}/standard
- summary: Get File Version Analysis Standard
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.
  - versionId [path] (required) (integer) - Version ID of the asset.

### getFileDataUploadStatus
- method: GET
- path: /file/{fileId}/{versionId}/{fileType}/status
- summary: Check FileData Upload Status
- auth: yes
- params:
  - fileId [path] (required) (string) - Must be a valid file ID.
  - versionId [path] (required) (integer) - Version ID of the asset.
  - fileType [path] (required) (string) - Type of file.

### getFiles
- method: GET
- path: /files
- summary: List Files
- auth: yes
- params:
  - tag [query] (string) - Tag, for example "icon" or "gallery", not included by default.
  - userId [query] (string) - UserID, will always generate a 500 permission error.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

## Tag: friends (2)

### getFriends
- method: GET
- path: /auth/user/friends
- summary: List Friends
- auth: yes
- params:
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - n [query] (integer) - The number of objects to return.
  - offline [query] (boolean) - Returns *only* offline users if true, returns only online and active users if false

### getFriendStatus
- method: GET
- path: /user/{userId}/friendStatus
- summary: Check Friend Status
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

## Tag: groups (15)

### getGroup
- method: GET
- path: /groups/{groupId}
- summary: Get Group by ID
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - includeRoles [query] (boolean) - Include roles for the Group object. Defaults to false.

### getGroupAnnouncements
- method: GET
- path: /groups/{groupId}/announcement
- summary: Get Group Announcement
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.

### getGroupAuditLogs
- method: GET
- path: /groups/{groupId}/auditLogs
- summary: Get Group Audit Logs
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - startDate [query] (string) - The start date of the search range.
  - endDate [query] (string) - The end date of the search range.
  - actorIds [query] (string) - The comma-separated actor ids to search for.
  - eventTypes [query] (string) - The comma-separated event types to search for.
  - targetIds [query] (string) - The comma-separated target ids to search for.

### getGroupBans
- method: GET
- path: /groups/{groupId}/bans
- summary: Get Group Bans
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getGroupGalleryImages
- method: GET
- path: /groups/{groupId}/galleries/{groupGalleryId}
- summary: Get Group Gallery Images
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - groupGalleryId [path] (required) (string) - Must be a valid group gallery ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - approved [query] (boolean) - If specified, only returns images that have been approved or not approved.

### getGroupInstances
- method: GET
- path: /groups/{groupId}/instances
- summary: Get Group Instances
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.

### getGroupInvites
- method: GET
- path: /groups/{groupId}/invites
- summary: Get Group Invites Sent
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getGroupMember
- method: GET
- path: /groups/{groupId}/members/{userId}
- summary: Get Group Member
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - userId [path] (required) (string) - Must be a valid user ID.

### getGroupMembers
- method: GET
- path: /groups/{groupId}/members
- summary: List Group Members
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - sort [query] - The sort order of Group Member results
  - roleId [query] - Only returns members with a specific groupRoleId

### getGroupPermissions
- method: GET
- path: /groups/{groupId}/permissions
- summary: List Group Permissions
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.

### getGroupPosts
- method: GET
- path: /groups/{groupId}/posts
- summary: Get posts from a Group
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - publicOnly [query] (boolean) - See public posts only.

### getGroupRequests
- method: GET
- path: /groups/{groupId}/requests
- summary: Get Group Join Requests
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - blocked [query] (boolean) - See blocked join requests

### getGroupRoles
- method: GET
- path: /groups/{groupId}/roles
- summary: Get Group Roles
- auth: yes
- params:
  - groupId [path] (required) (string) - Must be a valid group ID.

### getGroupRoleTemplates
- method: GET
- path: /groups/roleTemplates
- summary: Get Group Role Templates
- auth: yes
- params: none

### searchGroups
- method: GET
- path: /groups
- summary: Search Group
- auth: no
- params:
  - query [query] (string) - Query to search for, can be either Group Name or Group shortCode
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - n [query] (integer) - The number of objects to return.

## Tag: instances (4)

### getInstance
- method: GET
- path: /instances/{worldId}:{instanceId}
- summary: Get Instance
- auth: yes
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.
  - instanceId [path] (required) (string) - Must be a valid instance ID.

### getInstanceByShortName
- method: GET
- path: /instances/s/{shortName}
- summary: Get Instance By Short Name
- auth: yes
- params:
  - shortName [path] (required) (string) - Must be a valid instance short name.

### getRecentLocations
- method: GET
- path: /instances/recent
- summary: List Recent Locations
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getShortName
- method: GET
- path: /instances/{worldId}:{instanceId}/shortName
- summary: Get Instance Short Name
- auth: yes
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.
  - instanceId [path] (required) (string) - Must be a valid instance ID.

## Tag: inventory (6)

### getInventory
- method: GET
- path: /inventory
- summary: Get Inventory
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - holderId [query] - The UserID of the owner of the inventory; defaults to the currently authenticated user.
  - equipSlot [query] - Filter for inventory retrieval.
  - order [query] (string) - Sort order for inventory retrieval.
  - tags [query] - Filter tags for inventory retrieval (comma-separated).
  - types [query] - Filter for inventory retrieval.
  - flags [query] - Filter flags for inventory retrieval (comma-separated).
  - notTypes [query] - Filter out types for inventory retrieval (comma-separated).
  - notFlags [query] - Filter out flags for inventory retrieval (comma-separated).
  - archived [query] (boolean) - Filter archived status for inventory retrieval.

### getInventoryDrops
- method: GET
- path: /inventory/drops
- summary: List Inventory Drops
- auth: yes
- params:
  - active [query] (boolean) - Filter for users' listings and inventory bundles.

### getInventoryTemplate
- method: GET
- path: /inventory/template/{inventoryTemplateId}
- summary: Get Inventory Template
- auth: yes
- params:
  - inventoryTemplateId [path] (required) (string) - Must be a valid inventory template ID.

### getOwnInventoryItem
- method: GET
- path: /inventory/{inventoryItemId}
- summary: Get Own Inventory Item
- auth: yes
- params:
  - inventoryItemId [path] (required) (string) - Must be a valid inventory item ID.

### shareInventoryItemPedestal
- method: GET
- path: /inventory/cloning/pedestal
- summary: Share Inventory Item by Pedestal
- auth: yes
- params:
  - itemId [query] (required) - Id for inventory item sharing.
  - duration [query] (required) (integer) - The duration before the sharing pedestal despawns.

### spawnInventoryItem
- method: GET
- path: /inventory/spawn
- summary: Spawn Inventory Item
- auth: yes
- params:
  - id [query] (required) - Id for inventory item spawning.

## Tag: invite (2)

### getInviteMessage
- method: GET
- path: /message/{userId}/{messageType}/{slot}
- summary: Get Invite Message
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - messageType [path] (required) - The type of message to fetch, must be a valid InviteMessageType.
  - slot [path] (required) (integer) - The message slot to fetch of a given message type.

### getInviteMessages
- method: GET
- path: /message/{userId}/{messageType}
- summary: List Invite Messages
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - messageType [path] (required) - The type of message to fetch, must be a valid InviteMessageType.

## Tag: jams (3)

### getJam
- method: GET
- path: /jams/{jamId}
- summary: Show jam information
- auth: yes
- params:
  - jamId [path] (required) (string) - Must be a valid query ID.

### getJams
- method: GET
- path: /jams
- summary: Show jams list
- auth: yes
- params:
  - type [query] (string) - Only show jams of this type (`avatar` or `world`).

### getJamSubmissions
- method: GET
- path: /jams/{jamId}/submissions
- summary: Show jam submissions
- auth: yes
- params:
  - jamId [path] (required) (string) - Must be a valid query ID.

## Tag: miscellaneous (9)

### getAssignedPermissions
- method: GET
- path: /auth/permissions
- summary: Get Assigned Permissions
- auth: yes
- params: none

### getConfig
- method: GET
- path: /config
- summary: Fetch API Config
- auth: no
- params: none

### getCSS
- method: GET
- path: /css/app.css
- summary: Download CSS
- auth: no
- params:
  - variant [query] (string) - Specifies which `variant` of the site. Public is the end-user site, while `internal` is the staff-only site with special pages for moderation and management.
  - branch [query] (string) - Specifies which git branch the site should load frontend source code from.

### getCurrentOnlineUsers
- method: GET
- path: /visits
- summary: Current Online Users
- auth: no
- params: none

### getHealth
- method: GET
- path: /health
- summary: Check API Health
- auth: no
- deprecated: yes
- params: none

### getInfoPush
- method: GET
- path: /infoPush
- summary: Show Information Notices
- auth: no
- params:
  - require [query] - Tags to include (comma-separated). All of the tags needs to be present.
  - include [query] - Tags to include (comma-separated). Any of the tags needs to be present.

### getJavaScript
- method: GET
- path: /js/app.js
- summary: Download JavaScript
- auth: no
- params:
  - variant [query] (string) - Specifies which `variant` of the site. Public is the end-user site, while `internal` is the staff-only site with special pages for moderation and management.
  - branch [query] (string) - Specifies which git branch the site should load frontend source code from.

### getPermission
- method: GET
- path: /permissions/{permissionId}
- summary: Get Permission
- auth: yes
- params:
  - permissionId [path] (required) (string) - Must be a valid permission ID.

### getSystemTime
- method: GET
- path: /time
- summary: Current System Time
- auth: no
- params: none

## Tag: notifications (2)

### getNotification
- method: GET
- path: /auth/user/notifications/{notificationId}
- summary: Show notification
- auth: yes
- params:
  - notificationId [path] (required) (string) - Must be a valid notification ID.

### getNotifications
- method: GET
- path: /auth/user/notifications
- summary: List Notifications
- auth: yes
- params:
  - type [query] (string) - Only send notifications of this type (can use `all` for all). This parameter no longer does anything, and is deprecated.
  - sent [query] (boolean) - Return notifications sent by the user. Must be false or omitted.
  - hidden [query] (boolean) - Whether to return hidden or non-hidden notifications. True only allowed on type `friendRequest`.
  - after [query] (string) - Only return notifications sent after this Date. Ignored if type is `friendRequest`.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

## Tag: playermoderation (1)

### getPlayerModerations
- method: GET
- path: /auth/user/playermoderations
- summary: Search Player Moderations
- auth: yes
- params:
  - type [query] - Must be one of PlayerModerationType.
  - targetUserId [query] - Must be valid UserID.

## Tag: prints (2)

### getPrint
- method: GET
- path: /prints/{printId}
- summary: Get Print
- auth: yes
- params:
  - printId [path] (required) (string) - Print ID.

### getUserPrints
- method: GET
- path: /prints/user/{userId}
- summary: Get Own Prints
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

## Tag: props (1)

### getProp
- method: GET
- path: /props/{propId}
- summary: Get Prop
- auth: yes
- params:
  - propId [path] (required) (string) - Prop ID.

## Tag: users (12)

### checkUserPersistenceExists
- method: GET
- path: /users/{userId}/{worldId}/persist/exists
- summary: Check User Persistence Exists
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - worldId [path] (required) (string) - Must be a valid world ID.

### getUser
- method: GET
- path: /users/{userId}
- summary: Get User by ID
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getUserByName
- method: GET
- path: /users/{username}/name
- summary: Get User by Username
- auth: yes
- deprecated: yes
- params:
  - username [path] (required) (string) - Username of the user

### getUserFeedback
- method: GET
- path: /users/{userId}/feedback
- summary: Get User Feedback
- auth: yes
- deprecated: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - contentId [query] (boolean) - Filter for users' previously submitted feedback, e.g., a groupId, userId, avatarId, etc.
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getUserGroupInstances
- method: GET
- path: /users/{userId}/instances/groups
- summary: Get User Group Instances
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getUserGroupInstancesForGroup
- method: GET
- path: /users/{userId}/instances/groups/{groupId}
- summary: Get User Group Instances for a specific Group
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - groupId [path] (required) (string) - Must be a valid group ID.

### getUserGroupRequests
- method: GET
- path: /users/{userId}/groups/requested
- summary: Get User Group Requests
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getUserGroups
- method: GET
- path: /users/{userId}/groups
- summary: Get User Groups
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### getUserNote
- method: GET
- path: /userNotes/{userNoteId}
- summary: Get User Note
- auth: yes
- params:
  - userNoteId [path] (required) (string) - Must be a valid user note ID.

### getUserNotes
- method: GET
- path: /userNotes
- summary: Get User Notes
- auth: yes
- params:
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

### getUserRepresentedGroup
- method: GET
- path: /users/{userId}/groups/represented
- summary: Get user's current represented group
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.

### searchUsers
- method: GET
- path: /users
- summary: Search All Users
- auth: yes
- params:
  - search [query] (string) - Searches by `displayName`. Will return empty array if search query is empty or missing.
  - developerType [query] (string) - Active user by developer type, none for normal users and internal for moderators
  - n [query] (integer) - The number of objects to return.
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.

## Tag: worlds (9)

### checkUserPersistenceExists
- method: GET
- path: /users/{userId}/{worldId}/persist/exists
- summary: Check User Persistence Exists
- auth: yes
- params:
  - userId [path] (required) (string) - Must be a valid user ID.
  - worldId [path] (required) (string) - Must be a valid world ID.

### getActiveWorlds
- method: GET
- path: /worlds/active
- summary: List Active Worlds
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - search [query] (string) - Filters by world name.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.
  - noplatform [query] (string) - The platform the asset does not support.

### getFavoritedWorlds
- method: GET
- path: /worlds/favorites
- summary: List Favorited Worlds
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - search [query] (string) - Filters by world name.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.
  - userId [query] (string) - Target user to see information on, admin-only.

### getRecentWorlds
- method: GET
- path: /worlds/recent
- summary: List Recent Worlds
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - search [query] (string) - Filters by world name.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.
  - userId [query] (string) - Target user to see information on, admin-only.

### getWorld
- method: GET
- path: /worlds/{worldId}
- summary: Get World by ID
- auth: no
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.

### getWorldInstance
- method: GET
- path: /worlds/{worldId}/{instanceId}
- summary: Get World Instance
- auth: yes
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.
  - instanceId [path] (required) (string) - Must be a valid instance ID.

### getWorldMetadata
- method: GET
- path: /worlds/{worldId}/metadata
- summary: Get World Metadata
- auth: yes
- deprecated: yes
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.

### getWorldPublishStatus
- method: GET
- path: /worlds/{worldId}/publish
- summary: Get World Publish Status
- auth: yes
- params:
  - worldId [path] (required) (string) - Must be a valid world ID.

### searchWorlds
- method: GET
- path: /worlds
- summary: Search All Worlds
- auth: yes
- params:
  - featured [query] (boolean) - Filters on featured results.
  - sort [query] - The sort order of the results.
  - user [query] (string) - Set to `me` for searching own worlds.
  - userId [query] (string) - Filter by UserID.
  - n [query] (integer) - The number of objects to return.
  - order [query] - Result ordering
  - offset [query] (integer) - A zero-based offset from the default object sorting from where search results start.
  - search [query] (string) - Filters by world name.
  - tag [query] - Tags to include (comma-separated). Any of the tags needs to be present.
  - notag [query] - Tags to exclude (comma-separated).
  - releaseStatus [query] - Filter by ReleaseStatus.
  - maxUnityVersion [query] (string) - The maximum Unity version supported by the asset.
  - minUnityVersion [query] (string) - The minimum Unity version supported by the asset.
  - platform [query] - The platform the asset supports.
  - noplatform [query] (string) - The platform the asset does not support.
  - fuzzy [query] (boolean)
  - avatarSpecific [query] (boolean) - Only search for avatar worlds.

