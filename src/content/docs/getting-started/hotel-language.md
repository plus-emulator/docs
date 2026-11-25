---
title: Change the hotel language
description: Show Habbo's texts, furniture names and product names in German, Dutch, French, Spanish, Italian, Finnish, Turkish or Portuguese with one installer option.
sidebar:
  order: 5.5
---

The hotel is English by default. With the installer's language option, the client texts, the furniture and product names, and the website's default language come from a Habbo hotel in that language.

## Choose a language

| Code | Language | Texts from |
| --- | --- | --- |
| `en` | English (default) | The stock hotel files |
| `de` | German | habbo.de |
| `nl` | Dutch | habbo.nl |
| `fr` | French | habbo.fr |
| `es` | Spanish | habbo.es |
| `it` | Italian | habbo.it |
| `fi` | Finnish | habbo.fi |
| `tr` | Turkish | habbo.com.tr |
| `br` | Brazilian Portuguese | habbo.com.br |

## Set the language with the installer

On an installed hotel:

- Linux: `sudo plusemu-update --language de`
- Windows, in Administrator PowerShell: `plusemu-update -Language de`

On a new hotel, add the option to the installer command:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash -s -- --language de
```

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1))) -Language de
```

`PLUSEMU_LANGUAGE=de` does the same as the option. The installer saves the choice: `HOTEL_LANGUAGE` in `/etc/plusemu/hotel.env` on Linux, `Language` in `C:\ProgramData\PlusEMU\hotel.json` on Windows. Every later rerun and `plusemu-update` keeps the language and downloads the newest language pack.

To go back to English, use `--language en` or `-Language en`.

## What the installer changes

1. It reads `https://assets.plusemu.dev/language/<code>.json`, downloads the language pack from there and checks its SHA-256. It unpacks the pack into `hotel-files/language/`. Habbo blocks downloads from many servers, so the texts come from PlusEMU's copy.
2. Volt loads the pack's texts right after the stock texts, in `configuration/renderer-config.json`. Your own text files, such as `hotel-texts.json`, still load last, so your texts still win.
3. Volt also gets its own interface texts in `de`, `nl`, `fr`, `es` and `it`. For `fi`, `tr` and `br`, the Volt interface texts stay English.
4. It writes `hotel-files/language/ProductData.json`: every stock product with the name and description from the pack. Volt and the [AIR client](/getting-started/air-client/) use this file.
5. With the AIR client, it adds the pack's texts and products to the `AirClient` settings in the emulator's `Config/config.json`.
6. It writes the furniture names and descriptions from the pack into the `furniture` table. It matches the rows by `item_name`.
7. It sets `APP_LOCALE` in Atom CMS. This is the website's default language. A visitor still gets their browser's language when the website has it.
8. It restarts the emulator when the settings or the furniture names changed. Players are disconnected for a moment.

## Things to know

- **Edited furniture names are replaced.** The installer writes the furniture names only when the language changes, not on every update. Going back to English writes the names from the stock `FurnitureData.json`.
- **A failed download changes nothing.** A hotel that already has a pack keeps it. A hotel without a pack stays English. The installer shows a warning and tries again on the next run or update.
- **A language problem never undoes an update.** The language step runs after the update is done.

## What stays English

The installer cannot get these from Habbo, so they stay as they are:

- Catalogue page titles and texts. They are in the database, and Habbo does not publish them.
- Emulator messages, such as command replies and alerts.
- Badge names on the website.
