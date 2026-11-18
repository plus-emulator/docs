---
title: Reward tracks
description: How reward tracks, their tasks and their prizes are stored, the prize format, the Habboween 2026 track and the Letters currency.
sidebar:
  order: 7.5
---

A reward track is a season of tasks. Players do tasks, collect points, and claim prizes at set point totals. A track can have a premium part that players buy with credits or diamonds.

## The reward track tables

| Table | What it holds |
| --- | --- |
| `reward_tracks` | One row per track: `id`, `theme`, `sort_order`, `starts_at`, `ends_at`, the premium settings and `enabled`. |
| `reward_track_tasks` | The tasks of each track: `action_type`, `parameter` and `premium`. |
| `reward_track_task_levels` | The levels of each task: `required_count` and `points_reward`. |
| `reward_track_prizes` | The prizes: `required_points`, `product_item_type_id`, `reward_type`, `extra_params`, `reward_amount` and `premium`. |

Only tracks with `enabled = 1` load. Leave `starts_at` and `ends_at` empty (`NULL`) for a track without a start or end date.

### Premium settings

| `reward_tracks` column | Default | What it does |
| --- | --- | --- |
| `has_premium` | `0` | `1` gives the track a premium part. |
| `premium_cost_credits` | `0` | The credits the premium part costs. |
| `premium_cost_diamonds` | `0` | The diamonds the premium part costs. |
| `premium_instant_points` | `0` | Points the player gets at once when buying premium. |
| `premium_task_points_boost` | `0` | A number that PlusEMU sends to the client to show. |

Tasks, task levels and prizes with `premium = 1` are only for players who bought premium.

### Tasks and levels

Each task in `reward_track_tasks` has a `track_id`, an `id`, an `action_type`, an optional `parameter` and a `sort_order`. Each level of a task in `reward_track_task_levels` has a `level`, the `required_count` of actions and the `points_reward`.

### Task actions

`action_type` is one of these:

`chat_with_someone`, `enter_other_users_room`, `place_item`, `give_respect`, `change_motto`, `change_figure`, `buy_from_catalogue`, `create_room`, `request_friend`, `set_relationship_status`, `move_item`, `rotate_item`, `switch_item_state`, `publish_picture`, `dance`, `wave`, `find_hand_item`, `use_habbicon`, `send_messenger_message`, `send_messenger_invite`, `pet_level`, `pet_respect`, `wear_badge`, `replenish_respect`, `friend_furni_locked`, `swim`, `pet_eat`, `plant_monster_plant`, `treat_monster_plant`, `follow_friend`, `teleport`, `claim_daily_task`, `custom_wired_action`.

[Daily tasks](/features/daily-tasks/) use the same names, plus `show_sign`.

### Open the window

The link event `reward_track/open` opens the reward track window in Volt. `reward_track/toggle` and `reward_track/hide` also work.

PlusEMU loads the tracks when it starts. Restart the emulator after you change these tables.

## Prize format

Prizes use Habbo's format. `product_item_type_id` says what the prize is, and `reward_type` says which one:

| `product_item_type_id` | Prize | `reward_type` | `extra_params` |
| --- | --- | --- | --- |
| `0` | Wall furni | The furni's sprite ID | Empty |
| `1` | Floor furni | The furni's sprite ID | Empty |
| `4` | Badge | The badge code | Empty |
| `6` | Bot | `generic` or `bartender` | The bot's figure |
| `8` | Currency | `-1` for credits, or the activity point type, such as `0` for Duckets | Empty |
| `10` | Pet | The pet type | The pet figure: type, breed and colour, such as `0 1 FFFFFF` |
| `12` | Habbicon | The habbicon ID | Empty |

`reward_amount` is how many the player gets, for example 250 Duckets. It must be 1 or more.

For a pet prize, the first number of `extra_params` must equal `reward_type`. A prize that does not fit this format cannot be claimed.

Migration 141 changed the prizes of older hotels to this format. Before, `reward_type` held a word such as `badge`, `credits` or `furni`.

This example adds a free prize of 100 Duckets at 200 points to the track `mytrack`:

```sql
INSERT INTO reward_track_prizes
  (track_id, id, required_points, product_item_type_id, reward_type, extra_params, reward_amount, premium, sort_order)
VALUES ('mytrack', 'free5', 200, 8, '0', '', 100, 0, 9);
```

## Habboween 2026

Migration 144 adds Habbo's Habboween 2026 track with the ID `habboween2026`. It has no end date. Its prizes include zombie habbicons and Letters.

Letters are activity point type `104`. Players spend them on the catalogue page with the link `hween26sc`. Turn the track off with:

```sql
UPDATE reward_tracks SET enabled = 0 WHERE id = 'habboween2026';
```

### Show Letters in the purse

Volt shows a seasonal currency in the purse when these keys are in `ui-config.json`:

```json
{
	"seasonalcurrencyindicator.enabled": true,
	"seasonalcurrencyindicator.active": "104",
	"seasonalcurrencyindicator.page": "hween26sc",
	"seasonalcurrency.id.104": "letter",
	"activitypoint.name.104": "letter.currency.name",
	"seasonalcurrency.letter.color": "dark_mauve",
	"seasonalcurrency.preset.dark_mauve.border": "#813d6a",
	"seasonalcurrency.preset.dark_mauve.font": "#813d6a"
}
```

- `seasonalcurrencyindicator.active` lists the currency types to show, separated by commas.
- `seasonalcurrencyindicator.page` is the catalogue page that opens when a player clicks the currency.
- `activitypoint.name.104` names the text with the currency name. The text `letter.currency.name` in the hotel files says "Letters".
- The colour keys set the border and text colour. Without them, Volt uses its default colours.
