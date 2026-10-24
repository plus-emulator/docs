---
title: Add new clothing
description: Add new clothing to your hotel - free and HC clothing, clothing sold in the catalogue, and the wardrobe.
sidebar:
  order: 10
---

Clothing is not generated. FigureData, FigureMap and the emulator's `Config/figuredata.xml` are files that you edit yourself. Clothing sold in the catalogue also needs a `furniture` row.

## New clothing for everyone

1. Add the clothing asset files.
2. Add the parts to the client's FigureMap.
3. Add the set to the client's FigureData.
4. Add the same set to the emulator's `Config/figuredata.xml`, then restart the emulator. The emulator reads this file only at startup.
5. Set `club="0"` for free clothing, or `club="1"` or `club="2"` for HC clothing. Set `selectable="1"` so the set shows in the clothing editor.

If you skip step 4, the server removes the new clothing when a player saves their look. See [Updates](/getting-started/updates/) for the matching `figuredata.xml`.

## Clothing sold in the catalogue

A player buys a clothing item, places it in a room and uses it. The item disappears and the clothing stays on their account for good. PlusEMU stores it in `user_clothing`.

1. Add the set as above, and mark it `sellable="1"` in both FigureData and `figuredata.xml`.
2. Add a `furniture` row with `interaction_type = 'purchasable_clothing'` and `has_furnidata = 1`.
3. Put the set ids in `custom_params`, separated by commas. These also go into `FurnitureData.json` as `customparams`.
4. Add a catalogue offer as in [step 3](/features/add-furniture/#3-add-a-catalogue-offer), then [reload](/features/add-furniture/#4-reload).

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

## Wardrobe

Players save outfits in wardrobe slots. PlusEMU stores them in `user_wardrobe`, and you do not need to set anything up. The server checks every saved outfit for gender, club level and owned sellable clothing. It replaces any part the player is not allowed to wear.

## Troubleshooting

- **"This item isn't set as a sellable clothing item".** The row's `interaction_type` is not `purchasable_clothing`. Fix it and run `:update furni`.
- **"This item doesn't have a linking clothing configuration".** `custom_params` is empty or has no valid set id.
- **The new clothing disappears when the player saves their look.** The set is missing from the emulator's `figuredata.xml`, or its `gender` or `club` does not allow the player to wear it. Restart the emulator after you change the file.
