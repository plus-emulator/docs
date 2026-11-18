---
title: Campaign calendar
description: Set up an advent-style calendar with one door per day, random rewards, club bonuses, and a link that opens it.
sidebar:
  order: 7.6
---

The campaign calendar shows one door for each day of a campaign, like an advent calendar. A player opens today's door and gets a reward. Each door can be opened once per player.

You set up a calendar in three database tables. No restart is needed: PlusEMU reads the tables when a player logs in and when a player opens a door.

## Quick start

This example makes a 24-day calendar from 1 December. Every door gives 50 credits.

```sql
INSERT INTO campaign_calendars (name, image, starts_at, days, enabled)
VALUES ('advent2026', '', '2026-12-01 00:00:00', 24, 1);

INSERT INTO campaign_calendar_rewards (campaign_id, product_name, credits)
VALUES (LAST_INSERT_ID(), '%credits% credits', 50);
```

Then give players a way to open it. Volt opens the calendar with the link event `openView/calendar`. Use it, for example, in a [hotel view widget](/features/hotel-view/#widget-elements) button:

```text
internallinkbutton,landing.view.calendar.button,openView/calendar
```

## The calendar tables

### `campaign_calendars`

One row per campaign.

| Column | Default | What it does |
| --- | --- | --- |
| `name` | | The campaign name. It must be unique. It is case-sensitive. |
| `image` | `''` | An image name that PlusEMU sends to the client. |
| `starts_at` | | The start of day 1, in UTC. |
| `days` | | The number of doors, 1 to 366. Another value turns the campaign off. |
| `enabled` | `0` | Set it to `1` to use the campaign. |
| `lock_expired` | `1` | `1`: a door can be opened on its own day and the 2 days after it. `0`: every past door stays open. |
| `hc_duckets_multiplier` | `2` | Players with an active club membership get the reward's Duckets times this number. It must be 0 or more. |

Each day is 24 hours from `starts_at`. A day starts at the same UTC time as `starts_at`.

Only one campaign is active at a time. If several enabled campaigns run at the same moment, PlusEMU uses the one with the latest `starts_at`. When two have the same `starts_at`, the one with the highest `id` wins.

### `campaign_calendar_rewards`

The rewards of a campaign. When a player opens a door, PlusEMU picks one row of the campaign **at random**. A door does not have a fixed reward. To give the same reward every day, add only one row.

| Column | Default | What it does |
| --- | --- | --- |
| `campaign_id` | | The `id` of the campaign. |
| `product_name` | | The text the player sees. It must not be empty. See [placeholders](#reward-text). |
| `custom_image` | `''` | An image under the client's `image.library.url`. When empty, Volt shows the icon of the furni whose class name equals `product_name`. |
| `credits` | `0` | Credits. Must be 0 or more. |
| `duckets` | `0` | Duckets. Must be 0 or more. |
| `diamonds` | `0` | Diamonds. Must be 0 or more. |
| `badge` | `''` | A badge code. The badge must exist in `badge_definitions`. |
| `item_id` | `0` | A `furniture.id`, or `0` for no furni. |
| `hc_days` | `0` | Club days, 0 to 36500. |

One row can give several things at once, for example credits, a badge and a furni.

A furni reward must be a floor or wall item (`type` `s` or `i`). Teleports, gifts, mood lights, toners, group furni, Wired room linkers and Ecotron boxes are not allowed. A badge whose definition needs a permission (`required_right`) goes only to players who have that permission.

If a reward breaks one of these rules, the door does not open and the player can try again.

### `user_calendar_claims`

PlusEMU writes one row each time a player opens a door: `user_id`, `campaign_id`, `day`, `reward_id` and `claimed_at`. Each player can open each day once. You do not need to edit this table.

To let a player open a day again, delete the row:

```sql
DELETE FROM user_calendar_claims
WHERE user_id = 1 AND campaign_id = 1 AND day = 0;
```

Days start at `0`. Day `0` is the first door.

## Reward text

PlusEMU replaces these placeholders in `product_name`:

| Placeholder | Becomes |
| --- | --- |
| `%credits%` | The credits |
| `%pixels%` | The Duckets the player got, after the club multiplier |
| `%points%` | The diamonds |
| `%points_type%` | `5` (diamonds) |
| `%badge%` | The badge code |
| `%subscription_type%` | `HABBO_CLUB` |
| `%subscription_days%` | The club days |
| `%item%` | The furni class name |

## Calendar texts in Volt

Volt takes the window title from the text `campaign.calendar.<name>.title`, where `<name>` is the campaign name. Add this text to your UI texts, for example:

```json
"campaign.calendar.advent2026.title": "Advent calendar"
```

## Staff: open any door

Staff with the permission `campaign.calendar.force` see an extra button in the calendar. It opens any day of the campaign, also a future day. It still counts as that day's claim. See [grant an existing permission](/administration/custom-permissions/#grant-an-existing-permission).

## Troubleshooting

- **The calendar does not open.** Check that the campaign has `enabled = 1`, that `starts_at` is in the past and that the campaign has not ended. PlusEMU sends the calendar only at login, so the player must log in again after you add or change a campaign.
- **A door stays closed.** With `lock_expired = 1`, a door older than 2 days cannot be opened. A future door cannot be opened by players. Check also that the campaign has at least one reward row.
- **The calendar shows yesterday's state.** PlusEMU does not send the new day to players who stay online. They see the new door after they log in again.
