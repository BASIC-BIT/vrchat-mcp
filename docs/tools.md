# Tool Catalog (generated)

Generated: 2026-05-28T08:31:24.501Z

Spec: VRChat API Documentation (1.20.7)

This file is generated without starting the MCP server. It reflects curated tools plus the auto-generated tool catalog (curated read/write replacements are omitted).

## Curated tools
### vrchat_avatar_profile
Get an avatar profile by avatarId (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "avatarId": {
      "type": "string"
    }
  },
  "required": [
    "avatarId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "avatarId": {
      "type": "string"
    },
    "stale": {
      "type": "boolean"
    },
    "avatar": {
      "type": "object",
      "properties": {
        "acknowledgements": {
          "type": "string"
        },
        "activeAssetReviewId": {
          "type": "string"
        },
        "assetUrl": {
          "type": "string",
          "minLength": 1
        },
        "assetUrlObject": {
          "type": "object",
          "properties": {},
          "additionalProperties": {}
        },
        "authorId": {
          "type": "string"
        },
        "authorName": {
          "type": "string",
          "minLength": 1
        },
        "created_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "description": {
          "type": "string",
          "minLength": 0
        },
        "featured": {
          "default": false,
          "type": "boolean"
        },
        "highestPrice": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "id": {
          "type": "string"
        },
        "imageUrl": {
          "type": "string",
          "minLength": 1
        },
        "listingDate": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "lock": {
          "type": "boolean"
        },
        "lowestPrice": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "name": {
          "type": "string",
          "minLength": 1
        },
        "pendingUpload": {
          "default": false,
          "type": "boolean"
        },
        "performance": {
          "type": "object",
          "properties": {
            "android": {
              "type": "string"
            },
            "android-sort": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "ios": {
              "type": "string"
            },
            "ios-sort": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "standalonewindows": {
              "type": "string"
            },
            "standalonewindows-sort": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            }
          },
          "additionalProperties": {}
        },
        "productId": {
          "type": "string"
        },
        "publishedListings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "description": {
                "type": "string"
              },
              "displayName": {
                "type": "string"
              },
              "imageId": {
                "type": "string"
              },
              "listingId": {
                "type": "string"
              },
              "listingType": {
                "type": "string"
              },
              "priceTokens": {
                "type": "integer",
                "minimum": -9007199254740991,
                "maximum": 9007199254740991
              }
            },
            "additionalProperties": {}
          }
        },
        "releaseStatus": {
          "default": "public",
          "type": "string",
          "enum": [
            "all",
            "hidden",
            "private",
            "public"
          ]
        },
        "searchable": {
          "default": false,
          "type": "boolean"
        },
        "styles": {
          "type": "object",
          "properties": {
            "primary": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "secondary": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "supplementary": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "additionalProperties": {}
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "thumbnailImageUrl": {
          "type": "string",
          "minLength": 1
        },
        "unityPackageUrl": {
          "type": "string"
        },
        "unityPackageUrlObject": {
          "type": "object",
          "properties": {
            "unityPackageUrl": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        },
        "unityPackages": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assetUrl": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "assetUrlObject": {
                "type": "object",
                "properties": {},
                "additionalProperties": {}
              },
              "assetVersion": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "created_at": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "id": {
                "type": "string"
              },
              "impostorUrl": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "impostorizerVersion": {
                "type": "string"
              },
              "performanceRating": {
                "type": "string",
                "enum": [
                  "Excellent",
                  "Good",
                  "Medium",
                  "None",
                  "Poor",
                  "VeryPoor"
                ]
              },
              "platform": {
                "type": "string"
              },
              "pluginUrl": {
                "type": "string"
              },
              "pluginUrlObject": {
                "type": "object",
                "properties": {},
                "additionalProperties": {}
              },
              "scanStatus": {
                "type": "string"
              },
              "unitySortNumber": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "unityVersion": {
                "default": "5.3.4p1",
                "type": "string",
                "minLength": 1
              },
              "variant": {
                "type": "string"
              },
              "worldSignature": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "platform",
              "unityVersion"
            ],
            "additionalProperties": {}
          }
        },
        "updated_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "version": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        }
      },
      "additionalProperties": {}
    },
    "vrcxMemo": {
      "type": "object",
      "properties": {
        "editedAt": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "memo": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "editedAt",
        "memo"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "avatarId",
    "stale",
    "avatar"
  ],
  "additionalProperties": false
}
```

### vrchat_boop
Send boops to one or many users. Users may be usr_ ids or exact display names. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": {
      "type": "string",
      "minLength": 1
    },
    "users": {
      "minItems": 1,
      "maxItems": 50,
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "retry": {
      "type": "object",
      "properties": {
        "maxAttempts": {
          "type": "integer",
          "minimum": 1,
          "maximum": 8
        },
        "baseDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 60000
        },
        "maxDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 120000
        }
      },
      "additionalProperties": false
    },
    "emojiId": {
      "type": "string"
    },
    "emojiVersion": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "inventoryItemId": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "completed",
        "dry_run"
      ]
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "totalTargets": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "sent": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "failed": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "skipped": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stoppedAfterFailure": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "target": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "sent",
              "failed",
              "skipped",
              "would_send"
            ]
          },
          "attempts": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "notification": {
            "type": "object",
            "properties": {
              "created_at": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "details": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "emojiId": {
                        "type": "string"
                      },
                      "emojiVersion": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "inventoryItemId": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inviteMessage": {
                        "type": "string"
                      },
                      "worldId": {
                        "type": "string"
                      },
                      "worldName": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "worldId",
                      "worldName"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "responseMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo",
                      "responseMessage"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "platform": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "initiatorUserId": {
                        "type": "string"
                      },
                      "userToKickId": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "initiatorUserId",
                      "userToKickId"
                    ],
                    "additionalProperties": {}
                  }
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              },
              "message": {
                "type": "string"
              },
              "receiverUserId": {
                "type": "string"
              },
              "senderUserId": {
                "type": "string"
              },
              "senderUsername": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "default": "friendRequest",
                "type": "string",
                "enum": [
                  "boop",
                  "friendRequest",
                  "invite",
                  "inviteResponse",
                  "message",
                  "requestInvite",
                  "requestInviteResponse",
                  "votetokick"
                ]
              }
            },
            "additionalProperties": {}
          },
          "data": {},
          "error": {
            "type": "string"
          }
        },
        "required": [
          "target",
          "status"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "status",
    "dryRun",
    "continueOnError",
    "totalTargets",
    "sent",
    "failed",
    "skipped",
    "results"
  ],
  "additionalProperties": false
}
```

### vrchat_event_create
Create a group calendar event. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "accessType": {
      "default": "group",
      "type": "string",
      "enum": [
        "group",
        "public"
      ]
    },
    "category": {
      "default": "other",
      "type": "string",
      "enum": [
        "arts",
        "avatars",
        "dance",
        "education",
        "exploration",
        "film_media",
        "gaming",
        "hangout",
        "music",
        "other",
        "performance",
        "roleplaying",
        "wellness"
      ]
    },
    "closeInstanceAfterEndMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "description": {
      "type": "string",
      "minLength": 1
    },
    "endsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
    },
    "featured": {
      "type": "boolean"
    },
    "guestEarlyJoinMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "hostEarlyJoinMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "imageId": {
      "type": "string"
    },
    "isDraft": {
      "type": "boolean"
    },
    "languages": {
      "maxItems": 3,
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "parentId": {
      "type": "string"
    },
    "platforms": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "android",
          "ios",
          "standalonewindows"
        ]
      }
    },
    "roleIds": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "sendCreationNotification": {
      "default": false,
      "type": "boolean"
    },
    "startsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
    },
    "tags": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 100
      }
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64
    },
    "usesInstanceOverflow": {
      "type": "boolean"
    },
    "groupId": {
      "type": "string"
    }
  },
  "required": [
    "accessType",
    "category",
    "description",
    "endsAt",
    "sendCreationNotification",
    "startsAt",
    "title",
    "groupId"
  ],
  "additionalProperties": {}
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "created",
        "updated",
        "deleted",
        "followed",
        "unfollowed"
      ]
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "required": [
            "accessType",
            "category",
            "description",
            "endsAt",
            "id",
            "startsAt",
            "title"
          ],
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "success": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "minLength": 1
                },
                "status_code": {
                  "type": "integer",
                  "minimum": 100,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "status_code"
              ],
              "additionalProperties": {}
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_event_delete
Delete a group calendar event. (write, destructive)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "calendarId": {
      "type": "string"
    }
  },
  "required": [
    "groupId",
    "calendarId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "created",
        "updated",
        "deleted",
        "followed",
        "unfollowed"
      ]
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "required": [
            "accessType",
            "category",
            "description",
            "endsAt",
            "id",
            "startsAt",
            "title"
          ],
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "success": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "minLength": 1
                },
                "status_code": {
                  "type": "integer",
                  "minimum": 100,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "status_code"
              ],
              "additionalProperties": {}
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_event_follow
Follow or unfollow a group calendar event. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "calendarId": {
      "type": "string"
    },
    "isFollowing": {
      "type": "boolean"
    }
  },
  "required": [
    "groupId",
    "calendarId",
    "isFollowing"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "created",
        "updated",
        "deleted",
        "followed",
        "unfollowed"
      ]
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "required": [
            "accessType",
            "category",
            "description",
            "endsAt",
            "id",
            "startsAt",
            "title"
          ],
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "success": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "minLength": 1
                },
                "status_code": {
                  "type": "integer",
                  "minimum": 100,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "status_code"
              ],
              "additionalProperties": {}
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_event_update
Update a group calendar event. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "category": {
      "type": "string"
    },
    "closeInstanceAfterEndMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "description": {
      "type": "string",
      "minLength": 1
    },
    "endsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
    },
    "featured": {
      "type": "boolean"
    },
    "guestEarlyJoinMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "hostEarlyJoinMinutes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "imageId": {
      "type": "string"
    },
    "isDraft": {
      "type": "boolean"
    },
    "languages": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "parentId": {
      "type": "string"
    },
    "platforms": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "roleIds": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "sendCreationNotification": {
      "default": false,
      "type": "boolean"
    },
    "startsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "title": {
      "type": "string",
      "minLength": 1
    },
    "usesInstanceOverflow": {
      "type": "boolean"
    },
    "groupId": {
      "type": "string"
    },
    "calendarId": {
      "type": "string"
    }
  },
  "required": [
    "groupId",
    "calendarId"
  ],
  "additionalProperties": {}
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "created",
        "updated",
        "deleted",
        "followed",
        "unfollowed"
      ]
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "required": [
            "accessType",
            "category",
            "description",
            "endsAt",
            "id",
            "startsAt",
            "title"
          ],
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "success": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "minLength": 1
                },
                "status_code": {
                  "type": "integer",
                  "minimum": 100,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "status_code"
              ],
              "additionalProperties": {}
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_events_discover
Discover public calendar events with optional category/tag filters (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "scope": {
      "type": "string",
      "enum": [
        "all",
        "live",
        "upcoming"
      ]
    },
    "categories": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "arts",
          "avatars",
          "dance",
          "education",
          "exploration",
          "film_media",
          "gaming",
          "hangout",
          "music",
          "other",
          "performance",
          "roleplaying",
          "wellness"
        ]
      }
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "featuredResults": {
      "type": "string",
      "enum": [
        "exclude",
        "include",
        "skip"
      ]
    },
    "nonFeaturedResults": {
      "type": "string",
      "enum": [
        "exclude",
        "include",
        "skip"
      ]
    },
    "personalizedResults": {
      "type": "string",
      "enum": [
        "exclude",
        "include",
        "skip"
      ]
    },
    "minimumInterestCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "minimumRemainingMinutes": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "upcomingOffsetMinutes": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "nextCursor": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "scope": {
      "type": "string",
      "enum": [
        "all",
        "live",
        "upcoming"
      ]
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalEvents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "nextCursor": {
      "type": "string"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "nextCursor": {
          "type": "string"
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "truncated"
      ],
      "additionalProperties": false
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "accessType": {
            "default": "public",
            "type": "string",
            "enum": [
              "group",
              "public"
            ]
          },
          "category": {
            "default": "other",
            "type": "string",
            "enum": [
              "arts",
              "avatars",
              "dance",
              "education",
              "exploration",
              "film_media",
              "gaming",
              "hangout",
              "music",
              "other",
              "performance",
              "roleplaying",
              "wellness"
            ]
          },
          "closeInstanceAfterEndMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "deletedAt": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "description": {
            "type": "string"
          },
          "durationInMs": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "featured": {
            "type": "boolean"
          },
          "guestEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "hostEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "id": {
            "type": "string"
          },
          "imageId": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "imageUrl": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "interestedUserCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "isDraft": {
            "type": "boolean"
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ownerId": {
            "type": "string"
          },
          "platforms": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "android",
                "ios",
                "standalonewindows"
              ]
            }
          },
          "roleIds": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "userInterest": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "isFollowing": {
                "type": "boolean"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          },
          "usesInstanceOverflow": {
            "type": "boolean"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "pageSize",
    "maxPages",
    "maxItems",
    "totalEvents",
    "truncated",
    "page",
    "events"
  ],
  "additionalProperties": false
}
```

### vrchat_events_search
Search calendar events by term (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "searchTerm": {
      "type": "string"
    },
    "utcOffset": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "searchTerm"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "searchTerm": {
      "type": "string"
    },
    "utcOffset": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalEvents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "accessType": {
            "default": "public",
            "type": "string",
            "enum": [
              "group",
              "public"
            ]
          },
          "category": {
            "default": "other",
            "type": "string",
            "enum": [
              "arts",
              "avatars",
              "dance",
              "education",
              "exploration",
              "film_media",
              "gaming",
              "hangout",
              "music",
              "other",
              "performance",
              "roleplaying",
              "wellness"
            ]
          },
          "closeInstanceAfterEndMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "deletedAt": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "description": {
            "type": "string"
          },
          "durationInMs": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "featured": {
            "type": "boolean"
          },
          "guestEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "hostEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "id": {
            "type": "string"
          },
          "imageId": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "imageUrl": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "interestedUserCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "isDraft": {
            "type": "boolean"
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ownerId": {
            "type": "string"
          },
          "platforms": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "android",
                "ios",
                "standalonewindows"
              ]
            }
          },
          "roleIds": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "userInterest": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "isFollowing": {
                "type": "boolean"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          },
          "usesInstanceOverflow": {
            "type": "boolean"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "searchTerm",
    "pageSize",
    "maxPages",
    "totalEvents",
    "truncated",
    "events"
  ],
  "additionalProperties": false
}
```

### vrchat_events_upcoming
List calendar events in the upcoming window (read-only). Defaults to the next 7 days. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "from": {
      "type": "string"
    },
    "windowHours": {
      "type": "integer",
      "minimum": 1,
      "maximum": 168
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "from": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "windowHours": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalEvents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string"
          },
          "page": {
            "type": "object",
            "properties": {
              "pages": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "pageSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              },
              "offsetStart": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "truncated": {
                "type": "boolean"
              }
            },
            "required": [
              "pages",
              "items",
              "pageSize",
              "offsetStart",
              "truncated"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "date"
        ],
        "additionalProperties": false
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "accessType": {
            "default": "public",
            "type": "string",
            "enum": [
              "group",
              "public"
            ]
          },
          "category": {
            "default": "other",
            "type": "string",
            "enum": [
              "arts",
              "avatars",
              "dance",
              "education",
              "exploration",
              "film_media",
              "gaming",
              "hangout",
              "music",
              "other",
              "performance",
              "roleplaying",
              "wellness"
            ]
          },
          "closeInstanceAfterEndMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "deletedAt": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "description": {
            "type": "string"
          },
          "durationInMs": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "featured": {
            "type": "boolean"
          },
          "guestEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "hostEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "id": {
            "type": "string"
          },
          "imageId": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "imageUrl": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "interestedUserCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "isDraft": {
            "type": "boolean"
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ownerId": {
            "type": "string"
          },
          "platforms": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "android",
                "ios",
                "standalonewindows"
              ]
            }
          },
          "roleIds": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "userInterest": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "isFollowing": {
                "type": "boolean"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          },
          "usesInstanceOverflow": {
            "type": "boolean"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "from",
    "to",
    "windowHours",
    "pageSize",
    "maxPages",
    "maxItems",
    "totalEvents",
    "truncated",
    "segments",
    "events"
  ],
  "additionalProperties": false
}
```

### vrchat_favorite_add
Add a user, avatar, or world to a favorite group. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "avatar",
        "friend",
        "world"
      ]
    },
    "targetId": {
      "type": "string",
      "minLength": 1,
      "description": "User/avatar/world ID to favorite."
    },
    "tags": {
      "minItems": 1,
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Favorite group tags, e.g. worlds1, avatars1, group_0."
    }
  },
  "required": [
    "type",
    "targetId",
    "tags"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    },
    "favorite": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "favoriteRecordId": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "targetId": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "favoriteRecordId",
            "type",
            "targetId"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {}
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_favorite_remove
Remove a favorite by favorite record ID. Use vrchat_favorites to look up favoriteRecordId first. (write, destructive)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "favoriteRecordId": {
      "type": "string",
      "description": "Favorite record ID, not the target user/avatar/world ID."
    }
  },
  "required": [
    "favoriteRecordId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string"
    },
    "favorite": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "favoriteRecordId": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "targetId": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": [
            "favoriteRecordId",
            "type",
            "targetId"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "result": {}
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_favorites
Read favorites, favorite groups, limits, or favorited avatars with compact outputs (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "view": {
      "default": "favorites",
      "type": "string",
      "enum": [
        "favorites",
        "groups",
        "group",
        "limits",
        "avatars"
      ]
    },
    "type": {
      "type": "string",
      "enum": [
        "avatar",
        "friend",
        "world"
      ]
    },
    "tag": {
      "type": "string"
    },
    "favoriteGroupType": {
      "type": "string",
      "enum": [
        "avatar",
        "friend",
        "world"
      ]
    },
    "favoriteGroupName": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "ownerId": {
      "type": "string"
    },
    "query": {
      "type": "string"
    },
    "featured": {
      "type": "boolean"
    },
    "sort": {
      "type": "string"
    },
    "order": {
      "type": "string"
    },
    "notag": {
      "type": "string"
    },
    "releaseStatus": {
      "type": "string"
    },
    "maxUnityVersion": {
      "type": "string"
    },
    "minUnityVersion": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "view"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "view": {
      "type": "string"
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "favorites": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "favoriteRecordId": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "targetId": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "favoriteRecordId",
          "type",
          "targetId"
        ],
        "additionalProperties": false
      }
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "favoriteGroupId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "visibility": {
            "type": "string"
          },
          "ownerId": {
            "type": "string"
          }
        },
        "required": [
          "favoriteGroupId",
          "name"
        ],
        "additionalProperties": false
      }
    },
    "group": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "favoriteGroupId": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "displayName": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "visibility": {
              "type": "string"
            },
            "ownerId": {
              "type": "string"
            }
          },
          "required": [
            "favoriteGroupId",
            "name"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "limits": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "defaultMaxFavoriteGroups": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "defaultMaxFavoritesPerGroup": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "maxFavoriteGroups": {
              "type": "object",
              "properties": {
                "avatar": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "friend": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "vrcPlusWorld": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "world": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "avatar",
                "friend",
                "vrcPlusWorld",
                "world"
              ],
              "additionalProperties": {}
            },
            "maxFavoritesPerGroup": {
              "type": "object",
              "properties": {
                "avatar": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "friend": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "vrcPlusWorld": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "world": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                }
              },
              "required": [
                "avatar",
                "friend",
                "vrcPlusWorld",
                "world"
              ],
              "additionalProperties": {}
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "avatars": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "avatarId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "authorId": {
            "type": "string"
          },
          "authorName": {
            "type": "string"
          },
          "releaseStatus": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          }
        },
        "required": [
          "avatarId",
          "name"
        ],
        "additionalProperties": false
      }
    },
    "notes": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "view"
  ],
  "additionalProperties": false
}
```

