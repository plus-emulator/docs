---
title: Avatar images
description: Draw website avatar images with your own renderer - the renderer settings, the web server route, the Atom CMS avatar API, the address format, and other HTTP addresses.
sidebar:
  order: 2.2
---

Your website shows avatar images on profiles, staff pages and more. By default Atom CMS loads them from habbo.com. With the avatar renderer, your hotel draws them itself, with your own clothing, effects and hand items. The images look the same as in the hotel.

## How it works

Three parts work together:

1. **Atom CMS** answers `GET /api/avatar-image?figure=...`. It checks the look, signs an image address and sends the browser there with a `302` redirect.
2. **The web server** serves `/avatars/`. It sends a stored image, or passes a missing one to the renderer.
3. **The renderer** draws the image and stores it. The renderer is the camera service (`CameraRenderer` in PlusEMU).

The signature makes sure that only your website can ask for new images. Other sites cannot make your server draw any image they like.

## Before you start

- The [camera](/features/camera/) service must run.
- The client build must have avatar support in its `camera.html` (`window.cameraAvatar`). Update Volt first.
- Atom CMS must have the avatar API. Check that the file `app/Http/Controllers/Api/AvatarImageController.php` exists in your website folder.

## 1. Turn on avatar images in the renderer

The renderer reads three settings from its environment:

| Setting | Default | What it does |
| --- | --- | --- |
| `AVATAR_IMAGER_SECRET` | | A private random secret of at least 32 characters. The website signs every address with it. |
| `AVATAR_IMAGER_ROOT` | | The folder where the renderer stores the images. The web server serves it at `/avatars/`. |
| `AVATAR_IMAGER_MAX_MB` | `1024` | The most space the stored images may use, in MB. |

Avatar images stay off until both `AVATAR_IMAGER_SECRET` and `AVATAR_IMAGER_ROOT` are set. An empty value counts as not set. If only one of them is set, or the secret is shorter than 32 characters, the renderer does not start.

On Linux, `plusemu-update` writes `/etc/plusemu/camera.env` again after each update. Put the avatar settings in a systemd drop-in file instead, so they stay:

```bash
openssl rand -hex 32    # copy this secret, you need it again in step 3
sudo install -d -o plusemu -g plusemu /var/www/hotel/avatars
sudo systemctl edit plusemu-camera
```

Add these lines in the editor, with your own secret:

```ini
[Service]
Environment=AVATAR_IMAGER_SECRET=replace-with-your-secret
Environment=AVATAR_IMAGER_ROOT=/var/www/hotel/avatars
```

Then restart the service and check its log:

```bash
sudo systemctl restart plusemu-camera
journalctl -u plusemu-camera -n 50
```

The Windows steps are not described here.

## 2. Add the web server route

The web server serves stored images itself. It passes only a missing image to the renderer, without the camera password. Limit how many requests one visitor can pass on.

Add this to `/etc/nginx/sites-available/hotel.conf`. The `limit_req_zone` line goes in the `http` block, for example in a file in `/etc/nginx/conf.d/`. The other blocks go in the hotel's `server` block.

```nginx
# In the http block:
limit_req_zone $binary_remote_addr zone=avatars:10m rate=5r/s;

location /avatars/ {
    root /var/www/hotel;
    limit_except GET { deny all; }
    try_files $uri @avatar;
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Cross-Origin-Resource-Policy same-site;
}
location @avatar {
    limit_req zone=avatars burst=30;
    proxy_pass http://127.0.0.1:3921;
    proxy_intercept_errors on;
    error_page 404 502 503 504 = /avatar-missing.png;
    add_header Cross-Origin-Resource-Policy same-site;
}
location = /avatar-missing.png {
    root /var/www/hotel;
    add_header Cache-Control "no-store";
    add_header Cross-Origin-Resource-Policy same-site;
}
```

- `root /var/www/hotel` plus the address `/avatars/...` must point into `AVATAR_IMAGER_ROOT`.
- Put a placeholder image at `/var/www/hotel/avatar-missing.png`. Browsers get it when an image cannot be drawn. Keep `no-store` on it, so a browser never keeps the placeholder.
- `3921` is the default port of the renderer.

Check and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Set up Atom CMS

Add these settings to the website's `.env` file (`/var/www/hotel/cms/.env` on a Linux installer hotel):

| Setting | Default | What it does |
| --- | --- | --- |
| `AVATAR_IMAGER_SECRET` | empty | The same secret as the renderer. Empty turns the API off. |
| `AVATAR_IMAGER_URL` | `/avatars` | Where the images are. A value that starts with `/` gets `APP_URL` in front. |
| `AVATAR_IMAGER_VERSION` | `1` | The version in the image address, 1 to 999999. |

If your website caches its configuration, run `php artisan config:cache` in the website folder after the change.

## 4. Switch the website to your images

The website setting `avatar_imager` decides where avatar images come from. Set it to your own API:

```sql
UPDATE website_settings
SET `value` = 'https://your-domain/api/avatar-image?figure='
WHERE `key` = 'avatar_imager';
```

The website keeps its settings in a cache. Clear it in the website folder:

```bash
php artisan cache:forget website_settings
```

To go back to habbo.com, set the value to `https://www.habbo.com/habbo-imaging/avatarimage?figure=` and clear the cache again.

## Check that it works

```bash
curl -sI 'https://your-domain/api/avatar-image?figure=hr-100-61.hd-180-1.ch-210-66.lg-270-110.sh-305-62&direction=2'
```

The answer is `302` with a `location` under `/avatars/v1/`. Open that address. It must be a PNG image.

## The avatar API

`GET /api/avatar-image` takes the same query parameters as Habbo's avatar imager:

