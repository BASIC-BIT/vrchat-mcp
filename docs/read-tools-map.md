# Read Tools Map (GET endpoints)

Source: specs/vrchat-openapi.yaml (downloaded 2025-12-23T05:02:25.395Z)

Spec: VRChat API Documentation (1.20.5)

Total GET operations: 120

Legend: suggested tool names default to `vrchat_read_<operationId>` unless a curated ergonomic tool exists.

## Tag: authentication (7)

- checkUserExists -> vrchat_read_checkUserExists (/auth/exists)
- confirmEmail -> vrchat_read_confirmEmail (/auth/confirmEmail)
- getCurrentUser -> vrchat_me (/auth/user)
- getGlobalAvatarModerations -> vrchat_read_getGlobalAvatarModerations (/auth/user/avatarmoderations)
- getRecoveryCodes -> vrchat_read_getRecoveryCodes (/auth/user/twofactorauth/otp)
- verifyAuthToken -> vrchat_read_verifyAuthToken (/auth)
- verifyLoginPlace -> vrchat_read_verifyLoginPlace (/auth/verifyLoginPlace)

## Tag: avatars (7)

- getAvatar -> vrchat_avatars_get (/avatars/{avatarId})
- getAvatarStyles -> vrchat_read_getAvatarStyles (/avatarStyles)
- getFavoritedAvatars -> vrchat_avatars_favorites (/avatars/favorites)
- getImpostorQueueStats -> vrchat_read_getImpostorQueueStats (/avatars/impostor/queue/stats)
- getLicensedAvatars -> vrchat_read_getLicensedAvatars (/avatars/licensed)
- getOwnAvatar -> vrchat_read_getOwnAvatar (/users/{userId}/avatar)
- searchAvatars -> vrchat_avatars_search (/avatars)

## Tag: calendar (7)

- getCalendarEvents -> vrchat_calendar_events_list (/calendar)
- getFeaturedCalendarEvents -> vrchat_calendar_featured_list (/calendar/featured)
- getFollowedCalendarEvents -> vrchat_calendar_followed_list (/calendar/following)
- getGroupCalendarEvent -> vrchat_group_event_get (/calendar/{groupId}/{calendarId})
- getGroupCalendarEventICS -> vrchat_read_getGroupCalendarEventICS (/calendar/{groupId}/{calendarId}.ics)
- getGroupCalendarEvents -> vrchat_group_events_list (/calendar/{groupId})
- searchCalendarEvents -> vrchat_calendar_search (/calendar/search)

## Tag: economy (20)

- getActiveLicenses -> vrchat_read_getActiveLicenses (/economy/licenses/active)
- getBalance -> vrchat_read_getBalance (/user/{userId}/balance)
- getBalanceEarnings -> vrchat_read_getBalanceEarnings (/user/{userId}/balance/earnings)
- getBulkGiftPurchases -> vrchat_read_getBulkGiftPurchases (/user/bulk/gift/purchases)
- getCurrentSubscriptions -> vrchat_read_getCurrentSubscriptions (/auth/user/subscription)
- getEconomyAccount -> vrchat_read_getEconomyAccount (/user/{userId}/economy/account)
- getLicenseGroup -> vrchat_read_getLicenseGroup (/licenseGroups/{licenseGroupId})
- getProductListing -> vrchat_read_getProductListing (/listing/{productId})
- getProductListings -> vrchat_read_getProductListings (/user/{userId}/listings)
- getRecentSubscription -> vrchat_read_getRecentSubscription (/user/subscription/recent)
- getSteamTransaction -> vrchat_read_getSteamTransaction (/Steam/transactions/{transactionId})
- getSteamTransactions -> vrchat_read_getSteamTransactions (/Steam/transactions)
- getStore -> vrchat_read_getStore (/economy/store)
- getStoreShelves -> vrchat_read_getStoreShelves (/economy/store/shelves)
- getSubscriptions -> vrchat_read_getSubscriptions (/subscriptions)
- getTiliaStatus -> vrchat_read_getTiliaStatus (/tilia/status)
- getTiliaTos -> vrchat_read_getTiliaTos (/user/{userId}/tilia/tos)
- getTokenBundles -> vrchat_read_getTokenBundles (/tokenBundles)
- getUserCreditsEligible -> vrchat_read_getUserCreditsEligible (/users/{userId}/credits/eligible)
- getUserSubscriptionEligible -> vrchat_read_getUserSubscriptionEligible (/users/{userId}/subscription/eligible)