### vrchat_friend_details
Get a friend's profile, status, and location details by display name or userId (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "includeOffline": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "friend": {
      "type": "object",
      "properties": {
        "bio": {
          "type": "string"
        },
        "bioLinks": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarImageUrl": {
          "type": "string"
        },
        "currentAvatarTags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarThumbnailImageUrl": {
          "type": "string"
        },
        "developerType": {
          "default": "none",
          "type": "string",
          "enum": [
            "internal",
            "moderator",
            "none",
            "trusted"
          ]
        },
        "displayName": {
          "type": "string"
        },
        "friendKey": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "imageUrl": {
          "type": "string"
        },
        "isFriend": {
          "type": "boolean"
        },
        "last_activity": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_login": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_mobile": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_platform": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "profilePicOverride": {
          "type": "string"
        },
        "profilePicOverrideThumbnail": {
          "type": "string"
        },
        "status": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "ask me",
            "busy",
            "join me",
            "offline"
          ]
        },
        "statusDescription": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "userIcon": {
          "type": "string"
        }
      },
      "additionalProperties": {}
    },
    "profile": {
      "type": "object",
      "properties": {
        "ageVerificationStatus": {
          "type": "string",
          "enum": [
            "18+",
            "hidden",
            "verified"
          ]
        },
        "ageVerified": {
          "type": "boolean"
        },
        "allowAvatarCopying": {
          "default": true,
          "type": "boolean"
        },
        "badges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assignedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "badgeDescription": {
                "type": "string"
              },
              "badgeId": {
                "type": "string"
              },
              "badgeImageUrl": {
                "type": "string"
              },
              "badgeName": {
                "type": "string"
              },
              "hidden": {
                "anyOf": [
                  {
                    "type": "boolean"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "showcased": {
                "type": "boolean"
              },
              "updatedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "badgeDescription",
              "badgeId",
              "badgeImageUrl",
              "badgeName",
              "showcased"
            ],
            "additionalProperties": {}
          }
        },
        "bio": {
          "type": "string",
          "minLength": 0,
          "maxLength": 512
        },
        "bioLinks": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarImageUrl": {
          "type": "string"
        },
        "currentAvatarTags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarThumbnailImageUrl": {
          "type": "string"
        },
        "date_joined": {
          "type": "string"
        },
        "developerType": {
          "default": "none",
          "type": "string",
          "enum": [
            "internal",
            "moderator",
            "none",
            "trusted"
          ]
        },
        "displayName": {
          "type": "string"
        },
        "friendKey": {
          "type": "string"
        },
        "friendRequestStatus": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "instanceId": {
          "type": "string"
        },
        "isFriend": {
          "type": "boolean"
        },
        "last_activity": {
          "type": "string"
        },
        "last_login": {
          "type": "string"
        },
        "last_mobile": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_platform": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "note": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "profilePicOverride": {
          "type": "string"
        },
        "profilePicOverrideThumbnail": {
          "type": "string"
        },
        "pronouns": {
          "type": "string"
        },
        "state": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "offline",
            "online"
          ]
        },
        "status": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "ask me",
            "busy",
            "join me",
            "offline"
          ]
        },
        "statusDescription": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "travelingToInstance": {
          "type": "string"
        },
        "travelingToLocation": {
          "type": "string"
        },
        "travelingToWorld": {
          "type": "string"
        },
        "userIcon": {
          "type": "string"
        },
        "username": {
          "type": "string"
        },
        "worldId": {
          "type": "string"
        }
      },
      "additionalProperties": {}
    },
    "location": {
      "type": "object",
      "properties": {
        "raw": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "type": {
          "type": "string"
        },
        "worldId": {
          "type": "string"
        },
        "instanceId": {
          "type": "string"
        },
        "groupId": {
          "type": "string"
        },
        "accessType": {
          "type": "string"
        },
        "region": {
          "type": "string"
        },
        "worldName": {
          "type": "string"
        },
        "groupName": {
          "type": "string"
        },
        "groupShortCode": {
          "type": "string"
        }
      },
      "required": [
        "raw",
        "type"
      ],
      "additionalProperties": false
    },
    "instance": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "instanceId": {
              "type": "string"
            },
            "location": {
              "type": "string"
            },
            "worldId": {
              "type": "string"
            },
            "userCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "n_users": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "capacity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "recommendedCapacity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "full": {
              "default": false,
              "type": "boolean"
            },
            "hasCapacityForYou": {
              "type": "boolean"
            },
            "queueEnabled": {
              "type": "boolean"
            },
            "queueSize": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "calendarEntryId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "type": {
              "type": "string",
              "enum": [
                "friends",
                "group",
                "hidden",
                "private",
                "public"
              ]
            },
            "groupAccessType": {
              "default": "members",
              "type": "string",
              "enum": [
                "members",
                "plus",
                "public"
              ]
            },
            "region": {
              "type": "string",
              "enum": [
                "eu",
                "jp",
                "unknown",
                "us",
                "use",
                "usw",
                "usx"
              ]
            },
            "photonRegion": {
              "type": "string",
              "enum": [
                "eu",
                "jp",
                "unknown",
                "us",
                "use",
                "usw",
                "usx"
              ]
            },
            "canRequestInvite": {
              "default": true,
              "type": "boolean"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "displayName": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "shortName": {
              "anyOf": [
                {
                  "type": "string",
                  "minLength": 1
                },
                {
                  "type": "null"
                }
              ]
            },
            "name": {
              "type": "string",
              "minLength": 1
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "world": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "authorId": {
              "type": "string"
            },
            "authorName": {
              "type": "string",
              "minLength": 1
            },
            "capacity": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "created_at": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "defaultContentSettings": {
              "type": "object",
              "properties": {
                "drones": {
                  "default": true,
                  "type": "boolean"
                },
                "emoji": {
                  "default": true,
                  "type": "boolean"
                },
                "pedestals": {
                  "default": true,
                  "type": "boolean"
                },
                "prints": {
                  "default": true,
                  "type": "boolean"
                },
                "props": {
                  "default": true,
                  "type": "boolean"
                },
                "stickers": {
                  "default": true,
                  "type": "boolean"
                }
              },
              "additionalProperties": {}
            },
            "description": {
              "type": "string",
              "minLength": 0
            },
            "favorites": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "featured": {
              "default": false,
              "type": "boolean"
            },
            "heat": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageUrl": {
              "type": "string",
              "minLength": 1
            },
            "instances": {
              "type": "array",
              "items": {
                "minItems": 2,
                "type": "array",
                "items": {}
              }
            },
            "labsPublicationDate": {
              "type": "string",
              "minLength": 1
            },
            "name": {
              "type": "string",
              "minLength": 1
            },
            "namespace": {
              "type": "string"
            },
            "occupants": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "organization": {
              "default": "vrchat",
              "type": "string",
              "minLength": 1
            },
            "popularity": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "previewYoutubeId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "privateOccupants": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "publicOccupants": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "publicationDate": {
              "type": "string",
              "minLength": 1
            },
            "recommendedCapacity": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "releaseStatus": {
              "default": "public",
              "type": "string",
              "enum": [
                "all",
                "hidden",
                "private",
                "public"
              ]
            },
            "storeId": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "thumbnailImageUrl": {
              "type": "string",
              "minLength": 1
            },
            "udonProducts": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "unityPackages": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "assetUrl": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "assetUrlObject": {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  "assetVersion": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "created_at": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "id": {
                    "type": "string"
                  },
                  "impostorUrl": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "impostorizerVersion": {
                    "type": "string"
                  },
                  "performanceRating": {
                    "type": "string",
                    "enum": [
                      "Excellent",
                      "Good",
                      "Medium",
                      "None",
                      "Poor",
                      "VeryPoor"
                    ]
                  },
                  "platform": {
                    "type": "string"
                  },
                  "pluginUrl": {
                    "type": "string"
                  },
                  "pluginUrlObject": {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  "scanStatus": {
                    "type": "string"
                  },
                  "unitySortNumber": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "unityVersion": {
                    "default": "5.3.4p1",
                    "type": "string",
                    "minLength": 1
                  },
                  "variant": {
                    "type": "string"
                  },
                  "worldSignature": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  }
                },
                "required": [
                  "platform",
                  "unityVersion"
                ],
                "additionalProperties": {}
              }
            },
            "updated_at": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "urlList": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "version": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "visits": {
              "default": 0,
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    },
    "group": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "ageVerificationBetaCode": {
              "type": "string"
            },
            "ageVerificationBetaSlots": {
              "type": "number"
            },
            "ageVerificationSlotsAvailable": {
              "type": "boolean"
            },
            "allowGroupJoinPrompt": {
              "type": "boolean"
            },
            "badges": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "bannerId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "bannerUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "description": {
              "type": "string"
            },
            "discriminator": {
              "type": "string"
            },
            "galleries": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  "description": {
                    "type": "string",
                    "minLength": 0
                  },
                  "id": {
                    "type": "string"
                  },
                  "membersOnly": {
                    "default": false,
                    "type": "boolean"
                  },
                  "name": {
                    "type": "string",
                    "minLength": 1
                  },
                  "roleIdsToAutoApprove": {
                    "anyOf": [
                      {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "roleIdsToManage": {
                    "anyOf": [
                      {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "roleIdsToSubmit": {
                    "anyOf": [
                      {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "roleIdsToView": {
                    "anyOf": [
                      {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "updatedAt": {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  }
                },
                "additionalProperties": {}
              }
            },
            "iconId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "iconUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "isVerified": {
              "default": false,
              "type": "boolean"
            },
            "joinState": {
              "default": "open",
              "type": "string",
              "enum": [
                "closed",
                "invite",
                "open",
                "request"
              ]
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "lastPostCreatedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "links": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "memberCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "memberCountSyncedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "membershipStatus": {
              "default": "inactive",
              "type": "string",
              "enum": [
                "banned",
                "inactive",
                "invited",
                "member",
                "requested",
                "userblocked"
              ]
            },
            "myMember": {
              "type": "object",
              "properties": {
                "acceptedByDisplayName": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ]
                },
                "acceptedById": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ]
                },
                "bannedAt": {
                  "anyOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "null"
                    }
                  ]
                },
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "groupId": {
                  "type": "string"
                },
                "has2FA": {
                  "default": false,
                  "type": "boolean"
                },
                "hasJoinedFromPurchase": {
                  "default": false,
                  "type": "boolean"
                },
                "id": {
                  "type": "string"
                },
                "isRepresenting": {
                  "default": false,
                  "type": "boolean"
                },
                "isSubscribedToAnnouncements": {
                  "default": true,
                  "type": "boolean"
                },
                "isSubscribedToEventAnnouncements": {
                  "type": "boolean"
                },
                "joinedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "lastPostReadAt": {
                  "anyOf": [
                    {
                      "type": "string",
                      "format": "date-time",
                      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                    },
                    {
                      "type": "null"
                    }
                  ]
                },
                "mRoleIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "managerNotes": {
                  "type": "string"
                },
                "membershipStatus": {
                  "type": "string"
                },
                "permissions": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "enum": [
                      "*",
                      "group-announcement-manage",
                      "group-audit-view",
                      "group-bans-manage",
                      "group-calendar-manage",
                      "group-data-manage",
                      "group-default-role-manage",
                      "group-galleries-manage",
                      "group-instance-age-gated-create",
                      "group-instance-calendar-link",
                      "group-instance-join",
                      "group-instance-manage",
                      "group-instance-moderate",
                      "group-instance-open-create",
                      "group-instance-plus-create",
                      "group-instance-plus-portal",
                      "group-instance-plus-portal-unlocked",
                      "group-instance-public-create",
                      "group-instance-queue-priority",
                      "group-instance-restricted-create",
                      "group-invites-manage",
                      "group-members-manage",
                      "group-members-remove",
                      "group-members-viewall",
                      "group-roles-assign",
                      "group-roles-manage"
                    ]
                  }
                },
                "roleIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "userId": {
                  "type": "string"
                },
                "visibility": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            "name": {
              "type": "string"
            },
            "onlineMemberCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "ownerId": {
              "type": "string"
            },
            "privacy": {
              "default": "default",
              "type": "string",
              "enum": [
                "default",
                "private"
              ]
            },
            "roles": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "createdAt": {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      "description": {
                        "type": "string"
                      },
                      "groupId": {
                        "type": "string"
                      },
                      "id": {
                        "type": "string"
                      },
                      "isManagementRole": {
                        "default": false,
                        "type": "boolean"
                      },
                      "isSelfAssignable": {
                        "default": false,
                        "type": "boolean"
                      },
                      "name": {
                        "type": "string"
                      },
                      "order": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "permissions": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "enum": [
                            "*",
                            "group-announcement-manage",
                            "group-audit-view",
                            "group-bans-manage",
                            "group-calendar-manage",
                            "group-data-manage",
                            "group-default-role-manage",
                            "group-galleries-manage",
                            "group-instance-age-gated-create",
                            "group-instance-calendar-link",
                            "group-instance-join",
                            "group-instance-manage",
                            "group-instance-moderate",
                            "group-instance-open-create",
                            "group-instance-plus-create",
                            "group-instance-plus-portal",
                            "group-instance-plus-portal-unlocked",
                            "group-instance-public-create",
                            "group-instance-queue-priority",
                            "group-instance-restricted-create",
                            "group-invites-manage",
                            "group-members-manage",
                            "group-members-remove",
                            "group-members-viewall",
                            "group-roles-assign",
                            "group-roles-manage"
                          ]
                        }
                      },
                      "requiresPurchase": {
                        "default": false,
                        "type": "boolean"
                      },
                      "requiresTwoFactor": {
                        "default": false,
                        "type": "boolean"
                      },
                      "updatedAt": {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "rules": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "shortCode": {
              "type": "string"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "transferTargetId": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "friend",
    "profile",
    "location",
    "instance",
    "world",
    "group"
  ],
  "additionalProperties": false
}
```

### vrchat_friend_request
Send friend requests to one or many users. Users may be usr_ ids or exact display names. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": {
      "type": "string",
      "minLength": 1
    },
    "users": {
      "minItems": 1,
      "maxItems": 50,
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "retry": {
      "type": "object",
      "properties": {
        "maxAttempts": {
          "type": "integer",
          "minimum": 1,
          "maximum": 8
        },
        "baseDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 60000
        },
        "maxDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 120000
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "completed",
        "dry_run"
      ]
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "totalTargets": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "sent": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "failed": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "skipped": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stoppedAfterFailure": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "target": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "sent",
              "failed",
              "skipped",
              "would_send"
            ]
          },
          "attempts": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "notification": {
            "type": "object",
            "properties": {
              "created_at": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "details": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "emojiId": {
                        "type": "string"
                      },
                      "emojiVersion": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "inventoryItemId": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inviteMessage": {
                        "type": "string"
                      },
                      "worldId": {
                        "type": "string"
                      },
                      "worldName": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "worldId",
                      "worldName"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "responseMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo",
                      "responseMessage"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "platform": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "initiatorUserId": {
                        "type": "string"
                      },
                      "userToKickId": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "initiatorUserId",
                      "userToKickId"
                    ],
                    "additionalProperties": {}
                  }
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              },
              "message": {
                "type": "string"
              },
              "receiverUserId": {
                "type": "string"
              },
              "senderUserId": {
                "type": "string"
              },
              "senderUsername": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "default": "friendRequest",
                "type": "string",
                "enum": [
                  "boop",
                  "friendRequest",
                  "invite",
                  "inviteResponse",
                  "message",
                  "requestInvite",
                  "requestInviteResponse",
                  "votetokick"
                ]
              }
            },
            "additionalProperties": {}
          },
          "data": {},
          "error": {
            "type": "string"
          }
        },
        "required": [
          "target",
          "status"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "status",
    "dryRun",
    "continueOnError",
    "totalTargets",
    "sent",
    "failed",
    "skipped",
    "results"
  ],
  "additionalProperties": false
}
```

