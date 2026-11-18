---
title: Daily tasks
description: Set up the daily tasks window - the task pool, rewards, the bonus task, the number of tasks per day, and the Volt settings.
sidebar:
  order: 7.7
---

Daily tasks give each player a few small tasks every day, such as "dance 5 times". A finished task pays a reward. When a player finishes all tasks of the day, a bonus task opens.

## How it works

- Each player gets `dailytasks.count` tasks per day. The default is 3.
- PlusEMU draws the tasks from the `daily_tasks` table by `weight`. Each player gets their own draw, which stays the same for the whole day.
- PlusEMU tries to give tasks with different actions on the same day.
- When all tasks of the day are done or claimed, one bonus task opens. It comes from the tasks with `bonus = 1`.
- A finished task can be claimed for `dailytasks.unclaimed_days` days. The default is 7.
- The day changes at midnight in the time zone of the server. At that moment every online player gets the new list.

Fresh databases have 18 tasks. All pay 25 Duckets, and the bonus task pays 100 Duckets.

## Settings

Both settings are optional rows in `server_settings`. Reload them with `:update settings`.

| Key | Default | Range |
| --- | --- | --- |
| `dailytasks.count` | `3` | 0 to 20 tasks per day |
| `dailytasks.unclaimed_days` | `7` | 0 to 365 days |

```sql
INSERT INTO server_settings (`key`, `value`) VALUES ('dailytasks.count', '4')
ON DUPLICATE KEY UPDATE `value` = '4';
```

## The task tables

### `daily_tasks`

| Column | Default | What it does |
| --- | --- | --- |
| `code` | | A unique code. Volt uses it for the texts and the image. |
| `action_type` | | What the player must do, for example `dance`, `wave` or `chat_with_someone`. It uses the same names as [reward track tasks](/features/reward-tracks/#task-actions), plus `show_sign`. |
| `parameters` | `''` | Optional. A comma-separated list that limits the action, for example a sign number for `show_sign`. |
| `required_repeats` | `1` | How many times the player must do the action. |
| `image_version` | `''` | Added to the image name. Change it to make browsers load a new image. |
| `bonus` | `0` | `1` makes it a bonus task. |
| `weight` | `1` | The chance to be drawn. A weight of 0 or less is never drawn. |
| `enabled` | `1` | `0` turns the task off. |

`quest_type_code` and `catalog_name` are also sent to the client.

### `daily_task_rewards`

| Column | Default | What it does |
| --- | --- | --- |
| `task_id` | | The `id` of the task. |
| `product_item_type_id` | `8` | `8` for a currency, `4` for a badge. |
| `reward_type_id` | | For a currency: `-1` credits, or an activity point type such as `0` Duckets or `5` diamonds. For a badge: the badge code. |
| `amount` | `1` | How much. Must be 1 or more. |
| `sort_order` | | The order in the window. |

Club members get double Duckets from daily tasks.

PlusEMU skips a task without a code, an action or a valid reward. It logs `Daily task ... is skipped` at startup.

### Add a task

```sql
INSERT INTO daily_tasks (code, action_type, required_repeats, weight)
VALUES ('dance_five', 'dance', 5, 2);

INSERT INTO daily_task_rewards (task_id, product_item_type_id, reward_type_id, amount)
VALUES (LAST_INSERT_ID(), 8, '0', 50);
```

PlusEMU loads the task tables when it starts. Restart the emulator after you change them.

## Volt settings

| Where | What |
| --- | --- |
| `ui-config.json` key `dailytasks.enabled` | `true` shows Daily tasks in the toolbar menu. The example file does not have this key, so add it. |
| `ui-config.json` key `image.library.dailytasks.url` | The folder with the task images. Default `${image.library.url}dailytasks/`. |
| Image file | `<code><image_version>.png` in that folder, for example `dance_five.png`. |
| Texts | `dailytask.<code>.name`, `dailytask.<code>.desc` and `dailytask.<code>.hint` |
| Link event | `dailytasks/open` opens the window. `dailytasks/toggle` and `dailytasks/hide` also work. |

```json
"dailytasks.enabled": true
```

## Troubleshooting

- **The toolbar has no Daily tasks item.** Add `"dailytasks.enabled": true` to `ui-config.json`.
- **A new task never appears.** Restart the emulator. Check the startup log for `is skipped`. Check that `enabled = 1` and `weight` is above 0.
- **The task shows a text key instead of a name.** Add the `dailytask.<code>.*` texts.
