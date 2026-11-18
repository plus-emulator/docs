---
title: Groups and forums
description: Set the price of a group, manage badge parts, the delete limit, and group forums.
sidebar:
  order: 4.5
---

Players create a group for one of their rooms. A group has a badge, members, its own furni and an optional forum.

## Price of a group

A group costs `catalog.group.purchase.cost` credits. The default is 150. The value must be 0 or more, or players cannot create groups.

```sql
UPDATE server_settings SET `value` = '500' WHERE `key` = 'catalog.group.purchase.cost';
```

Reload with `:update settings`. A player can only create a group for a room they own that has no group yet.

## Badge parts

The parts of the group badge editor are in `groups_items`:

| Column | What it does |
| --- | --- |
| `type` | `base`, `symbol`, `color`, `color2` or `color3`. |
| `id` | The part number. `id` and `type` together are unique. |
| `firstvalue` | For a base or symbol: the image name, for example `base_basic_1.gif`. For a colour: the hex colour, for example `ffd601`. |
| `secondvalue` | A second image or value, or empty. |
| `enabled` | `0` hides the part. |

A badge can have at most 5 parts. PlusEMU loads the parts when it starts. Restart the emulator after a change.

## Delete limit

A group with `group.delete.member.limit` members or more cannot be deleted by its owner. The default is 500. Staff with `group.delete_limit_override` can still delete it.

## Group forums

A group gets a forum when someone buys its first forum terminal for it. The terminal is on the catalogue page with the link `guild_forum`. After that, the group settings can turn the forum on and off.

The table `group_forums` holds the forum rights of each group. The owner sets them in the client:

| Column | Default |
| --- | --- |
| `read_permission` | `0` |
| `post_permission` | `0` |
| `thread_permission` | `0` |
| `moderate_permission` | `2` |

Rules:

- A message has 10 to 4000 characters.
- A new thread title has 10 to 120 characters.

Volt checks for new forum messages every `groupforum.poll.period` seconds. The default is 300.

## Staff permissions

| Permission | What it allows |
| --- | --- |
| `group.delete_override` | Delete any group. |
| `group.delete_limit_override` | Delete a group above the delete limit. |
| `group.management_override` | Manage any group. |
| `group.accept.any` | Accept members in any group. |