### vrchat_friends_list
List friends with cache-backed pagination (read-only). Defaults to online-only; set includeOffline=true to include offline friends. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "includeOffline": {
      "type": "boolean"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "detailLevel": {
      "type": "string",
      "enum": [
        "summary",
        "full"
      ]
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "includeOffline": {
      "type": "boolean"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalFriends": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "offline": {
            "type": "boolean"
          },
          "page": {
            "type": "object",
            "properties": {
              "pages": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "pageSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              },
              "offsetStart": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "truncated": {
                "type": "boolean"
              }
            },
            "required": [
              "pages",
              "items",
              "pageSize",
              "offsetStart",
              "truncated"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "offline"
        ],
        "additionalProperties": false
      }
    },
    "detailLevel": {
      "type": "string",
      "enum": [
        "summary",
        "full"
      ]
    },
    "friends": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "bio": {
            "type": "string"
          },
          "bioLinks": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "currentAvatarImageUrl": {
            "type": "string"
          },
          "currentAvatarTags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "currentAvatarThumbnailImageUrl": {
            "type": "string"
          },
          "developerType": {
            "default": "none",
            "type": "string",
            "enum": [
              "internal",
              "moderator",
              "none",
              "trusted"
            ]
          },
          "displayName": {
            "type": "string"
          },
          "friendKey": {
            "type": "string"
          },
          "id": {
            "type": "string"
          },
          "imageUrl": {
            "type": "string"
          },
          "isFriend": {
            "type": "boolean"
          },
          "last_activity": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "last_login": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "last_mobile": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "last_platform": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "profilePicOverride": {
            "type": "string"
          },
          "profilePicOverrideThumbnail": {
            "type": "string"
          },
          "status": {
            "default": "offline",
            "type": "string",
            "enum": [
              "active",
              "ask me",
              "busy",
              "join me",
              "offline"
            ]
          },
          "statusDescription": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "userIcon": {
            "type": "string"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "includeOffline",
    "pageSize",
    "maxPages",
    "totalFriends",
    "truncated",
    "stale",
    "segments",
    "detailLevel",
    "friends"
  ],
  "additionalProperties": false
}
```

### vrchat_friends_overview
Summarize friends by status and location with enriched world/group info (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "includeOffline": {
      "type": "boolean"
    },
    "status": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 1
        },
        {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      ]
    },
    "statusFilter": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 1
        },
        {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      ]
    },
    "minInstanceUserCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "instanceDetailLevel": {
      "type": "string",
      "enum": [
        "summary",
        "full"
      ]
    },
    "maxLocations": {
      "type": "integer",
      "minimum": 1,
      "maximum": 200
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "includeOffline": {
      "type": "boolean"
    },
    "statusFilter": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "minInstanceUserCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "instanceDetailLevel": {
      "type": "string",
      "enum": [
        "summary",
        "full"
      ]
    },
    "totalFriends": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "onlineCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "offlineCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "statusCounts": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "type": "integer",
        "minimum": 0,
        "maximum": 9007199254740991
      }
    },
    "maxLocations": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalLocations": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "returnedLocations": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "omittedLocations": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "locationsTruncated": {
      "type": "boolean"
    },
    "totals": {
      "type": "object",
      "properties": {
        "all": {
          "type": "object",
          "properties": {
            "totalFriends": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "onlineCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "offlineCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "statusCounts": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            }
          },
          "required": [
            "totalFriends",
            "onlineCount",
            "offlineCount",
            "statusCounts"
          ],
          "additionalProperties": false
        },
        "filtered": {
          "type": "object",
          "properties": {
            "totalFriends": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "onlineCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "offlineCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "statusCounts": {
              "type": "object",
              "propertyNames": {
                "type": "string"
              },
              "additionalProperties": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              }
            }
          },
          "required": [
            "totalFriends",
            "onlineCount",
            "offlineCount",
            "statusCounts"
          ],
          "additionalProperties": false
        }
      },
      "required": [
        "all",
        "filtered"
      ],
      "additionalProperties": false
    },
    "locations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "raw": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "type": {
            "type": "string"
          },
          "worldId": {
            "type": "string"
          },
          "instanceId": {
            "type": "string"
          },
          "groupId": {
            "type": "string"
          },
          "accessType": {
            "type": "string"
          },
          "region": {
            "type": "string"
          },
          "worldName": {
            "type": "string"
          },
          "groupName": {
            "type": "string"
          },
          "groupShortCode": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "instance": {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string"
                  },
                  "instanceId": {
                    "type": "string"
                  },
                  "location": {
                    "type": "string"
                  },
                  "worldId": {
                    "type": "string"
                  },
                  "userCount": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "n_users": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "capacity": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "recommendedCapacity": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "full": {
                    "default": false,
                    "type": "boolean"
                  },
                  "hasCapacityForYou": {
                    "type": "boolean"
                  },
                  "queueEnabled": {
                    "type": "boolean"
                  },
                  "queueSize": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "calendarEntryId": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "type": {
                    "type": "string",
                    "enum": [
                      "friends",
                      "group",
                      "hidden",
                      "private",
                      "public"
                    ]
                  },
                  "groupAccessType": {
                    "default": "members",
                    "type": "string",
                    "enum": [
                      "members",
                      "plus",
                      "public"
                    ]
                  },
                  "region": {
                    "type": "string",
                    "enum": [
                      "eu",
                      "jp",
                      "unknown",
                      "us",
                      "use",
                      "usw",
                      "usx"
                    ]
                  },
                  "photonRegion": {
                    "type": "string",
                    "enum": [
                      "eu",
                      "jp",
                      "unknown",
                      "us",
                      "use",
                      "usw",
                      "usx"
                    ]
                  },
                  "canRequestInvite": {
                    "default": true,
                    "type": "boolean"
                  },
                  "tags": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "displayName": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "shortName": {
                    "anyOf": [
                      {
                        "type": "string",
                        "minLength": 1
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "name": {
                    "type": "string",
                    "minLength": 1
                  }
                },
                "additionalProperties": {}
              },
              {
                "type": "object",
                "properties": {
                  "active": {
                    "default": true,
                    "type": "boolean"
                  },
                  "ageGate": {
                    "anyOf": [
                      {
                        "type": "boolean"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "calendarEntryId": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "canRequestInvite": {
                    "default": true,
                    "type": "boolean"
                  },
                  "capacity": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "clientNumber": {
                    "type": "string",
                    "minLength": 1
                  },
                  "closedAt": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "contentSettings": {
                    "type": "object",
                    "properties": {
                      "drones": {
                        "default": true,
                        "type": "boolean"
                      },
                      "emoji": {
                        "default": true,
                        "type": "boolean"
                      },
                      "pedestals": {
                        "default": true,
                        "type": "boolean"
                      },
                      "prints": {
                        "default": true,
                        "type": "boolean"
                      },
                      "props": {
                        "default": true,
                        "type": "boolean"
                      },
                      "stickers": {
                        "default": true,
                        "type": "boolean"
                      }
                    },
                    "additionalProperties": {}
                  },
                  "creatorId": {
                    "type": "string"
                  },
                  "displayName": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "friends": {
                    "type": "string"
                  },
                  "full": {
                    "default": false,
                    "type": "boolean"
                  },
                  "gameServerVersion": {
                    "anyOf": [
                      {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "groupAccessType": {
                    "default": "members",
                    "type": "string",
                    "enum": [
                      "members",
                      "plus",
                      "public"
                    ]
                  },
                  "hardClose": {
                    "anyOf": [
                      {
                        "type": "boolean"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "hasCapacityForYou": {
                    "type": "boolean"
                  },
                  "hidden": {
                    "type": "string"
                  },
                  "id": {
                    "type": "string"
                  },
                  "instanceId": {
                    "type": "string"
                  },
                  "instancePersistenceEnabled": {
                    "anyOf": [
                      {
                        "type": "boolean"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "location": {
                    "type": "string"
                  },
                  "n_users": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "name": {
                    "type": "string",
                    "minLength": 1
                  },
                  "nonce": {
                    "type": "string"
                  },
                  "ownerId": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "permanent": {
                    "default": false,
                    "type": "boolean"
                  },
                  "photonRegion": {
                    "default": "us",
                    "type": "string",
                    "enum": [
                      "eu",
                      "jp",
                      "unknown",
                      "us",
                      "use",
                      "usw",
                      "usx"
                    ]
                  },
                  "platforms": {
                    "type": "object",
                    "properties": {
                      "android": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "ios": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "standalonewindows": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      }
                    },
                    "required": [
                      "android",
                      "standalonewindows"
                    ],
                    "additionalProperties": false
                  },
                  "playerPersistenceEnabled": {
                    "anyOf": [
                      {
                        "type": "boolean"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "private": {
                    "type": "string"
                  },
                  "queueEnabled": {
                    "type": "boolean"
                  },
                  "queueSize": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "recommendedCapacity": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "region": {
                    "default": "us",
                    "type": "string",
                    "enum": [
                      "eu",
                      "jp",
                      "unknown",
                      "us",
                      "use"
                    ]
                  },
                  "roleRestricted": {
                    "type": "boolean"
                  },
                  "secureName": {
                    "type": "string",
                    "minLength": 1
                  },
                  "shortName": {
                    "anyOf": [
                      {
                        "type": "string",
                        "minLength": 1
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "strict": {
                    "type": "boolean"
                  },
                  "tags": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "type": {
                    "type": "string",
                    "enum": [
                      "friends",
                      "group",
                      "hidden",
                      "private",
                      "public"
                    ]
                  },
                  "userCount": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 9007199254740991
                  },
                  "users": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "ageVerificationStatus": {
                          "type": "string",
                          "enum": [
                            "18+",
                            "hidden",
                            "verified"
                          ]
                        },
                        "ageVerified": {
                          "type": "boolean"
                        },
                        "allowAvatarCopying": {
                          "type": "boolean"
                        },
                        "bio": {
                          "type": "string"
                        },
                        "bioLinks": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "currentAvatarImageUrl": {
                          "type": "string"
                        },
                        "currentAvatarTags": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "currentAvatarThumbnailImageUrl": {
                          "type": "string"
                        },
                        "date_joined": {
                          "anyOf": [
                            {
                              "type": "string",
                              "format": "date-time",
                              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "developerType": {
                          "default": "none",
                          "type": "string",
                          "enum": [
                            "internal",
                            "moderator",
                            "none",
                            "trusted"
                          ]
                        },
                        "displayName": {
                          "type": "string"
                        },
                        "friendKey": {
                          "type": "string"
                        },
                        "id": {
                          "type": "string"
                        },
                        "imageUrl": {
                          "type": "string"
                        },
                        "isFriend": {
                          "type": "boolean"
                        },
                        "last_activity": {
                          "anyOf": [
                            {
                              "type": "string",
                              "format": "date-time",
                              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "last_mobile": {
                          "anyOf": [
                            {
                              "type": "string",
                              "format": "date-time",
                              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "last_platform": {
                          "type": "string"
                        },
                        "platform": {
                          "type": "string"
                        },
                        "profilePicOverride": {
                          "type": "string"
                        },
                        "profilePicOverrideThumbnail": {
                          "type": "string"
                        },
                        "pronouns": {
                          "type": "string"
                        },
                        "state": {
                          "default": "offline",
                          "type": "string",
                          "enum": [
                            "active",
                            "offline",
                            "online"
                          ]
                        },
                        "status": {
                          "default": "offline",
                          "type": "string",
                          "enum": [
                            "active",
                            "ask me",
                            "busy",
                            "join me",
                            "offline"
                          ]
                        },
                        "statusDescription": {
                          "type": "string"
                        },
                        "tags": {
                          "type": "array",
                          "items": {
                            "type": "string"
                          }
                        },
                        "userIcon": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "ageVerificationStatus",
                        "ageVerified",
                        "allowAvatarCopying",
                        "currentAvatarImageUrl",
                        "currentAvatarTags",
                        "currentAvatarThumbnailImageUrl",
                        "date_joined",
                        "developerType",
                        "displayName",
                        "friendKey",
                        "id",
                        "isFriend",
                        "last_activity",
                        "last_platform",
                        "pronouns",
                        "state",
                        "status",
                        "statusDescription",
                        "tags"
                      ],
                      "additionalProperties": {}
                    }
                  },
                  "world": {
                    "type": "object",
                    "properties": {
                      "authorId": {
                        "type": "string"
                      },
                      "authorName": {
                        "type": "string",
                        "minLength": 1
                      },
                      "capacity": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "created_at": {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      "defaultContentSettings": {
                        "type": "object",
                        "properties": {
                          "drones": {
                            "default": true,
                            "type": "boolean"
                          },
                          "emoji": {
                            "default": true,
                            "type": "boolean"
                          },
                          "pedestals": {
                            "default": true,
                            "type": "boolean"
                          },
                          "prints": {
                            "default": true,
                            "type": "boolean"
                          },
                          "props": {
                            "default": true,
                            "type": "boolean"
                          },
                          "stickers": {
                            "default": true,
                            "type": "boolean"
                          }
                        },
                        "additionalProperties": {}
                      },
                      "description": {
                        "type": "string",
                        "minLength": 0
                      },
                      "favorites": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "featured": {
                        "default": false,
                        "type": "boolean"
                      },
                      "heat": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "id": {
                        "type": "string"
                      },
                      "imageUrl": {
                        "type": "string",
                        "minLength": 1
                      },
                      "instances": {
                        "type": "array",
                        "items": {
                          "minItems": 2,
                          "type": "array",
                          "items": {}
                        }
                      },
                      "labsPublicationDate": {
                        "type": "string",
                        "minLength": 1
                      },
                      "name": {
                        "type": "string",
                        "minLength": 1
                      },
                      "namespace": {
                        "type": "string"
                      },
                      "occupants": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "organization": {
                        "default": "vrchat",
                        "type": "string",
                        "minLength": 1
                      },
                      "popularity": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "previewYoutubeId": {
                        "anyOf": [
                          {
                            "type": "string"
                          },
                          {
                            "type": "null"
                          }
                        ]
                      },
                      "privateOccupants": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "publicOccupants": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "publicationDate": {
                        "type": "string",
                        "minLength": 1
                      },
                      "recommendedCapacity": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "releaseStatus": {
                        "default": "public",
                        "type": "string",
                        "enum": [
                          "all",
                          "hidden",
                          "private",
                          "public"
                        ]
                      },
                      "storeId": {
                        "type": "string"
                      },
                      "tags": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "thumbnailImageUrl": {
                        "type": "string",
                        "minLength": 1
                      },
                      "udonProducts": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "unityPackages": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "assetUrl": {
                              "anyOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "null"
                                }
                              ]
                            },
                            "assetUrlObject": {
                              "type": "object",
                              "properties": {},
                              "additionalProperties": {}
                            },
                            "assetVersion": {
                              "type": "integer",
                              "minimum": 0,
                              "maximum": 9007199254740991
                            },
                            "created_at": {
                              "anyOf": [
                                {
                                  "type": "string",
                                  "format": "date-time",
                                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                                },
                                {
                                  "type": "null"
                                }
                              ]
                            },
                            "id": {
                              "type": "string"
                            },
                            "impostorUrl": {
                              "anyOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "null"
                                }
                              ]
                            },
                            "impostorizerVersion": {
                              "type": "string"
                            },
                            "performanceRating": {
                              "type": "string",
                              "enum": [
                                "Excellent",
                                "Good",
                                "Medium",
                                "None",
                                "Poor",
                                "VeryPoor"
                              ]
                            },
                            "platform": {
                              "type": "string"
                            },
                            "pluginUrl": {
                              "type": "string"
                            },
                            "pluginUrlObject": {
                              "type": "object",
                              "properties": {},
                              "additionalProperties": {}
                            },
                            "scanStatus": {
                              "type": "string"
                            },
                            "unitySortNumber": {
                              "type": "integer",
                              "minimum": 0,
                              "maximum": 9007199254740991
                            },
                            "unityVersion": {
                              "default": "5.3.4p1",
                              "type": "string",
                              "minLength": 1
                            },
                            "variant": {
                              "type": "string"
                            },
                            "worldSignature": {
                              "anyOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "null"
                                }
                              ]
                            }
                          },
                          "required": [
                            "platform",
                            "unityVersion"
                          ],
                          "additionalProperties": {}
                        }
                      },
                      "updated_at": {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      "urlList": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "version": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      },
                      "visits": {
                        "default": 0,
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 9007199254740991
                      }
                    },
                    "required": [
                      "authorId",
                      "authorName",
                      "capacity",
                      "created_at",
                      "description",
                      "favorites",
                      "featured",
                      "heat",
                      "id",
                      "imageUrl",
                      "labsPublicationDate",
                      "name",
                      "occupants",
                      "organization",
                      "popularity",
                      "privateOccupants",
                      "publicOccupants",
                      "publicationDate",
                      "recommendedCapacity",
                      "releaseStatus",
                      "tags",
                      "thumbnailImageUrl",
                      "updated_at",
                      "version",
                      "visits"
                    ],
                    "additionalProperties": {}
                  },
                  "worldId": {
                    "type": "string"
                  }
                },
                "required": [
                  "active",
                  "canRequestInvite",
                  "clientNumber",
                  "full",
                  "groupAccessType",
                  "id",
                  "instanceId",
                  "location",
                  "n_users",
                  "name",
                  "permanent",
                  "photonRegion",
                  "platforms",
                  "queueEnabled",
                  "queueSize",
                  "recommendedCapacity",
                  "region",
                  "secureName",
                  "strict",
                  "tags",
                  "type",
                  "userCount",
                  "world",
                  "worldId"
                ],
                "additionalProperties": {}
              }
            ]
          },
          "friendCount": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "friends": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "userId": {
                  "type": "string"
                },
                "displayName": {
                  "type": "string"
                },
                "status": {
                  "type": "string"
                }
              },
              "additionalProperties": false
            }
          }
        },
        "required": [
          "raw",
          "type",
          "location",
          "friendCount",
          "friends"
        ],
        "additionalProperties": false
      }
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "offline": {
            "type": "boolean"
          },
          "page": {
            "type": "object",
            "properties": {
              "pages": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "pageSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              },
              "offsetStart": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "truncated": {
                "type": "boolean"
              }
            },
            "required": [
              "pages",
              "items",
              "pageSize",
              "offsetStart",
              "truncated"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "offline"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "includeOffline",
    "totalFriends",
    "onlineCount",
    "offlineCount",
    "statusCounts",
    "maxLocations",
    "totalLocations",
    "returnedLocations",
    "omittedLocations",
    "locationsTruncated",
    "totals",
    "locations",
    "truncated",
    "stale",
    "segments"
  ],
  "additionalProperties": false
}
```

### vrchat_friends_search
Search friends by display name (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "maxResults": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "includeOffline": {
      "type": "boolean"
    }
  },
  "required": [
    "query"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "includeOffline": {
      "type": "boolean"
    },
    "totalFriends": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "matches": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "status": {
            "type": "string"
          },
          "matchScore": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "matchType": {
            "type": "string"
          }
        },
        "required": [
          "userId",
          "displayName",
          "matchScore",
          "matchType"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "query",
    "includeOffline",
    "totalFriends",
    "matches"
  ],
  "additionalProperties": false
}
```

### vrchat_group_event_get
Get a single group calendar event (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "calendarId": {
      "type": "string"
    }
  },
  "required": [
    "calendarId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "calendarId": {
      "type": "string"
    },
    "stale": {
      "type": "boolean"
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "groupId",
    "calendarId",
    "stale"
  ],
  "additionalProperties": false
}
```

### vrchat_group_event_next
Get the next upcoming calendar event for a group (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "stale": {
      "type": "boolean"
    },
    "event": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "accessType": {
              "default": "public",
              "type": "string",
              "enum": [
                "group",
                "public"
              ]
            },
            "category": {
              "default": "other",
              "type": "string",
              "enum": [
                "arts",
                "avatars",
                "dance",
                "education",
                "exploration",
                "film_media",
                "gaming",
                "hangout",
                "music",
                "other",
                "performance",
                "roleplaying",
                "wellness"
              ]
            },
            "closeInstanceAfterEndMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "deletedAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "description": {
              "type": "string"
            },
            "durationInMs": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "endsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "featured": {
              "type": "boolean"
            },
            "guestEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "hostEarlyJoinMinutes": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "id": {
              "type": "string"
            },
            "imageId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "imageUrl": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "interestedUserCount": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "isDraft": {
              "type": "boolean"
            },
            "languages": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "ownerId": {
              "type": "string"
            },
            "platforms": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "android",
                  "ios",
                  "standalonewindows"
                ]
              }
            },
            "roleIds": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "startsAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "title": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "userInterest": {
              "type": "object",
              "properties": {
                "createdAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                "isFollowing": {
                  "type": "boolean"
                },
                "updatedAt": {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                }
              },
              "additionalProperties": {}
            },
            "usesInstanceOverflow": {
              "type": "boolean"
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "groupId",
    "stale"
  ],
  "additionalProperties": false
}
```

### vrchat_group_events_list
List group calendar events (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "date": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "date": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalEvents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "accessType": {
            "default": "public",
            "type": "string",
            "enum": [
              "group",
              "public"
            ]
          },
          "category": {
            "default": "other",
            "type": "string",
            "enum": [
              "arts",
              "avatars",
              "dance",
              "education",
              "exploration",
              "film_media",
              "gaming",
              "hangout",
              "music",
              "other",
              "performance",
              "roleplaying",
              "wellness"
            ]
          },
          "closeInstanceAfterEndMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "deletedAt": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "description": {
            "type": "string"
          },
          "durationInMs": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "featured": {
            "type": "boolean"
          },
          "guestEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "hostEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "id": {
            "type": "string"
          },
          "imageId": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "imageUrl": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "interestedUserCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "isDraft": {
            "type": "boolean"
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ownerId": {
            "type": "string"
          },
          "platforms": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "android",
                "ios",
                "standalonewindows"
              ]
            }
          },
          "roleIds": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "userInterest": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "isFollowing": {
                "type": "boolean"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          },
          "usesInstanceOverflow": {
            "type": "boolean"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "groupId",
    "pageSize",
    "maxPages",
    "maxItems",
    "totalEvents",
    "truncated",
    "stale",
    "events"
  ],
  "additionalProperties": false
}
```

