---
title: Collectibles
description: The Collectibles hub, avatar collectibles, silver and emeralds, minting, and how to manage sets and shop offers in the database.
sidebar:
  order: 6
---

Collectibles are numbered items that players collect into sets. PlusEMU has two separate parts:

- The **Collectibles hub**. Players collect sets, buy collectibles with emeralds, and turn furniture into collectibles.
- **Avatar collectibles**. Staff give a player a fixed look. The player wears it from the avatar editor.

On Habbo, collectibles live on a blockchain. In PlusEMU, they live only in your database. Players cannot trade them, sell them, or move them outside the hotel.

## Open the Collectibles hub

Players open the hub from the Me menu. Click your avatar in the toolbar, then click **Collectibles**.

The Me menu shows this entry only when both of these flags are `true` in Volt's `ui-config.json`:

```json
{
	"classic.collectibles.hub.enabled": true,
	"collectibles.hub.enabled": true
}
```

Three more flags show or hide single tabs:

- `nft.shop.enabled` shows the Shop tab.
- `nft.minting.enabled` shows the Relics tab.
- `collectibles.transfer.enabled` shows the Transfer tab.

Volt's example `ui-config.json` turns on all five flags. See [client connection and furniture data](/getting-started/configuration/#client-connection-and-furniture-data) for where the file lives.

The top of the hub shows the player's collector score, highest score, collector level, silver, and emeralds.

## Tabs in the hub

Tab names come from the hotel's external texts. With Habbo's texts, the tabs are Rewards, Collection, Shop, Relics, Transfer, and Info.

### Rewards

This tab lists monthly collector rewards that the player can claim now. **Claim all** puts every open reward into the player's Collector Wallet.

