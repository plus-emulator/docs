---
title: Add new furniture
description: Add a new furniture item to your hotel - the asset files, the furniture row, the catalogue offer, and the reload. Furniture data is generated for you.
sidebar:
  order: 9
---

You do not edit `FurnitureData.json` by hand. PlusEMU builds it from the `furniture` table and the catalogue. To add a new furniture item you only need to:

1. Put the asset files on the web server.
2. Add one row to the `furniture` table.
3. Add a catalogue offer, if players should be able to buy it.
4. Reload the furniture and the catalogue.

The examples use a floor item with the classname `my_throne`. Replace it with your own name.

## How furniture data works

PlusEMU serves `FurnitureData.json` at `/api/gamedata/furnidata`. It builds the file from two sources:

- Every `furniture` row with `has_furnidata = 1`. This gives the name, description, size, colours and the other client fields.
- The catalogue offers that sell the furniture. This gives `offerid`, `buyout`, `bc` and `bcofferid`, so the buy button in the info stand and the catalogue search open the right offer.

PlusEMU rebuilds the file every time the catalogue reloads. The AIR client's XML furniture data and product data come from the same file. See [Configuration](/getting-started/configuration/) for the endpoints.

## 1. Add the asset files

The client needs the graphics of the furniture and an icon. The paths below are the installer defaults from `renderer-config.json`. The installer serves `hotel-files/` at `https://your-domain/hotel-files/`.

| File | Path | Setting |
| --- | --- | --- |
| Volt asset bundle | `hotel-files/assets/furniture/my_throne.hab` | `furni.asset.url` |
| Icon | `hotel-files/c_images/hof_furni/icons/my_throne_icon.png` | `furni.asset.icon.url` |