### vrchat_group_events_upcoming
List upcoming group events in a time window (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "from": {
      "type": "string"
    },
    "windowHours": {
      "type": "integer",
      "minimum": 1,
      "maximum": 168
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "from": {
      "type": "string"
    },
    "to": {
      "type": "string"
    },
    "windowHours": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalEvents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "segments": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string"
          },
          "page": {
            "type": "object",
            "properties": {
              "pages": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "pageSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 9007199254740991
              },
              "offsetStart": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "truncated": {
                "type": "boolean"
              }
            },
            "required": [
              "pages",
              "items",
              "pageSize",
              "offsetStart",
              "truncated"
            ],
            "additionalProperties": false
          }
        },
        "required": [
          "date"
        ],
        "additionalProperties": false
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "accessType": {
            "default": "public",
            "type": "string",
            "enum": [
              "group",
              "public"
            ]
          },
          "category": {
            "default": "other",
            "type": "string",
            "enum": [
              "arts",
              "avatars",
              "dance",
              "education",
              "exploration",
              "film_media",
              "gaming",
              "hangout",
              "music",
              "other",
              "performance",
              "roleplaying",
              "wellness"
            ]
          },
          "closeInstanceAfterEndMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "deletedAt": {
            "anyOf": [
              {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              {
                "type": "null"
              }
            ]
          },
          "description": {
            "type": "string"
          },
          "durationInMs": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "featured": {
            "type": "boolean"
          },
          "guestEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "hostEarlyJoinMinutes": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "id": {
            "type": "string"
          },
          "imageId": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "imageUrl": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "interestedUserCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "isDraft": {
            "type": "boolean"
          },
          "languages": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "ownerId": {
            "type": "string"
          },
          "platforms": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "android",
                "ios",
                "standalonewindows"
              ]
            }
          },
          "roleIds": {
            "anyOf": [
              {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "title": {
            "type": "string",
            "minLength": 1
          },
          "type": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
          },
          "userInterest": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "isFollowing": {
                "type": "boolean"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          },
          "usesInstanceOverflow": {
            "type": "boolean"
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "groupId",
    "from",
    "to",
    "windowHours",
    "pageSize",
    "maxPages",
    "maxItems",
    "totalEvents",
    "truncated",
    "stale",
    "segments",
    "events"
  ],
  "additionalProperties": false
}
```

### vrchat_group_instances_overview
Summarize active group instances (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "maxInstances": {
      "type": "integer",
      "minimum": 1,
      "maximum": 200
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "totalInstances": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "totalMembers": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stale": {
      "type": "boolean"
    },
    "instances": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "worldId": {
            "type": "string"
          },
          "worldName": {
            "type": "string"
          },
          "instanceId": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "memberCount": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          }
        },
        "required": [
          "instanceId",
          "memberCount"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "groupId",
    "totalInstances",
    "totalMembers",
    "stale",
    "instances"
  ],
  "additionalProperties": false
}
```

### vrchat_group_invite
Invite one or many users to a group. Users may be usr_ ids or exact display names. Requires groupId or shortCode. confirmOverrideBlock defaults false; pass true only to override an existing target-user block. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": {
      "type": "string",
      "minLength": 1
    },
    "users": {
      "minItems": 1,
      "maxItems": 50,
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "retry": {
      "type": "object",
      "properties": {
        "maxAttempts": {
          "type": "integer",
          "minimum": 1,
          "maximum": 8
        },
        "baseDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 60000
        },
        "maxDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 120000
        }
      },
      "additionalProperties": false
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "confirmOverrideBlock": {
      "default": false,
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "completed",
        "dry_run"
      ]
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "totalTargets": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "sent": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "failed": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "skipped": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stoppedAfterFailure": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "target": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "sent",
              "failed",
              "skipped",
              "would_send"
            ]
          },
          "attempts": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "notification": {
            "type": "object",
            "properties": {
              "created_at": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "details": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "emojiId": {
                        "type": "string"
                      },
                      "emojiVersion": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "inventoryItemId": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inviteMessage": {
                        "type": "string"
                      },
                      "worldId": {
                        "type": "string"
                      },
                      "worldName": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "worldId",
                      "worldName"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "responseMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo",
                      "responseMessage"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "platform": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "initiatorUserId": {
                        "type": "string"
                      },
                      "userToKickId": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "initiatorUserId",
                      "userToKickId"
                    ],
                    "additionalProperties": {}
                  }
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              },
              "message": {
                "type": "string"
              },
              "receiverUserId": {
                "type": "string"
              },
              "senderUserId": {
                "type": "string"
              },
              "senderUsername": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "default": "friendRequest",
                "type": "string",
                "enum": [
                  "boop",
                  "friendRequest",
                  "invite",
                  "inviteResponse",
                  "message",
                  "requestInvite",
                  "requestInviteResponse",
                  "votetokick"
                ]
              }
            },
            "additionalProperties": {}
          },
          "data": {},
          "error": {
            "type": "string"
          }
        },
        "required": [
          "target",
          "status"
        ],
        "additionalProperties": false
      }
    },
    "groupId": {
      "type": "string"
    }
  },
  "required": [
    "status",
    "dryRun",
    "continueOnError",
    "totalTargets",
    "sent",
    "failed",
    "skipped",
    "results",
    "groupId"
  ],
  "additionalProperties": false
}
```

### vrchat_group_members
List group members by userId + displayName (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "roleId": {
      "type": "string"
    },
    "sort": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 200
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "totalMembers": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "members": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          }
        },
        "required": [
          "userId"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "groupId",
    "totalMembers",
    "truncated",
    "stale"
  ],
  "additionalProperties": false
}
```

### vrchat_group_posts_recent
List recent posts for a group (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    },
    "publicOnly": {
      "type": "boolean"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalPosts": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "posts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "text": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          },
          "authorId": {
            "type": "string"
          },
          "visibility": {
            "type": "string"
          }
        },
        "required": [
          "id"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "groupId",
    "pageSize",
    "maxPages",
    "totalPosts",
    "truncated",
    "stale",
    "posts"
  ],
  "additionalProperties": false
}
```

### vrchat_group_profile
Get a group profile by groupId or shortCode (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "groupId": {
      "type": "string"
    },
    "stale": {
      "type": "boolean"
    },
    "group": {
      "type": "object",
      "properties": {
        "ageVerificationBetaCode": {
          "type": "string"
        },
        "ageVerificationBetaSlots": {
          "type": "number"
        },
        "ageVerificationSlotsAvailable": {
          "type": "boolean"
        },
        "allowGroupJoinPrompt": {
          "type": "boolean"
        },
        "badges": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "bannerId": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "bannerUrl": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "description": {
          "type": "string"
        },
        "discriminator": {
          "type": "string"
        },
        "galleries": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "description": {
                "type": "string",
                "minLength": 0
              },
              "id": {
                "type": "string"
              },
              "membersOnly": {
                "default": false,
                "type": "boolean"
              },
              "name": {
                "type": "string",
                "minLength": 1
              },
              "roleIdsToAutoApprove": {
                "anyOf": [
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "roleIdsToManage": {
                "anyOf": [
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "roleIdsToSubmit": {
                "anyOf": [
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "roleIdsToView": {
                "anyOf": [
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          }
        },
        "iconId": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "iconUrl": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "id": {
          "type": "string"
        },
        "isVerified": {
          "default": false,
          "type": "boolean"
        },
        "joinState": {
          "default": "open",
          "type": "string",
          "enum": [
            "closed",
            "invite",
            "open",
            "request"
          ]
        },
        "languages": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "lastPostCreatedAt": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "links": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "memberCount": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "memberCountSyncedAt": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "membershipStatus": {
          "default": "inactive",
          "type": "string",
          "enum": [
            "banned",
            "inactive",
            "invited",
            "member",
            "requested",
            "userblocked"
          ]
        },
        "myMember": {
          "type": "object",
          "properties": {
            "acceptedByDisplayName": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "acceptedById": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "bannedAt": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "groupId": {
              "type": "string"
            },
            "has2FA": {
              "default": false,
              "type": "boolean"
            },
            "hasJoinedFromPurchase": {
              "default": false,
              "type": "boolean"
            },
            "id": {
              "type": "string"
            },
            "isRepresenting": {
              "default": false,
              "type": "boolean"
            },
            "isSubscribedToAnnouncements": {
              "default": true,
              "type": "boolean"
            },
            "isSubscribedToEventAnnouncements": {
              "type": "boolean"
            },
            "joinedAt": {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            "lastPostReadAt": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "date-time",
                  "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                },
                {
                  "type": "null"
                }
              ]
            },
            "mRoleIds": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "managerNotes": {
              "type": "string"
            },
            "membershipStatus": {
              "type": "string"
            },
            "permissions": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "*",
                  "group-announcement-manage",
                  "group-audit-view",
                  "group-bans-manage",
                  "group-calendar-manage",
                  "group-data-manage",
                  "group-default-role-manage",
                  "group-galleries-manage",
                  "group-instance-age-gated-create",
                  "group-instance-calendar-link",
                  "group-instance-join",
                  "group-instance-manage",
                  "group-instance-moderate",
                  "group-instance-open-create",
                  "group-instance-plus-create",
                  "group-instance-plus-portal",
                  "group-instance-plus-portal-unlocked",
                  "group-instance-public-create",
                  "group-instance-queue-priority",
                  "group-instance-restricted-create",
                  "group-invites-manage",
                  "group-members-manage",
                  "group-members-remove",
                  "group-members-viewall",
                  "group-roles-assign",
                  "group-roles-manage"
                ]
              }
            },
            "roleIds": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "userId": {
              "type": "string"
            },
            "visibility": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        },
        "name": {
          "type": "string"
        },
        "onlineMemberCount": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "ownerId": {
          "type": "string"
        },
        "privacy": {
          "default": "default",
          "type": "string",
          "enum": [
            "default",
            "private"
          ]
        },
        "roles": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "createdAt": {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  "description": {
                    "type": "string"
                  },
                  "groupId": {
                    "type": "string"
                  },
                  "id": {
                    "type": "string"
                  },
                  "isManagementRole": {
                    "default": false,
                    "type": "boolean"
                  },
                  "isSelfAssignable": {
                    "default": false,
                    "type": "boolean"
                  },
                  "name": {
                    "type": "string"
                  },
                  "order": {
                    "type": "integer",
                    "minimum": -9007199254740991,
                    "maximum": 9007199254740991
                  },
                  "permissions": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "*",
                        "group-announcement-manage",
                        "group-audit-view",
                        "group-bans-manage",
                        "group-calendar-manage",
                        "group-data-manage",
                        "group-default-role-manage",
                        "group-galleries-manage",
                        "group-instance-age-gated-create",
                        "group-instance-calendar-link",
                        "group-instance-join",
                        "group-instance-manage",
                        "group-instance-moderate",
                        "group-instance-open-create",
                        "group-instance-plus-create",
                        "group-instance-plus-portal",
                        "group-instance-plus-portal-unlocked",
                        "group-instance-public-create",
                        "group-instance-queue-priority",
                        "group-instance-restricted-create",
                        "group-invites-manage",
                        "group-members-manage",
                        "group-members-remove",
                        "group-members-viewall",
                        "group-roles-assign",
                        "group-roles-manage"
                      ]
                    }
                  },
                  "requiresPurchase": {
                    "default": false,
                    "type": "boolean"
                  },
                  "requiresTwoFactor": {
                    "default": false,
                    "type": "boolean"
                  },
                  "updatedAt": {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  }
                },
                "additionalProperties": {}
              }
            },
            {
              "type": "null"
            }
          ]
        },
        "rules": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "shortCode": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "transferTargetId": {
          "type": "string"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "groupId",
    "stale",
    "group"
  ],
  "additionalProperties": false
}
```

### vrchat_group_roles
List group roles or role templates with compact fields (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "view": {
      "default": "roles",
      "type": "string",
      "enum": [
        "roles",
        "templates"
      ]
    },
    "groupId": {
      "type": "string"
    },
    "shortCode": {
      "type": "string"
    }
  },
  "required": [
    "view"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "view": {
      "type": "string"
    },
    "groupId": {
      "type": "string"
    },
    "totalRoles": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "roleId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "order": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "permissions": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "*",
                "group-announcement-manage",
                "group-audit-view",
                "group-bans-manage",
                "group-calendar-manage",
                "group-data-manage",
                "group-default-role-manage",
                "group-galleries-manage",
                "group-instance-age-gated-create",
                "group-instance-calendar-link",
                "group-instance-join",
                "group-instance-manage",
                "group-instance-moderate",
                "group-instance-open-create",
                "group-instance-plus-create",
                "group-instance-plus-portal",
                "group-instance-plus-portal-unlocked",
                "group-instance-public-create",
                "group-instance-queue-priority",
                "group-instance-restricted-create",
                "group-invites-manage",
                "group-members-manage",
                "group-members-remove",
                "group-members-viewall",
                "group-roles-assign",
                "group-roles-manage"
              ]
            }
          },
          "isManagementRole": {
            "type": "boolean"
          },
          "isSelfAssignable": {
            "type": "boolean"
          }
        },
        "required": [
          "roleId"
        ],
        "additionalProperties": false
      }
    },
    "templates": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "type": "object",
        "properties": {
          "basePermissions": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "*",
                "group-announcement-manage",
                "group-audit-view",
                "group-bans-manage",
                "group-calendar-manage",
                "group-data-manage",
                "group-default-role-manage",
                "group-galleries-manage",
                "group-instance-age-gated-create",
                "group-instance-calendar-link",
                "group-instance-join",
                "group-instance-manage",
                "group-instance-moderate",
                "group-instance-open-create",
                "group-instance-plus-create",
                "group-instance-plus-portal",
                "group-instance-plus-portal-unlocked",
                "group-instance-public-create",
                "group-instance-queue-priority",
                "group-instance-restricted-create",
                "group-invites-manage",
                "group-members-manage",
                "group-members-remove",
                "group-members-viewall",
                "group-roles-assign",
                "group-roles-manage"
              ]
            }
          },
          "description": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "roles": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "basePermissions": {
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "*",
                    "group-announcement-manage",
                    "group-audit-view",
                    "group-bans-manage",
                    "group-calendar-manage",
                    "group-data-manage",
                    "group-default-role-manage",
                    "group-galleries-manage",
                    "group-instance-age-gated-create",
                    "group-instance-calendar-link",
                    "group-instance-join",
                    "group-instance-manage",
                    "group-instance-moderate",
                    "group-instance-open-create",
                    "group-instance-plus-create",
                    "group-instance-plus-portal",
                    "group-instance-plus-portal-unlocked",
                    "group-instance-public-create",
                    "group-instance-queue-priority",
                    "group-instance-restricted-create",
                    "group-invites-manage",
                    "group-members-manage",
                    "group-members-remove",
                    "group-members-viewall",
                    "group-roles-assign",
                    "group-roles-manage"
                  ]
                }
              },
              "isAddedOnJoin": {
                "default": false,
                "type": "boolean"
              }
            },
            "additionalProperties": {}
          }
        },
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "view"
  ],
  "additionalProperties": false
}
```

### vrchat_group_roles_manage
Assign/remove member roles or create/update/delete group role definitions. (write, destructive)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "const": "assign_member_role"
        },
        "groupId": {
          "type": "string"
        },
        "shortCode": {
          "type": "string"
        },
        "userId": {
          "type": "string"
        },
        "groupRoleId": {
          "type": "string"
        }
      },
      "required": [
        "action",
        "userId",
        "groupRoleId"
      ],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "const": "remove_member_role"
        },
        "groupId": {
          "type": "string"
        },
        "shortCode": {
          "type": "string"
        },
        "userId": {
          "type": "string"
        },
        "groupRoleId": {
          "type": "string"
        }
      },
      "required": [
        "action",
        "userId",
        "groupRoleId"
      ],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "*",
              "group-announcement-manage",
              "group-audit-view",
              "group-bans-manage",
              "group-calendar-manage",
              "group-data-manage",
              "group-default-role-manage",
              "group-galleries-manage",
              "group-instance-age-gated-create",
              "group-instance-calendar-link",
              "group-instance-join",
              "group-instance-manage",
              "group-instance-moderate",
              "group-instance-open-create",
              "group-instance-plus-create",
              "group-instance-plus-portal",
              "group-instance-plus-portal-unlocked",
              "group-instance-public-create",
              "group-instance-queue-priority",
              "group-instance-restricted-create",
              "group-invites-manage",
              "group-members-manage",
              "group-members-remove",
              "group-members-viewall",
              "group-roles-assign",
              "group-roles-manage"
            ]
          }
        },
        "isSelfAssignable": {
          "type": "boolean"
        },
        "action": {
          "type": "string",
          "const": "create_role"
        },
        "groupId": {
          "type": "string"
        },
        "shortCode": {
          "type": "string"
        },
        "roleId": {
          "type": "string"
        }
      },
      "required": [
        "action"
      ],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "*",
              "group-announcement-manage",
              "group-audit-view",
              "group-bans-manage",
              "group-calendar-manage",
              "group-data-manage",
              "group-default-role-manage",
              "group-galleries-manage",
              "group-instance-age-gated-create",
              "group-instance-calendar-link",
              "group-instance-join",
              "group-instance-manage",
              "group-instance-moderate",
              "group-instance-open-create",
              "group-instance-plus-create",
              "group-instance-plus-portal",
              "group-instance-plus-portal-unlocked",
              "group-instance-public-create",
              "group-instance-queue-priority",
              "group-instance-restricted-create",
              "group-invites-manage",
              "group-members-manage",
              "group-members-remove",
              "group-members-viewall",
              "group-roles-assign",
              "group-roles-manage"
            ]
          }
        },
        "isSelfAssignable": {
          "type": "boolean"
        },
        "action": {
          "type": "string",
          "const": "update_role"
        },
        "groupId": {
          "type": "string"
        },
        "shortCode": {
          "type": "string"
        },
        "groupRoleId": {
          "type": "string"
        },
        "order": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "action",
        "groupRoleId"
      ],
      "additionalProperties": false
    },
    {
      "type": "object",
      "properties": {
        "action": {
          "type": "string",
          "const": "delete_role"
        },
        "groupId": {
          "type": "string"
        },
        "shortCode": {
          "type": "string"
        },
        "groupRoleId": {
          "type": "string"
        }
      },
      "required": [
        "action",
        "groupRoleId"
      ],
      "additionalProperties": false
    }
  ]
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "action": {
      "type": "string"
    },
    "groupId": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "groupRoleId": {
      "type": "string"
    },
    "roleIds": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "role": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "roleId": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "order": {
              "type": "integer",
              "minimum": -9007199254740991,
              "maximum": 9007199254740991
            },
            "permissions": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "*",
                  "group-announcement-manage",
                  "group-audit-view",
                  "group-bans-manage",
                  "group-calendar-manage",
                  "group-data-manage",
                  "group-default-role-manage",
                  "group-galleries-manage",
                  "group-instance-age-gated-create",
                  "group-instance-calendar-link",
                  "group-instance-join",
                  "group-instance-manage",
                  "group-instance-moderate",
                  "group-instance-open-create",
                  "group-instance-plus-create",
                  "group-instance-plus-portal",
                  "group-instance-plus-portal-unlocked",
                  "group-instance-public-create",
                  "group-instance-queue-priority",
                  "group-instance-restricted-create",
                  "group-invites-manage",
                  "group-members-manage",
                  "group-members-remove",
                  "group-members-viewall",
                  "group-roles-assign",
                  "group-roles-manage"
                ]
              }
            },
            "isManagementRole": {
              "type": "boolean"
            },
            "isSelfAssignable": {
              "type": "boolean"
            }
          },
          "required": [
            "roleId"
          ],
          "additionalProperties": false
        },
        {
          "type": "null"
        }
      ]
    },
    "roles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "roleId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "order": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "permissions": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "*",
                "group-announcement-manage",
                "group-audit-view",
                "group-bans-manage",
                "group-calendar-manage",
                "group-data-manage",
                "group-default-role-manage",
                "group-galleries-manage",
                "group-instance-age-gated-create",
                "group-instance-calendar-link",
                "group-instance-join",
                "group-instance-manage",
                "group-instance-moderate",
                "group-instance-open-create",
                "group-instance-plus-create",
                "group-instance-plus-portal",
                "group-instance-plus-portal-unlocked",
                "group-instance-public-create",
                "group-instance-queue-priority",
                "group-instance-restricted-create",
                "group-invites-manage",
                "group-members-manage",
                "group-members-remove",
                "group-members-viewall",
                "group-roles-assign",
                "group-roles-manage"
              ]
            }
          },
          "isManagementRole": {
            "type": "boolean"
          },
          "isSelfAssignable": {
            "type": "boolean"
          }
        },
        "required": [
          "roleId"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "action",
    "groupId"
  ],
  "additionalProperties": false
}
```

