---
title: Avatar effects
description: How players buy, wear and lose avatar effects, how to sell effects in the catalogue, effect boxes, and the staff effect commands.
sidebar:
  order: 8
---

An avatar effect changes how an avatar looks in a room, for example a glow or a costume. Players buy effects in the catalogue or get them from effect boxes. Staff can also put effects on avatars with chat commands.

A bought effect lasts one hour from the moment the player first wears it. An effect from an effect box never runs out.

## What players see

Players find their effects in the avatar editor:

1. Click your own avatar and choose **My clothes** in the Me menu.
2. Open the **Effects** tab.
3. Select an effect and click **Save**.

The tab shows each effect with its icon, name and a time bar. A number on the icon shows how many copies the player owns. The first slot is the clear button. Select it and save to take the effect off.

The **Shop** button on the tab opens the catalogue page with the link `ny2015_permeffects`. The fresh catalogue has an **Effects** page with that link. You can change the target with the Volt setting `avatareditor.effects.buy.button.catalog.page.name`.

Wearing an effect stops dancing. Volt turns off **Dance** in the Me menu while the player wears an effect from the Effects tab.

## Buy an effect

A player buys an effect like any other catalogue offer. The effect goes straight to the Effects tab. It does not go to the furniture inventory.

- PlusEMU charges the price and adds one copy of the effect. The player cannot choose an amount for effect offers.
- If the player already owns that effect, PlusEMU adds one to the number of copies.
- A new copy is not active yet. Its timer has not started.

## Activate and wear

Activating and wearing are two different steps:

- **Activating** starts the timer of one copy. A copy is activated only once.
- **Wearing** shows an active effect on the avatar in the room.

When the player saves an effect in the editor, Volt first activates a copy if none is active. Then Volt asks the server to wear it. PlusEMU only lets a player wear an effect that they own and that is active.

The player can choose an effect outside a room. PlusEMU keeps the choice and puts the effect on at the next room entry.

Volt also wears the last chosen effect again on every room entry. The Volt setting `effects.reactivate.on.room.entry` controls this. It is `true` by default.

After the player logs out or reconnects, no effect is worn. The player chooses it again in the editor.

## Timer and expiry

The timer starts when a copy is activated. It does not pause:

- The timer keeps running when the player takes the effect off.
- The timer keeps running when the player is offline.

PlusEMU checks the timers of online players about once a minute. When the timer of a copy runs out:

1. PlusEMU removes that copy.
2. If the player still wears the effect, PlusEMU takes it off. Everyone in the room sees this.
3. The next room entry does not bring the effect back.

## Several copies of the same effect

PlusEMU stores all copies of one effect in one `user_effects` row. The `quantity` column holds the number of copies.

- Only one copy can run at a time.
- When the running copy expires, the next copy does not start by itself. The player selects and saves the effect again to start it.
- When the last copy expires, PlusEMU deletes the row and the effect leaves the Effects tab.

## Permanent effects

An effect with `total_duration = 0` is permanent. It never runs out. Volt shows a full time bar and the text for a permanent effect.

Effect boxes create permanent effects. You can also give one by hand:

```sql
INSERT INTO user_effects (user_id, effect_id, total_duration, is_activated, activated_stamp, quantity)
VALUES (123, 19, 0, 0, NULL, 1);
```

Replace `123` with the user id and `19` with the effect id. Set `quantity` to at least `1`. The column default is `0`, and PlusEMU ignores a row with no copies. PlusEMU loads effects at login, so the player sees the new effect after logging in again.

## Effect boxes

An effect box is a furniture item that gives an effect for good. Its `item_name` is `fxbox_fx` followed by the effect id. For example, `fxbox_fx16` gives effect 16. The furniture needs `interaction_type = 'effect_box'`. PlusEMU sets this on effect boxes that still use a default interaction.

To open a box:

1. The owner places the box in a room and stands in that room.
2. The owner uses the box. Volt shows a confirm dialog.
3. The owner clicks **OK**.

Then PlusEMU:

- deletes the box,
- adds the effect as a permanent effect and puts it on the owner,
- plays the opening animation and removes the box from the room.

Only the owner of the box can open it. If the owner already has bought copies of the effect, that effect becomes permanent.

Older versions only switched the box to its opening state. That left the box invisible but still on its tile. A database migration closes those boxes again, so their owners can open them.

## Sell an effect in the catalogue