The file name of the bundle must be the classname. Volt reads `.hab` bundles by default. If you have a `.nitro` bundle, convert it with [hab-converter](https://github.com/plus-emulator/hab-converter):

```sh
./hab-converter -o hotel-files/assets/ nitro-assets/
```

This turns `nitro-assets/furniture/my_throne.nitro` into `hotel-files/assets/furniture/my_throne.hab`.

The update tool keeps files you add to `hotel-files`. It only replaces the stock files.

### AIR client

The AIR client loads furniture from Flash `.swf` libraries. Two external variables set the location:

- `flash.dynamic.download.url`, for example `https://your-domain/dcr/hof_furni/`
- `flash.dynamic.download.name.template`, for example `%revision%/%typeid%.swf`

With this template, the client loads `<revision>/my_throne.swf`, where the revision is the `revision` column of the furniture row. Put the file in the folder with that number, or use a template without `%revision%`.

## 2. Add the furniture row

One row in `furniture` holds two kinds of data:

- **Server columns.** PlusEMU uses them in rooms: `width`, `length`, `stack_height`, `can_stack`, `can_sit`, `is_walkable`, `interaction_type`, and the `allow_*` columns.
- **Furniture data columns.** These go into `FurnitureData.json` for the client: `name`, `description`, `xdim`, `ydim`, `can_sit_on`, `can_stand_on`, `can_lay_on`, `part_colors`, `revision` and others.

Keep the two sets the same. For example, set `xdim` to the same value as `width`, and `ydim` to the same value as `length`. If they differ, the client draws the furniture with a different size than the server uses.

```sql
INSERT INTO furniture
    (item_name, public_name, type, width, length, stack_height, can_stack, can_sit, is_walkable,
     sprite_id, interaction_type, interaction_modes_count,
     has_furnidata, name, description, xdim, ydim, can_sit_on, revision)
VALUES
    ('my_throne', 'My Throne', 's', 1, 1, 1.0, 0, 1, 0,
     90001, 'default', 1,
     1, 'My Throne', 'A throne for my hotel.', 1, 1, 1, 1);
```

What the important columns mean:

| Column | Meaning |
| --- | --- |
| `item_name` | The classname. It must match the asset file name. |
| `type` | `s` for a floor item, `i` for a wall item. Only these two types can have furniture data. |
| `sprite_id` | The furniture data id. It must be unique for its type. Pick a free number. |
| `has_furnidata` | `1` puts the row into `FurnitureData.json`. |
| `name`, `description` | The texts that players see in the catalogue, the info stand and the inventory. |
| `interaction_type` | What the furniture does in a room. `default` switches between states. `interaction_modes_count` is the number of states. |
| `can_sit_on`, `can_stand_on`, `can_lay_on` | What the client shows. Set them to match `can_sit`, `is_walkable` and the interaction. |
| `revision` | The asset revision. The AIR client uses it in the file path. Raise it when you change the asset, so clients load the new file. |
| `default_dir` | The direction the item faces when a player places it. |
| `part_colors` | Comma-separated colours for furniture with colour versions. `NULL` leaves the field out. |

To find a free `sprite_id`:

```sql
SELECT MAX(sprite_id) + 1 FROM furniture WHERE type = 's';
```

The database checks these rules:

- A `sprite_id` is unique among furniture data rows of the same type.
- An `item_name` is unique among furniture data rows.

### Copies with another interaction

Sometimes you want a second row for the same furniture with another interaction. Give the copy the same `item_name` and keep `has_furnidata = 0`. The copy then uses the furniture data entry of the first row.

## 3. Add a catalogue offer

An offer has three parts: the offer, what it sells, and the page that shows it. First find the page:

```sql
SELECT id, caption FROM catalog_pages WHERE caption LIKE '%Thrones%';
```

Then add the offer. Replace `42` with your page id.

```sql
INSERT INTO catalog_offers (localization_key, cost_credits, cost_points, points_type)
VALUES ('my_throne', 25, 0, 0);
SET @offer = LAST_INSERT_ID();

INSERT INTO catalog_offer_products (offer_id, position, product_type, furniture_id, amount)
VALUES (@offer, 0, 'furni', (SELECT id FROM furniture WHERE item_name = 'my_throne' AND has_furnidata = 1), 1);

INSERT INTO catalog_page_offers (page_id, offer_id, position)
VALUES (42, @offer, 0);
```

- `cost_credits` is the price in credits.
- `cost_points` and `points_type` set a price in activity points. `points_type` `0` is duckets and `5` is diamonds.
- `club_level` makes the offer need a club membership.

If the furniture is sold in more than one offer, furniture data names one of them. PlusEMU prefers an offer that sells only this item once, on a page that every player can see. See [Catalogue and economy](/features/economy/) for more about offers.

You can skip this step for furniture that players should not buy. The furniture then gets `offerid` `-1` and has no buy button.

## 4. Reload

Run these two commands in the hotel, in this order:

```text
:update furni
:update catalog
```

1. `:update furni` loads the new row into the server. It needs the `command_update_furni` permission.
2. `:update catalog` loads the new offer, builds a new `FurnitureData.json` and tells online clients that the catalogue changed. It needs the `command_update_catalog` permission.

The order matters, because the catalogue looks up the furniture rows when it loads. A restart of PlusEMU also works.

Players who are online must reload the client to get the new furniture data.

## Check that it works

1. Check that the furniture is in the generated file:

   ```sh
   curl -s http://127.0.0.1:8080/api/gamedata/furnidata | grep -o '"classname":"my_throne"[^}]*'
   ```

2. Check that the web server serves the asset and the icon:

   ```sh
   curl -I https://your-domain/hotel-files/assets/furniture/my_throne.hab
   curl -I https://your-domain/hotel-files/c_images/hof_furni/icons/my_throne_icon.png
   ```

   Both must answer `200`.

3. Reload the client, open the catalogue page, buy the furniture and place it in a room.

## Troubleshooting

- **The furniture is missing from `FurnitureData.json`.** Check `has_furnidata = 1` and `type` `s` or `i`. Then run `:update catalog` again.
- **The insert fails with a duplicate key.** Another furniture data row already uses this `sprite_id` for the type, or this `item_name`. Pick another value.
- **The catalogue shows the offer, but the furniture has no image.** The asset file is missing or has another name than `item_name`. Check the `curl -I` command above.
- **The furniture is not in the catalogue.** Run `:update furni` before `:update catalog`. Check that the offer and the page have `enabled = 1`.
- **The size or the sitting in the room is wrong.** The server columns and the furniture data columns differ. Make `width`, `length` and `can_sit` match `xdim`, `ydim` and `can_sit_on`.

## Adding clothing

Clothing is not generated. FigureData, FigureMap and the emulator's `Config/figuredata.xml` are files that you edit yourself. Clothing sold in the catalogue also needs a `furniture` row.

### New clothing for everyone

1. Add the clothing asset files.
2. Add the parts to the client's FigureMap.
3. Add the set to the client's FigureData.
4. Add the same set to the emulator's `Config/figuredata.xml`, then restart the emulator. The emulator reads this file only at startup.
5. Set `club="0"` for free clothing, or `club="1"` or `club="2"` for HC clothing. Set `selectable="1"` so the set shows in the clothing editor.

If you skip step 4, the server removes the new clothing when a player saves their look. See [Updates](/getting-started/updates/) for the matching `figuredata.xml`.

### Clothing sold in the catalogue

A player buys a clothing item, places it in a room and uses it. The item disappears and the clothing stays on their account for good. PlusEMU stores it in `user_clothing`.

1. Add the set as above, and mark it `sellable="1"` in both FigureData and `figuredata.xml`.
2. Add a `furniture` row with `interaction_type = 'purchasable_clothing'` and `has_furnidata = 1`.
3. Put the set ids in `custom_params`, separated by commas. These also go into `FurnitureData.json` as `customparams`.
4. Add a catalogue offer as in [step 3](#3-add-a-catalogue-offer), then [reload](#4-reload).

```sql
INSERT INTO furniture
    (item_name, public_name, type, width, length, stack_height, can_stack, can_sit, is_walkable,
     sprite_id, interaction_type, interaction_modes_count, custom_params,
     has_furnidata, name, description, xdim, ydim, can_sit_on, revision)
VALUES
    ('clothing_my_hat', 'My Hat', 's', 1, 1, 1.0, 0, 0, 0,
     90002, 'purchasable_clothing', 1, '3442,3443',
     1, 'My Hat', 'Use it to add the hat to your clothes.', 1, 1, 0, 1);
```

Until a player uses the item, the server replaces the sellable set when they save their look. A player who already owns the set gets no second copy.

### Wardrobe

Players save outfits in wardrobe slots. PlusEMU stores them in `user_wardrobe`, and you do not need to set anything up. The server checks every saved outfit for gender, club level and owned sellable clothing. It replaces any part the player is not allowed to wear.

### Clothing troubleshooting

- **"This item isn't set as a sellable clothing item".** The row's `interaction_type` is not `purchasable_clothing`. Fix it and run `:update furni`.
- **"This item doesn't have a linking clothing configuration".** `custom_params` is empty or has no valid set id.
- **The new clothing disappears when the player saves their look.** The set is missing from the emulator's `figuredata.xml`, or its `gender` or `club` does not allow the player to wear it. Restart the emulator after you change the file.
