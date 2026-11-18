---
title: Set up the Volt client
description: Install and configure the Volt client by hand, set the JSON mode, split the game data, build from source, and update.
sidebar:
  order: 6
---

Volt is the web client for PlusEMU hotels. The [installer](/getting-started/installation/) sets it up. Use this page to install, configure, build or update Volt manually.

Volt is built on [Volt-Renderer](https://github.com/plus-emulator/Volt-Renderer), which is bundled into every Volt release.

## Install a release

Recommended. No build step is needed.

1. Download `volt-client.zip` from the latest [Volt release](https://github.com/plus-emulator/Volt/releases).
2. Unzip it into the folder of your web server.
3. Create your configuration files. In the `configuration/` folder, copy these three files:

   | Copy this example | To this file |
   | --- | --- |
   | `renderer-config.json.example.json` | `renderer-config.json` |
   | `ui-config.example` | `ui-config.json` |
   | `client-mode.example` | `client-mode.json` |

4. Open `renderer-config.json` and set `socket.url` to the WebSocket address of PlusEMU. See [connect to PlusEMU](#connect-to-plusemu).
5. Open the client with a login ticket: `https://your-domain/index.html?sso=TICKET`. Your website normally does this for the player.

## Configuration files

All files are in the `configuration/` folder.

| File | Main settings |
| --- | --- |
| `renderer-config.json` | `socket.url` (game server WebSocket), `api.url`, `asset.url`, `image.library.url`, `hof.furni.url`, `gamedata.url`, and the URL of each game data file |
| `ui-config.json` | `thumbnails.url`, `url.prefix`, `habbopages.url`, catalogue and interface options |
| `client-mode.json` | `secureAssetsEnabled`, `secureApiEnabled`, `distObfuscationEnabled`, `apiBaseUrl`, `plainConfigBaseUrl`, `plainGamedataBaseUrl` |

Text files (`UITexts_*.jsonc.example`, `QuestUITexts.jsonc.example`) and `hotlooks.example` are in the same folder. Copy them and remove `.example` from the name to use them.

### Feature settings

These settings turn on or tune single features. New installs get the values below. `plusemu-update` adds a missing setting with its default, and keeps the value your file already has.

How `plusemu-update` merges `renderer-config.json`, `ui-config.json` and `client-mode.json`:

- A setting that is missing in your file is added from Volt's example file.
- A value in your file always wins. Objects are merged key by key, so a new key inside an object such as `notification` is added.
- A list in your file, such as `chat.styles` or `camera.available.effects`, is kept as it is. New list entries from a release are not added. Compare the list with the example file by hand.
- A file with comments or trailing commas is not plain JSON. The update keeps it as it is and adds no new settings. It shows a warning.
- The update never reads values from the database. Keep the [server values](#settings-that-must-match-the-server) equal by hand.

| File | Setting | What it does | Default |
| --- | --- | --- | --- |
| `renderer-config.json` | `habbicons.asset.hash` | The folder with the habbicon images. See [habbicons](#habbicons). | `habbo-225e1f8a` |
| `renderer-config.json` | `system.fps.max` | The highest frame rate. See [frame rate](#frame-rate). | `60` |
| `ui-config.json` | `recycler.number_of_slots` | The number of Furni-Matic slots. Keep it equal to the server. See [Furni-Matic](/features/economy/#furni-matic). | `8` |
| `ui-config.json` | `image.library.dailytasks.url` | Where the daily task icons are. Without it, Volt uses the `dailytasks/` folder under `image.library.url`. | `${image.library.url}dailytasks/` |
| `ui-config.json` | `dailytasks.enabled` | `true` shows Daily tasks in the toolbar menu. See [daily tasks](/features/daily-tasks/#volt-settings). | not set |
| `ui-config.json` | `toolbar.hide.quests` | `false` shows Quests in the toolbar menu. See [quests](/features/achievements-and-quests/#quests). | `true` |
| `ui-config.json` | `builders.club.enabled` | `false` hides the Builders Club. See [Builders Club](/features/builders-club/#volt-settings). | not set (on) |
| `ui-config.json` | `landing.view.*` | The hotel view background and widgets. See [hotel view](/features/hotel-view/). | empty |
| `ui-config.json` | `wired.*` | Wired tool options. See [Wired](/features/wired/#volt-settings). | |

### Settings that must match the server

Volt shows these values, but PlusEMU decides. When they differ, players see wrong numbers or get errors.

| `ui-config.json` setting | Must match |
| --- | --- |
| `recycler.number_of_slots` | `recycler_settings.slots`. See [Furni-Matic](/features/economy/#furni-matic). |
| `recycler.ducket_cost` | `recycler_settings.cost_duckets` |
| `recycler.timeout_seconds` | `recycler_settings.cooldown_seconds` |
| `motto.max.length` | `38`, the motto limit of PlusEMU |
| `bot.name.max.length` | `15`, the bot name limit of PlusEMU |
| `system.currency.types` | The activity point types your hotel uses |
| `catalog.links`, `catalog.clothes.page`, `avatareditor.pets.catalog.page.name`, `avatareditor.effects.buy.button.catalog.page.name` | Catalogue page names that exist in `catalog_pages` |
| `camera.available.effects` | The effect names in `Camera.Effects` of the emulator's `Config/config.json` |

### Habbicons

Volt ships two habbicon folders in `habbicons/`: `default` and `habbo-225e1f8a`. Only `habbo-225e1f8a` has the zombie habbicons, which are reward track prizes. Use it:

```json
"habbicons.asset.hash": "habbo-225e1f8a"
```

`plusemu-update` keeps your own value of this setting. A hotel installed before 18 November 2026 still has `default`, so change it by hand after you update Volt to 1.0.9.

Since Volt 1.0.8 and Volt Renderer 1.0.4, `habbicons.json` uses Habbo's own format. If you made your own habbicon folder, start again from a copy of `habbo-225e1f8a`.

### Frame rate

Volt draws at most 60 frames per second. Change the default with `system.fps.max` in `renderer-config.json`.

Players can change it for their own session with the `:fps` chat command, like in the AIR client. For example, `:fps 30` sets 30 frames per second. The value can be 5 to 10000. `:togglefps` turns the limit off and on.

## Link events

A link event is a short text that opens a part of Volt. Use link events in [hotel view widgets](/features/hotel-view/#widget-elements), in texts and in buttons.

| Link event | Opens |
| --- | --- |
| `openView/calendar` | The [campaign calendar](/features/campaign-calendar/) |
| `catalog/open` | The catalogue |
| `catalog/open/<page>` | A catalogue page, by page name or page ID |
| `catalog/open/offerId/<id>` | The page of an offer |
| `catalog/show/builders_club` | The Builders Club catalogue |
| `catalog/warehouse/<page>` | A page of the Builders Club catalogue |
| `navigator/show`, `navigator/toggle` | The navigator |
| `navigator/goto/<room id>` | Goes to a room. `navigator/goto/home` goes to the home room. |
| `navigator/search/<text>` | A navigator search |
| `navigator/create` | The create room window |
| `inventory/show`, `inventory/toggle` | The inventory. Add `/furni`, `/pets`, `/badges` or `/bots` for one tab. |
| `achievements/toggle` | Achievements |
| `questengine/achievements/<category>` | One achievement category |
| `quests/toggle` | Quests |
| `dailytasks/open` | [Daily tasks](/features/daily-tasks/) |
| `reward_track/open` | [Reward tracks](/features/reward-tracks/) |
| `habboUI/open/hccenter` | The Habbo Club center |
| `avatar-editor/show` | The avatar editor |
| `friends/show` | The friends list |
| `groups/create` | The create group window |
| `games/toggle` | The game center |
| `collectibles/open` | The [Collectibles](/features/collectibles/) hub |
| `user-settings/show` | The user settings |
| `help/show` | The help window |
| `habbopages/<page>` | A Habbo page from `habbopages.url` |

## Connect to PlusEMU

- **`socket.url`:** the WebSocket address of PlusEMU. It is the `Nitro` section in PlusEMU's `Config/config.json` (default port 2096). Use `ws://127.0.0.1:2096` on your own computer. Use `wss://` behind a TLS proxy on a live server.
- **`api.url`:** the HTTP address for login, maintenance and authentication.
- **`furnidata.url`:** see [furniture data](/getting-started/configuration/#client-connection-and-furniture-data).
- **Login ticket:** the client reads it from the `?sso=` part of the address.

## JSON or JSONC files

Volt reads its configuration and game data files in one of three modes:

| Mode | What it accepts |
| --- | --- |
| `legacy` | Strict JSON only. Comments and trailing commas cause an error. |
| `jsonc` | JSON with comments and trailing commas |
| `auto` | Strict JSON first, then JSONC. This is the default. |

A file whose name ends in `.jsonc` is always read as JSONC.

The mode is fixed when Volt is built. To choose it, run `yarn configure` (it asks you and writes `.volt-build.json`), or set it for one build:

```bash
VOLT_JSON_MODE=jsonc yarn build
```

Single-quoted strings and unquoted keys are not accepted in any mode. Change them to normal JSON.

## Split game data

A game data file (FurnitureData, FigureData, FigureMap, EffectMap, ProductData, HabboAvatarActions, ExternalTexts or UITexts) can be one big file, or a folder of small files. Small files are easier to edit and to share.

Point the URL at the folder. End it with a slash:

```jsonc
"furnidata.url": "https://example.com/gamedata/furnidata/"
```

The folder looks like this:

```text
furnidata/
  manifest.jsonc        optional: { "tiers": ["core", "custom", "seasonal"] }
  core/
    manifest.jsonc      required: { "files": ["a.jsonc", "b.jsonc"] }
    a.jsonc
    b.jsonc
  custom/               optional
    manifest.jsonc
    overrides.jsonc
  seasonal/             optional
    manifest.jsonc
    xmas.jsonc
```

- Without the top `manifest.jsonc`, Volt uses the order `core`, `custom`, `seasonal`.
- Volt skips a tier that has no `manifest.jsonc`.
- Later tiers and later files override earlier ones.

How Volt joins two parts:

| Two parts | Result |
| --- | --- |
| Two objects | Joined key by key, going deeper |
| Two lists of objects with the same id key | Joined by id. The later one wins. |
| Two lists without an id key | One longer list |
| Anything else | The later value wins |

The id keys are `id`, `classname` and `name`, in this order.

To split an old single file into the `core/` tier, run this in the Volt source folder:

```bash
node scripts/split-gamedata.mjs --input FurnitureData.json --output gamedata/furnidata
node scripts/split-gamedata.mjs --help
```

## Build from source

Build from source only if you change Volt. For a normal hotel, install a release.

You need:

- Node.js 22.12 or newer
- Yarn 4, through Corepack (`corepack enable`)
- Git
- A game server such as PlusEMU, and the converted client assets

### With the install script

Run `install.sh` (Linux and macOS) or `install.bat` (Windows) in the Volt folder. It does these steps:

1. Checks your Node.js version.
2. Clones Volt-Renderer to `../Volt-Renderer` if it is missing.
3. Runs `yarn install` in both folders.
4. Links the renderer into Volt.
5. Copies the three configuration files.
6. Asks for the JSON mode and the URLs.
7. Runs `yarn build`.

Run `node install.mjs --help` to see the options. For an unattended run, use `--non-interactive` with `--socket-url=...` and the other URL options.

### By hand

Put Volt and Volt-Renderer next to each other. Volt reads the renderer from `../Volt-Renderer`.

```bash
git clone https://github.com/plus-emulator/Volt.git
git clone https://github.com/plus-emulator/Volt-Renderer.git
corepack enable
(cd Volt-Renderer && yarn install)
(cd Volt && yarn install)
```

Then create the three configuration files in `Volt/public/configuration/` as described above, and start the development server:

```bash
cd Volt
yarn start
```

In development, `/api/*` goes to `AUTH_PROXY_TARGET`, or else to `api.url`, or else to `http://127.0.0.1:2096`. Assets can come from a `../Nitro-Files/` folder: `nitro-assets/` appears at `/nitro-assets` and `swf/` at `/swf`.

### Build commands

| Command | What it does |
| --- | --- |
| `yarn vite build` | A plain build into `dist/`. The release uses this. |
| `yarn build` | A build, then `scripts/minify-dist.mjs`. It makes the JSON smaller and writes gzip `.dat` copies of the JavaScript and CSS for the obfuscated loader. |
| `yarn build:prod` | Updates the browser list, then runs `yarn build`. |
| `yarn preview` | Shows `dist/` on your computer. |

Upload the contents of `dist/` and your configuration files to your web server. Set `VITE_BASE` to change the base path (default `./`).

## Update Volt

### With the installer

Run `sudo plusemu-update` (Linux) or `plusemu-update` (Windows). It keeps your configuration files. See [update PlusEMU](/getting-started/updates/).

### By hand, from a release

1. Back up your `configuration/` folder.
2. Download the newest `volt-client.zip`.
3. Replace the old files with the new ones. Keep your own `renderer-config.json`, `ui-config.json`, `client-mode.json` and text files.
4. Compare your files with the new `.example` files. Add any new settings.
5. Reload the hotel page in the browser.

Update PlusEMU and Volt together, because their packet versions must match. Read the [changelog](/changelog/) first.

### By hand, from source

```bash
cd Volt-Renderer && git pull && yarn install
cd ../Volt && git pull && yarn install
yarn build
```

Run `yarn install` in Volt-Renderer every time it changes the `pixi.js` version. If the installed version does not match, the Volt build stops with an error.
