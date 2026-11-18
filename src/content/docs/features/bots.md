---
title: Bots
description: Sell rentable bots in the catalogue, set bartender answers, and know the bot limits.
sidebar:
  order: 6.8
---

Players buy bots in the catalogue and place them in their rooms. A bot can stand, walk, talk and serve drinks. Room owners set a bot's look, name, speech and walk mode in the client.

## Bot types

| `ai_type` | What it does |
| --- | --- |
| `generic` | Walks and says its speech lines. |
| `bartender` | Like `generic`. It also answers keywords from `bots_responses` and can hand out drinks. |

## Sell a bot

A bot offer needs a preset in `catalog_bot_presets` and a catalogue offer whose product points to it.

| `catalog_bot_presets` column | What it does |
| --- | --- |
| `name` | The bot's first name. |
| `figure` | The bot's look. |
| `gender` | `M` or `F`. |
| `motto` | The bot's motto. |
| `ai_type` | `generic` or `bartender`. |

The catalogue product has `product_type = 'bot'` and `bot_preset_id` set to the preset's `id`. Fresh databases sell two bots on the page with the link `bots`: Robbie (`generic`, preset `3569`) and Skye (`bartender`, preset `3570`). Copy one of those offers when you add your own.

A bought bot uses chat bubble 31, Habbo's style for rentable bots.

## Keyword answers

Bartender bots answer chat that contains a keyword. The answers are in `bots_responses`. Only rows with `bot_ai = 'bartender'` are used:

| Column | What it does |
| --- | --- |
| `bot_ai` | `bartender`. |
| `chat_keywords` | Keywords, separated by commas. Upper and lower case do not matter. A message that contains one keyword matches. |
| `response_text` | The answer. `{username}` becomes the name of the player. |
| `response_mode` | `say`, `shout` or `whisper`. |
| `response_beverage` | Hand item IDs, separated by commas. A bartender gives one at random. `0` gives nothing. |

A bartender answers players who are at most 8 tiles away.

```sql
INSERT INTO bots_responses (bot_ai, chat_keywords, response_text, response_mode, response_beverage)
VALUES ('bartender', 'coffee,latte', 'Here is your coffee, {username}!', 'say', '2');
```

Reload the answers in room chat:

```text
:update bots
```

The command needs `command.update` and `command.update_bots`.

## Speech lines

The lines a bot says by itself are in `bots_speech` (`bot_id`, `text`). Room owners normally set them in the client. In the `bots` table:

- `automatic_chat` (`true` or `false`) turns the lines on.
- `speaking_interval` is the number of seconds between lines. The lowest value is 7.

## Limits

| Limit | Value |
| --- | --- |
| Bots per room | 5. Staff with `bot.place_any_override` can place more. |
| Name length | 1 to 15 characters. Keep `bot.name.max.length` in `ui-config.json` at `15`. |
| Seconds between speech lines | At least 7. |
| Speech line length | 200 characters. |

Staff with `bot.edit_any_override` can change other players' bots.

Pets do not count against the bot limit. For pets, see [pets](/features/pets/).