## Tag: favorites (4)

- getFavoriteGroup -> vrchat_read_getFavoriteGroup (/favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId})
- getFavoriteGroups -> vrchat_favorite_groups_list (/favorite/groups)
- getFavoriteLimits -> vrchat_favorites_limits (/auth/user/favoritelimits)
- getFavorites -> vrchat_favorites_list (/favorites)

## Tag: files (8)

- downloadFileVersion -> vrchat_read_downloadFileVersion (/file/{fileId}/{versionId})
- getAdminAssetBundle -> vrchat_read_getAdminAssetBundle (/adminassetbundles/{adminAssetBundleId})
- getFile -> vrchat_read_getFile (/file/{fileId})
- getFileAnalysis -> vrchat_read_getFileAnalysis (/analysis/{fileId}/{versionId})
- getFileAnalysisSecurity -> vrchat_read_getFileAnalysisSecurity (/analysis/{fileId}/{versionId}/security)
- getFileAnalysisStandard -> vrchat_read_getFileAnalysisStandard (/analysis/{fileId}/{versionId}/standard)
- getFileDataUploadStatus -> vrchat_read_getFileDataUploadStatus (/file/{fileId}/{versionId}/{fileType}/status)
- getFiles -> vrchat_read_getFiles (/files)

## Tag: friends (2)

- getFriends -> vrchat_friends_list (/auth/user/friends)
- getFriendStatus -> vrchat_friends_status (/user/{userId}/friendStatus)

## Tag: groups (15)

- getGroup -> vrchat_groups_get (/groups/{groupId})
- getGroupAnnouncements -> vrchat_groups_announcements_get (/groups/{groupId}/announcement)
- getGroupAuditLogs -> vrchat_read_getGroupAuditLogs (/groups/{groupId}/auditLogs)
- getGroupBans -> vrchat_read_getGroupBans (/groups/{groupId}/bans)
- getGroupGalleryImages -> vrchat_read_getGroupGalleryImages (/groups/{groupId}/galleries/{groupGalleryId})
- getGroupInstances -> vrchat_groups_instances_list (/groups/{groupId}/instances)
- getGroupInvites -> vrchat_read_getGroupInvites (/groups/{groupId}/invites)
- getGroupMember -> vrchat_groups_members_get (/groups/{groupId}/members/{userId})
- getGroupMembers -> vrchat_groups_members_list (/groups/{groupId}/members)
- getGroupPermissions -> vrchat_groups_permissions_list (/groups/{groupId}/permissions)
- getGroupPosts -> vrchat_groups_posts_list (/groups/{groupId}/posts)
- getGroupRequests -> vrchat_read_getGroupRequests (/groups/{groupId}/requests)
- getGroupRoles -> vrchat_groups_roles_list (/groups/{groupId}/roles)
- getGroupRoleTemplates -> vrchat_read_getGroupRoleTemplates (/groups/roleTemplates)
- searchGroups -> vrchat_groups_search (/groups)

## Tag: instances (4)

- getInstance -> vrchat_instances_get (/instances/{worldId}:{instanceId})
- getInstanceByShortName -> vrchat_instances_getByShortName (/instances/s/{shortName})
- getRecentLocations -> vrchat_instances_recent (/instances/recent)
- getShortName -> vrchat_read_getShortName (/instances/{worldId}:{instanceId}/shortName)

## Tag: inventory (6)

- getInventory -> vrchat_read_getInventory (/inventory)
- getInventoryDrops -> vrchat_read_getInventoryDrops (/inventory/drops)
- getInventoryTemplate -> vrchat_read_getInventoryTemplate (/inventory/template/{inventoryTemplateId})
- getOwnInventoryItem -> vrchat_read_getOwnInventoryItem (/inventory/{inventoryItemId})
- shareInventoryItemPedestal -> vrchat_read_shareInventoryItemPedestal (/inventory/cloning/pedestal)
- spawnInventoryItem -> vrchat_read_spawnInventoryItem (/inventory/spawn)

