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

The marketplace lists eligible furniture for sale. Marketplace eligibility is separate from trade eligibility. A tradeable item is not automatically sellable on the marketplace.

Gift purchases, crafting recipes, and recycler rewards depend on their own catalogue and database configuration.

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
