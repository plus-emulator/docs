---
title: Set up the camera
description: Connect the private camera renderer, prepare its assets, serve photos, and diagnose failures.
sidebar:
  order: 2
---

This guide uses a Linux installer layout. The camera renderer is a separate Node.js process. It needs the emulator, a current Volt build containing `camera.html`, and compatible renderer assets.

## Prepare the renderer files

Get the source version that matches your emulator release. From a PlusEMU source checkout, run:

```bash
cd CameraRenderer
npm ci
npx playwright install chromium
```

On a Linux host missing Chromium system libraries, install them with `npx playwright install-deps chromium`. Install the browser as the account that will run the renderer.

Use the deployed Volt directory as `CAMERA_PAGE_ROOT`. For the Linux installer, confirm this file exists:

```bash
ls /var/www/hotel/client/camera.html
```

If it is missing, deploy a compatible Volt build before continuing.

## Prepare compatible assets

The renderer's local asset layout differs from the installer's public `hotel-files` layout. Do not point `CAMERA_ASSET_ROOT` at that directory without preparing the expected files.

For the example below, place compatible assets under `/srv/plusemu-camera-assets` with this structure:

```text
/srv/plusemu-camera-assets/
  furniture/nitro/*.nitro
  furniture/json/ProductData.json
  clothes/nitro/*.nitro
  clothes/json/FigureData.json
  clothes/json/FigureMap.json
  effects/nitro/*.nitro
  effects/json/EffectMap.json
  gamedata/json/HabboAvatarActions.json
  pets/*.nitro
```

Use the asset set that matches your client. The current renderer requests `.nitro` filenames. A hotel asset pack containing only `.hab` files is not a drop-in local asset source for these defaults.

The example reads furniture data from the emulator through `CAMERA_FURNIDATA_URL`. Without that variable, the renderer also needs `furniture/json/FurnitureData.json` under the asset root.

Point `CAMERA_IMAGES_ROOT` at the directory containing `Habbo-Stories/` for camera effects. In an installer layout, the image directory is `/var/www/hotel/hotel-files/c_images`.

An existing compatible asset service can replace local game assets through `CAMERA_ASSET_ORIGIN`. This must be an HTTPS origin, such as `https://assets.example.com`, with no path. It must serve `/assets/...` and `/gamedata/...` using the paths requested by the renderer. The renderer still reads camera effect images locally.

## Set the shared secret

Generate a private secret of at least 32 characters. For example:

```bash
openssl rand -hex 32
```

Set the following keys inside the existing `Camera` section of the emulator's `Config/config.json`. Keep its existing `Effects` list.

```json
{
	"RendererUrl": "http://127.0.0.1:3921/render",
	"Bearer": "replace-with-your-private-secret",
	"OutputDirectory": "/var/www/hotel/emulator/camera",
	"TimeoutSeconds": 15,
	"MaxConcurrency": 2
}
```

Keep the renderer private. `RendererUrl` must use HTTP, a private address, and the `/render` path. PlusEMU rejects redirects and public renderer addresses.

Give the emulator account write access to the output directory. The renderer and web server need read access. Keep the bearer out of client configuration and public files.

## Start the renderer

From `CameraRenderer`, enter the same secret without saving it in shell history:

```bash
read -rsp 'Camera secret: ' CAMERA_RENDERER_SECRET
export CAMERA_RENDERER_SECRET
```

Start the renderer with your prepared paths:

```bash
CAMERA_PAGE_ROOT=/var/www/hotel/client \
CAMERA_ASSET_ROOT=/srv/plusemu-camera-assets \
CAMERA_IMAGES_ROOT=/var/www/hotel/hotel-files/c_images \
CAMERA_MEDIA_ROOT=/var/www/hotel/emulator/camera \
CAMERA_FURNIDATA_URL=http://127.0.0.1:8080/api/gamedata/furnidata \
CAMERA_RENDERER_CONFIG=/var/www/hotel/client/configuration/renderer-config.json \
CAMERA_UI_CONFIG=/var/www/hotel/client/configuration/ui-config.json \
node server.mjs
```

Look for both `Trusted camera renderer listening on 127.0.0.1:3921` and `Trusted camera page ready`. A listening process can still have asset or browser startup failures.

After the foreground check succeeds, run the same process under your service manager with these environment variables and a protected secret file. Restart it after each Volt deployment.

## Serve the photos

Add this location inside the hotel's nginx `server` block. Adjust the alias if you chose a different output directory.

```nginx
location /camera/ {
	alias /var/www/hotel/emulator/camera/;
	autoindex off;
	limit_except GET HEAD { deny all; }
	add_header X-Content-Type-Options nosniff always;
	add_header Cache-Control "no-cache" always;
}
```

Check and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

This location serves image files, not the private renderer. The refresh policy also lets room thumbnails change without retaining an old image.

The installer already sets `thumbnails.url` in Volt's `ui-config.json` to `/camera/thumbnail/%thumbnail%.png`. Check that it still has this value.

Restart PlusEMU to load the camera connection settings:

```bash
sudo systemctl restart plusemu
```

Current fresh databases already contain camera tables. Updates apply database migrations at startup. Do not replay old SQL update files on a current installation.

## Check a photo

1. Sign in with an account that has `camera.use`.
2. Enter a room and take a photo.
3. Apply an available effect and confirm that the preview changes.
4. Purchase a wall photograph and place it.
5. Capture a room thumbnail with an account that has room management rights.
6. Reload the navigator and check the thumbnail.

For a generated photo, request its actual `/camera/<guid>.png` URL in the browser. A successful renderer preview alone does not confirm public photo delivery.

## Troubleshoot the camera

| Symptom | Check |
| --- | --- |
| Renderer rejects captures | The emulator bearer and `CAMERA_RENDERER_SECRET` match, with at least 32 characters |
| Renderer listens but never becomes ready | `camera.html`, Chromium libraries, renderer file permissions, and the first asset error in its log |
| Missing asset error | The exact requested filename exists in the expected local tree or configured asset origin |
| Camera unavailable for one account | `camera.enabled`, `camera.use`, capture cooldowns, and daily quotas |
| Preview works but placed photos fail | The `/camera/` web route, output directory permissions, and `CAMERA_MEDIA_ROOT` |
| Photo purchase fails | The account balance, point currency type `0`, and a valid `camera.item_id` |
| Old photo draft fails | Take a new photo in the current room and session |
| Thumbnail stays unchanged | The thumbnail URL and cache rules on nginx and Cloudflare |

See [camera settings](/features/camera/#access-and-settings) for prices and quotas.
