---
title: Server settings reference
description: Every hotel setting in the server_settings table - what it does, its default, and how to change and reload it.
sidebar:
  order: 2.5
---

Many game rules are rows in the `server_settings` database table. Each row has a `key` and a `value`. This page lists the keys a hotel owner can change.

## Change a setting

Change a value with SQL, then reload the settings in room chat:

```sql
INSERT INTO server_settings (`key`, `value`) VALUES ('catalog.group.purchase.cost', '500')
ON DUPLICATE KEY UPDATE `value` = '500';
```

```text
:update settings
```

The command needs `command.update` and `command.update_configuration`. A restart also loads the settings.

Some keys are not in a fresh database. PlusEMU then uses the default. Add the row only when you want another value. Those keys are marked "optional" below.

## Catalogue and economy

| Key | Default | What it does |
| --- | --- | --- |
| `catalog.enabled` | `1` | Any value other than `1` stops all purchases. |
| `catalog.group.purchase.cost` | `150` | The credits a group costs. See [groups](/features/groups/). |
| `room.item.gifts.enabled` | `1` | `1` lets players buy gifts. |
| `room.item.exchangeables.enabled` | `1` | `1` lets players redeem [credit furni](/features/economy/#credit-furni). |
| `trading.auto_exchange_redeemables` | `0` | `1` turns credit furni into credits when a trade completes. |
| `user.currency_scheduler.credit_reward` | `100` | Credits that every online player gets each payment. |
| `user.currency_scheduler.ducket_reward` | `100` | Duckets that every online player gets each payment. |
| `user.currency_scheduler.tick` | `15` | Minutes between two payments. |

A role can add more to the payment with the role limits `limit.currency_credits` and `limit.currency_duckets`.

### Marketplace

All marketplace keys are optional.

| Key | Default | What it does |
| --- | --- | --- |
| `catalog.marketplace.only_rare_ltd` | `0` | `1` allows only rare furni (`furniture.is_rare = 1`) and limited edition furni. |
| `catalog.marketplace.fee.percentage` | `1` | The fee in percent, 0 to 100. The seller gets the price minus the fee. |
| `catalog.marketplace.fee.half_tax_limit` | very high | Makes the fee grow with the price. At this price, 50 percent of the price is added to the fee. Leave it out for a flat fee. |
| `catalog.marketplace.price.minimum` | `1` | The lowest price. |
| `catalog.marketplace.price.maximum` | `99999999` | The highest price. |
| `catalog.marketplace.expiration_hours` | `48` | Hours an offer stays on sale, 1 to 8760. |
| `catalog.marketplace.batch_limit` | `500` | The most items in one listing, 1 to 500. |
| `catalog.marketplace.commission` | the fee | A number that PlusEMU only sends to the client. It does not change the fee. |

See also [trading and marketplace](/features/economy/#trading-and-marketplace).

### Builders Club

`builders_club.furni_limit`, `builders_club.trial_furni_limit`, `builders_club.max_furni_limit` and `builders_club.grace_seconds` are optional. See [Builders Club settings](/features/builders-club/#settings).

## Habbo Club

| Key | Default | What it does |
| --- | --- | --- |
| `club.limit.rooms.member` | `100` | Rooms a club member can own |
| `club.limit.rooms.normal` | `50` | Rooms other players can own |
| `club.limit.friends.member` | `800` | Friends of a club member |
| `club.limit.friends.normal` | `300` | Friends of other players |
| `club.limit.visitors.member` | `75` | Visitors in a club member's room |
| `club.limit.visitors.normal` | `50` | Visitors in other players' rooms |
| `club.payday.percentage` | `10` | The share of last month's catalogue credits that a member gets back on payday. |

See [Habbo Club offers](/features/catalogue-offers/#habbo-club-offers).

## Rooms

| Key | Default | What it does |
| --- | --- | --- |
| `global_home_room` | `0` | A room for every player who has no home room. See [global home room](/features/rooms/#global-home-room). |
| `room.item.placement_limit` | `7500` | The most furni in one room. |
| `room.pets.placement_limit` | `25` | The most pets in one room. |
| `room.promotion.lifespan` | `120` | Minutes a [room ad](/features/rooms/#room-ads) runs. |
| `room.background.allowed_hosts` | empty | Web hosts allowed in [room backgrounds](/features/rooms/#room-backgrounds), separated by commas. Empty allows every host. |
| `room.forced_effect.staff` | `102` | The effect that staff get when they enter a room. `0` turns it off. See [avatar effects](/features/avatar-effects/#forced-staff-effects). |
| `room.forced_effect.ambassador` | `178` | The same for ambassadors. |
| `room.chat.filter.banned_phrases.chances` | `6` | After this many banned phrases, PlusEMU bans the player and disconnects them. |
| `group.delete.member.limit` | `500` | Groups with this many members or more cannot be deleted by their owner. |

## Login

| Key | Default | What it does |
| --- | --- | --- |
| `user.login.message.enabled` | `0` | `1` shows a message at login. The text is the locale text `user.login.message`. |

## Progression

| Key | Default | What it does |
| --- | --- | --- |
| `dailytasks.count` | `3` | Optional. Tasks per day, 0 to 20. See [daily tasks](/features/daily-tasks/#settings). |
| `dailytasks.unclaimed_days` | `7` | Optional. Days a finished task stays claimable, 0 to 365. |
| `landing.bonus_rare.item_name` | `bonusbag26_3` | Optional. The bonus rare furni. See [hotel view](/features/hotel-view/#bonus-rare). |
| `landing.bonus_rare.credits` | `120` | Optional. The bonus rare credit total. |

### Badge rarity

Badges get a rarity from the number of active players who own them. A badge is in a tier when at most the larger of `min_owners` and `percent` of active players own it. A badge with one owner is always unique.

| Key | Default |
| --- | --- |
| `badge.rarity.active_days` | `90`: players who logged in during these days count as active |
| `badge.rarity.legendary.percent` / `.min_owners` | `0.5` / `3` |
| `badge.rarity.mythical.percent` / `.min_owners` | `1.5` / `8` |
| `badge.rarity.epic.percent` / `.min_owners` | `5` / `20` |
| `badge.rarity.rare.percent` / `.min_owners` | `15` / `50` |
| `badge.rarity.uncommon` | `0`: `1` turns on the uncommon tier |
| `badge.rarity.uncommon.percent` / `.min_owners` | `35` / `0` |

## Camera

The `camera.*` keys are on the [camera page](/features/camera/#access-and-settings). One more key:

| Key | Default | What it does |
| --- | --- | --- |
| `camera.competition.daily` | `3` | Competition entries per player per day. |

## Collectibles

| Key | Default | What it does |
| --- | --- | --- |
| `collectibles.minting.enabled` | `1` | Turns minting on. See [collectibles](/features/collectibles/). |

## Wired

All Wired keys are optional. See [Wired limits](/features/wired/#limits-and-room-settings).

| Key | Default | What it does |
| --- | --- | --- |
| `wired.max_depth` | `20` | How deep one Wired stack can trigger another. |
| `wired.max_executions_per_pass` | `10000` | Wired executions in one pass. |
| `wired.max_pending_stacks` | `10000` | Stacks that can wait to run. |
| `wired.execution_cost_cap` | not set | One cost cap for every room. Without it, the cap of a room depends on its owner's account level. |

## SnowStorm and the game center

| Key | Default | Range | What it does |
| --- | --- | --- | --- |
| `gamecenter.snowwar.enabled` | `1` | | `1` turns SnowStorm on. |
| `gamecenter.snowwar.arenas` | `8,9,11` | | The arenas, separated by commas. |
| `gamecenter.snowwar.players.min` | `2` | 1 to 8 | Players needed to start. |
| `gamecenter.snowwar.queue.match.max` | `8` | 2 to 8 | Players in one game. |
| `gamecenter.snowwar.games.max.concurrent` | `1` | 1 to 100 | Games at the same time. |
| `gamecenter.snowwar.game.start.time` | `15` | 1 to 300 | Seconds of the lobby countdown. |
| `gamecenter.snowwar.game.length.seconds` | `180` | 10 to 3600 | Seconds of one game. |
| `gamecenter.snowwar.preparing.seconds` | `5` | 1 to 60 | Seconds of the countdown in the arena. |
| `gamecenter.snowwar.restart.seconds` | `30` | 1 to 300 | Seconds to choose a rematch. |
| `gamecenter.snowwar.raygun.enabled` | `1` | | `0` turns off the ray guns. |
| `gamecenter.games.free.daily` | `10` | -1 to 1000 | Free games per day. `-1` means no limit. |
| `gamecenter.game.leave.block.seconds` | `180` | 0 to 86400 | Seconds a player who left a game must wait. |

`gamecenter.snowwar.artic.bg`, `gamecenter.snowwar.dragoncave.bg` and `gamecenter.snowwar.fightnight.bg` are the background images of the three arenas. An empty value shows no image.