## Tag: invite (2)

- getInviteMessage -> vrchat_invite_messages_get (/message/{userId}/{messageType}/{slot})
- getInviteMessages -> vrchat_invite_messages_list (/message/{userId}/{messageType})

## Tag: jams (3)

- getJam -> vrchat_read_getJam (/jams/{jamId})
- getJams -> vrchat_read_getJams (/jams)
- getJamSubmissions -> vrchat_read_getJamSubmissions (/jams/{jamId}/submissions)

## Tag: miscellaneous (9)

- getAssignedPermissions -> vrchat_read_getAssignedPermissions (/auth/permissions)
- getConfig -> vrchat_config_get (/config)
- getCSS -> vrchat_read_getCSS (/css/app.css)
- getCurrentOnlineUsers -> vrchat_read_getCurrentOnlineUsers (/visits)
- getHealth -> vrchat_read_getHealth (/health)
- getInfoPush -> vrchat_read_getInfoPush (/infoPush)
- getJavaScript -> vrchat_read_getJavaScript (/js/app.js)
- getPermission -> vrchat_read_getPermission (/permissions/{permissionId})
- getSystemTime -> vrchat_system_time (/time)

## Tag: notifications (2)

- getNotification -> vrchat_notifications_get (/auth/user/notifications/{notificationId})
- getNotifications -> vrchat_notifications_list (/auth/user/notifications)

## Tag: playermoderation (1)

- getPlayerModerations -> vrchat_read_getPlayerModerations (/auth/user/playermoderations)

## Tag: prints (2)

- getPrint -> vrchat_read_getPrint (/prints/{printId})
- getUserPrints -> vrchat_read_getUserPrints (/prints/user/{userId})

## Tag: props (1)

- getProp -> vrchat_read_getProp (/props/{propId})

## Tag: users (12)

- checkUserPersistenceExists -> vrchat_read_checkUserPersistenceExists (/users/{userId}/{worldId}/persist/exists)
- getUser -> vrchat_users_get (/users/{userId})
- getUserByName -> vrchat_users_getByName (/users/{username}/name)
- getUserFeedback -> vrchat_read_getUserFeedback (/users/{userId}/feedback)
- getUserGroupInstances -> vrchat_read_getUserGroupInstances (/users/{userId}/instances/groups)
- getUserGroupInstancesForGroup -> vrchat_read_getUserGroupInstancesForGroup (/users/{userId}/instances/groups/{groupId})
- getUserGroupRequests -> vrchat_users_groups_requests (/users/{userId}/groups/requested)
- getUserGroups -> vrchat_users_groups_list (/users/{userId}/groups)
- getUserNote -> vrchat_read_getUserNote (/userNotes/{userNoteId})
- getUserNotes -> vrchat_read_getUserNotes (/userNotes)
- getUserRepresentedGroup -> vrchat_users_groups_represented (/users/{userId}/groups/represented)
- searchUsers -> vrchat_users_search (/users)

## Tag: worlds (9)

- checkUserPersistenceExists -> vrchat_read_checkUserPersistenceExists (/users/{userId}/{worldId}/persist/exists)
- getActiveWorlds -> vrchat_worlds_active (/worlds/active)
- getFavoritedWorlds -> vrchat_worlds_favorites (/worlds/favorites)
- getRecentWorlds -> vrchat_worlds_recent (/worlds/recent)
- getWorld -> vrchat_worlds_get (/worlds/{worldId})
- getWorldInstance -> vrchat_read_getWorldInstance (/worlds/{worldId}/{instanceId})
- getWorldMetadata -> vrchat_read_getWorldMetadata (/worlds/{worldId}/metadata)
- getWorldPublishStatus -> vrchat_read_getWorldPublishStatus (/worlds/{worldId}/publish)
- searchWorlds -> vrchat_worlds_search (/worlds)

