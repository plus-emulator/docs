---
title: Builders Club
description: Set up the Builders Club - membership offers, furni limits, the Builders Club catalogue, settings, and the pick-up command.
sidebar:
  order: 5.4
---

The Builders Club lets players place furni from a separate catalogue without buying each item. Every placed item counts against the player's furni limit. When a player picks up a Builders Club item, it is deleted and frees a place in the limit. It never goes to the inventory.

Players without a membership are on a trial with a small limit.

## Membership

Players buy a membership in the normal catalogue, like Habbo Club. Fresh databases have these offers:

| Offer ID | Price | What it gives |
| --- | --- | --- |
| `13275` | 100 credits | 31 days, limit 1000 furni |
| `1890000001` | 250 credits | 93 days, limit 1500 furni |
| `13902` | 105 diamonds | 31 days, limit 1000 furni |
| `13212` | 10 credits | 45 more furni |
| `13199` | 50 credits | 250 more furni |
| `13211` | 100 credits | 600 more furni |

The pages are under the Habbo Club page (link `habbo_club_desktop`) in the normal catalogue:

| Page link | Layout |
| --- | --- |
| `builders_club_frontpage` | `builders_club_frontpage` |
| `builders_club_membership` | `builders_club_loyalty` |
| `loyalty_bc` | `builders_club_loyalty` |
| `builders_upgrades` | `builders_club_addons` |

A membership offer has a product with `product_type = 'builders_club'`. Its `amount` is the number of days and its `extra_param` is the furni limit. An add-on offer has `product_type = 'builders_club_addon'`, and its `amount` is the number of extra furni. An add-on needs a running membership.

Buying again while a membership runs adds the days to the end date. The limit becomes the higher of the old and the new one.

### Give a membership by hand

Memberships are in `user_builders_club`. This gives user `5` 30 days with a limit of 1000 furni:

```sql
INSERT INTO user_builders_club (user_id, expires_at, furni_limit)
VALUES (5, UTC_TIMESTAMP() + INTERVAL 30 DAY, 1000)
ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), furni_limit = VALUES(furni_limit);
```

`expires_at` is in UTC. `furni_addon` holds the furni added by add-on offers.

## Settings

These `server_settings` keys are optional. Fresh databases do not have them, so PlusEMU uses the default. Reload them with `:update settings`.

| Key | Default | What it does |
| --- | --- | --- |
| `builders_club.furni_limit` | `500` | The lowest limit of a member. A membership with a higher `furni_limit` uses its own. |
| `builders_club.trial_furni_limit` | `50` | The limit without a membership. |
| `builders_club.max_furni_limit` | `2000000` | The highest limit, add-ons included. |
| `builders_club.grace_seconds` | `0` | Seconds after the end of a membership before the player's rooms with Builders Club furni are locked for visitors. |

A member's limit is the higher of `builders_club.furni_limit` and the membership's `furni_limit`, plus `furni_addon`, at most `builders_club.max_furni_limit`.

The room limit `room.item.placement_limit` also applies.

## Placing rules

- Only the room owner or a group admin of the room can place Builders Club furni.
- On the trial, nobody else may be in the room.
- After a membership and its grace time end, visitors cannot enter a room that has the player's Builders Club furni. The room owner and staff with `room.enter_locked` still can. The room opens again when the player renews or picks the furni up.

## The Builders Club catalogue

Builders Club pages are rows in `catalog_pages` with `catalog_mode = 'BUILDERS_CLUB'`. Normal pages have `catalog_mode = 'NORMAL'`. A page `link` must be unique within its mode, so both catalogues can use the same link.

Fresh databases have a full Builders Club catalogue. Run `:update catalog` after you change it.

## Pick up all Builders Club furni

The room owner can type:

```text
:pickallbc
```

It picks up every Builders Club item in the room. The command needs the permission `command.pickallbc`. Every role with `command.pickall` gets it. The normal `:pickall` skips Builders Club furni.

## Volt settings

None of these keys are in the example file. Volt uses the default when a key is missing.

| `ui-config.json` key | Default | What it does |
| --- | --- | --- |
| `builders.club.enabled` | `true` | Shows the Builders Club toolbar button and catalogue. |
| `builders.club.furniture.placement.group.room.enabled` | `true` | Lets group admins place Builders Club furni in group rooms. |
| `builders_club.try_page` | `''` | A Builders Club catalogue page. When set, players without a membership see a "try" button on the Builders Club front page that opens it. |

The link event `catalog/show/builders_club` opens the Builders Club catalogue. `catalog/warehouse/<page>` opens one of its pages.