A fresh install has no monthly rewards, so the tab is empty. To add rewards, see [monthly rewards](#monthly-rewards).

### Collection

This tab lists every enabled set. It shows which items of a set the player owns, and the score of each item and of the whole set.

The player can choose which wallet to view. Each wallet has its own score and level.

If a set has a bonus or reward item, the player can claim it here after they own every item of the set. A fresh install has no bonus or reward items.

### Shop

Players buy collectibles here with emeralds. A bought collectible goes into the selected wallet. It does not go into the furniture inventory.

An offer can have a limit. When the hotel has that many copies of the item, the offer is sold out. The limit counts every copy, also copies from minting or rewards.

### Relics

Here, players turn a furniture item into a collectible. This is called minting. Minting costs mint tokens.

To mint, the player needs:

- A matching furniture item in their inventory. Placed furniture does not count.
- Enough mint tokens in the selected wallet.
- An open minting period for that furniture.

Minting deletes the furniture item for good. The player gets the matching relic collectible in its place. Players buy mint tokens on this tab with silver.

### Transfer

This tab moves all collectibles from the Collector Wallet to a linked wallet. Players cannot link a wallet from the client. Only staff can add a linked wallet, see [wallets](#wallets).

The transfer costs `collectibles.transfer.fee` silver. The default is `0`.

### Info

This tab shows help text from the external texts. It has no settings.

## Wallets, score, and levels

### Wallets

Every player gets one Collector Wallet the first time they open the hub. Its address is a random text that starts with `0x`. It is not a real blockchain address.

Collectibles, mint tokens, and score belong to a wallet, not directly to the player. Each copy of a collectible gets a serial number: 1, 2, 3 and so on per item.

A linked wallet is a second wallet of the same player. Add one with SQL. The address must be unique and at most 42 characters long:

```sql
INSERT INTO collectible_wallets (address, user_id, is_collector)
VALUES ('0x0000000000000000000000000000000000000001', 123, 0);
```

Replace `123` with the player's user ID.

### Score and level

The collector score of a wallet is:

- The `score` of each item the wallet owns. More copies of the same item count once.
- Plus the `boost_score` of each complete set.

The level is the highest row in `collectible_levels` whose `min_score` is not above the score. A fresh install has 20 levels, from level 1 at 0 points to level 20 at 60000 points.

## Silver and emeralds

The hub uses two activity point types:

- **Silver** is type `1000`. It buys mint tokens and pays the transfer fee.
- **Emeralds** are type `1001`. They buy shop offers.

Both balances are rows in `user_currencies`. PlusEMU has no way for players to earn silver or emeralds. Staff must give them.

To give silver or emeralds to an online player, use the `:give` command with the type number:

```text
:give PlayerName 1000 500
:give PlayerName 1001 200
```

The staff account needs `command.give` and `command.give_diamonds`. In the default roles, Administrator, Manager, Community Leader, Developer, and Owner have both. The rules from [give currency to a player](/features/economy/#give-currency-to-a-player) also apply here.

The emulator keeps the balance of an online player in memory. If you change `user_currencies` with SQL, do it while the player is offline.

## Prices

Each price comes from a database table:

| What | Table and column | Currency |
| --- | --- | --- |
| Shop offer | `collectible_shop_offers.emerald_price` | Emeralds |
| Mint token pack | `collectible_mint_token_offers.silver_price` | Silver |
| Minting one furniture item | `collectible_mintable_items.token_price` | Mint tokens |
| Transfer | `collectibles.transfer.fee` in `server_settings` | Silver |

A fresh install has 10 mint token packs. One token costs 100 silver, and the largest pack is 10 tokens for 1000 silver.

## Give an avatar collectible

An avatar collectible is a saved copy of a look. Staff give one with this chat command:

```text
:givecollectible PlayerName [avatar|clothes|genesis]
```

- The collectible is a copy of **your own current look**, not the player's look. Change into the look you want to give first.
- The last word is optional. The default is `avatar`. The word only changes the name and button color in the avatar editor.
- The player must be online. Your account must outrank the player. You can also give a collectible to yourself.
- The player gets a notification. The collectible shows up in their avatar editor.

The command needs the `command.givecollectible` permission. In a fresh install, Senior Moderator, Administrator, Manager, Community Leader, Developer, and Owner have it. On an existing hotel, the update gives it to every role that already had `command.givebadge`.

Avatar collectibles are stored in `user_nft_wardrobe`. They are not part of the hub, so they do not count toward score or sets.

## Wear an avatar collectible

1. Open the avatar editor.
2. Open the Avatar Collectibles tab.
3. Click a look.
4. Click **Save**.

The look changes in the room at once. PlusEMU remembers the look the player had before.

The collectible stays on until the player saves any other look. When the player opens a clothing tab of the editor, the editor shows their earlier look to start from. Saving that look takes the collectible off.

## Manage sets and offers

The emulator does not cache these tables. It reads them each time the client asks for hub data, so you do not need to restart the emulator.

A fresh install copies Habbo's current sets, shop offers, mint token packs, and mintable furniture. It adds only items whose furniture exists in your `furniture` table. Every collectible needs a furniture definition and client assets for its image and name.

### Tables

- `collectible_collections` holds the sets. Main columns: `id`, `name`, `boost_score`, `bonus_product_code`, `reward_product_code`, `released_at`, `snapshot_at`, `sort_order`, `enabled`.
- `collectible_products` holds every item a collectible can be. Main columns: `product_code`, `collection_id`, `product_type`, `item_type_id`, `score`, `rarity`, `figure_set_ids`, `sort_order`.
- `collectible_shop_offers` holds the Shop tab. Main columns: `product_code`, `emerald_price`, `is_featured`, `is_limited`, `mint_limit`, `sort_order`, `enabled`.
- `collectible_mint_token_offers` holds the mint token packs. Main columns: `product_code`, `silver_price`, `amount_tokens`, `sort_order`, `enabled`.
- `collectible_mintable_items` holds the furniture that players can mint. Main columns: `item_type`, `sprite_id`, `product_code`, `token_price`, `starts_at`, `ends_at`, `enabled`.
- `collectible_levels` holds the level ladder: `level` and `min_score`.
- `collectible_reward_claims` holds the monthly rewards.

All times are UTC.

### Products

- `product_type` is `1` for floor furniture, `0` for wall furniture, and `11` for clothing furniture.
- `item_type_id` is the `sprite_id` of the furniture. The client takes the name and image from it.
- `collection_id` puts the item in a set. Leave it `NULL` for items outside a set, such as relics and bonus items.
- `rarity` is a text such as `Common`, `Uncommon`, `Rare`, or `Epic`.

### Sets

- The client shows the external text `collectibles.set.<id>` as the set name. If that text is missing, it shows `name`.
- A player can claim the bonus item only between `released_at` and `snapshot_at`. An empty time leaves that side open.
- A player can claim the reward item at any time after the set is complete.
- Each wallet can claim the bonus and the reward of a set once.

### Shop offers

- `mint_limit` is the highest number of copies. `-1` means no limit.
- Set `enabled` to `0` to hide an offer without deleting it.

### Mintable furniture

- `item_type` is `s` for floor furniture and `i` for wall furniture. `sprite_id` must match the furniture's sprite ID.
- `product_code` is the collectible the player gets.
- Always set `ends_at`. The client does not allow minting for a row without an end time.
- The Relics tab hides rows after `ends_at`. Minting before `starts_at` fails.
- To turn off all minting, set `collectibles.minting.enabled` to `0` in `server_settings`, then run `:update settings`.

### Example: add a shop offer

This example adds an existing floor furniture item to a set and sells it for 100 emeralds. Replace `my_chair` with the furniture's `furnidata_classname`, and `witch_scholar` with the ID of an existing set.

```sql
INSERT INTO collectible_products (product_code, collection_id, product_type, item_type_id, score, rarity, sort_order)
SELECT 'nft_my_chair', 'witch_scholar', 1, sprite_id, 25, 'Rare', 10
FROM furniture WHERE furnidata_classname = 'my_chair' AND type = 's';

INSERT INTO collectible_shop_offers (product_code, emerald_price, sort_order)
VALUES ('nft_my_chair', 100, 50);
```

### Monthly rewards

Each row of `collectible_reward_claims` is one reward:

- `claim_id` is a unique text.
- `product_code` is the item the player gets.
- `set_id` and `set_name` are shown in the Rewards tab.
- `min_level` is the lowest collector level that can claim it.
- `claim_limit` is how many copies each player gets.
- `valid_from` and `valid_to` set when the reward is open.

Only the Collector Wallet can claim rewards. **Claim all** gives all remaining copies at once.

## Differences from Habbo

- Collectibles are stored in your database, not on a blockchain. Wallet addresses are not real.
- Players cannot link a wallet. Staff add linked wallets with SQL.
- Players cannot trade or sell collectibles. Bought and minted collectibles never go to the furniture inventory.
- Players cannot earn silver or emeralds in the hotel. Staff give them.
- No chat command gives hub collectibles. `:givecollectible` gives avatar collectibles only.
- Set boost scores are `0` and no set has a bonus or reward item. Habbo's values were not available.
- Every relic is worth 10 points and is `Common`. These values were chosen for PlusEMU.
- A fresh install has no monthly rewards.
