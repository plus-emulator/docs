---
title: Before the first release
description: What changed when PlusEMU and Octane were forked into PlusEMU and Volt, before the first public release.
sidebar:
  order: 6
---

Volt is our fork of Octane, which is a fork of Nitro. PlusEMU is our fork of [PlusEMU by 80O](https://github.com/80O/PlusEMU). This page sums up the work done before the first public release on 7 October 2026. For the changes after that, see [1-7 October 2026: first release](/changelog/2026-10-01/) and the newer pages.

## Volt, compared to Octane

- Reworked the interface to match Habbo more closely.
- Rebuilt the floor editor.
- Updated furniture menus and room controls.
- Improved chat, avatar portraits and notifications.
- Updated the catalogue, inventory and trading windows.
- Updated the groups, forums and moderation windows.
- Reworked the camera and photo viewer.
- Faster client loading.
- Better performance in crowded rooms.
- Fixed multiple memory leaks and reduced memory usage.
- Updated to Pixi 8.22.
- Fixed Firefox display issues.
- Removed the soundboard, fortune wheel, mentions, emoji picker and custom name decorations.

## PlusEMU, compared to the original

### Runtime and architecture

- Moved to .NET 10, modernised the codebase and updated dependencies.
- Moved rooms, inventory, trading, groups, messenger and moderation into their own services.
- Separated gameplay logic, database access and packet handling.
- Renamed packets to their original Habbo names.
- Gave each room its own services and lifecycle, and improved room cleanup and disconnect handling.
- Fixed race conditions in player saves, group updates and friend requests.
- Failed database saves no longer leave the game out of sync.
- Inventory items are reserved while furniture is placed.
- Room access, bans and furniture placement rules live in one place.

### Database

- Replaced the old database layer with Dapper and MySqlConnector.
- Purchases and rewards run in database transactions.
- All timestamps are stored in UTC.
- Added a fresh-install database and migration scripts.
- Included the Habbo catalogue and club gifts, with a reworked catalogue structure.
- Furnidata is generated on the fly, like on Habbo.

### Permissions

- Rewrote the rank and permission system.
- Packet permission checks happen in one place.

### Gameplay

- Camera and wall photos.
- Group forums.
- SnowStorm and Ice Tag.
- Crafting, recycling and Ecotron rewards.
- Advent calendar rewards.
- Room polls and word quizzes.
- Safety and Habbo Way quizzes.
- Jukebox playlists and music discs.
- Habbo Club monthly gifts and payday.
- The introduction reward track.
- Talent progression and rewards.
- Habbicons.
- Badge rarity and leaderboards.
- A rewritten WIRED engine that follows Habbo's WIRED v2.
- Reworked pathfinding.
- Improved rollers, gates, teleporters and stacking helpers.
- Reworked marketplace handling.
- Improved purchases, gifts, Habbo Club memberships and quests.
- Fewer unneeded room updates.
