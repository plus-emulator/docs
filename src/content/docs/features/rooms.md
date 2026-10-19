---
title: Rooms and building
description: Room settings, furniture placement, build height, room games, and community features.
sidebar:
  order: 4
---

Rooms hold furniture, visitors, pets, bots, and games. The navigator lets players find and create rooms. Room owners control access and the settings for their own rooms.

## Room settings

Room settings include the name, description, category, tags, visitor limit, and entry access. Other settings control trading, pets, walking through users, wall visibility, and floor and wall thickness.

Owners can also choose who can mute, kick, or ban visitors. These room settings are separate from hotel-wide staff roles.

Groups have their own membership and room rights. Giving someone rights in one room does not give them a hotel staff role.

## Building tools

Players place furniture from their inventory and adjust its position, rotation, and state. The floor editor changes the room layout. Stack tools and the build-height command provide more control over furniture placement.

To place or move furniture at a fixed height, use:

```text
:bh 2.5
```

The supported range is `0` to `40`. Values are rounded to two decimal places. Type `:bh` without a value to return to normal stacking.

The command changes placement height for your current room user. It does not grant furniture editing rights.

[Wired](/features/wired/) adds room interactions. The [camera](/features/camera/) provides wall photographs and navigator thumbnails.

## Games

PlusEMU includes Battle Banzai, Freeze, Football, Ice Tag, and SnowStorm. Room games use their matching furniture and game rules. SnowStorm has its own game flow.

A working game needs the corresponding catalogue items and client assets. The presence of an emulator game handler does not add missing assets to an existing hotel.

## Community features

Friends and messenger support conversations outside the current room. Groups and forums support shared communities. Room polls and word quizzes provide activities inside rooms.

Achievements, talent tracks, quests, and campaigns provide progression. Their visible content depends on the hotel's database and configuration.
