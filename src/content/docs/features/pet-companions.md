---
title: Pet companions
description: How players buy, unlock and wear pet companions, and how staff change the Companions catalogue page.
sidebar:
  order: 7
---

A pet companion is a small pet that walks with a player's avatar. It is a clothing part, not a room pet. The companion has no needs, levels or commands. It is part of the avatar's look, in the same way as a hat or a shirt.

In the figure data, companions use the `pt` set type. PlusEMU sells 33 companions on the Clothing > Companions page for 25 credits each.

## What players do

### Buy a companion

1. Open the catalogue and go to Clothing > Companions.
2. Select a companion. The preview shows the avatar with the companion.
3. Buy it for 25 credits. The player gets a clothing furni in their inventory.

### Unlock a companion

1. Place the clothing furni in a room.
2. Double-click the furni. A dialog shows the avatar with the companion.
3. Confirm the dialog.

The furni leaves the room and the companion is added to the player's wardrobe for good. Volt also saves the new look, so the avatar wears the companion right away.

Only the owner of the furni can unlock it. If the player already owns that companion, the furni is still used up.

### Wear or remove a companion

1. Open the wardrobe.
2. Open the "..." tab. The pets sub tab opens first.
3. Click a companion to wear it. To remove it, click the empty item at the start of the list.
4. Save the look.

The pets sub tab lists only the companions the player has unlocked. The plus button at the end of the list opens Clothing > Companions.

An avatar can wear one companion at a time.

## How it works on the server

- Each companion is a `furniture` row with `interaction_type = 'purchasable_clothing'`. The `custom_params` column holds the figure set id that the furni unlocks, for example `6383` for the Pet Toucan.
- When a player unlocks the furni, PlusEMU deletes the item and adds one row to `user_clothing` per figure set id. The table has the columns `user_id`, `part_id` (the figure set id) and `part` (the furni's `item_name`).
- When a player saves a look, PlusEMU checks it against `Config/figuredata.xml`. A set with `sellable="1"` is only kept if the player has it in `user_clothing`. If not, PlusEMU removes or replaces that part. This stops players from wearing a companion they have not unlocked.
- PlusEMU sends the list of unlocked set ids to the client at login and after each unlock.

## Change the Companions page

Migration 102 creates the page and the offers. The page has the link `clothing_companions` and the caption `Companions`. It sits under Clothing, right after Accessories, and uses the `default_3x3` layout. Search by the link, because the page id is different in each hotel.

The page uses these tables:

- `catalog_pages`: the page itself, with `visible` and `enabled`.
- `catalog_page_offers`: links offers to the page, with `position`.
- `catalog_offers`: the price, with `cost_credits`, `cost_points`, `points_type` and `enabled`.
- `catalog_offer_products`: links an offer to its `furniture_id`.

After any change, reload the catalogue with `:update catalog`. See [catalogue and furniture data](/features/economy/#catalogue-and-furniture-data).

### Change the price

This example sets all companions on the page to 50 credits:

```sql
UPDATE catalog_offers o
JOIN catalog_page_offers po ON po.offer_id = o.id
JOIN catalog_pages p ON p.id = po.page_id
SET o.cost_credits = 50
WHERE p.link = 'clothing_companions' AND p.catalog_mode = 'NORMAL';
```

To change one companion, add a condition such as `AND o.localization_key = 'clothing_r26_toucancompanion'`. The migration uses the furni's `item_name` as the `localization_key`.

### Stop selling one companion

Set `enabled = 0` on its offer. The catalogue then hides the offer and refuses to sell it. Players who already unlocked the companion keep it.

```sql
UPDATE catalog_offers o
JOIN catalog_page_offers po ON po.offer_id = o.id
JOIN catalog_pages p ON p.id = po.page_id
SET o.enabled = 0
WHERE p.link = 'clothing_companions' AND p.catalog_mode = 'NORMAL'
  AND o.localization_key = 'clothing_nftshiba';
```

### Hide the page

Set `visible = 0` to remove the page from the catalogue tree. Set `enabled = 0` to stop the page from showing its offers.

```sql
UPDATE catalog_pages
SET visible = 0, enabled = 0
WHERE link = 'clothing_companions' AND catalog_mode = 'NORMAL';
```

The wardrobe's plus button still points to `clothing_companions`. You can point it to another page with the Volt setting `avatareditor.pets.catalog.page.name`.

### Add a companion

A new companion needs all of these parts:

- A `pt` set with `sellable="1"` in the server's `Config/figuredata.xml` and in the client figure data. Use the same set id in both.
- The figure map entry and the figure library for its parts in the hotel files.
- A `furniture` row with `interaction_type = 'purchasable_clothing'` and the set id in `custom_params`.
- An offer in `catalog_offers`, a product in `catalog_offer_products` and a link in `catalog_page_offers`.

Then run `:update furni` and `:update catalog`. If you changed `Config/figuredata.xml`, run `:update mutant` to reload it.

## Hotel files the client needs

Volt loads these files through `renderer-config.json`:

- Figure data, from `avatar.figuredata.url` (`FigureData.json`). It must contain the `pt` sets.
- Figure map, from `avatar.figuremap.url` (`FigureMap.json`). It tells the client which library holds each part.
- Figure libraries, from `avatar.asset.url` (`figure/<library>.hab`). They hold the companion images.

If a file is missing, the client does not show an error for that companion:

- With no `pt` sets in the figure data, the pets sub tab stays empty.
- With no figure map entry or no library, the avatar shows without the companion.
- If the server's `Config/figuredata.xml` does not have the set, PlusEMU removes the companion when the player saves the look.

Keep the server figure data and the client figure data in step. After an update, compare `Config/figuredata.xml` with the release copy, as described in [updates](/getting-started/updates/).

## Differences from Habbo

- Habbo has no public catalogue offer for these companions. PlusEMU adds its own Companions page and sets the price to 25 credits.
- The unlock flow and the wardrobe follow Habbo. The wardrobe lists only unlocked companions, and the "..." tab is on by default, as on Habbo.
