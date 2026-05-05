# Tool Catalog (generated)

Generated: 2026-05-04T22:14:24.918Z

Spec: VRChat API Documentation (1.20.7)

This file is generated without starting the MCP server. It reflects curated tools plus all possible auto-generated tools that are exposed (curated replacements are omitted).

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
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
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
              "assetVersion",
              "id",
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
                "maxItems": 2,
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
                    "type": "string",
                    "format": "date-time",
                    "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
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
                  "assetVersion",
                  "id",
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
                          "maxItems": 2,
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
                              "type": "string",
                              "format": "date-time",
                              "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
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
                            "assetVersion",
                            "id",
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
            "maxItems": 2,
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
                "type": "string",
                "format": "date-time",
                "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$"
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
              "assetVersion",
              "id",
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
    "includeMeta": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "size": {
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
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
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
    "includeMeta": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "size": {
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
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
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
    },
    "token": {
      "type": "string"
    }
  },
  "required": [
    "url",
    "token"
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


## Auto-generated read tools (GET operations)
Input schemas are derived per operation from OpenAPI parameters (path/query/header/cookie).
Read options are shared across read tools:

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
    "includeMeta": {
      "type": "boolean"
    },
    "page": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "size": {
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
        "offset": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
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

- `vrchat_read_checkUserExists` (GET /auth/exists) - Check User Exists
- `vrchat_read_checkUserPersistenceExists` (GET /users/{userId}/{worldId}/persist/exists) - Check User Persistence Exists
- `vrchat_read_confirmEmail` (GET /auth/confirmEmail) - Confirm Email
- `vrchat_read_downloadFileVersion` (GET /file/{fileId}/{versionId}) - Download File Version
- `vrchat_read_getActiveLicenses` (GET /economy/licenses/active) - Get Active Licenses
- `vrchat_read_getActiveWorlds` (GET /worlds/active) - List Active Worlds
- `vrchat_read_getAdminAssetBundle` (GET /adminassetbundles/{adminAssetBundleId}) - Get AdminAssetBundle
- `vrchat_read_getAssignedPermissions` (GET /auth/permissions) - Get Assigned Permissions
- `vrchat_read_getAvatar` (GET /avatars/{avatarId}) - Get Avatar
- `vrchat_read_getAvatarStyles` (GET /avatarStyles) - Get Avatar Styles
- `vrchat_read_getBalance` (GET /user/{userId}/balance) - Get Balance
- `vrchat_read_getBalanceEarnings` (GET /user/{userId}/balance/earnings) - Get Balance Earnings
- `vrchat_read_getBlockedGroups` (GET /users/{userId}/groups/userblocked) - Get User Group Blocks
- `vrchat_read_getBulkGiftPurchases` (GET /user/bulk/gift/purchases) - Get Bulk Gift Purchases
- `vrchat_read_getCalendarEvents` (GET /calendar) - List calendar events (curated: vrchat_events_upcoming)
- `vrchat_read_getContentAgreementStatus` (GET /agreement) - Get Content Agreement Status
- `vrchat_read_getCSS` (GET /css/app.css) - Download CSS
- `vrchat_read_getCurrentOnlineUsers` (GET /visits) - Current Online Users
- `vrchat_read_getCurrentSubscriptions` (GET /auth/user/subscription) - Get Current Subscriptions
- `vrchat_read_getCurrentUser` (GET /auth/user) - Login and/or Get Current User Info (curated: vrchat_me)
- `vrchat_read_getEconomyAccount` (GET /user/{userId}/economy/account) - Get Economy Account
- `vrchat_read_getFavoritedAvatars` (GET /avatars/favorites) - List Favorited Avatars
- `vrchat_read_getFavoritedWorlds` (GET /worlds/favorites) - List Favorited Worlds (curated: vrchat_worlds_favorites)
- `vrchat_read_getFavoriteGroup` (GET /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}) - Show Favorite Group
- `vrchat_read_getFavoriteGroups` (GET /favorite/groups) - List Favorite Groups
- `vrchat_read_getFavoriteLimits` (GET /auth/user/favoritelimits) - Get Favorite Limits
- `vrchat_read_getFavorites` (GET /favorites) - List Favorites
- `vrchat_read_getFeaturedCalendarEvents` (GET /calendar/featured) - List featured calendar events
- `vrchat_read_getFile` (GET /file/{fileId}) - Show File
- `vrchat_read_getFileAnalysis` (GET /analysis/{fileId}/{versionId}) - Get File Version Analysis
- `vrchat_read_getFileAnalysisSecurity` (GET /analysis/{fileId}/{versionId}/security) - Get File Version Analysis Security
- `vrchat_read_getFileAnalysisStandard` (GET /analysis/{fileId}/{versionId}/standard) - Get File Version Analysis Standard
- `vrchat_read_getFileDataUploadStatus` (GET /file/{fileId}/{versionId}/{fileType}/status) - Check FileData Upload Status
- `vrchat_read_getFiles` (GET /files) - List Files
- `vrchat_read_getFollowedCalendarEvents` (GET /calendar/following) - List followed calendar events
- `vrchat_read_getFriendStatus` (GET /user/{userId}/friendStatus) - Check Friend Status
- `vrchat_read_getGlobalAvatarModerations` (GET /auth/user/avatarmoderations) - Get Global Avatar Moderations
- `vrchat_read_getGroupAuditLogEntryTypes` (GET /groups/{groupId}/auditLogTypes) - Get Group Audit Log Entry Types
- `vrchat_read_getGroupAuditLogs` (GET /groups/{groupId}/auditLogs) - Get Group Audit Logs
- `vrchat_read_getGroupBans` (GET /groups/{groupId}/bans) - Get Group Bans
- `vrchat_read_getGroupCalendarEventICS` (GET /calendar/{groupId}/{calendarId}.ics) - Download calendar event as ICS
- `vrchat_read_getGroupGalleryImages` (GET /groups/{groupId}/galleries/{groupGalleryId}) - Get Group Gallery Images
- `vrchat_read_getGroupInstances` (GET /groups/{groupId}/instances) - Get Group Instances (curated: vrchat_group_instances_overview)
- `vrchat_read_getGroupInvites` (GET /groups/{groupId}/invites) - Get Group Invites Sent
- `vrchat_read_getGroupMember` (GET /groups/{groupId}/members/{userId}) - Get Group Member
- `vrchat_read_getGroupMembers` (GET /groups/{groupId}/members) - List Group Members (curated: vrchat_group_members)
- `vrchat_read_getGroupPermissions` (GET /groups/{groupId}/permissions) - List Group Permissions
- `vrchat_read_getGroupPosts` (GET /groups/{groupId}/posts) - Get posts from a Group (curated: vrchat_group_posts_recent)
- `vrchat_read_getGroupRequests` (GET /groups/{groupId}/requests) - Get Group Join Requests
- `vrchat_read_getGroupRoles` (GET /groups/{groupId}/roles) - Get Group Roles
- `vrchat_read_getGroupRoleTemplates` (GET /groups/roleTemplates) - Get Group Role Templates
- `vrchat_read_getGroupTransferability` (GET /groups/{groupId}/transfer) - Get Group Transferability
- `vrchat_read_getHealth` (GET /health) - Check API Health
- `vrchat_read_getImpostorQueueStats` (GET /avatars/impostor/queue/stats) - Get Impostor Queue Stats
- `vrchat_read_getInfoPush` (GET /infoPush) - Show Information Notices
- `vrchat_read_getInstance` (GET /instances/{worldId}:{instanceId}) - Get Instance
- `vrchat_read_getInstanceByShortName` (GET /instances/s/{shortName}) - Get Instance By Short Name
- `vrchat_read_getInventory` (GET /inventory) - Get Inventory
- `vrchat_read_getInventoryCollections` (GET /inventory/collections) - List Inventory Collections
- `vrchat_read_getInventoryDrops` (GET /inventory/drops) - List Inventory Drops
- `vrchat_read_getInventoryTemplate` (GET /inventory/template/{inventoryTemplateId}) - Get Inventory Template
- `vrchat_read_getInvitedGroups` (GET /users/{userId}/groups/invited) - Get User Group Invited
- `vrchat_read_getInviteMessage` (GET /message/{userId}/{messageType}/{slot}) - Get Invite Message
- `vrchat_read_getInviteMessages` (GET /message/{userId}/{messageType}) - List Invite Messages
- `vrchat_read_getJam` (GET /jams/{jamId}) - Show jam information
- `vrchat_read_getJams` (GET /jams) - Show jams list
- `vrchat_read_getJamSubmissions` (GET /jams/{jamId}/submissions) - Show jam submissions
- `vrchat_read_getJavaScript` (GET /js/app.js) - Download JavaScript
- `vrchat_read_getLicensedAvatars` (GET /avatars/licensed) - List Licensed Avatars
- `vrchat_read_getLicenseGroup` (GET /licenseGroups/{licenseGroupId}) - Get License Group
- `vrchat_read_getModerationReports` (GET /moderationReports) - Get Moderation Reports
- `vrchat_read_getMutualFriends` (GET /users/{userId}/mutuals/friends) - Get User Mutual Friends
- `vrchat_read_getMutualGroups` (GET /users/{userId}/mutuals/groups) - Get User Mutual Groups
- `vrchat_read_getMutuals` (GET /users/{userId}/mutuals) - Get User Mutuals
- `vrchat_read_getNotification` (GET /auth/user/notifications/{notificationId}) - Show notification
- `vrchat_read_getNotifications` (GET /auth/user/notifications) - List Notifications (curated: vrchat_notifications_recent)
- `vrchat_read_getNotificationV2` (GET /notifications/{notificationId}) - Get NotificationV2
- `vrchat_read_getNotificationV2s` (GET /notifications) - List NotificationV2s
- `vrchat_read_getOwnAvatar` (GET /users/{userId}/avatar) - Get Own Avatar
- `vrchat_read_getOwnInventoryItem` (GET /inventory/{inventoryItemId}) - Get Own Inventory Item
- `vrchat_read_getPermission` (GET /permissions/{permissionId}) - Get Permission
- `vrchat_read_getPlayerModerations` (GET /auth/user/playermoderations) - Search Player Moderations
- `vrchat_read_getPrint` (GET /prints/{printId}) - Get Print
- `vrchat_read_getProductListing` (GET /listing/{productId}) - Get Product Listing
- `vrchat_read_getProductListingAlternate` (GET /products/{productId}) - Get Product Listing (alternate)
- `vrchat_read_getProductListings` (GET /user/{userId}/listings) - Get User Product Listings
- `vrchat_read_getProductPurchases` (GET /economy/purchases) - Get Product Purchases
- `vrchat_read_getProp` (GET /props/{propId}) - Get Prop
- `vrchat_read_getPropPublishStatus` (GET /props/{propId}/publish) - Get Prop Publish Status
- `vrchat_read_getRecentLocations` (GET /instances/recent) - List Recent Locations
- `vrchat_read_getRecentSubscription` (GET /user/subscription/recent) - Get Recent Subscription
- `vrchat_read_getRecentWorlds` (GET /worlds/recent) - List Recent Worlds
- `vrchat_read_getRecoveryCodes` (GET /auth/user/twofactorauth/otp) - Get 2FA Recovery codes
- `vrchat_read_getShortName` (GET /instances/{worldId}:{instanceId}/shortName) - Get Instance Short Name
- `vrchat_read_getSteamTransaction` (GET /Steam/transactions/{transactionId}) - Get Steam Transaction
- `vrchat_read_getSteamTransactions` (GET /Steam/transactions) - List Steam Transactions
- `vrchat_read_getStore` (GET /economy/store) - Get Store
- `vrchat_read_getStoreShelves` (GET /economy/store/shelves) - Get Store Shelves
- `vrchat_read_getSubscriptions` (GET /subscriptions) - List Subscriptions
- `vrchat_read_getTiliaStatus` (GET /tilia/status) - Get Tilia Status
- `vrchat_read_getTiliaTos` (GET /user/{userId}/tilia/tos) - Get Tilia TOS Agreement Status
- `vrchat_read_getTokenBundles` (GET /tokenBundles) - List Token Bundles
- `vrchat_read_getUserAllGroupPermissions` (GET /users/{userId}/groups/permissions) - Get user's permissions for all joined groups.
- `vrchat_read_getUserCreditsEligible` (GET /users/{userId}/credits/eligible) - Get User Credits Eligiblity
- `vrchat_read_getUserFeedback` (GET /users/{userId}/feedback) - Get User Feedback
- `vrchat_read_getUserGroupInstances` (GET /users/{userId}/instances/groups) - Get User Group Instances
- `vrchat_read_getUserGroupInstancesForGroup` (GET /users/{userId}/instances/groups/{groupId}) - Get User Group Instances for a specific Group
- `vrchat_read_getUserGroupRequests` (GET /users/{userId}/groups/requested) - Get User Group Requests
- `vrchat_read_getUserGroups` (GET /users/{userId}/groups) - Get User Groups (curated: vrchat_user_groups)
- `vrchat_read_getUserInventoryItem` (GET /user/{userId}/inventory/{inventoryItemId}) - Get User Inventory Item
- `vrchat_read_getUserNote` (GET /userNotes/{userNoteId}) - Get User Note
- `vrchat_read_getUserNotes` (GET /userNotes) - Get User Notes
- `vrchat_read_getUserPrints` (GET /prints/user/{userId}) - Get Own Prints
- `vrchat_read_getUserRepresentedGroup` (GET /users/{userId}/groups/represented) - Get user's current represented group
- `vrchat_read_getUserSubscriptionEligible` (GET /users/{userId}/subscription/eligible) - Get User Subscription Eligiblity
- `vrchat_read_getWorldInstance` (GET /worlds/{worldId}/{instanceId}) - Get World Instance
- `vrchat_read_getWorldMetadata` (GET /worlds/{worldId}/metadata) - Get World Metadata
- `vrchat_read_getWorldPublishStatus` (GET /worlds/{worldId}/publish) - Get World Publish Status
- `vrchat_read_listProps` (GET /props) - List Props
- `vrchat_read_searchAvatars` (GET /avatars) - Search Avatars
- `vrchat_read_searchGroupMembers` (GET /groups/{groupId}/members/search) - Search Group Members
- `vrchat_read_searchGroups` (GET /groups) - Search Group (curated: vrchat_groups_search)
- `vrchat_read_searchUsers` (GET /users) - Search All Users
- `vrchat_read_searchWorlds` (GET /worlds) - Search All Worlds (curated: vrchat_worlds_search)
- `vrchat_read_shareInventoryItemPedestal` (GET /inventory/cloning/pedestal) - Share Inventory Item by Pedestal
- `vrchat_read_spawnInventoryItem` (GET /inventory/spawn) - Spawn Inventory Item
- `vrchat_read_verifyAuthToken` (GET /auth) - Verify Auth Token
- `vrchat_read_verifyLoginPlace` (GET /auth/verifyLoginPlace) - Verify Login Place

## Auto-generated write tools (non-GET operations)
Input schemas are derived per operation from OpenAPI parameters and request bodies (writes still require `writes.allow = true`).
Write options are shared across write tools:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "includeMeta": {
      "type": "boolean"
    },
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
    "dryRun": {
      "type": "boolean"
    }
  },
  "additionalProperties": false
}
```

- `vrchat_write_acceptFriendRequest` (PUT /auth/user/notifications/{notificationId}/accept) - Accept Friend Request
- `vrchat_write_acknowledgeNotificationV2` (POST /notifications/{notificationId}/see) - Acknowledge NotificationV2
- `vrchat_write_addFavorite` (POST /favorites) - Add Favorite
- `vrchat_write_addGroupGalleryImage` (POST /groups/{groupId}/galleries/{groupGalleryId}/images) - Add Group Gallery Image
- `vrchat_write_addGroupMemberRole` (PUT /groups/{groupId}/members/{userId}/roles/{groupRoleId}) - Add Role to GroupMember
- `vrchat_write_addGroupPost` (POST /groups/{groupId}/posts) - Create a post in a Group
- `vrchat_write_addTags` (POST /users/{userId}/addTags) - Add User Tags
- `vrchat_write_banGroupMember` (POST /groups/{groupId}/bans) - Ban Group Member
- `vrchat_write_blockGroup` (POST /groups/{groupId}/block) - Block Group
- `vrchat_write_boop` (POST /users/{userId}/boop) - Send Boop
- `vrchat_write_cancelGroupRequest` (DELETE /groups/{groupId}/requests) - Cancel Group Join Request
- `vrchat_write_cancelGroupTransfer` (DELETE /groups/{groupId}/transfer) - Cancel Group Transfer
- `vrchat_write_cancelPending2FA` (DELETE /auth/twofactorauth/totp/pending) - Cancel pending enabling of time-based 2FA codes
- `vrchat_write_clearAllPlayerModerations` (DELETE /auth/user/playermoderations) - Clear All Player Moderations
- `vrchat_write_clearFavoriteGroup` (DELETE /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}) - Clear Favorite Group
- `vrchat_write_clearNotifications` (PUT /auth/user/notifications/clear) - Clear All Notifications
- `vrchat_write_closeInstance` (DELETE /instances/{worldId}:{instanceId}) - Close Instance
- `vrchat_write_consumeOwnInventoryItem` (PUT /inventory/{inventoryItemId}/consume) - Consume Own Inventory Item
- `vrchat_write_createAvatar` (POST /avatars) - Create Avatar
- `vrchat_write_createFile` (POST /file) - Create File
- `vrchat_write_createFileVersion` (POST /file/{fileId}) - Create File Version
- `vrchat_write_createGlobalAvatarModeration` (POST /auth/user/avatarmoderations) - Create Global Avatar Moderation
- `vrchat_write_createGroup` (POST /groups) - Create Group
- `vrchat_write_createGroupGallery` (POST /groups/{groupId}/galleries) - Create Group Gallery
- `vrchat_write_createGroupInvite` (POST /groups/{groupId}/invites) - Invite User to Group
- `vrchat_write_createGroupRole` (POST /groups/{groupId}/roles) - Create GroupRole
- `vrchat_write_createProp` (POST /props) - Create Prop
- `vrchat_write_createWorld` (POST /worlds) - Create World
- `vrchat_write_declineGroupInvite` (PUT /groups/{groupId}/invites) - Decline Invite from Group
- `vrchat_write_deleteAllNotificationV2s` (DELETE /notifications) - Delete All NotificationV2s
- `vrchat_write_deleteAllUserPersistenceData` (DELETE /users/{userId}/persist) - Delete All User Persistence Data
- `vrchat_write_deleteAvatar` (DELETE /avatars/{avatarId}) - Delete Avatar
- `vrchat_write_deleteFile` (DELETE /file/{fileId}) - Delete File
- `vrchat_write_deleteFileVersion` (DELETE /file/{fileId}/{versionId}) - Delete File Version
- `vrchat_write_deleteFriendRequest` (DELETE /user/{userId}/friendRequest) - Delete Friend Request
- `vrchat_write_deleteGlobalAvatarModeration` (DELETE /auth/user/avatarmoderations) - Delete Global Avatar Moderation
- `vrchat_write_deleteGroup` (DELETE /groups/{groupId}) - Delete Group
- `vrchat_write_deleteGroupGallery` (DELETE /groups/{groupId}/galleries/{groupGalleryId}) - Delete Group Gallery
- `vrchat_write_deleteGroupGalleryImage` (DELETE /groups/{groupId}/galleries/{groupGalleryId}/images/{groupGalleryImageId}) - Delete Group Gallery Image
- `vrchat_write_deleteGroupInvite` (DELETE /groups/{groupId}/invites/{userId}) - Delete User Invite
- `vrchat_write_deleteGroupPost` (DELETE /groups/{groupId}/posts/{notificationId}) - Delete a Group post
- `vrchat_write_deleteGroupRole` (DELETE /groups/{groupId}/roles/{groupRoleId}) - Delete Group Role
- `vrchat_write_deleteImpostor` (DELETE /avatars/{avatarId}/impostor) - Delete generated Impostor
- `vrchat_write_deleteModerationReport` (DELETE /moderationReports/{moderationReportId}) - Delete Moderation Report
- `vrchat_write_deleteNotification` (PUT /auth/user/notifications/{notificationId}/hide) - Delete Notification
- `vrchat_write_deleteNotificationV2` (DELETE /notifications/{notificationId}) - Delete NotificationV2
- `vrchat_write_deleteOwnInventoryItem` (DELETE /inventory/{inventoryItemId}) - Delete Own Inventory Item
- `vrchat_write_deletePrint` (DELETE /prints/{printId}) - Delete Print
- `vrchat_write_deleteProp` (DELETE /props/{propId}) - Delete Prop
- `vrchat_write_deleteUser` (PUT /users/{userId}/delete) - Delete User
- `vrchat_write_deleteUserPersistence` (DELETE /users/{userId}/{worldId}/persist) - Delete User Persistence
- `vrchat_write_deleteWorld` (DELETE /worlds/{worldId}) - Delete World
- `vrchat_write_disable2FA` (DELETE /auth/twofactorauth) - Disable 2FA
- `vrchat_write_editPrint` (POST /prints/{printId}) - Edit Print
- `vrchat_write_enable2FA` (POST /auth/twofactorauth/totp/pending) - Enable time-based 2FA codes
- `vrchat_write_enqueueImpostor` (POST /avatars/{avatarId}/impostor/enqueue) - Enqueue Impostor generation
- `vrchat_write_equipOwnInventoryItem` (PUT /inventory/{inventoryItemId}/equip) - Equip Own Inventory Item
- `vrchat_write_finishFileDataUpload` (PUT /file/{fileId}/{versionId}/{fileType}/finish) - Finish FileData Upload
- `vrchat_write_friend` (POST /user/{userId}/friendRequest) - Send Friend Request
- `vrchat_write_initiateOrAcceptGroupTransfer` (POST /groups/{groupId}/transfer) - Initiate or Accept Group Transfer
- `vrchat_write_inviteUserWithPhoto` (POST /invite/{userId}/photo) - Invite User with photo
- `vrchat_write_joinGroup` (POST /groups/{groupId}/join) - Join Group
- `vrchat_write_kickGroupMember` (DELETE /groups/{groupId}/members/{userId}) - Kick Group Member
- `vrchat_write_leaveGroup` (POST /groups/{groupId}/leave) - Leave Group
- `vrchat_write_logout` (PUT /logout) - Logout
- `vrchat_write_markNotificationAsRead` (PUT /auth/user/notifications/{notificationId}/see) - Mark Notification As Read
- `vrchat_write_moderateUser` (POST /auth/user/playermoderations) - Moderate User
- `vrchat_write_publishProp` (PUT /props/{propId}/publish) - Publish Prop
- `vrchat_write_publishWorld` (PUT /worlds/{worldId}/publish) - Publish World
- `vrchat_write_purchaseProductListing` (POST /economy/purchase/listing) - Purchase Product Listing
- `vrchat_write_registerUserAccount` (POST /auth/register) - Register User Account
- `vrchat_write_removeFavorite` (DELETE /favorites/{favoriteId}) - Remove Favorite
- `vrchat_write_removeGroupMemberRole` (DELETE /groups/{groupId}/members/{userId}/roles/{groupRoleId}) - Remove Role from GroupMember
- `vrchat_write_removeTags` (POST /users/{userId}/removeTags) - Remove User Tags
- `vrchat_write_replyNotificationV2` (POST /notifications/{notificationId}/reply) - Reply NotificationV2
- `vrchat_write_requestInvite` (POST /requestInvite/{userId}) - Request Invite
- `vrchat_write_requestInviteWithPhoto` (POST /requestInvite/{userId}/photo) - Request Invite with photo
- `vrchat_write_resendEmailConfirmation` (POST /auth/user/resendEmail) - Resend Email Confirmation
- `vrchat_write_resetInviteMessage` (DELETE /message/{userId}/{messageType}/{slot}) - Reset Invite Message
- `vrchat_write_respondGroupJoinRequest` (PUT /groups/{groupId}/requests/{userId}) - Respond Group Join request
- `vrchat_write_respondInvite` (POST /invite/{notificationId}/response) - Respond Invite
- `vrchat_write_respondInviteWithPhoto` (POST /invite/{notificationId}/response/photo) - Respond Invite with photo
- `vrchat_write_respondNotificationV2` (POST /notifications/{notificationId}/respond) - Respond NotificationV2
- `vrchat_write_selectAvatar` (PUT /avatars/{avatarId}/select) - Select Avatar
- `vrchat_write_selectFallbackAvatar` (PUT /avatars/{avatarId}/selectFallback) - Select Fallback Avatar
- `vrchat_write_setGroupGalleryFileOrder` (PUT /files/order) - Set Group Gallery File Order
- `vrchat_write_shareInventoryItemDirect` (POST /inventory/cloning/direct) - Share Inventory Item Direct
- `vrchat_write_startFileDataUpload` (PUT /file/{fileId}/{versionId}/{fileType}/start) - Start FileData Upload
- `vrchat_write_submitContentAgreement` (POST /agreement) - Submit Content Agreement
- `vrchat_write_submitModerationReport` (POST /moderationReports) - Submit Moderation Report
- `vrchat_write_unbanGroupMember` (DELETE /groups/{groupId}/bans/{userId}) - Unban Group Member
- `vrchat_write_unequipOwnInventorySlot` (DELETE /inventory/{inventoryItemId}/equip) - Unequip Own Inventory Slot
- `vrchat_write_unfriend` (DELETE /auth/user/friends/{userId}) - Unfriend
- `vrchat_write_unmoderateUser` (PUT /auth/user/unplayermoderate) - Unmoderate User
- `vrchat_write_unpublishProp` (DELETE /props/{propId}/publish) - Unpublish Prop
- `vrchat_write_unpublishWorld` (DELETE /worlds/{worldId}/publish) - Unpublish World
- `vrchat_write_updateAssetReviewNotes` (PUT /assetReview/{assetReviewId}/notes) - Update Asset Review Notes
- `vrchat_write_updateAvatar` (PUT /avatars/{avatarId}) - Update Avatar
- `vrchat_write_updateBadge` (PUT /users/{userId}/badges/{badgeId}) - Update User Badge
- `vrchat_write_updateFavoriteGroup` (PUT /favorite/group/{favoriteGroupType}/{favoriteGroupName}/{userId}) - Update Favorite Group
- `vrchat_write_updateGroup` (PUT /groups/{groupId}) - Update Group
- `vrchat_write_updateGroupGallery` (PUT /groups/{groupId}/galleries/{groupGalleryId}) - Update Group Gallery
- `vrchat_write_updateGroupMember` (PUT /groups/{groupId}/members/{userId}) - Update Group Member
- `vrchat_write_updateGroupPost` (PUT /groups/{groupId}/posts/{notificationId}) - Edits a Group post
- `vrchat_write_updateGroupRepresentation` (PUT /groups/{groupId}/representation) - Update Group Representation
- `vrchat_write_updateGroupRole` (PUT /groups/{groupId}/roles/{groupRoleId}) - Update Group Role
- `vrchat_write_updateInviteMessage` (PUT /message/{userId}/{messageType}/{slot}) - Update Invite Message
- `vrchat_write_updateOwnInventoryItem` (PUT /inventory/{inventoryItemId}) - Update Own Inventory Item
- `vrchat_write_updateProp` (PUT /props/{propId}) - Update Prop
- `vrchat_write_updateTiliaTos` (PUT /user/{userId}/tilia/tos) - Update Tilia TOS Agreement Status
- `vrchat_write_updateUserNote` (POST /userNotes) - Update User Note
- `vrchat_write_updateWorld` (PUT /worlds/{worldId}) - Update World
- `vrchat_write_uploadGalleryImage` (POST /gallery) - Upload gallery image
- `vrchat_write_uploadIcon` (POST /icon) - Upload icon
- `vrchat_write_uploadImage` (POST /file/image) - Upload gallery image, icon, emoji or sticker
- `vrchat_write_uploadPrint` (POST /prints) - Upload Print
- `vrchat_write_verify2FA` (POST /auth/twofactorauth/totp/verify) - Verify 2FA code
- `vrchat_write_verify2FAEmailCode` (POST /auth/twofactorauth/emailotp/verify) - Verify 2FA email code
- `vrchat_write_verifyPending2FA` (POST /auth/twofactorauth/totp/pending/verify) - Verify Pending 2FA code
- `vrchat_write_verifyRecoveryCode` (POST /auth/twofactorauth/otp/verify) - Verify 2FA code with Recovery code
