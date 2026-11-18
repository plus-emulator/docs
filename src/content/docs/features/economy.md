---
title: Catalogue and economy
description: Credits, activity points, catalogue offers, trading, marketplace, crafting, and staff currency commands.
sidebar:
  order: 5
---

PlusEMU supports catalogue purchases, player trading, marketplace offers, crafting, recycling, vouchers, and club offers. Hotel operators control the available content and prices through the database and management tools.

## Currencies

Credits are separate from activity points. Activity points include duckets, diamonds, and other currency types. A catalogue offer can use credits, points, or both.

Current databases store activity-point balances in `user_currencies`. An older website that expects only legacy currency columns needs an update before use with this schema. The installer selects an Atom CMS version for the emulator's database layout.

## Catalogue and furniture data

Catalogue pages organize offers. Furniture definitions describe the items that those offers sell. PlusEMU generates `FurnitureData.json` from the furniture and catalogue data so clients can identify the items.

The public endpoint is:

```text
/api/gamedata/furnidata
```

A staff account with `command.update` and `command.update_catalog` can reload catalogue content with:

```text
:update catalog
```

The reload also rebuilds generated furniture data. Furniture artwork still needs matching client assets. Adding a database offer alone does not create an image or animation.

## Trading and marketplace

Trading exchanges eligible inventory items between players. Room trading settings and player restrictions can prevent a trade. Furniture definitions decide whether an item can be traded.

The marketplace lists eligible furniture for sale. A player can sell an item only when its furniture row has both `allow_trade = 1` and `allow_marketplace_sell = 1`. Both default to `1`. A tradeable item is not automatically sellable on the marketplace.

```sql
UPDATE furniture SET allow_marketplace_sell = 0 WHERE item_name = 'acme_throne';
```

The marketplace fee, the price range and how long an offer stays on sale are [marketplace settings](/getting-started/server-settings/#marketplace). With `catalog.marketplace.only_rare_ltd = 1`, players can sell only rare furni (`furniture.is_rare = 1`) and limited edition furni.

Gift purchases, [crafting recipes](/features/crafting/), and recycler rewards depend on their own catalogue and database configuration. For club offers, vouchers, limited stock and the catalogue front page, see [club, vouchers and catalogue offers](/features/catalogue-offers/).

## Furni-Matic

The Furni-Matic is the recycler. Players put furni in its slots and get a Mystery Box. The box holds a random prize: a furni or a speech bubble style.

### Habbo's settings

Migration 150 gives Habbo's Furni-Matic to every hotel that never set up its recycler:

- 8 slots.
- 10 Duckets for each use.
- 10 seconds between two uses.
- Habbo's 6 prize levels and prizes.

A hotel that already set up its recycler keeps its own settings and prizes. If the prize furni are missing from the `furniture` table, the migration sets only the 8 slots.

### The recycler tables

| Table | What it holds |
| --- | --- |
| `recycler_settings` | One row with `id = 1`: `enabled`, `slots`, `cooldown_seconds` and `cost_duckets`. |
| `recycler_levels` | One row per prize level: `level` (1 to 6) and `chance`. |
| `recycler_prizes` | The prizes of each level: `level`, and `item_id` (a `furniture` ID) or `chat_style_id` (a speech bubble style). |

A level with `chance` 400 gives about 1 box in 400. Level 1 must have `chance` 1. It gets all the boxes that the other levels do not get. Habbo's chances are 1, 4, 10, 40, 400 and 5000 for levels 1 to 6.

The Furni-Matic shows as closed when the setup is not valid. It must have:

- `enabled = 1`, 1 to 12 slots, 0 to 86400 seconds between uses, and 0 to 1000000 Duckets.
- 1 to 6 levels, each with 1 to 500 prizes. Prize furni must be floor or wall furni with a sprite ID.
- Exactly one Mystery Box in the `furniture` table: a floor furni named `matic_box` with sprite ID 4692 and interaction type `default`.
- Chances that leave room for level 1. When the chances do not work, PlusEMU logs an error that starts with `Recycler level chances`.

PlusEMU reads these tables each time a player opens the Furni-Matic, so a change works without a restart.

### Client settings

Volt reads three settings from `ui-config.json`. Keep them equal to the server values:

| Setting | Server value | Habbo default |
| --- | --- | --- |
| `recycler.number_of_slots` | `recycler_settings.slots` | `8` |
| `recycler.ducket_cost` | `recycler_settings.cost_duckets` | `10` |
| `recycler.timeout_seconds` | `recycler_settings.cooldown_seconds` | `10` |

A Mystery Box cannot be recycled, traded, or sold on the Marketplace.

### Which furni can be recycled

A player can put an item into the Furni-Matic only when:

- The furniture row has `allow_recycle = 1`. This is the default.
- It is not a limited edition item.
- It is not Builders Club furni.
- It is not a gift or a box that is still closed.
- It is not a disc or a jukebox in use in a playlist.

### Troubleshooting

**"The Furni-Matic is not available right now" after a player clicks Start.** PlusEMU refused the exchange. Check these causes:

- The number of slots in the client is not the server's number. `recycler.number_of_slots` in `ui-config.json` must equal `recycler_settings.slots`. The server accepts only exactly that many items.
- The player has fewer Duckets than `recycler_settings.cost_duckets`. If `recycler.ducket_cost` in `ui-config.json` shows a lower price, the player does not see the problem before Start.
- The player used the machine again too soon. `recycler.timeout_seconds` in `ui-config.json` must not be lower than `recycler_settings.cooldown_seconds`.
- One of the items cannot be recycled. See the list above.
- The player is trading, or is not in a room.
- The setup is not valid, for example the `matic_box` furniture row is missing. See the rules above.

After you change `ui-config.json`, players must reload the client.

## Credit furni

A credit furni, such as a gold bar or a coin, turns into credits when its owner redeems it. It has `interaction_type = 'exchange'`, and its value in credits is in `behaviour_data`.

Migration 154 sets the value of every credit furni that had none. It reads the value from the name, like Habbo: `CF_50_goldbar` is worth 50 credits.

Items whose name starts with `CFC_` cannot be redeemed for credits, like on Habbo. They still have a value. For example, Wired chest payments count `CFC_10_coin_bronze` as 10 credits.

## Give currency to a player

Authorized staff can use the following chat commands. Replace `PlayerName` and the amount with the intended recipient and value.

```text
:give PlayerName credits 100
:give PlayerName duckets 50
:give PlayerName diamonds 10
```

These examples add currency. The account needs `command.give` and the permission for the currency: `command.give_coins` for credits, `command.give_pixels` for duckets, or `command.give_diamonds` for diamonds. The recipient must be online.

The staff account must outrank another recipient. If it does not, the command does nothing and shows no message. A staff account can target itself if it has the required currency permission.

Use the smallest permission set needed for the job. Access to one currency command does not imply access to the others.

## Check a catalogue change

After a change, reopen the catalogue and confirm that the offer has the expected price and currency. Buy one item with a test account, then check the balance and inventory.

If the purchase succeeds but the furniture is missing or blank, check the furniture definition, generated furniture data, and matching client asset. If the price or page is stale, check that the catalogue reload reached the emulator.
