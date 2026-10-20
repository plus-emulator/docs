---
title: Wired
description: Build room interactions with triggers, conditions, effects, selectors, variables, and the Wired Web API.
sidebar:
  order: 3
---

Wired connects furniture and room events without changing the emulator's code. Builders use it for games, puzzles, movement, messages, and score systems.

## How a stack works

A basic Wired stack groups boxes on the same floor tile.

| Box | Purpose |
| --- | --- |
| Trigger | Starts the stack when an event happens, such as a user entering or speaking |
| Condition | Checks whether the stack can run |
| Effect | Changes the room, furniture, or selected users |
| Selector | Chooses the furniture or users that other boxes act on |
| Add-on | Changes how the stack chooses, limits, or runs its effects |

A greeting stack can combine a room-entry trigger with a message effect. Conditions can restrict who receives the message. Configure each box in the client before checking the result in the room.

Effects can have delays. Moving, editing, or removing a box can cancel its unfinished work. Ordinary effects attached to a user also stop when that user's room visit ends.

## Variables, links, and scores

Variables store values that room logic can read and change. PlusEMU includes variable triggers, conditions, effects, and variable-driven visual effects.

Wired Label, Wired Link, and Room Linker support more complex room setups. Leaderboard boxes support score displays. Wired chests and contracts support controlled exchanges of items.

Available boxes depend on the emulator version, catalogue, and client assets. A box needs a matching furniture definition and editor, as well as server support.

Players can buy the Wired boxes that Habbo sells. Boxes that Habbo does not sell are on the staff-only **Wired (staff)** catalogue page. This page needs the `catalog.pages.administrator` permission, and catalogue search does not show its items. Database migrations create the page and move the boxes when you update.

## Open the Wired menu

Type one of these commands in the room chat:

| Command | Opens |
| --- | --- |
| `:wf` or `:wired` | The Wired menu on its current tab |
| `:var` or `:variables` | The variables tab |
| `:inspect` or `:inspection` | The inspection tab |

The monitor, variables, and inspection tabs show the data that the emulator sends. If you cannot read Wired in the room, the client shows an alert instead.

## Hide Wired furniture

The room owner, or staff who can manage any room, can type:

```text
:hidewired
```

The command toggles Wired furniture visibility and saves the choice for the room. Run it again to show the boxes for editing.

## Web API

The Variables Web API add-on generates read and write keys for a room. External tools send those keys in the `X-Wired-Read-Key` and `X-Wired-Write-Key` headers.

The API is served by the emulator's `WebServer`, normally on `127.0.0.1:8080`. On an nginx installation, add this route to the hotel's server block:

```nginx
location /api/public/ {
	proxy_pass http://127.0.0.1:8080;
}
```

Check nginx configuration before reloading it. The installer's existing furniture-data route does not expose the Wired API by itself. On a Windows installation, IIS (Internet Information Services) needs a matching rewrite rule from `api/public/` to `http://127.0.0.1:8080/api/public/`.

For example, list the variables in room `123` with its read key:

```bash
curl 'https://your-domain/api/public/rooms/123/variables' \
	-H 'X-Wired-Read-Key: replace-with-room-read-key'
```

The API also has routes under `/api/public/rooms/{roomId}/variables_profile/` for variable profiles. Use a read key for read-only integrations. Keep write keys out of public pages and client bundles.

For complete route and request definitions, see [WiredWebApiEndpoints.cs](https://github.com/plus-emulator/PlusEMU/blob/master/Communication/Http/WiredWebApiEndpoints.cs).

## When a stack does nothing

Check the trigger and conditions first. Confirm that selected users or furniture still exist in the room and that the relevant boxes share the intended tile.

If the box does not appear in the catalogue or has no usable editor, check the matching client assets and furniture definitions. Restarting a room cannot add missing catalogue content.
