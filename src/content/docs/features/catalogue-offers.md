---
title: Club, vouchers and catalogue offers
description: Habbo Club offers and gifts, club limits, vouchers, limited edition stock, the catalogue front page, gifts, and vending machines.
sidebar:
  order: 5.2
---

This page covers the catalogue features that need their own tables or settings. For normal offers, see [add new furniture](/features/add-furniture/#3-add-a-catalogue-offer). Run `:update catalog` after you change catalogue tables. It needs `command.update` and `command.update_catalog`.

## Habbo Club offers

Club memberships are sold from `catalog_club_offers`. Only rows with `enabled = 1` load.

| Column | Default | What it does |
| --- | --- | --- |
| `name` | | The offer name. |
| `days` | | Club days. |
| `credits` | `0` | Price in credits. |
| `points` | `0` | Price in activity points. |
| `points_type` | `0` | The activity point type of `points`, for example `5` for diamonds. |
| `giftable` | `0` | `1` lets players buy it as a gift. |

Fresh databases sell 31 days for 100 credits, 93 days for 250 credits and 186 days for 500 credits. The catalogue page uses the layout `vip_buy`.

An active club member has club level 2. Staff with the permission `club.access` count as members. A catalogue offer with `club_level` 1 or 2, or a page with a `required_club_level`, is only for members.

### Club limits

| `server_settings` key | Default | What it does |
| --- | --- | --- |
| `club.limit.rooms.member` / `.normal` | `100` / `50` | Rooms a player can own |
| `club.limit.friends.member` / `.normal` | `800` / `300` | Friends a player can have |
| `club.limit.visitors.member` / `.normal` | `75` / `50` | Visitors in a room |
| `club.payday.percentage` | `10` | Club payday: the share, in percent, of the credits a member spent in the catalogue that the member gets back. 0 to 100. |

Payday is on the first day of each month, in UTC. Credit furni bought in the catalogue do not count as spending.

### Club gifts

Club members can choose free gifts. A gift is a normal catalogue offer listed in `club_gift_offers`:

| Column | Default | What it does |
| --- | --- | --- |
| `offer_id` | | A `catalog_offers.id`. |
| `days_required` | `0` | The club days a member needs before the gift opens. |
| `enabled` | `1` | `0` hides the gift. |

The offer must be enabled, on a page the player can open, not limited, and have exactly one furni product. That furni must have the interaction type `none`, and the amount must be 1 to 100.

The gift page uses the layout `club_gifts` and the link `club_gifts`.

## Vouchers

A voucher is a code that gives credits or Duckets. Players type it in the catalogue.

| Column | Default | What it does |
| --- | --- | --- |
| `voucher` | | The code. |
| `type` | `credits` | `credits` or `duckets`. |
| `value` | `100` | The amount. |
| `max_uses` | `1` | How many players can use it. |
| `current_uses` | `0` | How many players used it. PlusEMU counts this. |
| `enabled` | `1` | `0` turns it off. |

Each player can use a code once.

```sql
INSERT INTO catalog_vouchers (voucher, type, value, max_uses)
VALUES ('WELCOME2026', 'credits', 500, 100);
```

Then run `:update vouchers`. It needs `command.update` and `command.update_vouchers`.

## Limited edition stock

An offer is limited when it has a row in `catalog_offer_limited`:

| Column | What it does |
| --- | --- |
| `offer_id` | The `catalog_offers.id`. |
| `stack` | How many exist. Must be above 0. |
| `sold` | How many are sold. PlusEMU counts it. Each item gets the next number. |

```sql
INSERT INTO catalog_offer_limited (offer_id, stack) VALUES (12345, 50);
```

Limited offers cannot be bought as gifts and cannot be club gifts. A limited item cannot be put into the [Furni-Matic](/features/economy/#furni-matic) or used for [crafting](/features/crafting/).

## Catalogue front page

The front page (layout `frontpage4`) shows the rows of `catalog_promotions`:

| Column | Default | What it does |
| --- | --- | --- |
| `title` | `''` | The text. |
| `image` | `''` | An image under the client's `image.library.url`. |
| `position` | `0` | The place on the front page. |
| `item_type` | `0` | `0`: opens the page in `page_link`. `1`: an offer in `offer_id`. `2`: a product code in `product_code`. |
| `expires_at` | `NULL` | The end, in UTC. `NULL` means no end. |

```sql
INSERT INTO catalog_promotions (title, image, page_link, position, item_type, expires_at)
VALUES ('New furni', 'catalogue/feature_cata_vert_acme.png', 'new_furni', 1, 0, '2026-12-31 23:59:59');
```

## Gifts

Players can buy most offers as a gift. Turn gift buying off for the whole hotel with:

```sql
UPDATE server_settings SET `value` = '0' WHERE `key` = 'room.item.gifts.enabled';
```

Volt reads `catalog.purchase.gift_wrapping.default_box_index` (default `0`) for the box that is selected first.

## Turn the catalogue off

`catalog.enabled` in `server_settings` must be `1`. Any other value stops all purchases.

## Vending machines

A vending machine gives a hand item or an avatar effect to a player who stands next to it.

| `furniture` column | What it does |
| --- | --- |
| `interaction_type` | `vendingmachine` |
| `vending_ids` | Hand item IDs, separated by commas, for example `1,2`. The machine gives one at random. `0` means none. |
| `effect_id` | An avatar effect. The machine uses it only when `vending_ids` is `0`. |

```sql
UPDATE furniture SET interaction_type = 'vendingmachine', vending_ids = '1,2'
WHERE item_name = 'acme_fridge';
```

Run `:update furni` after the change. It needs `command.update` and `command.update_furni`.
