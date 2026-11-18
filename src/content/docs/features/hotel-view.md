---
title: Hotel view
description: Set the hotel view background and widgets in Volt, and the landing promotions and bonus rare in the database.
sidebar:
  order: 2.8
---

The hotel view is the screen players see outside a room. In Volt you set it up in `ui-config.json`. The database also has landing data for clients that ask for it.

## Background

These `ui-config.json` keys set the images behind the hotel view. Leave a key empty for no image.

| Key | Where the image goes |
| --- | --- |
| `landing.view.background_gradient_top.uri` | The top gradient |
| `landing.view.background_gradient.uri` | The main gradient |
| `landing.view.background_left.uri` | The left side |
| `landing.view.background_right.uri` | The right side |

## Widgets

The hotel view has 5 widget slots. Slot 1 is the row at the top. Slots 2 and 4 are in the wide left column. Slots 3 and 5 are in the narrow right column.

| Key | What it does |
| --- | --- |
| `landing.view.dynamic.slot.<n>.widget` | `generic` puts a widget in slot `<n>`. `widgetcontainer` puts a [scheduled widget](#scheduled-widgets) there. |
| `landing.view.dynamic.slot.<n>.ignore` | `"true"` hides the slot. |
| `landing.view.dynamic.slot.<n>.layout` | The picture and the position of the text. See [layout](#widget-layout). |
| `landing.view.dynamic.slot.<n>.conf` | The texts and buttons. See [elements](#widget-elements). |
| `landing.view.dynamic.leftPaneWidth` | The width of the left column. Default 500. |
| `landing.view.dynamic.rightPaneWidth` | The width of the right column. Default 250. |
| `landing.view.common.textcolor` | A hex colour for all widget texts, for example `ffffff`. |
| `landing.view.common.etchingcolor` | A hex colour for the text shadow. |


### Widget layout

`layout` is a list of `key,value` pairs, separated by `;`:

| Key | What it does |
| --- | --- |
| `bitmap.uri` | The address of the picture. |
| `bitmap.x`, `bitmap.y` | The position of the picture. |
| `bitmap.width`, `bitmap.height` | The size of the picture. |
| `content.x`, `content.y` | The position of the texts and buttons. |
| `content.width` | The width of the texts. Default 250. |
| `container.height` | The height of the widget. |

### Widget elements

`conf` is a list of elements, separated by `;`. The parts of one element are separated by `,`. Volt shows the elements from top to bottom. It stops at the first element it does not know.

| Element | What it shows |
| --- | --- |
| `caption,<text key>[,<width>]` | A heading |
| `bodytext,<text key>[,<width>]` | A paragraph |
| `catalogbutton,<text key>[,<page>]` | A button that opens the catalogue, or one page of it |
| `internallinkbutton,<text key>,<link event>` | A button that runs a [link event](/getting-started/volt-client/#link-events) |
| `link,<text key>,<address>` | A button that opens a web address in the browser |

The texts are text keys. Add them to your UI texts.

### Example

This widget in slot 2 shows a picture, a heading, a paragraph and a button that opens the [campaign calendar](/features/campaign-calendar/):

```json
"landing.view.dynamic.slot.2.widget": "generic",
"landing.view.dynamic.slot.2.layout": "bitmap.uri,https://example.com/landing/advent.png;content.y,10",
"landing.view.dynamic.slot.2.conf": "caption,landing.acme.advent.title;bodytext,landing.acme.advent.text;internallinkbutton,landing.acme.advent.button,openView/calendar"
```

### Scheduled widgets

A `widgetcontainer` slot changes its widget on set dates. Its `conf` is a list of start times and widget codes:

```json
"landing.view.dynamic.slot.3.widget": "widgetcontainer",
"landing.view.dynamic.slot.3.conf": "2026-12-01 00:00,advent;2027-01-01 00:00,newyear"
```

- The format of each entry is `yyyy-MM-dd HH:mm,<code>`, in the time zone of the server.
- PlusEMU picks the code with the latest start time that has passed.
- Volt then shows the widget from `landing.view.<code>.widget`, `landing.view.<code>.layout` and `landing.view.<code>.conf`. The widget must be `generic`.

```json
"landing.view.advent.widget": "generic",
"landing.view.advent.conf": "caption,landing.acme.advent.title;internallinkbutton,landing.acme.advent.button,openView/calendar"
```

Before the first start time, the slot is empty.

## Landing data in the database

Volt does not show this data. PlusEMU sends it to clients that ask for it.

### Promotions

The `server_landing` table holds the promotion articles:

| Column | Default | What it does |
| --- | --- | --- |
| `title` | `''` | The title, at most 35 characters. |
| `text` | | The text. |
| `button_text` | `''` | The button caption, at most 25 characters. |
| `button_type` | `0` | `0` to `3`. |
| `button_link` | | The button link, at most 90 characters. |
| `image_link` | `''` | The image, at most 120 characters. |

Rows with a higher `id` come first. Reload with `:update promotions`. It needs `command.update` and `command.update_promotions`.

### Bonus rare

The bonus rare widget shows one furni and a credit total:

| `server_settings` key | Default | What it does |
| --- | --- | --- |
| `landing.bonus_rare.item_name` | `bonusbag26_3` | The furni class name. It must exist in `furniture`. An unknown name hides the widget. |
| `landing.bonus_rare.credits` | `120` | The credits. It must be a whole number above 0, or the widget is hidden. |

PlusEMU does not count purchases for the bonus rare. The widget always shows the full credit total as still needed.

### Community goal

The community goal shows the number of players online against a fixed goal of 1000. It has no settings.