| Parameter | Values | Default |
| --- | --- | --- |
| `figure` | The look. | |
| `direction` | `0` to `7` | `2` |
| `head_direction` | `0` to `7` | `2` |
| `size` | `s` (small), `l` (large). Any other value, also `b`, is normal size. | normal |
| `headonly` | `1` draws only the head. | |
| `gesture` | `nrm`, `sml`, `sad`, `agr`, `srp` | `nrm` |
| `action` | A comma-separated list: `std`, `sit`, `lay`, `wlk` (pose), `wav`, `blw`, `lgh` (wave, kiss, laugh), `crr=<id>` (hand item). Unknown parts are skipped. | `std` |
| `frame` | Any value that is not empty makes the image still. | |

When the first action is `wlk` or `wav` and there is no `frame`, the image is an animated PNG. Then `headonly` is not used.

### Which looks are drawn

- The API draws a look only when a user in the `users` table wears exactly that look. Other looks get the website's `start_look` setting. When `start_look` cannot be drawn, the API uses a fixed default look.
- The gender of that user decides the body.
- A look that ends with a dot, as the game saves it, is drawn without the dot.
- A real user's look is sent with `Cache-Control: public, max-age=86400`. A start look is sent with `no-store`.

### Limits and errors

| Answer | When |
| --- | --- |
| `302` | The normal answer. |
| `404` | `AVATAR_IMAGER_SECRET` is empty or shorter than 32 characters, or `AVATAR_IMAGER_VERSION` is out of range. |
| `429` | More than 300 requests in one minute from one IP address. |

## Image addresses

The renderer answers addresses in this form:

```text
/avatars/v<version>/<figure>/<signature>.<variant>.png
```

- `<figure>` uses only lower-case letters, digits, `.` and `-`, and is at most 240 characters.
- `<signature>` is the first 16 hex characters of HMAC-SHA256 with the secret over `v<version>/<figure>/<variant>`. Every size, pose and action has its own address.
- `<variant>` has twelve fields joined by `-`:

| Field | Values |
| --- | --- |
| gender | `m`, `f` |
| size | `s` (half), `m`, `l` (double) |
| part | `full`, `head` |
| direction, head direction | `0` to `7` |
| posture | `std`, `sit`, `lay`, `wlk` |
| expression | `none`, `wave`, `kiss`, `laugh` |
| gesture | `nrm`, `sml`, `sad`, `agr`, `srp` |
| dance | `0` to `4` |
| effect, hand item | the ID, or `0` |
| motion | `still`, `anim` |

For example `m-m-full-2-3-std-wave-sml-0-0-0-still`. A head is always `std-none-<gesture>-0-0-0-still`, with the same value for both directions.

### Image sizes

| Image | `s` | `m` | `l` |
| --- | --- | --- | --- |
| Full body, standing, sitting or walking | 33 x 56 | 64 x 110 | 128 x 220 |
| Full body, lying | 56 x 33 | 110 x 64 | 220 x 128 |
| Head | 27 x 30 | 54 x 62 | 108 x 124 |

An `anim` image has at most 32 frames at 12 frames per second, and loops.

### Renderer answers

| Answer | When |
| --- | --- |
| `200` | A PNG image. It is sent with `Cache-Control: public, max-age=31536000, immutable`. |
| `404` | The address is wrong, the signature does not match, or avatar images are off. |
| `502` | The image could not be drawn. After some errors the renderer waits 10 minutes before it tries that image again. |
| `503` | Too many images are waiting to be drawn (more than 128). |

The renderer draws one avatar at a time. Photos go first.

## Stored images

- The renderer stores each image as `<AVATAR_IMAGER_ROOT>/v<version>/<figure>/<signature>.<variant>.png`. The images stay after a restart.
- When the folder grows over `AVATAR_IMAGER_MAX_MB`, the renderer deletes the oldest images. It draws an image again the next time the website asks for it.
- The web server can serve stored images while the renderer is down.
- When the art of existing clothing changes, raise `AVATAR_IMAGER_VERSION` in the website `.env`. Then delete the old `v<version>` folder.

## Troubleshooting

- **Every avatar shows the placeholder.** Check that the secret is the same in the renderer and the website. Check the renderer log for an error about `AVATAR_IMAGER_SECRET`. Check that the plusemu user can write to `AVATAR_IMAGER_ROOT`.
- **The API answers 404.** `AVATAR_IMAGER_SECRET` is missing or too short in the website `.env`, or the configuration cache is old. Run `php artisan config:cache`.
- **Every avatar shows the same default look.** The look in the address does not match a user's `look` exactly. The website must send the look from the `users` table.
- **The website still shows habbo.com images.** Clear the settings cache with `php artisan cache:forget website_settings`.

## Other HTTP addresses

These addresses are for hotel owners and tools.

| Address | Served by | What it gives |
| --- | --- | --- |
| `/api/avatar-image` | Atom CMS | A redirect to an avatar image. See [the avatar API](#the-avatar-api). |
| `/avatars/...` | Web server and renderer | Avatar images. |
| `/camera/...` | Web server | Camera photos and room thumbnails. See [serve the photos](/features/camera-setup/#serve-the-photos). |
| `/api/gamedata/furnidata` | PlusEMU | The generated furniture data. See [furniture data](/getting-started/configuration/#furniture-data-endpoints). |
| `/api/gamedata/furnidata/version` | PlusEMU | The version of the furniture data. |
| `/api/badges/leaderboard` | PlusEMU | Badge rarity and the badge leaderboards, as JSON. |
| `/api/public/...` | PlusEMU | The [Wired Web API](/features/wired/#web-api). |

PlusEMU serves its addresses from its `WebServer`, normally `127.0.0.1:8080`. The installer's nginx site passes `/api/gamedata/furnidata` and `/api/badges/leaderboard` to it.
