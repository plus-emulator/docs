---
title: Camera
description: Room photos, wall photographs, thumbnails, camera permissions, prices, and limits.
sidebar:
  order: 1
---

The camera takes room photos, applies effects, and creates wall photographs. Room thumbnails use the same rendering service.

PlusEMU sends a snapshot of the room to a private renderer. That renderer uses `camera.html` from the Volt build. Players choose the viewpoint and effects, but cannot upload a replacement image through camera packets.

The installer does not start this renderer. Fresh installs already enable the camera, but photos fail until the renderer runs. Follow [camera setup](/features/camera-setup/), or set `camera.enabled` to `0` until it is ready.

## Photos and thumbnails

A photo keeps the room snapshot from the moment the player takes it. Editing the photo changes its effects without capturing the room again.

Photo checkout requires the same client session and original room. Leaving the room or reconnecting invalidates the active draft. Drafts expire after 30 minutes.

Photos are 320 by 320 pixels. Small previews and room thumbnails are 110 by 110 pixels. The emulator writes photos under its `Camera.OutputDirectory` and returns URLs under `/camera/`.

Only the room owner, an admin of the room's group, or staff with `room.owner.any` can capture a room thumbnail. Volt's thumbnail URL is:

```json
{
	"thumbnails.url": "/camera/thumbnail/%thumbnail%.png"
}
```

## Access and settings

Camera use requires both `camera.enabled = 1` in `server_settings` and the `camera.use` permission. The current permission check does not use the old `camera.permission` setting.

These are the current fresh-install values. Existing hotels can have different values.

| `server_settings` key | Default | Meaning |
| --- | --- | --- |
| `camera.enabled` | `1` | Enables camera access |
| `camera.price.credits` | `2` | Credits per wall photograph |
| `camera.price.points` | `0` | Duckets per wall photograph |
| `camera.price.points.type` | `0` | Point type for wall photographs |
| `camera.price.publish.points` | `1` | Duckets per publication |
| `camera.price.publish.points.type` | `0` | Point type for publications |
| `camera.publish.cooldown` | `180` | Seconds between publications |
| `camera.render.cooldown` | `5` | Seconds between new captures |
| `camera.render.daily` | `50` | New captures per account per UTC day |
| `camera.render.edit.cooldown` | `1` | Seconds between effect renders |
| `camera.render.edit.daily` | `200` | Effect renders per account per UTC day |
| `camera.thumbnail.cooldown` | `15` | Seconds between thumbnail captures |
| `camera.competition.enabled` | `0` | Competition submissions are disabled |

`camera.price.points.type` and `camera.price.publish.points.type` must stay `0`, meaning duckets. Other point types are rejected.

`camera.item_id` identifies the wall furniture definition with interaction type `camera_picture`. Its numeric ID belongs to your database. Do not copy an ID from another hotel.

Staff with `command.update` and `command.update_configuration` can reload database settings with `:update settings`. Changes to the `Camera` section of `Config/config.json` require an emulator restart.

## Effects

The renderer reads available effects from `camera.available.effects` in the client configuration. Effect names must also exist in the emulator's `Camera.Effects` list.

Names are case-sensitive. Each emulator entry has a `Name` and `MinLevel`. An empty renderer catalogue permits photos without effects.

## Competition limitation

Competition submissions are disabled by default. PlusEMU has no verified-email flag for this flow. Setting `camera.competition.require_email` to a value other than `0` rejects submissions.

For connection failures, missing assets, or broken photo URLs, use [camera troubleshooting](/features/camera-setup/#troubleshoot-the-camera).
