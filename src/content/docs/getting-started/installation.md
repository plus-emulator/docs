---
title: Install your hotel
description: Install PlusEMU, Volt, and Atom CMS on a Linux or Windows server, then connect your domain through Cloudflare.
sidebar:
  order: 1
---

Use the PlusEMU installer to set up the game server, Volt client, Atom CMS website, MariaDB, and hotel files together. It also protects the server, makes nightly backups, and checks the hotel every 5 minutes.

To try PlusEMU or work on it on your own PC, use a [local install](/getting-started/local-install/) instead. It needs no domain and no Cloudflare.

## Prepare a server

Start with a fresh server. The installer changes the web server, database, firewall, SSH, and update settings.

| Requirement | Linux | Windows |
| --- | --- | --- |
| Operating system | Debian 12 or 13; Ubuntu 22.04, 24.04, or 26.04 | Windows Server 2019, 2022, or 2025 |
| Architecture | x64 or ARM64 | x64 |
| Free disk space | 10 GB | 15 GB on `C:` |
| Access | Root or `sudo` | PowerShell as Administrator |

Have a domain, for example `myhotel.com`, and a free [Cloudflare](https://dash.cloudflare.com) account ready.

## Run the installer

On Linux, run:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo bash
```

On Windows, open PowerShell as Administrator and run:

```powershell
irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1 | iex
```

Both commands download and run the installer. To read the script first, download `install.sh` or `install.ps1` from the [installer repository](https://github.com/plus-emulator/plusemu-installer). Then run `sudo bash install.sh` on Linux, or `.\install.ps1` in an Administrator PowerShell on Windows.

The installer asks these questions. Press Enter to accept a suggested answer.

1. Your hotel's domain, for example `myhotel.com`.
2. The WebSocket address the game connects to. Keep the suggested `wss://myhotel.com/ws` unless your setup needs a separate hostname.
3. The hotel name.
4. The username for your admin account.
5. The email for your admin account.
6. A Discord webhook URL for health alerts. This is optional: press Enter to skip. See [health check and Discord alerts](/getting-started/backups-and-health/#health-check-and-discord-alerts).
7. Only with the advanced guide on Linux: whether to install CrowdSec. The default is no. See [CrowdSec](/getting-started/server-protection/#crowdsec-advanced-linux-only).

After you confirm, the installer runs on its own in about 10 minutes. If it stops, read the error and the last lines of the log it shows, fix the cause, and run the same command again. It reuses your answers and keeps the parts that are already installed.

### Choose the setup guide

The installer writes a **simple** setup guide by default. The **advanced** guide adds a manual checklist for administrator access, firewall rules, and maintenance. The choice changes the instructions only. Both guides get the same [server protection](/getting-started/server-protection/). The one extra is the CrowdSec question on Linux.

To choose the advanced guide, use `sudo bash install.sh --guide-mode advanced` on Linux or `.\install.ps1 -GuideMode advanced` on Windows. With the one-command installation on Linux, run:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo env PLUSEMU_GUIDE_MODE=advanced bash
```

The installer saves the choice and reuses it when you run it again. A second run keeps the installed emulator and client, and installs a newer hotel files pack when one exists. Files you added to `hotel-files` stay.

### Save your login details

At the end, the installer shows the initial admin login and the database password in the terminal. It saves them before installation starts in a file that only root or Administrators can read: `/etc/plusemu/hotel.env` on Linux, `C:\ProgramData\PlusEMU\hotel.json` on Windows. The passwords are not in the installer log or the setup guide.

## Open the setup guide

On Linux, the installer prints a private address like `http://<server IP>/<token>/`. The token is random, so strangers cannot find the page. On Windows, the guide opens in your browser, and a copy named **Hotel setup guide** is saved on the desktop.

The guide has the commands for your server and contains no passwords or private keys. Do its steps 1 and 2 first:

1. Add your domain to Cloudflare on the **Free** plan.
2. Change your domain's nameservers to the two that Cloudflare shows. Wait until Cloudflare shows **Active** next to your domain.

## Connect Cloudflare automatically

The last step of the installer is **Connecting your hotel to Cloudflare**. It asks: *Paste your Cloudflare API token, or press Enter to skip and follow the manual steps in the guide.* With a token, the installer does the rest of the Cloudflare setup for you.

### Create the token

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), click the profile icon at the top right, then **My Profile**.
2. On the left, click **API Tokens**. Click **Create Token**.
3. At the bottom, next to **Create Custom Token**, click **Get started**.
4. Under **Token name**, type `PlusEMU installer`.
5. Under **Permissions**, add these 6 rows. Choose the three menus of each row from left to right. Click **+ Add more** for the next row.

   | First menu | Second menu | Third menu |
   | --- | --- | --- |
   | Zone | Zone | Read |
   | Zone | DNS | Edit |
   | Zone | SSL and Certificates | Edit |
   | Zone | Zone Settings | Edit |
   | Zone | Zone WAF | Edit |
   | Zone | Bot Management | Edit |

6. Under **Zone Resources**, choose **Include**, then **Specific zone**, then your domain.
7. Leave **Client IP Address Filtering** and **TTL** as they are. Click **Continue to summary**, then **Create Token**.
8. Click **Copy** next to the token. Cloudflare shows it only once.

Go back to the installer and paste the token. On Linux, paste with a right-click or **Ctrl+Shift+V**. In PowerShell, paste with a right-click. Nothing appears while you paste, because the token stays hidden. The installer uses the token only while it runs. It never saves it in a file, a log, or the guide. When the installer says that Cloudflare is connected, you can delete the token on the **API Tokens** page.

Did the installer already finish? Run it again with the same command. It keeps your hotel and asks for the token again. For an unattended install, set `PLUSEMU_CLOUDFLARE_TOKEN`.

### What the installer sets up with the token

1. It checks the token and finds your domain in Cloudflare.
2. It adds or updates proxied **A** records for `@`, `www`, and the game address, pointing to the server's IPv4 address. It changes no other records.
3. It creates a private key and a certificate request on the server, and gets a Cloudflare **Origin CA** certificate for your domain and `*.yourdomain`, valid for 15 years. The private key never leaves the server. When a valid origin certificate is already installed, a rerun keeps it.
4. It turns on **Full (strict)**, **Always Use HTTPS**, TLS 1.2 or newer, **WebSockets**, **Browser Integrity Check**, security level **medium**, and **Bot Fight Mode**. When **I'm Under Attack** mode is on, it stays on.
5. It adds one rate limiting rule: 10 requests per 10 seconds per visitor to the sign-in, registration, and password reset pages. Over the limit, Cloudflare blocks that visitor for 10 seconds.
6. It adds two custom rules. The game connection works only from `https://yourdomain`, and visitors to housekeeping get a Cloudflare check first.

It stops at the first step that fails, names the step and the permission the token lacks, and shows Cloudflare's message. The guide shows the reason at the top. Add the permission to the token (**API Tokens** > **Edit**) and run the installer again. A failed or skipped step never removes a working certificate. Running it again updates the installer's own records and rules instead of adding copies.

When the setup is done, reload the guide. A green box at the top lists what was set up, and the manual steps fold away.

## Connect Cloudflare by hand

If you skip the token, follow the guide's steps 4 to 6:

1. Add the proxied DNS records for your server. Keep them orange (**Proxied**). The server accepts the hotel only from Cloudflare, so a grey (**DNS only**) record makes the hotel unreachable.
2. Generate a private key and certificate-signing request on the server, request a Cloudflare Origin CA certificate, and install the signed certificate. Paste only the certificate-signing request into Cloudflare.
3. Set Cloudflare SSL/TLS to **Full (strict)**, turn on **Always Use HTTPS**, and check that WebSockets are on.

Install the origin certificate before you select **Full (strict)**. The installer starts with a temporary self-signed certificate.

## Check your hotel

1. Open `https://your-domain` and sign in with the initial admin account.
2. Change the initial password.
3. Click **Enter hotel** and check that the game connects.
4. Open `https://your-domain/housekeeping` to manage the website.

For Cloudflare errors such as 521, 522, 526, or "too many redirects", use the troubleshooting section at the bottom of the setup guide. It contains the paths and commands for your server.

## Get help

Stuck? Ask in our Discord: **[Join the PlusEMU Discord](https://discord.gg/D7B42G7Rxk)**.

## Next steps

Read [server protection](/getting-started/server-protection/) to see what the installer changed on the server, and [backups and health checks](/getting-started/backups-and-health/) for the nightly backups and alerts. [Configuration](/getting-started/configuration/) lists file locations and service commands. Camera rendering needs a [separate setup](/features/camera-setup/). To update the hotel later, see [update PlusEMU](/getting-started/updates/).

For an emulator-only installation, use the [PlusEMU release archives](https://github.com/plus-emulator/PlusEMU/releases) and the [manual setup instructions](https://github.com/plus-emulator/PlusEMU#setup). The archives are self-contained and do not require a separate .NET installation.