### vrchat_groups_search
Search groups by name or shortCode (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "query"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalGroups": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "groupId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "shortCode": {
            "type": "string"
          },
          "memberCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          }
        },
        "required": [
          "groupId"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "query",
    "pageSize",
    "maxPages",
    "totalGroups",
    "truncated",
    "stale",
    "groups"
  ],
  "additionalProperties": false
}
```

### vrchat_instance_create
Create a new instance. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "friends",
        "group",
        "hidden",
        "private",
        "public"
      ]
    },
    "region": {
      "type": "string",
      "enum": [
        "eu",
        "jp",
        "unknown",
        "us",
        "use"
      ]
    },
    "groupId": {
      "type": "string"
    },
    "ownerId": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "groupAccessType": {
      "type": "string",
      "enum": [
        "members",
        "plus",
        "public"
      ]
    },
    "roleIds": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "displayName": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "inviteOnly": {
      "type": "boolean"
    },
    "canRequestInvite": {
      "type": "boolean"
    },
    "queueEnabled": {
      "type": "boolean"
    },
    "ageGate": {
      "type": "boolean"
    },
    "calendarEntryId": {
      "type": "string"
    },
    "instancePersistenceEnabled": {
      "anyOf": [
        {
          "type": "boolean"
        },
        {
          "type": "null"
        }
      ]
    },
    "playerPersistenceEnabled": {
      "anyOf": [
        {
          "type": "boolean"
        },
        {
          "type": "null"
        }
      ]
    },
    "closedAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
    },
    "hardClose": {
      "type": "boolean"
    },
    "contentSettings": {
      "type": "object",
      "properties": {
        "drones": {
          "default": true,
          "type": "boolean"
        },
        "emoji": {
          "default": true,
          "type": "boolean"
        },
        "pedestals": {
          "default": true,
          "type": "boolean"
        },
        "prints": {
          "default": true,
          "type": "boolean"
        },
        "props": {
          "default": true,
          "type": "boolean"
        },
        "stickers": {
          "default": true,
          "type": "boolean"
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "worldId",
    "type",
    "region"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "const": "created"
    },
    "instance": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "instanceId": {
              "type": "string"
            },
            "location": {
              "type": "string"
            },
            "worldId": {
              "type": "string"
            },
            "userCount": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "n_users": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "capacity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "recommendedCapacity": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "full": {
              "default": false,
              "type": "boolean"
            },
            "hasCapacityForYou": {
              "type": "boolean"
            },
            "queueEnabled": {
              "type": "boolean"
            },
            "queueSize": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "calendarEntryId": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "type": {
              "type": "string",
              "enum": [
                "friends",
                "group",
                "hidden",
                "private",
                "public"
              ]
            },
            "groupAccessType": {
              "default": "members",
              "type": "string",
              "enum": [
                "members",
                "plus",
                "public"
              ]
            },
            "region": {
              "type": "string",
              "enum": [
                "eu",
                "jp",
                "unknown",
                "us",
                "use",
                "usw",
                "usx"
              ]
            },
            "photonRegion": {
              "type": "string",
              "enum": [
                "eu",
                "jp",
                "unknown",
                "us",
                "use",
                "usw",
                "usx"
              ]
            },
            "canRequestInvite": {
              "default": true,
              "type": "boolean"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "displayName": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "shortName": {
              "anyOf": [
                {
                  "type": "string",
                  "minLength": 1
                },
                {
                  "type": "null"
                }
              ]
            },
            "name": {
              "type": "string",
              "minLength": 1
            }
          },
          "additionalProperties": {}
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_invite
Invite yourself or one/many users to an instance. Users may be usr_ ids or exact display names. Supports here=true, full location, worldId+instanceId, or bare instanceId for user invites. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": {
      "type": "string",
      "minLength": 1
    },
    "users": {
      "minItems": 1,
      "maxItems": 50,
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "retry": {
      "type": "object",
      "properties": {
        "maxAttempts": {
          "type": "integer",
          "minimum": 1,
          "maximum": 8
        },
        "baseDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 60000
        },
        "maxDelayMs": {
          "type": "integer",
          "minimum": 0,
          "maximum": 120000
        }
      },
      "additionalProperties": false
    },
    "here": {
      "type": "boolean"
    },
    "location": {
      "type": "string",
      "minLength": 1
    },
    "worldId": {
      "type": "string"
    },
    "instanceId": {
      "type": "string"
    },
    "self": {
      "type": "boolean"
    },
    "message": {
      "type": "string",
      "minLength": 1
    },
    "overwriteMessageSlot": {
      "type": "integer",
      "minimum": 0,
      "maximum": 11
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "completed",
        "dry_run"
      ]
    },
    "dryRun": {
      "type": "boolean"
    },
    "continueOnError": {
      "type": "boolean"
    },
    "totalTargets": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "sent": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "failed": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "skipped": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stoppedAfterFailure": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "target": {
            "type": "string"
          },
          "userId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": [
              "sent",
              "failed",
              "skipped",
              "would_send"
            ]
          },
          "attempts": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "notification": {
            "type": "object",
            "properties": {
              "created_at": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              },
              "details": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "emojiId": {
                        "type": "string"
                      },
                      "emojiVersion": {
                        "type": "integer",
                        "minimum": -9007199254740991,
                        "maximum": 9007199254740991
                      },
                      "inventoryItemId": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inviteMessage": {
                        "type": "string"
                      },
                      "worldId": {
                        "type": "string"
                      },
                      "worldName": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "worldId",
                      "worldName"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "responseMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo",
                      "responseMessage"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "platform": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "inResponseTo": {
                        "type": "string"
                      },
                      "requestMessage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "inResponseTo"
                    ],
                    "additionalProperties": {}
                  },
                  {
                    "type": "object",
                    "properties": {
                      "initiatorUserId": {
                        "type": "string"
                      },
                      "userToKickId": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "initiatorUserId",
                      "userToKickId"
                    ],
                    "additionalProperties": {}
                  }
                ]
              },
              "id": {
                "type": "string",
                "minLength": 1
              },
              "message": {
                "type": "string"
              },
              "receiverUserId": {
                "type": "string"
              },
              "senderUserId": {
                "type": "string"
              },
              "senderUsername": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "default": "friendRequest",
                "type": "string",
                "enum": [
                  "boop",
                  "friendRequest",
                  "invite",
                  "inviteResponse",
                  "message",
                  "requestInvite",
                  "requestInviteResponse",
                  "votetokick"
                ]
              }
            },
            "additionalProperties": {}
          },
          "data": {},
          "error": {
            "type": "string"
          }
        },
        "required": [
          "target",
          "status"
        ],
        "additionalProperties": false
      }
    },
    "destination": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "here",
            "location",
            "world_instance",
            "instance"
          ]
        },
        "location": {
          "type": "string"
        },
        "worldId": {
          "type": "string"
        },
        "instanceId": {
          "type": "string"
        }
      },
      "required": [
        "kind"
      ],
      "additionalProperties": false
    },
    "message": {
      "type": "object",
      "properties": {
        "requested": {
          "type": "string"
        },
        "slot": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "matchedExisting": {
          "type": "boolean"
        },
        "overwrittenSlot": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "wouldOverwriteSlot": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        }
      },
      "additionalProperties": false
    }
  },
  "required": [
    "status",
    "dryRun",
    "continueOnError",
    "totalTargets",
    "sent",
    "failed",
    "skipped",
    "results",
    "destination"
  ],
  "additionalProperties": false
}
```

### vrchat_invite_self
Invite yourself to an instance (low-risk write). (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "instanceId": {
      "type": "string"
    },
    "location": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "const": "sent"
    },
    "notification": {
      "type": "object",
      "properties": {
        "created_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "details": {
          "anyOf": [
            {
              "type": "object",
              "properties": {},
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "emojiId": {
                  "type": "string"
                },
                "emojiVersion": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "inventoryItemId": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inviteMessage": {
                  "type": "string"
                },
                "worldId": {
                  "type": "string"
                },
                "worldName": {
                  "type": "string"
                }
              },
              "required": [
                "worldId",
                "worldName"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "responseMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo",
                "responseMessage"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "platform": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "initiatorUserId": {
                  "type": "string"
                },
                "userToKickId": {
                  "type": "string"
                }
              },
              "required": [
                "initiatorUserId",
                "userToKickId"
              ],
              "additionalProperties": {}
            }
          ]
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "message": {
          "type": "string"
        },
        "receiverUserId": {
          "type": "string"
        },
        "senderUserId": {
          "type": "string"
        },
        "senderUsername": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "default": "friendRequest",
          "type": "string",
          "enum": [
            "boop",
            "friendRequest",
            "invite",
            "inviteResponse",
            "message",
            "requestInvite",
            "requestInviteResponse",
            "votetokick"
          ]
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_invite_user
Invite a user to an instance. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "instanceId": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "messageSlot": {
      "type": "integer",
      "minimum": 0,
      "maximum": 11
    }
  },
  "required": [
    "userId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "const": "sent"
    },
    "notification": {
      "type": "object",
      "properties": {
        "created_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "details": {
          "anyOf": [
            {
              "type": "object",
              "properties": {},
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "emojiId": {
                  "type": "string"
                },
                "emojiVersion": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "inventoryItemId": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inviteMessage": {
                  "type": "string"
                },
                "worldId": {
                  "type": "string"
                },
                "worldName": {
                  "type": "string"
                }
              },
              "required": [
                "worldId",
                "worldName"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "responseMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo",
                "responseMessage"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "platform": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "initiatorUserId": {
                  "type": "string"
                },
                "userToKickId": {
                  "type": "string"
                }
              },
              "required": [
                "initiatorUserId",
                "userToKickId"
              ],
              "additionalProperties": {}
            }
          ]
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "message": {
          "type": "string"
        },
        "receiverUserId": {
          "type": "string"
        },
        "senderUserId": {
          "type": "string"
        },
        "senderUsername": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "default": "friendRequest",
          "type": "string",
          "enum": [
            "boop",
            "friendRequest",
            "invite",
            "inviteResponse",
            "message",
            "requestInvite",
            "requestInviteResponse",
            "votetokick"
          ]
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_invite_user_to_me
Invite a user to your current instance. Requires only the target userId; resolves your current location automatically. If you only have a display name, run vrchat_friends_search first to get userId. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "messageSlot": {
      "type": "integer",
      "minimum": 0,
      "maximum": 11
    }
  },
  "required": [
    "userId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "const": "sent"
    },
    "userId": {
      "type": "string"
    },
    "worldId": {
      "type": "string"
    },
    "instanceId": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "notification": {
      "type": "object",
      "properties": {
        "created_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "details": {
          "anyOf": [
            {
              "type": "object",
              "properties": {},
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "emojiId": {
                  "type": "string"
                },
                "emojiVersion": {
                  "type": "integer",
                  "minimum": -9007199254740991,
                  "maximum": 9007199254740991
                },
                "inventoryItemId": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inviteMessage": {
                  "type": "string"
                },
                "worldId": {
                  "type": "string"
                },
                "worldName": {
                  "type": "string"
                }
              },
              "required": [
                "worldId",
                "worldName"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "responseMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo",
                "responseMessage"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "platform": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "inResponseTo": {
                  "type": "string"
                },
                "requestMessage": {
                  "type": "string"
                }
              },
              "required": [
                "inResponseTo"
              ],
              "additionalProperties": {}
            },
            {
              "type": "object",
              "properties": {
                "initiatorUserId": {
                  "type": "string"
                },
                "userToKickId": {
                  "type": "string"
                }
              },
              "required": [
                "initiatorUserId",
                "userToKickId"
              ],
              "additionalProperties": {}
            }
          ]
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "message": {
          "type": "string"
        },
        "receiverUserId": {
          "type": "string"
        },
        "senderUserId": {
          "type": "string"
        },
        "senderUsername": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "default": "friendRequest",
          "type": "string",
          "enum": [
            "boop",
            "friendRequest",
            "invite",
            "inviteResponse",
            "message",
            "requestInvite",
            "requestInviteResponse",
            "votetokick"
          ]
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "status",
    "userId",
    "worldId",
    "instanceId",
    "location"
  ],
  "additionalProperties": false
}
```

### vrchat_me
Get your profile (read-only). Use view=presence/summary/profile presets; provide fields to override. Optionally include a paged list of your groups. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "view": {
      "type": "string",
      "enum": [
        "summary",
        "presence",
        "profile"
      ]
    },
    "includeGroups": {
      "type": "boolean"
    },
    "groupPageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "groupMaxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "groupOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "user": {
      "type": "object",
      "properties": {
        "ageVerificationStatus": {
          "type": "string",
          "enum": [
            "18+",
            "hidden",
            "verified"
          ]
        },
        "ageVerified": {
          "type": "boolean"
        },
        "allowAvatarCopying": {
          "default": true,
          "type": "boolean"
        },
        "badges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assignedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "badgeDescription": {
                "type": "string"
              },
              "badgeId": {
                "type": "string"
              },
              "badgeImageUrl": {
                "type": "string"
              },
              "badgeName": {
                "type": "string"
              },
              "hidden": {
                "anyOf": [
                  {
                    "type": "boolean"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "showcased": {
                "type": "boolean"
              },
              "updatedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "badgeDescription",
              "badgeId",
              "badgeImageUrl",
              "badgeName",
              "showcased"
            ],
            "additionalProperties": {}
          }
        },
        "bio": {
          "type": "string",
          "minLength": 0,
          "maxLength": 512
        },
        "bioLinks": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarImageUrl": {
          "type": "string"
        },
        "currentAvatarTags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarThumbnailImageUrl": {
          "type": "string"
        },
        "date_joined": {
          "type": "string"
        },
        "developerType": {
          "default": "none",
          "type": "string",
          "enum": [
            "internal",
            "moderator",
            "none",
            "trusted"
          ]
        },
        "displayName": {
          "type": "string"
        },
        "friendKey": {
          "type": "string"
        },
        "friendRequestStatus": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "instanceId": {
          "type": "string"
        },
        "isFriend": {
          "type": "boolean"
        },
        "last_activity": {
          "type": "string"
        },
        "last_login": {
          "type": "string"
        },
        "last_mobile": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_platform": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "note": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "profilePicOverride": {
          "type": "string"
        },
        "profilePicOverrideThumbnail": {
          "type": "string"
        },
        "pronouns": {
          "type": "string"
        },
        "state": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "offline",
            "online"
          ]
        },
        "status": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "ask me",
            "busy",
            "join me",
            "offline"
          ]
        },
        "statusDescription": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "travelingToInstance": {
          "type": "string"
        },
        "travelingToLocation": {
          "type": "string"
        },
        "travelingToWorld": {
          "type": "string"
        },
        "userIcon": {
          "type": "string"
        },
        "username": {
          "type": "string"
        },
        "worldId": {
          "type": "string"
        }
      },
      "additionalProperties": {}
    },
    "groups": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string"
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "totalGroups": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        },
        "stale": {
          "type": "boolean"
        },
        "page": {
          "type": "object",
          "properties": {
            "pages": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "items": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "pageSize": {
              "type": "integer",
              "minimum": 1,
              "maximum": 9007199254740991
            },
            "offsetStart": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "truncated": {
              "type": "boolean"
            }
          },
          "required": [
            "pages",
            "items",
            "pageSize",
            "offsetStart",
            "truncated"
          ],
          "additionalProperties": false
        },
        "groups": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "groupId": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "shortCode": {
                "type": "string"
              },
              "memberCount": {
                "type": "integer",
                "minimum": -9007199254740991,
                "maximum": 9007199254740991
              }
            },
            "required": [
              "groupId"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "userId",
        "pageSize",
        "maxPages",
        "totalGroups",
        "truncated",
        "stale",
        "page",
        "groups"
      ],
      "additionalProperties": false
    },
    "vrcxMemo": {
      "type": "object",
      "properties": {
        "editedAt": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "memo": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "editedAt",
        "memo"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "userId",
    "user"
  ],
  "additionalProperties": false
}
```

