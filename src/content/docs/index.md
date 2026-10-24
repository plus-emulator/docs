---
title: PlusEMU documentation
description: Set up your PlusEMU hotel, manage ranks and permissions, and configure camera, Wired, rooms, and the economy.
tableOfContents: false
---

PlusEMU is a Habbo Hotel server emulator written in C# on .NET 10. It runs your hotel's rooms, users, furniture, games, and economy. The [Volt client](https://github.com/plus-emulator/Volt) connects players to the emulator in their browser.

Use these guides to set up a hotel, manage staff access, and configure the main features.

:::tip[Need help? Join our Discord]
Ask questions, get help and talk to other hotel owners: **[Join the PlusEMU Discord](https://discord.gg/D7B42G7Rxk)**
:::

## Start here

| Your task | Guide |
| --- | --- |
| Run PlusEMU for the first time | [Install your hotel](/getting-started/installation/) |
| Connect the database and client | [Configuration](/getting-started/configuration/) |
| Install a new release | [Update PlusEMU](/getting-started/updates/) |
| Install or update the Volt client by hand | [Set up the Volt client](/getting-started/volt-client/) |
| See what changed | [Changelog](/changelog/) |
| Understand ranks and permissions | [Ranks and permissions](/administration/ranks-and-permissions/) |
| Give or remove staff access | [Assign and remove roles](/administration/manage-roles/) |
| Add a permission to a feature | [Create roles and permissions](/administration/custom-permissions/) |
| Set up room photos | [Set up the camera](/features/camera-setup/) |

## Explore the features

- [Camera](/features/camera/) saves room photos and thumbnails through a separate renderer service.
- [Wired](/features/wired/) lets room builders connect triggers, conditions, and effects without writing server code.
- [Rooms and building](/features/rooms/) covers room settings, building tools, room games, and community features.
- [Catalogue and economy](/features/economy/) covers the catalogue, currencies, trading, and other ways to exchange items.
- [Collectibles](/features/collectibles/) covers the Collectibles hub and avatar collectibles.
- [Pet companions](/features/pet-companions/) are small pets that players buy in the catalogue and wear with their look.
- [Avatar effects](/features/avatar-effects/) covers buying, wearing, and selling effects, and effect boxes.
- [Add new furniture](/features/add-furniture/) shows how to add a furniture item. Furniture data is generated from the database.

The [ranks and permissions guide](/administration/ranks-and-permissions/) explains how access works. Read [Assign and remove roles](/administration/manage-roles/) to give or remove access. Read [Create roles and permissions](/administration/custom-permissions/) to define a new role or permission.

## What you need

A running hotel combines the emulator, a MariaDB or MySQL database, a compatible client, and the client's assets. Your website handles registration and login. The camera renderer is a separate service that you can add when you need photos.

The [installation guide](/getting-started/installation/) lists what you need before you start: a server, a domain, and a Cloudflare account.

## Source and releases

These guides focus on the current [PlusEMU project](https://github.com/plus-emulator/PlusEMU). Older forks and releases may use different commands or settings. Read the [changelog](/changelog/) when you update an existing hotel.

For a language model or another tool, use the [Markdown pages and complete text export](/using-these-docs/).