An effect offer uses the same tables as other offers:

- `catalog_offers` holds the name key, the price and the club level.
- `catalog_offer_products` holds the product. Use `product_type = 'effect'` and put the effect id in `effect_id`. Leave `furniture_id` empty.
- `catalog_page_offers` puts the offer on a page.

The stock offers use the name key `avatar_effect` followed by the effect id, such as `avatar_effect19`.

There is no duration setting. PlusEMU gives every bought effect a duration of 3600 seconds (one hour). The `user_effects.total_duration` column stores this value.

This example sells effect 19 for 50 duckets on the page with the link `ny2015_permeffects`:

```sql
INSERT INTO catalog_offers (localization_key, cost_credits, cost_points, points_type, club_level, bulk_purchase, enabled)
VALUES ('avatar_effect19', 0, 50, 0, 0, 0, 1);

SET @offer_id = LAST_INSERT_ID();

INSERT INTO catalog_offer_products (offer_id, position, product_type, effect_id, amount)
VALUES (@offer_id, 0, 'effect', 19, 1);

INSERT INTO catalog_page_offers (page_id, offer_id, position)
SELECT id, @offer_id, 0 FROM catalog_pages
WHERE link = 'ny2015_permeffects' AND catalog_mode = 'NORMAL';
```

Then run `:update catalog`. Buy the offer with a test account and check that the effect shows in the Effects tab.

All purchases stop when `catalog.enabled` in `server_settings` is not `1`. For more about offers and prices, see [catalogue and economy](/features/economy/).

## Hotel files the client needs

Volt loads effects through `renderer-config.json`:

- The effect map, from `avatar.effectmap.url` (`EffectMap.json`). It lists each effect id with the library that draws it.
- The effect libraries, from `avatar.asset.effect.url` (`effect/<library>.hab`).
- The libraries in `avatar.mandatory.effect.libraries`. The example configuration lists the dance libraries.

The effect name in the editor comes from the external text key `fx_` followed by the effect id, such as `fx_19`. The effect icons are part of the Volt build.

An effect needs an entry in the effect map and its library before players can see it. The camera renderer also reads the effect map. A photo fails if someone in the room wears an effect that is not in the effect map. See [camera](/features/camera/).

## Staff commands and permissions

Each chat command needs the permission `command.` followed by the command name. The fresh-install grants below can differ in your hotel. For roles and limits, see [ranks and permissions](/administration/ranks-and-permissions/).

### Enable

`:enable <effect id>` puts any effect on your own avatar. `:enable 0` takes it off.

- It needs `command.enable`. The fresh database gives it to the `default` role and to all staff roles.
- The player does not need to own the effect. There is no timer.
- It does not work while you ride a horse, lie down or play on a game team.
- Effects 102 and 187 need `moderation.tool`.
- Effect 178 needs a `limit.staff_effect` value of 178 or higher. The fresh database sets 178 for `gold_vip` and 187 for `events_staff`, `developer` and `owner`.

The room owner can turn `:enable` off for a room with `:room enables`. Run the same command again to turn it back on. Staff with `moderation.tool` can still use `:enable` in that room.

### Mass enable

`:massenable <effect id>` puts an effect on every user in the room.

- It needs `command.massenable`. The fresh database gives it to all staff roles.
- You can use it only in your own room, unless you have `command.override_massenable`. The fresh database gives that to `developer` and `owner`.
- It changes your own avatar and the avatars of users you outrank. It skips users who ride a horse.
- Effect ids 102 and 178 disconnect the staff member who runs the command.

### Forced staff effects

When staff enter a room, PlusEMU puts a staff effect on them:

- Users with `moderation.tool` get effect 102.
- Users with the `ambassador` permission and without `moderation.tool` get effect 178.

`:forced_effects` turns this on or off for your own account. PlusEMU saves the choice in `users_settings.disable_forced_effects`. The command needs `command.forced_effects`. The fresh database gives it to all staff roles.

## Games and Wired

Games and Wired can put another effect on an avatar for a while, such as a team effect or the freeze effect.

- When a Wired freeze or teleport effect ends, the earlier effect returns.
- A player who leaves a room while on a game team loses the team effect. It does not come back on the next room entry.

## Differences from Habbo

- The `:enable`, `:massenable` and `:forced_effects` commands and the forced staff effects exist only in PlusEMU.
- Every bought effect lasts one hour. The catalogue tables have no duration setting.