### vrchat_notifications_recent
List recent notifications (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "unreadOnly": {
      "type": "boolean"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "after": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalNotifications": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "notifications": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "senderUserId": {
            "type": "string"
          },
          "seen": {
            "type": "boolean"
          },
          "details": {
            "$ref": "#/$defs/__schema0"
          }
        },
        "required": [
          "id"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "pageSize",
    "maxPages",
    "totalNotifications",
    "truncated",
    "stale",
    "notifications"
  ],
  "additionalProperties": false,
  "$defs": {
    "__schema0": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "boolean"
        },
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "$ref": "#/$defs/__schema0"
          }
        },
        {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "$ref": "#/$defs/__schema0"
          }
        }
      ]
    }
  }
}
```

### vrchat_profile_update
Update your profile fields (bio, bioLinks, pronouns, userIcon, booping, content filters). Status is preserved automatically. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "bio": {
      "type": "string",
      "minLength": 0
    },
    "bioLinks": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "pronouns": {
      "type": "string",
      "minLength": 0,
      "maxLength": 32
    },
    "userIcon": {
      "type": "string",
      "minLength": 0
    },
    "isBoopingEnabled": {
      "type": "boolean"
    },
    "contentFilters": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "content_adult",
          "content_gore",
          "content_horror",
          "content_sex",
          "content_violence"
        ]
      }
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "user": {
      "type": "object",
      "properties": {
        "acceptedPrivacyVersion": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "acceptedTOSVersion": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "accountDeletionDate": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "accountDeletionLog": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "dateTime": {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  "deletionScheduled": {
                    "anyOf": [
                      {
                        "type": "string",
                        "format": "date-time",
                        "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                      },
                      {
                        "type": "null"
                      }
                    ]
                  },
                  "message": {
                    "default": "Deletion requested",
                    "type": "string"
                  }
                },
                "additionalProperties": {}
              }
            },
            {
              "type": "null"
            }
          ]
        },
        "activeFriends": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "ageVerificationStatus": {
          "type": "string",
          "enum": [
            "18+",
            "hidden",
            "verified"
          ]
        },
        "ageVerified": {
          "type": "boolean"
        },
        "allowAvatarCopying": {
          "type": "boolean"
        },
        "authToken": {
          "type": "string"
        },
        "badges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assignedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "badgeDescription": {
                "type": "string"
              },
              "badgeId": {
                "type": "string"
              },
              "badgeImageUrl": {
                "type": "string"
              },
              "badgeName": {
                "type": "string"
              },
              "hidden": {
                "anyOf": [
                  {
                    "type": "boolean"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "showcased": {
                "type": "boolean"
              },
              "updatedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "badgeDescription",
              "badgeId",
              "badgeImageUrl",
              "badgeName",
              "showcased"
            ],
            "additionalProperties": {}
          }
        },
        "bio": {
          "type": "string"
        },
        "bioLinks": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "contentFilters": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatar": {
          "type": "string"
        },
        "currentAvatarImageUrl": {
          "type": "string"
        },
        "currentAvatarTags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarThumbnailImageUrl": {
          "type": "string"
        },
        "date_joined": {
          "type": "string"
        },
        "developerType": {
          "default": "none",
          "type": "string",
          "enum": [
            "internal",
            "moderator",
            "none",
            "trusted"
          ]
        },
        "discordDetails": {
          "type": "object",
          "properties": {
            "global_name": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        },
        "discordId": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        },
        "emailVerified": {
          "type": "boolean"
        },
        "fallbackAvatar": {
          "type": "string"
        },
        "friendGroupNames": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "friendKey": {
          "type": "string"
        },
        "friends": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "googleDetails": {
          "type": "object",
          "properties": {},
          "additionalProperties": {}
        },
        "googleId": {
          "type": "string"
        },
        "hasBirthday": {
          "type": "boolean"
        },
        "hasEmail": {
          "type": "boolean"
        },
        "hasLoggedInFromClient": {
          "type": "boolean"
        },
        "hasPendingEmail": {
          "type": "boolean"
        },
        "hideContentFilterSettings": {
          "type": "boolean"
        },
        "homeLocation": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "isAdult": {
          "type": "boolean"
        },
        "isBoopingEnabled": {
          "default": true,
          "type": "boolean"
        },
        "isFriend": {
          "default": false,
          "type": "boolean"
        },
        "last_activity": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "last_login": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "last_mobile": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_platform": {
          "type": "string"
        },
        "obfuscatedEmail": {
          "type": "string"
        },
        "obfuscatedPendingEmail": {
          "type": "string"
        },
        "oculusId": {
          "type": "string"
        },
        "offlineFriends": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "onlineFriends": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "pastDisplayNames": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "displayName": {
                "type": "string",
                "minLength": 1
              },
              "updated_at": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "required": [
              "displayName",
              "updated_at"
            ],
            "additionalProperties": {}
          }
        },
        "picoId": {
          "type": "string"
        },
        "platform_history": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "isMobile": {
                "type": "boolean"
              },
              "platform": {
                "type": "string"
              },
              "recorded": {
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
              }
            },
            "additionalProperties": {}
          }
        },
        "presence": {
          "type": "object",
          "properties": {
            "avatarThumbnail": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "currentAvatarTags": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "debugflag": {
              "type": "string"
            },
            "displayName": {
              "type": "string"
            },
            "groups": {
              "anyOf": [
                {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                {
                  "type": "null"
                }
              ]
            },
            "id": {
              "type": "string"
            },
            "instance": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "instanceType": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "isRejoining": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "platform": {
              "type": "string"
            },
            "profilePicOverride": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "status": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "travelingToInstance": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "travelingToWorld": {
              "type": "string"
            },
            "userIcon": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "null"
                }
              ]
            },
            "world": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        },
        "profilePicOverride": {
          "type": "string"
        },
        "profilePicOverrideThumbnail": {
          "type": "string"
        },
        "pronouns": {
          "type": "string"
        },
        "pronounsHistory": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "queuedInstance": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "receiveMobileInvitations": {
          "type": "boolean"
        },
        "state": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "offline",
            "online"
          ]
        },
        "status": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "ask me",
            "busy",
            "join me",
            "offline"
          ]
        },
        "statusDescription": {
          "type": "string"
        },
        "statusFirstTime": {
          "type": "boolean"
        },
        "statusHistory": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "steamDetails": {
          "type": "object",
          "properties": {},
          "additionalProperties": {}
        },
        "steamId": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "twoFactorAuthEnabled": {
          "type": "boolean"
        },
        "twoFactorAuthEnabledDate": {
          "anyOf": [
            {
              "type": "string",
              "format": "date-time",
              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
            },
            {
              "type": "null"
            }
          ]
        },
        "unsubscribe": {
          "type": "boolean"
        },
        "updated_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "userIcon": {
          "type": "string"
        },
        "userLanguage": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "userLanguageCode": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "username": {
          "type": "string"
        },
        "usesGeneratedPassword": {
          "type": "boolean"
        },
        "viveId": {
          "type": "string"
        }
      },
      "additionalProperties": {}
    }
  },
  "required": [
    "userId",
    "user"
  ],
  "additionalProperties": false
}
```

### vrchat_status_get
Get your current status + description (read-only). (read-only)

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "ask me",
        "busy",
        "join me",
        "offline"
      ]
    },
    "statusDescription": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

### vrchat_status_set
Set your status + description (write). Requires status or color (blue/green/orange/red); if both are provided they must agree. Defaults to current user. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "active",
        "ask me",
        "busy",
        "join me",
        "offline"
      ]
    },
    "color": {
      "type": "string",
      "enum": [
        "blue",
        "green",
        "orange",
        "red"
      ]
    },
    "description": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "ask me",
        "busy",
        "join me",
        "offline"
      ]
    },
    "statusDescription": {
      "type": "string"
    }
  },
  "required": [
    "userId",
    "status"
  ],
  "additionalProperties": false
}
```

### vrchat_user_groups
List a user's groups (id + name only, cache-backed). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "username": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "totalGroups": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "groups": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "groupId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "shortCode": {
            "type": "string"
          },
          "memberCount": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          }
        },
        "required": [
          "groupId"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "userId",
    "pageSize",
    "maxPages",
    "totalGroups",
    "truncated",
    "stale",
    "page",
    "groups"
  ],
  "additionalProperties": false
}
```

### vrchat_user_profile
Get a user profile (read-only). Optionally include a paged list of the user's groups. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "userId": {
      "type": "string"
    },
    "username": {
      "type": "string"
    },
    "includeGroups": {
      "type": "boolean"
    },
    "groupPageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "groupMaxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "groupOffset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "user": {
      "type": "object",
      "properties": {
        "ageVerificationStatus": {
          "type": "string",
          "enum": [
            "18+",
            "hidden",
            "verified"
          ]
        },
        "ageVerified": {
          "type": "boolean"
        },
        "allowAvatarCopying": {
          "default": true,
          "type": "boolean"
        },
        "badges": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assignedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "badgeDescription": {
                "type": "string"
              },
              "badgeId": {
                "type": "string"
              },
              "badgeImageUrl": {
                "type": "string"
              },
              "badgeName": {
                "type": "string"
              },
              "hidden": {
                "anyOf": [
                  {
                    "type": "boolean"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "showcased": {
                "type": "boolean"
              },
              "updatedAt": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "badgeDescription",
              "badgeId",
              "badgeImageUrl",
              "badgeName",
              "showcased"
            ],
            "additionalProperties": {}
          }
        },
        "bio": {
          "type": "string",
          "minLength": 0,
          "maxLength": 512
        },
        "bioLinks": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarImageUrl": {
          "type": "string"
        },
        "currentAvatarTags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "currentAvatarThumbnailImageUrl": {
          "type": "string"
        },
        "date_joined": {
          "type": "string"
        },
        "developerType": {
          "default": "none",
          "type": "string",
          "enum": [
            "internal",
            "moderator",
            "none",
            "trusted"
          ]
        },
        "displayName": {
          "type": "string"
        },
        "friendKey": {
          "type": "string"
        },
        "friendRequestStatus": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "instanceId": {
          "type": "string"
        },
        "isFriend": {
          "type": "boolean"
        },
        "last_activity": {
          "type": "string"
        },
        "last_login": {
          "type": "string"
        },
        "last_mobile": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "last_platform": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "note": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        },
        "profilePicOverride": {
          "type": "string"
        },
        "profilePicOverrideThumbnail": {
          "type": "string"
        },
        "pronouns": {
          "type": "string"
        },
        "state": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "offline",
            "online"
          ]
        },
        "status": {
          "default": "offline",
          "type": "string",
          "enum": [
            "active",
            "ask me",
            "busy",
            "join me",
            "offline"
          ]
        },
        "statusDescription": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "travelingToInstance": {
          "type": "string"
        },
        "travelingToLocation": {
          "type": "string"
        },
        "travelingToWorld": {
          "type": "string"
        },
        "userIcon": {
          "type": "string"
        },
        "username": {
          "type": "string"
        },
        "worldId": {
          "type": "string"
        }
      },
      "additionalProperties": {}
    },
    "groups": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string"
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "totalGroups": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        },
        "stale": {
          "type": "boolean"
        },
        "page": {
          "type": "object",
          "properties": {
            "pages": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "items": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "pageSize": {
              "type": "integer",
              "minimum": 1,
              "maximum": 9007199254740991
            },
            "offsetStart": {
              "type": "integer",
              "minimum": 0,
              "maximum": 9007199254740991
            },
            "truncated": {
              "type": "boolean"
            }
          },
          "required": [
            "pages",
            "items",
            "pageSize",
            "offsetStart",
            "truncated"
          ],
          "additionalProperties": false
        },
        "groups": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "groupId": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "shortCode": {
                "type": "string"
              },
              "memberCount": {
                "type": "integer",
                "minimum": -9007199254740991,
                "maximum": 9007199254740991
              }
            },
            "required": [
              "groupId"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "userId",
        "pageSize",
        "maxPages",
        "totalGroups",
        "truncated",
        "stale",
        "page",
        "groups"
      ],
      "additionalProperties": false
    },
    "vrcxMemo": {
      "type": "object",
      "properties": {
        "editedAt": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "memo": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "editedAt",
        "memo"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "userId",
    "user"
  ],
  "additionalProperties": false
}
```

### vrchat_world_instances_overview
Summarize world instances by access type and region (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "name": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "resolvedBy": {
      "type": "string",
      "enum": [
        "id",
        "name"
      ]
    },
    "stale": {
      "type": "boolean"
    },
    "instances": {
      "type": "object",
      "properties": {
        "totalInstances": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "totalOccupants": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "countsByAccess": {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          }
        },
        "countsByRegion": {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          }
        }
      },
      "required": [
        "totalInstances",
        "totalOccupants",
        "countsByAccess",
        "countsByRegion"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "worldId",
    "resolvedBy",
    "stale",
    "instances"
  ],
  "additionalProperties": false
}
```

### vrchat_world_profile
Get a world profile by worldId or name (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "compact": {
      "type": "boolean"
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991
    },
    "worldId": {
      "type": "string"
    },
    "name": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "resolvedBy": {
      "type": "string",
      "enum": [
        "id",
        "name"
      ]
    },
    "stale": {
      "type": "boolean"
    },
    "world": {
      "type": "object",
      "properties": {
        "authorId": {
          "type": "string"
        },
        "authorName": {
          "type": "string",
          "minLength": 1
        },
        "capacity": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "created_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "defaultContentSettings": {
          "type": "object",
          "properties": {
            "drones": {
              "default": true,
              "type": "boolean"
            },
            "emoji": {
              "default": true,
              "type": "boolean"
            },
            "pedestals": {
              "default": true,
              "type": "boolean"
            },
            "prints": {
              "default": true,
              "type": "boolean"
            },
            "props": {
              "default": true,
              "type": "boolean"
            },
            "stickers": {
              "default": true,
              "type": "boolean"
            }
          },
          "additionalProperties": {}
        },
        "description": {
          "type": "string",
          "minLength": 0
        },
        "favorites": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "featured": {
          "default": false,
          "type": "boolean"
        },
        "heat": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "id": {
          "type": "string"
        },
        "imageUrl": {
          "type": "string",
          "minLength": 1
        },
        "instances": {
          "type": "array",
          "items": {
            "minItems": 2,
            "type": "array",
            "items": {}
          }
        },
        "labsPublicationDate": {
          "type": "string",
          "minLength": 1
        },
        "name": {
          "type": "string",
          "minLength": 1
        },
        "namespace": {
          "type": "string"
        },
        "occupants": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "organization": {
          "default": "vrchat",
          "type": "string",
          "minLength": 1
        },
        "popularity": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "previewYoutubeId": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "privateOccupants": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "publicOccupants": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "publicationDate": {
          "type": "string",
          "minLength": 1
        },
        "recommendedCapacity": {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        "releaseStatus": {
          "default": "public",
          "type": "string",
          "enum": [
            "all",
            "hidden",
            "private",
            "public"
          ]
        },
        "storeId": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "thumbnailImageUrl": {
          "type": "string",
          "minLength": 1
        },
        "udonProducts": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "unityPackages": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "assetUrl": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "assetUrlObject": {
                "type": "object",
                "properties": {},
                "additionalProperties": {}
              },
              "assetVersion": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "created_at": {
                "anyOf": [
                  {
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "id": {
                "type": "string"
              },
              "impostorUrl": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "impostorizerVersion": {
                "type": "string"
              },
              "performanceRating": {
                "type": "string",
                "enum": [
                  "Excellent",
                  "Good",
                  "Medium",
                  "None",
                  "Poor",
                  "VeryPoor"
                ]
              },
              "platform": {
                "type": "string"
              },
              "pluginUrl": {
                "type": "string"
              },
              "pluginUrlObject": {
                "type": "object",
                "properties": {},
                "additionalProperties": {}
              },
              "scanStatus": {
                "type": "string"
              },
              "unitySortNumber": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9007199254740991
              },
              "unityVersion": {
                "default": "5.3.4p1",
                "type": "string",
                "minLength": 1
              },
              "variant": {
                "type": "string"
              },
              "worldSignature": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            },
            "required": [
              "platform",
              "unityVersion"
            ],
            "additionalProperties": {}
          }
        },
        "updated_at": {
          "type": "string",
          "format": "date-time",
          "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
        },
        "urlList": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "version": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "visits": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        }
      },
      "additionalProperties": {}
    },
    "vrcxMemo": {
      "type": "object",
      "properties": {
        "editedAt": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "memo": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "required": [
        "editedAt",
        "memo"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "worldId",
    "resolvedBy",
    "stale",
    "world"
  ],
  "additionalProperties": false
}
```

### vrchat_worlds_favorites
List favorited worlds with compact results (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "featured": {
      "type": "boolean"
    },
    "sort": {
      "type": "string"
    },
    "order": {
      "type": "string"
    },
    "tag": {
      "type": "string"
    },
    "notag": {
      "type": "string"
    },
    "releaseStatus": {
      "type": "string"
    },
    "maxUnityVersion": {
      "type": "string"
    },
    "minUnityVersion": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "userId": {
      "type": "string"
    },
    "includeTags": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "worlds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "worldId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "authorId": {
            "type": "string"
          },
          "authorName": {
            "type": "string"
          },
          "capacity": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "visits": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "favorites": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "heat": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "popularity": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "releaseStatus": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "favoriteGroup": {
            "type": "string"
          },
          "favoriteId": {
            "type": "string"
          }
        },
        "required": [
          "worldId",
          "name"
        ],
        "additionalProperties": false
      }
    },
    "notes": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "total",
    "stale",
    "worlds"
  ],
  "additionalProperties": false
}
```

### vrchat_worlds_search
Search worlds by name and return compact results (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "pageSize": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "maxPages": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50
    },
    "maxItems": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "featured": {
      "type": "boolean"
    },
    "sort": {
      "type": "string"
    },
    "order": {
      "type": "string"
    },
    "tag": {
      "type": "string"
    },
    "notag": {
      "type": "string"
    },
    "releaseStatus": {
      "type": "string"
    },
    "maxUnityVersion": {
      "type": "string"
    },
    "minUnityVersion": {
      "type": "string"
    },
    "platform": {
      "type": "string"
    },
    "includeTags": {
      "type": "boolean"
    }
  },
  "required": [
    "query"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "string"
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "stale": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    },
    "worlds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "worldId": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "authorId": {
            "type": "string"
          },
          "authorName": {
            "type": "string"
          },
          "capacity": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "visits": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "favorites": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "heat": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "popularity": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "releaseStatus": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "favoriteGroup": {
            "type": "string"
          },
          "favoriteId": {
            "type": "string"
          }
        },
        "required": [
          "worldId",
          "name"
        ],
        "additionalProperties": false
      }
    },
    "notes": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "query",
    "total",
    "stale",
    "worlds"
  ],
  "additionalProperties": false
}
```

### vrcx_db_status
Detect VRCX on this machine and report database path, active user, and DB version (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {},
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "enabled": {
      "type": "boolean"
    },
    "available": {
      "type": "boolean"
    },
    "db": {
      "type": "object",
      "properties": {
        "path": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "exists": {
          "type": "boolean"
        },
        "source": {
          "type": "string",
          "enum": [
            "config",
            "vrcx_json",
            "default",
            "unknown"
          ]
        }
      },
      "required": [
        "path",
        "exists",
        "source"
      ],
      "additionalProperties": false
    },
    "worldDb": {
      "type": "object",
      "properties": {
        "path": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "exists": {
          "type": "boolean"
        },
        "source": {
          "type": "string",
          "enum": [
            "config",
            "vrcx_json",
            "default",
            "unknown"
          ]
        }
      },
      "required": [
        "path",
        "exists",
        "source"
      ],
      "additionalProperties": false
    },
    "vrcxJson": {
      "type": "object",
      "properties": {
        "path": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "type": "null"
            }
          ]
        },
        "exists": {
          "type": "boolean"
        }
      },
      "required": [
        "path",
        "exists"
      ],
      "additionalProperties": false
    },
    "activeUserId": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "userPrefix": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "databaseVersion": {
      "anyOf": [
        {
          "type": "integer",
          "minimum": -9007199254740991,
          "maximum": 9007199254740991
        },
        {
          "type": "null"
        }
      ]
    },
    "warnings": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": [
    "enabled",
    "available",
    "db",
    "worldDb",
    "vrcxJson",
    "activeUserId",
    "userPrefix",
    "databaseVersion"
  ],
  "additionalProperties": false
}
```

### vrcx_gamelog_world_visits_recent
List recent world visits from the VRCX gamelog (read-only). This reflects your local VRChat/VRCX activity history. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "daysBack": {
      "type": "integer",
      "minimum": 1,
      "maximum": 365
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "from": {
      "type": "string"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "visits": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "rowId": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "createdAt": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "worldId": {
            "type": "string"
          },
          "worldName": {
            "type": "string"
          },
          "groupName": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "groupId": {
            "type": "string"
          },
          "accessType": {
            "type": "string"
          },
          "region": {
            "type": "string"
          },
          "timeMs": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          }
        },
        "required": [
          "rowId",
          "createdAt",
          "location"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "from",
    "limit",
    "total",
    "truncated",
    "visits"
  ],
  "additionalProperties": false
}
```

### vrcx_instances_recent
List recent instance sessions for your active VRCX account (read-only). Derived from VRCX gamelog OnPlayerLeft entries. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "daysBack": {
      "type": "integer",
      "minimum": 1,
      "maximum": 365
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "from": {
      "type": "string"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "activeUserId": {
      "type": "string"
    },
    "sessions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "rowId": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "location": {
            "type": "string"
          },
          "joinTime": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "leaveTime": {
            "type": "string"
          },
          "durationMs": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "worldId": {
            "type": "string"
          },
          "worldName": {
            "type": "string"
          },
          "groupName": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "groupId": {
            "type": "string"
          },
          "accessType": {
            "type": "string"
          },
          "region": {
            "type": "string"
          }
        },
        "required": [
          "rowId",
          "location",
          "joinTime",
          "leaveTime",
          "durationMs"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "from",
    "limit",
    "total",
    "truncated",
    "sessions"
  ],
  "additionalProperties": false
}
```

### vrcx_memos_avatar_get
Get a VRCX avatar memo by avatarId (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "avatarId": {
      "type": "string"
    }
  },
  "required": [
    "avatarId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "avatarId": {
      "type": "string"
    },
    "editedAt": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "memo": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "avatarId",
    "editedAt",
    "memo"
  ],
  "additionalProperties": false
}
```

### vrcx_memos_user_get
Get a VRCX user memo by userId (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    }
  },
  "required": [
    "userId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "editedAt": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "memo": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "userId",
    "editedAt",
    "memo"
  ],
  "additionalProperties": false
}
```

