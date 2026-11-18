---
title: Achievements, talents and quests
description: Change achievement levels and rewards, add an achievement, set up the talent track, and turn on quests.
sidebar:
  order: 7.8
---

Achievements, the talent track and quests reward players for playing. This page shows the tables you can change and how to reload them.

## Achievements

Each achievement is a group of levels, such as `ACH_RoomEntry1`, `ACH_RoomEntry2` and so on. Each level is one row in the `achievements` table.

| Column | Default | What it does |
| --- | --- | --- |
| `group_name` | `ACH_` | The achievement group, for example `ACH_RoomEntry`. |
| `level` | `1` | The level. `group_name` and `level` together are unique. |
| `category` | `identity` | The tab in the achievements window. |
| `progress_needed` | `1` | The **total** progress for this level, counted from zero. It is not the step from the level before. |
| `reward_pixels` | `5` | Duckets the player gets for the level. |
| `reward_points` | `5` | Achievement score the player gets for the level. |
| `state` | | `0` off, `1` on, `2` archived, `3` off-season, `4` Wired. |
| `visible` | `1` | `0` keeps the progress but hides the achievement in the window. |
| `badge_code` | `NULL` | The badge for the level. When empty, the badge is `group_name` plus `level`, for example `ACH_RoomEntry2`. |

### Change a reward

```sql
UPDATE achievements SET reward_pixels = 50, reward_points = 10
WHERE group_name = 'ACH_RoomEntry' AND level = 2;
```

Then reload in room chat:

```text
:update achievements
```

The command needs `command.update` and `command.update_achievements`.

### Add an achievement

Every level needs a badge. Add the badge definition too:

```sql
INSERT INTO achievements (group_name, category, level, reward_pixels, reward_points, progress_needed)
VALUES ('ACH_AcmeVisitor', 'explore', 1, 5, 10, 1),
       ('ACH_AcmeVisitor', 'explore', 2, 10, 10, 10);

INSERT IGNORE INTO badge_definitions (code, required_right)
VALUES ('ACH_AcmeVisitor1', ''), ('ACH_AcmeVisitor2', '');
```

Run `:update achievements` and `:update badge_definitions`. The badge images and texts must also be in your hotel files.

A new achievement group only gets progress when something in the hotel counts it. Crafting recipes can count any group through their [`achievement` column](/features/crafting/#crafting_recipes).

### Volt settings

| `ui-config.json` key | What it does |
| --- | --- |
| `achievements.unseen.ignored` | A list of badge groups without the level number, for example `ACH_AllTimeHotelPresence`. These never count as unseen in the toolbar. |
| `achievements.new` | Achievement names, separated by commas, in the same form as the example file: `RewardTracksCompleted,HabbiconUsed`. Volt also lists them in a "new" tab. |

The link event `achievements/toggle` opens the achievements window. `questengine/achievements/<category>` opens one category.

## Talent track

The talent track is a ladder of levels for the types `citizenship` and `helper`. Each level has steps, and each step is an achievement level.

| Table | What it holds |
| --- | --- |
| `talents` | One row per level: `type`, `level`, `data_actions` and `data_gifts`. |
| `talents_sub_levels` | The steps of a level: `talent_type`, `talent_level`, `sub_level`, `badge_code` and `required_progress`. |
| `user_talent_rewards` | The gifts each player got. PlusEMU fills it. |

- `data_gifts` is a list of furni class names, separated by `|`, for example `pixel_walldeco`. The gift furni must be floor or wall items.
- `data_actions` is a list of perk names, separated by `|`, such as `TRADE` or `CITIZEN`.
- A step is done when the player has the achievement level in `badge_code`, for example `ACH_RoomEntry2`. A `badge_code` that matches no achievement level is never done.
- Levels open in order. Each gift is given once per player.

PlusEMU loads the talent tables when it starts. Restart the emulator after a change. Volt has no talent track window.

## Quests

Quests are in the `quests` table. Each row has a `type` (the quest group), `level_num`, `goal_type`, `goal_data`, `pixel_reward` (Duckets, default 10) and the optional dates `timestamp_unlock` and `timestamp_lock`. Fresh databases have about 57 quests.

Reload quests after a change:

```text
:update quests
```

The command needs `command.update` and `command.update_quests`.

Volt hides the Quests item in the toolbar menu by default. To show it, set this in `ui-config.json`:

```json
"toolbar.hide.quests": false
```

The link events `quests/toggle` and `questengine/quests` open the quests window.

## Reload commands

| Command | Reloads | Permission besides `command.update` |
| --- | --- | --- |
| `:update achievements` | Achievements | `command.update_achievements` |
| `:update badge_definitions` | Badge definitions | `command.update_badge_definitions` |
| `:update quests` | Quests | `command.update_quests` |

Daily tasks, reward tracks, crafting and talents have no reload command. Crafting needs none. The others need a restart.
