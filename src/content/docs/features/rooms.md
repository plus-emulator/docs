---
title: Rooms and building
description: Room settings, public rooms, furniture placement, build height, room backgrounds, room games, and community features.
sidebar:
  order: 4
---

Rooms hold furniture, visitors, pets, bots, and games. The navigator lets players find and create rooms. Room owners control access and the settings for their own rooms.

## Room settings

Room settings include the name, description, category, tags, visitor limit, and entry access. Other settings control trading, pets, walking through users, wall visibility, and floor and wall thickness.

Owners can also choose who can mute, kick, or ban visitors. These room settings are separate from hotel-wide staff roles.

Groups have their own membership and room rights. Giving someone rights in one room does not give them a hotel staff role.

### Door tile, idle and pet settings

The room settings window has these settings, like Habbo:

| Setting | What it does | Default |
| --- | --- | --- |
| Door tile | When on, a user who walks onto the door tile leaves the room. | On |
| Idle sleep | An avatar that does nothing falls asleep after this time. 30 to 3600 seconds. | On, 300 seconds |
| Idle kick | An avatar that does nothing leaves the room after this time. 60 to 36000 seconds, and at least 30 seconds more than idle sleep when both are on. | On, 900 seconds |
| Mute all pets | Pets in the room do not talk. | Off |

Only Habbo Club members can change the door tile, idle sleep and idle kick settings. Every room owner can change "Mute all pets". When a timer is off, the room keeps its last time for later.

The settings are stored in the `rooms` table, in the columns `leave_on_door_tile`, `idle_sleep_enabled`, `idle_sleep_timeout_seconds`, `idle_autokick_enabled`, `idle_autokick_timeout_seconds`, and `mute_all_pets`. Migration 137 adds them with the defaults above.

### Global home room

Players without their own home room can start in a room you choose. Set the server setting `global_home_room` to the room ID, then run `:update settings`:

```sql
UPDATE server_settings SET `value` = '123' WHERE `key` = 'global_home_room';
```

These players go to that room when they log in and when they press "go to home room". A player's own home room still wins. `0` turns it off, and that is the default.

## Public rooms

The **Public** tab is the first tab players see when they open the navigator. It lists the hotel's public rooms as tiles with a picture. Players click a tile to enter the room.

A room shows in the Public tab when it has an enabled row in the `navigator_publics` table. Each row points to a room in the `rooms` table.

### Add a public room

Run both statements in the same database session. `LAST_INSERT_ID()` then points to the room that the first statement created.

```sql
INSERT INTO rooms (roomtype, caption, description, owner, model_name, users_max)
VALUES ('public', 'Welcome Lounge', 'Meet new people here', 2, 'model_a', 50);

INSERT INTO navigator_publics (room_id, caption, description, image_url, order_num, enabled)
VALUES (LAST_INSERT_ID(), 'Welcome Lounge', 'Meet new people here', 'navigator/welcome_lounge.png', 1, 1);
```

Replace `2` with the user ID of the staff account that owns the room. `model_name` must be an ID from the `room_models` table.

To add a room that already exists, use its room ID:

```sql
INSERT INTO navigator_publics (room_id, caption, description, image_url, order_num, enabled)
VALUES (123, 'Old Hangout', 'A room that already exists', '', 2, 1);
```

Then load the change in one of these ways:

- Restart the emulator.
- Type `:update navigator` in a room. This needs the `command.update_navigator` permission. In the default roles, only Developer and Owner have it.
- Send `reload_navigator` to RCON in the plain-text format: the command name, then the byte `0x01`. The JSON RCON format does not accept this command.

### The navigator_publics columns

| Column | What it does |
| --- | --- |
| `room_id` | The room to show. A room can have only one row. When you delete the room, its row is deleted too. |
| `caption`, `description` | Required, but the navigator does not show them. The tile shows the name from `rooms.caption`. |
| `image_url` | The tile picture. The client adds this path to `image.library.url` from `renderer-config.json`. Leave it empty (`''`) to show the room's normal navigator thumbnail. |
| `order_num` | The position in the list. Lower numbers show first. |
| `enabled` | `1` shows the room. `0` hides it but keeps the row. |

To hide a room again, set `enabled` to `0` and load the change:

```sql
UPDATE navigator_publics SET enabled = 0 WHERE room_id = 123;
```

### Room type

Set `rooms.roomtype` to `'public'` for a hotel room. The navigator then does not show an owner for the room. In a public room, the owner and users with room rights get no rights. Only staff with the `room.owner.any` permission can decorate it. In the default roles, Senior Moderator and higher roles have this permission.

The Public tab also lists rooms with `roomtype` set to `'private'`. Change `roomtype` while the room is empty. A loaded room keeps its old settings until it unloads.

### Rename the Public rooms heading

The heading above the tiles comes from the `official-root` row in `navigator_categories`. When `public_name` is empty, the client shows the text `navigator.searchcode.title.official-root`, which is "Public rooms" in English. To use your own heading, set `public_name` and load the change:

```sql
UPDATE navigator_categories SET public_name = 'Hotel Lobbies' WHERE category_identifier = 'official-root';
```

## Building tools

Players place furniture from their inventory and adjust its position, rotation, and state. The floor editor changes the room layout. Stack tools and the build-height command provide more control over furniture placement.

To place or move furniture at a fixed height, use:

```text
:bh 2.5
```

The supported range is `0` to `40`. Values are rounded to two decimal places. Type `:bh` without a value to return to normal stacking.

The command changes placement height for your current room user. It does not grant furniture editing rights.

[Wired](/features/wired/) adds room interactions. The [camera](/features/camera/) provides wall photographs and navigator thumbnails.

## Room backgrounds

A room background is a furniture item that shows an image in the room. To set the image, the user needs the `room.item_save_branding_items` permission and must own the room. Staff with `room.owner.any` can also set it. In the default roles, only Developer and Owner have this permission. You can give it to another role, for example a custom "Room builder" role. See [grant an existing permission](/administration/custom-permissions/#grant-an-existing-permission).

Click the background in the room. The fields `imageUrl`, `offsetX`, `offsetY`, and `offsetZ` show in the info stand. Users without the permission do not see these fields.

The image and click addresses must be empty or start with `http://` or `https://`. The emulator refuses other addresses, such as `javascript:` or `data:` addresses.

`offsetZ` sets the depth of the image, like on Habbo. It can be any whole number. Near `0`, walls, the floor and furniture can cover the image. Use a value of about `9000` to `20000` to bring the image to the front.

## Games

PlusEMU includes Battle Banzai, Freeze, Football, Ice Tag, and SnowStorm. Room games use their matching furniture and game rules. SnowStorm has its own game flow.

A working game needs the corresponding catalogue items and client assets. The presence of an emulator game handler does not add missing assets to an existing hotel.

## Community features

Friends and messenger support conversations outside the current room. Groups and forums support shared communities. Room polls and word quizzes provide activities inside rooms.

Achievements, talent tracks, quests, and campaigns provide progression. Their visible content depends on the hotel's database and configuration.