### vrcx_memos_world_get
Get a VRCX world memo by worldId (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    }
  },
  "required": [
    "worldId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "worldId": {
      "type": "string"
    },
    "editedAt": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "memo": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    }
  },
  "required": [
    "worldId",
    "editedAt",
    "memo"
  ],
  "additionalProperties": false
}
```

### vrcx_user_relationship_sessions
List recent shared instance sessions with a user from VRCX logs (read-only). Use this for deep history; results are limited by default. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "displayName": {
      "type": "string",
      "minLength": 1
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "resolvedBy": {
      "type": "string",
      "enum": [
        "userId",
        "displayName",
        "none"
      ]
    },
    "resolvedUserId": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "sessions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "rowId": {
            "type": "integer",
            "minimum": -9007199254740991,
            "maximum": 9007199254740991
          },
          "location": {
            "type": "string"
          },
          "joinTime": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "leaveTime": {
            "type": "string"
          },
          "durationMs": {
            "type": "integer",
            "minimum": 0,
            "maximum": 9007199254740991
          },
          "worldId": {
            "type": "string"
          },
          "worldName": {
            "type": "string"
          },
          "groupName": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ]
          },
          "groupId": {
            "type": "string"
          },
          "accessType": {
            "type": "string"
          },
          "region": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          }
        },
        "required": [
          "rowId",
          "location",
          "joinTime",
          "leaveTime",
          "durationMs"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "query",
    "resolvedBy",
    "resolvedUserId",
    "total",
    "limit",
    "truncated",
    "sessions"
  ],
  "additionalProperties": false
}
```

### vrcx_user_relationship_summary
Summarize your relationship history with a user using VRCX logs: time spent, join count, and last seen (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    },
    "displayName": {
      "type": "string",
      "minLength": 1
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "query": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        }
      },
      "additionalProperties": false
    },
    "resolvedBy": {
      "type": "string",
      "enum": [
        "userId",
        "displayName",
        "none"
      ]
    },
    "resolvedUserId": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "displayName": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "lastSeen": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "null"
        }
      ]
    },
    "joinCount": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "timeSpentMs": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "timeSpentHours": {
      "type": "number",
      "minimum": 0
    },
    "hasData": {
      "type": "boolean"
    }
  },
  "required": [
    "query",
    "resolvedBy",
    "resolvedUserId",
    "displayName",
    "lastSeen",
    "joinCount",
    "timeSpentMs",
    "timeSpentHours",
    "hasData"
  ],
  "additionalProperties": false
}
```


## Cache tools
### vrchat_cache_invalidate
Invalidate cached data (local-only). (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "scope": {
      "type": "string",
      "enum": [
        "all",
        "area",
        "key"
      ]
    },
    "area": {
      "type": "string"
    },
    "key": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "enabled": {
      "type": "boolean"
    },
    "cleared": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "scope": {
      "type": "string"
    },
    "area": {
      "type": "string"
    },
    "key": {
      "type": "string"
    }
  },
  "required": [
    "enabled",
    "cleared",
    "scope"
  ],
  "additionalProperties": false
}
```


## System tools
### vrchat_config_get
Fetch API config (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Fields to keep."
    },
    "compact": {
      "type": "boolean",
      "description": "Compact response."
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991,
      "description": "Max array items."
    },
    "includeMeta": {
      "type": "boolean",
      "description": "Include URL/page metadata."
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Enable paging."
        },
        "size": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Items/page."
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max pages."
        },
        "maxItems": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max items."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991,
          "description": "Start offset."
        }
      },
      "additionalProperties": false,
      "description": "Paging controls."
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "data": {},
    "url": {
      "type": "string"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "data"
  ],
  "additionalProperties": false
}
```

### vrchat_operation_details
Look up exact OpenAPI params and request body schema for a VRChat operationId. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operationId": {
      "type": "string",
      "description": "VRChat OpenAPI operationId."
    }
  },
  "required": [
    "operationId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operationId": {
      "type": "string"
    },
    "method": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "summary": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "generatedToolStatus": {
      "type": "string",
      "enum": [
        "available",
        "blocked_by_policy",
        "curated_replacement",
        "hard_skipped",
        "disabled_by_config",
        "not_allowlisted"
      ]
    },
    "generatedToolName": {
      "type": "string"
    },
    "curatedToolName": {
      "type": "string"
    },
    "blockedReason": {
      "type": "string"
    },
    "parameters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "in": {
            "type": "string",
            "enum": [
              "path",
              "query",
              "header",
              "cookie"
            ]
          },
          "required": {
            "type": "boolean"
          },
          "description": {
            "type": "string"
          },
          "schemaRef": {
            "type": "string"
          },
          "schema": {}
        },
        "required": [
          "name",
          "in",
          "required"
        ],
        "additionalProperties": false
      }
    },
    "requestBody": {
      "type": "object",
      "properties": {
        "required": {
          "type": "boolean"
        },
        "description": {
          "type": "string"
        },
        "contentTypes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "schemaRef": {
          "type": "string"
        },
        "schema": {}
      },
      "required": [
        "required"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "operationId",
    "method",
    "path",
    "generatedToolStatus",
    "parameters"
  ],
  "additionalProperties": false
}
```

### vrchat_operations
List VRChat OpenAPI operationIds and generated-tool availability for vrchat_read/vrchat_write. (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "read",
        "write"
      ],
      "description": "Operation kind."
    },
    "view": {
      "type": "string",
      "enum": [
        "available",
        "all"
      ],
      "description": "Show available generated ops or all ops."
    },
    "query": {
      "type": "string",
      "description": "Filter operationId, path, summary, or description."
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500,
      "description": "Max operations."
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "total": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "truncated": {
      "type": "boolean"
    },
    "operations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "operationId": {
            "type": "string"
          },
          "kind": {
            "type": "string",
            "enum": [
              "read",
              "write"
            ]
          },
          "method": {
            "type": "string"
          },
          "path": {
            "type": "string"
          },
          "summary": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "generatedToolStatus": {
            "type": "string",
            "enum": [
              "available",
              "blocked_by_policy",
              "curated_replacement",
              "hard_skipped",
              "disabled_by_config",
              "not_allowlisted"
            ]
          },
          "generatedToolName": {
            "type": "string"
          },
          "curatedToolName": {
            "type": "string"
          },
          "blockedReason": {
            "type": "string"
          }
        },
        "required": [
          "operationId",
          "kind",
          "method",
          "path",
          "generatedToolStatus"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": [
    "total",
    "truncated",
    "operations"
  ],
  "additionalProperties": false
}
```

### vrchat_system_time
Get current system time (read-only). (read-only)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Fields to keep."
    },
    "compact": {
      "type": "boolean",
      "description": "Compact response."
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991,
      "description": "Max array items."
    },
    "includeMeta": {
      "type": "boolean",
      "description": "Include URL/page metadata."
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Enable paging."
        },
        "size": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Items/page."
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max pages."
        },
        "maxItems": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max items."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991,
          "description": "Start offset."
        }
      },
      "additionalProperties": false,
      "description": "Paging controls."
    }
  },
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "data": {},
    "url": {
      "type": "string"
    },
    "page": {
      "type": "object",
      "properties": {
        "pages": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "items": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "pageSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "offsetStart": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "truncated": {
          "type": "boolean"
        }
      },
      "required": [
        "pages",
        "items",
        "pageSize",
        "offsetStart",
        "truncated"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "data"
  ],
  "additionalProperties": false
}
```


## Auth tools
### vrchat_auth_begin
Begin login flow via local browser UI. (write)

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "url": {
      "type": "string"
    }
  },
  "required": [
    "url"
  ],
  "additionalProperties": false
}
```

### vrchat_auth_logout
Logout and clear session. (write)

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "loggedIn": {
      "type": "boolean"
    }
  },
  "required": [
    "loggedIn"
  ],
  "additionalProperties": false
}
```

### vrchat_auth_status
Auth status. (read-only)

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "loggedIn": {
      "type": "boolean"
    }
  },
  "required": [
    "loggedIn"
  ],
  "additionalProperties": false
}
```


## Optional raw tool
### vrchat_call
Call a VRChat OpenAPI operation by operationId. (write)

Input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operationId": {
      "type": "string"
    },
    "params": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {}
    },
    "body": {},
    "options": {
      "type": "object",
      "properties": {
        "dryRun": {
          "type": "boolean"
        },
        "rawResponse": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    }
  },
  "required": [
    "operationId"
  ],
  "additionalProperties": false
}
```

Output schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "url": {
      "type": "string"
    },
    "status": {
      "type": "number"
    },
    "headers": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {
        "type": "string"
      }
    },
    "data": {},
    "dryRun": {
      "type": "boolean"
    }
  },
  "required": [
    "url"
  ],
  "additionalProperties": false
}
```


## Auto-generated read router (GET operations)
Use `vrchat_read` with `operationId` plus OpenAPI path/query/header/cookie values under `params`. Use `vrchat_operations` to discover operationIds and `vrchat_operation_details` for exact per-operation parameter schemas.
Generated read input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operationId": {
      "type": "string",
      "minLength": 1,
      "description": "OpenAPI operationId."
    },
    "params": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {},
      "description": "OpenAPI params."
    },
    "fields": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Fields to keep."
    },
    "compact": {
      "type": "boolean",
      "description": "Compact response."
    },
    "maxArrayLength": {
      "type": "integer",
      "exclusiveMinimum": 0,
      "maximum": 9007199254740991,
      "description": "Max array items."
    },
    "includeMeta": {
      "type": "boolean",
      "description": "Include URL/page metadata."
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Enable paging."
        },
        "size": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Items/page."
        },
        "maxPages": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max pages."
        },
        "maxItems": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991,
          "description": "Max items."
        },
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991,
          "description": "Start offset."
        }
      },
      "additionalProperties": false,
      "description": "Paging controls."
    }
  },
  "required": [
    "operationId"
  ],
  "additionalProperties": {}
}
```

Generated output uses a compact envelope; exact API response content is under `data` and optional metadata may be present when requested:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "data": {
      "description": "VRChat API response data."
    }
  },
  "required": [
    "data"
  ],
  "additionalProperties": {}
}
```

- `checkUserExists` via `vrchat_read` (GET /auth/exists) - Read VRChat API: Check User Exists.
- `checkUserPersistenceExists` via `vrchat_read` (GET /users/{userId}/{worldId}/persist/exists) - Read VRChat API: Check User Persistence Exists.
- `confirmEmail` via `vrchat_read` (GET /auth/confirmEmail) - Read VRChat API: Confirm Email.
- `downloadFileVersion` via `vrchat_read` (GET /file/{fileId}/{versionId}) - Read VRChat API: Download File Version.
- `getActiveLicenses` via `vrchat_read` (GET /economy/licenses/active) - Read VRChat API: Get Active Licenses.
- `getActiveWorlds` via `vrchat_read` (GET /worlds/active) - Read VRChat API: List Active Worlds.
- `getAdminAssetBundle` via `vrchat_read` (GET /adminassetbundles/{adminAssetBundleId}) - Read VRChat API: Get AdminAssetBundle.
- `getAssignedPermissions` via `vrchat_read` (GET /auth/permissions) - Read VRChat API: Get Assigned Permissions.
- `getAvatarStyles` via `vrchat_read` (GET /avatarStyles) - Read VRChat API: Get Avatar Styles.
- `getBalance` via `vrchat_read` (GET /user/{userId}/balance) - Read VRChat API: Get Balance.
- `getBalanceEarnings` via `vrchat_read` (GET /user/{userId}/balance/earnings) - Read VRChat API: Get Balance Earnings.
- `getBlockedGroups` via `vrchat_read` (GET /users/{userId}/groups/userblocked) - Read VRChat API: Get User Group Blocks.
- `getBulkGiftPurchases` via `vrchat_read` (GET /user/bulk/gift/purchases) - Read VRChat API: Get Bulk Gift Purchases.
- `getContentAgreementStatus` via `vrchat_read` (GET /agreement) - Read VRChat API: Get Content Agreement Status.
- `getCSS` via `vrchat_read` (GET /css/app.css) - Read VRChat API: Download CSS.
- `getCurrentOnlineUsers` via `vrchat_read` (GET /visits) - Read VRChat API: Current Online Users.
- `getCurrentSubscriptions` via `vrchat_read` (GET /auth/user/subscription) - Read VRChat API: Get Current Subscriptions.
- `getEconomyAccount` via `vrchat_read` (GET /user/{userId}/economy/account) - Read VRChat API: Get Economy Account.
- `getFeaturedCalendarEvents` via `vrchat_read` (GET /calendar/featured) - Read VRChat API: List featured calendar events.
- `getFile` via `vrchat_read` (GET /file/{fileId}) - Read VRChat API: Show File.
- `getFileAnalysis` via `vrchat_read` (GET /analysis/{fileId}/{versionId}) - Read VRChat API: Get File Version Analysis.
- `getFileAnalysisSecurity` via `vrchat_read` (GET /analysis/{fileId}/{versionId}/security) - Read VRChat API: Get File Version Analysis Security.
- `getFileAnalysisStandard` via `vrchat_read` (GET /analysis/{fileId}/{versionId}/standard) - Read VRChat API: Get File Version Analysis Standard.
- `getFileDataUploadStatus` via `vrchat_read` (GET /file/{fileId}/{versionId}/{fileType}/status) - Read VRChat API: Check FileData Upload Status.
- `getFiles` via `vrchat_read` (GET /files) - Read VRChat API: List Files.
- `getFollowedCalendarEvents` via `vrchat_read` (GET /calendar/following) - Read VRChat API: List followed calendar events.
- `getFriendStatus` via `vrchat_read` (GET /user/{userId}/friendStatus) - Read VRChat API: Check Friend Status.
- `getGlobalAvatarModerations` via `vrchat_read` (GET /auth/user/avatarmoderations) - Read VRChat API: Get Global Avatar Moderations.
- `getGroupAuditLogEntryTypes` via `vrchat_read` (GET /groups/{groupId}/auditLogTypes) - Read VRChat API: Get Group Audit Log Entry Types.
- `getGroupAuditLogs` via `vrchat_read` (GET /groups/{groupId}/auditLogs) - Read VRChat API: Get Group Audit Logs.
- `getGroupBans` via `vrchat_read` (GET /groups/{groupId}/bans) - Read VRChat API: Get Group Bans.
- `getGroupCalendarEventICS` via `vrchat_read` (GET /calendar/{groupId}/{calendarId}.ics) - Read VRChat API: Download calendar event as ICS.
- `getGroupGalleryImages` via `vrchat_read` (GET /groups/{groupId}/galleries/{groupGalleryId}) - Read VRChat API: Get Group Gallery Images.
- `getGroupInvites` via `vrchat_read` (GET /groups/{groupId}/invites) - Read VRChat API: Get Group Invites Sent.
- `getGroupMember` via `vrchat_read` (GET /groups/{groupId}/members/{userId}) - Read VRChat API: Get Group Member.
- `getGroupPermissions` via `vrchat_read` (GET /groups/{groupId}/permissions) - Read VRChat API: List Group Permissions.
- `getGroupRequests` via `vrchat_read` (GET /groups/{groupId}/requests) - Read VRChat API: Get Group Join Requests.
- `getGroupTransferability` via `vrchat_read` (GET /groups/{groupId}/transfer) - Read VRChat API: Get Group Transferability.
- `getHealth` via `vrchat_read` (GET /health) - Read VRChat API: Check API Health.
- `getImpostorQueueStats` via `vrchat_read` (GET /avatars/impostor/queue/stats) - Read VRChat API: Get Impostor Queue Stats.
- `getInfoPush` via `vrchat_read` (GET /infoPush) - Read VRChat API: Show Information Notices.
- `getInstance` via `vrchat_read` (GET /instances/{worldId}:{instanceId}) - Read VRChat API: Get Instance.
- `getInstanceByShortName` via `vrchat_read` (GET /instances/s/{shortName}) - Read VRChat API: Get Instance By Short Name.
- `getInventory` via `vrchat_read` (GET /inventory) - Read VRChat API: Get Inventory.
- `getInventoryCollections` via `vrchat_read` (GET /inventory/collections) - Read VRChat API: List Inventory Collections.
- `getInventoryDrops` via `vrchat_read` (GET /inventory/drops) - Read VRChat API: List Inventory Drops.
- `getInventoryTemplate` via `vrchat_read` (GET /inventory/template/{inventoryTemplateId}) - Read VRChat API: Get Inventory Template.
- `getInvitedGroups` via `vrchat_read` (GET /users/{userId}/groups/invited) - Read VRChat API: Get User Group Invited.
- `getInviteMessage` via `vrchat_read` (GET /message/{userId}/{messageType}/{slot}) - Read VRChat API: Get Invite Message.
- `getInviteMessages` via `vrchat_read` (GET /message/{userId}/{messageType}) - Read VRChat API: List Invite Messages.
- `getJam` via `vrchat_read` (GET /jams/{jamId}) - Read VRChat API: Show jam information.
- `getJams` via `vrchat_read` (GET /jams) - Read VRChat API: Show jams list.
- `getJamSubmissions` via `vrchat_read` (GET /jams/{jamId}/submissions) - Read VRChat API: Show jam submissions.
- `getJavaScript` via `vrchat_read` (GET /js/app.js) - Read VRChat API: Download JavaScript.
- `getLicensedAvatars` via `vrchat_read` (GET /avatars/licensed) - Read VRChat API: List Licensed Avatars.
- `getLicenseGroup` via `vrchat_read` (GET /licenseGroups/{licenseGroupId}) - Read VRChat API: Get License Group.
- `getModerationReports` via `vrchat_read` (GET /moderationReports) - Read VRChat API: Get Moderation Reports.
- `getMutualFriends` via `vrchat_read` (GET /users/{userId}/mutuals/friends) - Read VRChat API: Get User Mutual Friends.
- `getMutualGroups` via `vrchat_read` (GET /users/{userId}/mutuals/groups) - Read VRChat API: Get User Mutual Groups.
- `getMutuals` via `vrchat_read` (GET /users/{userId}/mutuals) - Read VRChat API: Get User Mutuals.
- `getNotification` via `vrchat_read` (GET /auth/user/notifications/{notificationId}) - Read VRChat API: Show notification.
- `getNotificationV2` via `vrchat_read` (GET /notifications/{notificationId}) - Read VRChat API: Get NotificationV2.
- `getNotificationV2s` via `vrchat_read` (GET /notifications) - Read VRChat API: List NotificationV2s.
- `getOwnAvatar` via `vrchat_read` (GET /users/{userId}/avatar) - Read VRChat API: Get Own Avatar.
- `getOwnInventoryItem` via `vrchat_read` (GET /inventory/{inventoryItemId}) - Read VRChat API: Get Own Inventory Item.
- `getPermission` via `vrchat_read` (GET /permissions/{permissionId}) - Read VRChat API: Get Permission.
- `getPlayerModerations` via `vrchat_read` (GET /auth/user/playermoderations) - Read VRChat API: Search Player Moderations.
- `getPrint` via `vrchat_read` (GET /prints/{printId}) - Read VRChat API: Get Print.
- `getProductListing` via `vrchat_read` (GET /listing/{productId}) - Read VRChat API: Get Product Listing.
- `getProductListingAlternate` via `vrchat_read` (GET /products/{productId}) - Read VRChat API: Get Product Listing (alternate).
- `getProductListings` via `vrchat_read` (GET /user/{userId}/listings) - Read VRChat API: Get User Product Listings.
- `getProductPurchases` via `vrchat_read` (GET /economy/purchases) - Read VRChat API: Get Product Purchases.
- `getProp` via `vrchat_read` (GET /props/{propId}) - Read VRChat API: Get Prop.
- `getPropPublishStatus` via `vrchat_read` (GET /props/{propId}/publish) - Read VRChat API: Get Prop Publish Status.
- `getRecentLocations` via `vrchat_read` (GET /instances/recent) - Read VRChat API: List Recent Locations.
- `getRecentSubscription` via `vrchat_read` (GET /user/subscription/recent) - Read VRChat API: Get Recent Subscription.
- `getRecentWorlds` via `vrchat_read` (GET /worlds/recent) - Read VRChat API: List Recent Worlds.
- `getRecoveryCodes` via `vrchat_read` (GET /auth/user/twofactorauth/otp) - Read VRChat API: Get 2FA Recovery codes.
- `getShortName` via `vrchat_read` (GET /instances/{worldId}:{instanceId}/shortName) - Read VRChat API: Get Instance Short Name.
- `getSteamTransaction` via `vrchat_read` (GET /Steam/transactions/{transactionId}) - Read VRChat API: Get Steam Transaction.
- `getSteamTransactions` via `vrchat_read` (GET /Steam/transactions) - Read VRChat API: List Steam Transactions.
- `getStore` via `vrchat_read` (GET /economy/store) - Read VRChat API: Get Store.
- `getStoreShelves` via `vrchat_read` (GET /economy/store/shelves) - Read VRChat API: Get Store Shelves.
- `getSubscriptions` via `vrchat_read` (GET /subscriptions) - Read VRChat API: List Subscriptions.
- `getTiliaStatus` via `vrchat_read` (GET /tilia/status) - Read VRChat API: Get Tilia Status.
- `getTiliaTos` via `vrchat_read` (GET /user/{userId}/tilia/tos) - Read VRChat API: Get Tilia TOS Agreement Status.
- `getTokenBundles` via `vrchat_read` (GET /tokenBundles) - Read VRChat API: List Token Bundles.
- `getUserAllGroupPermissions` via `vrchat_read` (GET /users/{userId}/groups/permissions) - Read VRChat API: Get user's permissions for all joined groups.
- `getUserCreditsEligible` via `vrchat_read` (GET /users/{userId}/credits/eligible) - Read VRChat API: Get User Credits Eligiblity.
- `getUserFeedback` via `vrchat_read` (GET /users/{userId}/feedback) - Read VRChat API: Get User Feedback.
- `getUserGroupInstances` via `vrchat_read` (GET /users/{userId}/instances/groups) - Read VRChat API: Get User Group Instances.
- `getUserGroupInstancesForGroup` via `vrchat_read` (GET /users/{userId}/instances/groups/{groupId}) - Read VRChat API: Get User Group Instances for a specific Group.
- `getUserGroupRequests` via `vrchat_read` (GET /users/{userId}/groups/requested) - Read VRChat API: Get User Group Requests.
- `getUserInventoryItem` via `vrchat_read` (GET /user/{userId}/inventory/{inventoryItemId}) - Read VRChat API: Get User Inventory Item.
- `getUserNote` via `vrchat_read` (GET /userNotes/{userNoteId}) - Read VRChat API: Get User Note.
- `getUserNotes` via `vrchat_read` (GET /userNotes) - Read VRChat API: Get User Notes.
- `getUserPrints` via `vrchat_read` (GET /prints/user/{userId}) - Read VRChat API: Get Own Prints.
- `getUserRepresentedGroup` via `vrchat_read` (GET /users/{userId}/groups/represented) - Read VRChat API: Get user's current represented group.
- `getUserSubscriptionEligible` via `vrchat_read` (GET /users/{userId}/subscription/eligible) - Read VRChat API: Get User Subscription Eligiblity.
- `getWorldInstance` via `vrchat_read` (GET /worlds/{worldId}/{instanceId}) - Read VRChat API: Get World Instance.
- `getWorldMetadata` via `vrchat_read` (GET /worlds/{worldId}/metadata) - Read VRChat API: Get World Metadata.
- `getWorldPublishStatus` via `vrchat_read` (GET /worlds/{worldId}/publish) - Read VRChat API: Get World Publish Status.
- `listProps` via `vrchat_read` (GET /props) - Read VRChat API: List Props.
- `searchAvatars` via `vrchat_read` (GET /avatars) - Read VRChat API: Search Avatars.
- `searchGroupMembers` via `vrchat_read` (GET /groups/{groupId}/members/search) - Read VRChat API: Search Group Members.
- `searchUsers` via `vrchat_read` (GET /users) - Read VRChat API: Search All Users.
- `shareInventoryItemPedestal` via `vrchat_read` (GET /inventory/cloning/pedestal) - Read VRChat API: Share Inventory Item by Pedestal.
- `spawnInventoryItem` via `vrchat_read` (GET /inventory/spawn) - Read VRChat API: Spawn Inventory Item.
- `verifyAuthToken` via `vrchat_read` (GET /auth) - Read VRChat API: Verify Auth Token.
- `verifyLoginPlace` via `vrchat_read` (GET /auth/verifyLoginPlace) - Read VRChat API: Verify Login Place.

## Auto-generated write router (non-GET operations)
Use `vrchat_write` with `operationId`, OpenAPI path/query/header/cookie values under `params`, and JSON payloads under `body`. Use `vrchat_operations` to discover operationIds and `vrchat_operation_details` for exact per-operation parameter and body schemas. Set `writes.allow = false` for read-only mode.
Generated write input schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "operationId": {
      "type": "string",
      "minLength": 1,
      "description": "OpenAPI operationId."
    },
    "params": {
      "type": "object",
      "propertyNames": {
        "type": "string"
      },
      "additionalProperties": {},
      "description": "OpenAPI params."
    },
    "body": {
      "description": "OpenAPI request body."
    },
    "includeMeta": {
      "type": "boolean",
      "description": "Include URL/status/headers."
    },
    "options": {
      "type": "object",
      "properties": {
        "dryRun": {
          "type": "boolean",
          "description": "Preview request."
        },
        "rawResponse": {
          "type": "boolean",
          "description": "Return raw metadata."
        }
      },
      "additionalProperties": false,
      "description": "Write options."
    }
  },
  "required": [
    "operationId"
  ],
  "additionalProperties": {}
}
```

Generated output uses a compact envelope; exact API response content is under `data` and optional metadata may be present when requested:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "data": {
      "description": "VRChat API response data."
    }
  },
  "additionalProperties": {}
}
```

- `acceptFriendRequest` via `vrchat_write` (PUT /auth/user/notifications/{notificationId}/accept) - Write VRChat API: Accept Friend Request.
- `acknowledgeNotificationV2` via `vrchat_write` (POST /notifications/{notificationId}/see) - Write VRChat API: Acknowledge NotificationV2.
- `addGroupGalleryImage` via `vrchat_write` (POST /groups/{groupId}/galleries/{groupGalleryId}/images) - Write VRChat API: Add Group Gallery Image.
- `addGroupPost` via `vrchat_write` (POST /groups/{groupId}/posts) - Write VRChat API: Create a post in a Group.
- `addTags` via `vrchat_write` (POST /users/{userId}/addTags) - Write VRChat API: Add User Tags.
- `banGroupMember` via `vrchat_write` (POST /groups/{groupId}/bans) - Write VRChat API: Ban Group Member.
- `blockGroup` via `vrchat_write` (POST /groups/{groupId}/block) - Write VRChat API: Block Group.
- `cancelGroupRequest` via `vrchat_write` (DELETE /groups/{groupId}/requests) - Write VRChat API: Cancel Group Join Request.
- `cancelGroupTransfer` via `vrchat_write` (DELETE /groups/{groupId}/transfer) - Write VRChat API: Cancel Group Transfer.
- `cancelPending2FA` via `vrchat_write` (DELETE /auth/twofactorauth/totp/pending) - Write VRChat API: Cancel pending enabling of time-based 2FA codes.
- `clearAllPlayerModerations` via `vrchat_write` (DELETE /auth/user/playermoderations) - Write VRChat API: Clear All Player Moderations.
- `clearFavoriteGroup` via `vrchat_write` (DELETE /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}) - Write VRChat API: Clear Favorite Group.
- `clearNotifications` via `vrchat_write` (PUT /auth/user/notifications/clear) - Write VRChat API: Clear All Notifications.
- `closeInstance` via `vrchat_write` (DELETE /instances/{worldId}:{instanceId}) - Write VRChat API: Close Instance.
- `consumeOwnInventoryItem` via `vrchat_write` (PUT /inventory/{inventoryItemId}/consume) - Write VRChat API: Consume Own Inventory Item.
- `createFile` via `vrchat_write` (POST /file) - Write VRChat API: Create File.
- `createFileVersion` via `vrchat_write` (POST /file/{fileId}) - Write VRChat API: Create File Version.
- `createGlobalAvatarModeration` via `vrchat_write` (POST /auth/user/avatarmoderations) - Write VRChat API: Create Global Avatar Moderation.
- `createGroup` via `vrchat_write` (POST /groups) - Write VRChat API: Create Group.
- `createGroupGallery` via `vrchat_write` (POST /groups/{groupId}/galleries) - Write VRChat API: Create Group Gallery.
- `createProp` via `vrchat_write` (POST /props) - Write VRChat API: Create Prop.
- `declineGroupInvite` via `vrchat_write` (PUT /groups/{groupId}/invites) - Write VRChat API: Decline Invite from Group.
- `deleteAllNotificationV2s` via `vrchat_write` (DELETE /notifications) - Write VRChat API: Delete All NotificationV2s.
- `deleteAllUserPersistenceData` via `vrchat_write` (DELETE /users/{userId}/persist) - Write VRChat API: Delete All User Persistence Data.
- `deleteFile` via `vrchat_write` (DELETE /file/{fileId}) - Write VRChat API: Delete File.
- `deleteFileVersion` via `vrchat_write` (DELETE /file/{fileId}/{versionId}) - Write VRChat API: Delete File Version.
- `deleteFriendRequest` via `vrchat_write` (DELETE /user/{userId}/friendRequest) - Write VRChat API: Delete Friend Request.
- `deleteGlobalAvatarModeration` via `vrchat_write` (DELETE /auth/user/avatarmoderations) - Write VRChat API: Delete Global Avatar Moderation.
- `deleteGroup` via `vrchat_write` (DELETE /groups/{groupId}) - Write VRChat API: Delete Group.
- `deleteGroupGallery` via `vrchat_write` (DELETE /groups/{groupId}/galleries/{groupGalleryId}) - Write VRChat API: Delete Group Gallery.
- `deleteGroupGalleryImage` via `vrchat_write` (DELETE /groups/{groupId}/galleries/{groupGalleryId}/images/{groupGalleryImageId}) - Write VRChat API: Delete Group Gallery Image.
- `deleteGroupInvite` via `vrchat_write` (DELETE /groups/{groupId}/invites/{userId}) - Write VRChat API: Delete User Invite.
- `deleteGroupPost` via `vrchat_write` (DELETE /groups/{groupId}/posts/{notificationId}) - Write VRChat API: Delete a Group post.
- `deleteImpostor` via `vrchat_write` (DELETE /avatars/{avatarId}/impostor) - Write VRChat API: Delete generated Impostor.
- `deleteModerationReport` via `vrchat_write` (DELETE /moderationReports/{moderationReportId}) - Write VRChat API: Delete Moderation Report.
- `deleteNotification` via `vrchat_write` (PUT /auth/user/notifications/{notificationId}/hide) - Write VRChat API: Delete Notification.
- `deleteNotificationV2` via `vrchat_write` (DELETE /notifications/{notificationId}) - Write VRChat API: Delete NotificationV2.
- `deleteOwnInventoryItem` via `vrchat_write` (DELETE /inventory/{inventoryItemId}) - Write VRChat API: Delete Own Inventory Item.
- `deletePrint` via `vrchat_write` (DELETE /prints/{printId}) - Write VRChat API: Delete Print.
- `deleteProp` via `vrchat_write` (DELETE /props/{propId}) - Write VRChat API: Delete Prop.
- `deleteUser` via `vrchat_write` (PUT /users/{userId}/delete) - Write VRChat API: Delete User.
- `deleteUserPersistence` via `vrchat_write` (DELETE /users/{userId}/{worldId}/persist) - Write VRChat API: Delete User Persistence.
- `disable2FA` via `vrchat_write` (DELETE /auth/twofactorauth) - Write VRChat API: Disable 2FA.
- `editPrint` via `vrchat_write` (POST /prints/{printId}) - Write VRChat API: Edit Print.
- `enable2FA` via `vrchat_write` (POST /auth/twofactorauth/totp/pending) - Write VRChat API: Enable time-based 2FA codes.
- `enqueueImpostor` via `vrchat_write` (POST /avatars/{avatarId}/impostor/enqueue) - Write VRChat API: Enqueue Impostor generation.
- `equipOwnInventoryItem` via `vrchat_write` (PUT /inventory/{inventoryItemId}/equip) - Write VRChat API: Equip Own Inventory Item.
- `finishFileDataUpload` via `vrchat_write` (PUT /file/{fileId}/{versionId}/{fileType}/finish) - Write VRChat API: Finish FileData Upload.
- `initiateOrAcceptGroupTransfer` via `vrchat_write` (POST /groups/{groupId}/transfer) - Write VRChat API: Initiate or Accept Group Transfer.
- `joinGroup` via `vrchat_write` (POST /groups/{groupId}/join) - Write VRChat API: Join Group.
- `kickGroupMember` via `vrchat_write` (DELETE /groups/{groupId}/members/{userId}) - Write VRChat API: Kick Group Member.
- `leaveGroup` via `vrchat_write` (POST /groups/{groupId}/leave) - Write VRChat API: Leave Group.
- `markNotificationAsRead` via `vrchat_write` (PUT /auth/user/notifications/{notificationId}/see) - Write VRChat API: Mark Notification As Read.
- `moderateUser` via `vrchat_write` (POST /auth/user/playermoderations) - Write VRChat API: Moderate User.
- `publishProp` via `vrchat_write` (PUT /props/{propId}/publish) - Write VRChat API: Publish Prop.
- `purchaseProductListing` via `vrchat_write` (POST /economy/purchase/listing) - Write VRChat API: Purchase Product Listing.
- `registerUserAccount` via `vrchat_write` (POST /auth/register) - Write VRChat API: Register User Account.
- `removeTags` via `vrchat_write` (POST /users/{userId}/removeTags) - Write VRChat API: Remove User Tags.
- `replyNotificationV2` via `vrchat_write` (POST /notifications/{notificationId}/reply) - Write VRChat API: Reply NotificationV2.
- `requestInvite` via `vrchat_write` (POST /requestInvite/{userId}) - Write VRChat API: Request Invite.
- `resendEmailConfirmation` via `vrchat_write` (POST /auth/user/resendEmail) - Write VRChat API: Resend Email Confirmation.
- `resetInviteMessage` via `vrchat_write` (DELETE /message/{userId}/{messageType}/{slot}) - Write VRChat API: Reset Invite Message.
- `respondGroupJoinRequest` via `vrchat_write` (PUT /groups/{groupId}/requests/{userId}) - Write VRChat API: Respond Group Join request.
- `respondInvite` via `vrchat_write` (POST /invite/{notificationId}/response) - Write VRChat API: Respond Invite.
- `respondInviteWithPhoto` via `vrchat_write` (POST /invite/{notificationId}/response/photo) - Write VRChat API: Respond Invite with photo.
- `respondNotificationV2` via `vrchat_write` (POST /notifications/{notificationId}/respond) - Write VRChat API: Respond NotificationV2.
- `selectAvatar` via `vrchat_write` (PUT /avatars/{avatarId}/select) - Write VRChat API: Select Avatar.
- `selectFallbackAvatar` via `vrchat_write` (PUT /avatars/{avatarId}/selectFallback) - Write VRChat API: Select Fallback Avatar.
- `setGroupGalleryFileOrder` via `vrchat_write` (PUT /files/order) - Write VRChat API: Set Group Gallery File Order.
- `shareInventoryItemDirect` via `vrchat_write` (POST /inventory/cloning/direct) - Write VRChat API: Share Inventory Item Direct.
- `startFileDataUpload` via `vrchat_write` (PUT /file/{fileId}/{versionId}/{fileType}/start) - Write VRChat API: Start FileData Upload.
- `submitContentAgreement` via `vrchat_write` (POST /agreement) - Write VRChat API: Submit Content Agreement.
- `submitModerationReport` via `vrchat_write` (POST /moderationReports) - Write VRChat API: Submit Moderation Report.
- `unbanGroupMember` via `vrchat_write` (DELETE /groups/{groupId}/bans/{userId}) - Write VRChat API: Unban Group Member.
- `unequipOwnInventorySlot` via `vrchat_write` (DELETE /inventory/{inventoryItemId}/equip) - Write VRChat API: Unequip Own Inventory Slot.
- `unfriend` via `vrchat_write` (DELETE /auth/user/friends/{userId}) - Write VRChat API: Unfriend.
- `unmoderateUser` via `vrchat_write` (PUT /auth/user/unplayermoderate) - Write VRChat API: Unmoderate User.
- `unpublishProp` via `vrchat_write` (DELETE /props/{propId}/publish) - Write VRChat API: Unpublish Prop.
- `updateAssetReviewNotes` via `vrchat_write` (PUT /assetReview/{assetReviewId}/notes) - Write VRChat API: Update Asset Review Notes.
- `updateBadge` via `vrchat_write` (PUT /users/{userId}/badges/{badgeId}) - Write VRChat API: Update User Badge.
- `updateFavoriteGroup` via `vrchat_write` (PUT /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}) - Write VRChat API: Update Favorite Group.
- `updateGroup` via `vrchat_write` (PUT /groups/{groupId}) - Write VRChat API: Update Group.
- `updateGroupGallery` via `vrchat_write` (PUT /groups/{groupId}/galleries/{groupGalleryId}) - Write VRChat API: Update Group Gallery.
- `updateGroupMember` via `vrchat_write` (PUT /groups/{groupId}/members/{userId}) - Write VRChat API: Update Group Member.
- `updateGroupPost` via `vrchat_write` (PUT /groups/{groupId}/posts/{notificationId}) - Write VRChat API: Edits a Group post.
- `updateGroupRepresentation` via `vrchat_write` (PUT /groups/{groupId}/representation) - Write VRChat API: Update Group Representation.
- `updateInviteMessage` via `vrchat_write` (PUT /message/{userId}/{messageType}/{slot}) - Write VRChat API: Update Invite Message.
- `updateOwnInventoryItem` via `vrchat_write` (PUT /inventory/{inventoryItemId}) - Write VRChat API: Update Own Inventory Item.
- `updateProp` via `vrchat_write` (PUT /props/{propId}) - Write VRChat API: Update Prop.
- `updateTiliaTos` via `vrchat_write` (PUT /user/{userId}/tilia/tos) - Write VRChat API: Update Tilia TOS Agreement Status.
- `updateUserNote` via `vrchat_write` (POST /userNotes) - Write VRChat API: Update User Note.
- `uploadGalleryImage` via `vrchat_write` (POST /gallery) - Write VRChat API: Upload gallery image.
- `uploadIcon` via `vrchat_write` (POST /icon) - Write VRChat API: Upload icon.
- `uploadImage` via `vrchat_write` (POST /file/image) - Write VRChat API: Upload gallery image, icon, emoji or sticker.
- `uploadPrint` via `vrchat_write` (POST /prints) - Write VRChat API: Upload Print.
- `verify2FA` via `vrchat_write` (POST /auth/twofactorauth/totp/verify) - Write VRChat API: Verify 2FA code.
- `verify2FAEmailCode` via `vrchat_write` (POST /auth/twofactorauth/emailotp/verify) - Write VRChat API: Verify 2FA email code.
- `verifyPending2FA` via `vrchat_write` (POST /auth/twofactorauth/totp/pending/verify) - Write VRChat API: Verify Pending 2FA code.
- `verifyRecoveryCode` via `vrchat_write` (POST /auth/twofactorauth/otp/verify) - Write VRChat API: Verify 2FA code with Recovery code.
