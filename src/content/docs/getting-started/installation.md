---
title: Install your hotel
description: Install PlusEMU, Volt, and Atom CMS on Linux or Windows Server, then connect your domain.
sidebar:
  order: 1
---

Use the PlusEMU installer to set up the game server, Volt client, Atom CMS website, MariaDB, and hotel assets together.

## Prepare a server

Start with a fresh server. The installer changes the web server, database, and firewall configuration.

| Requirement | Linux | Windows |
| --- | --- | --- |
| Operating system | Debian 12 or 13; Ubuntu 22.04, 24.04, or 26.04 | Windows Server 2019, 2022, or 2025 |
| Architecture | x64 or ARM64 | x64 |
| Free disk space | 10 GB | 15 GB on `C:` |
| Access | Root or `sudo` | PowerShell as Administrator |

Have a domain and a Cloudflare account ready. The installer generates the instructions for your domain after installation.

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

Answer the prompts for your domain, WebSocket address, hotel name, admin username, and admin email. Keep the suggested WebSocket address, `wss://your-domain/ws`, unless your setup needs a separate hostname.

### Choose the setup guide

The installer writes a **simple** setup guide by default. The **advanced** guide adds a manual checklist for administrator access, firewall rules, and maintenance. The choice changes the instructions only. It does not change SSH, RDP, firewall, update, or backup settings.

To choose the advanced guide, use `sudo bash install.sh --guide-mode advanced` on Linux or `.\install.ps1 -GuideMode advanced` on Windows. With the one-command installation on Linux, run:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo env PLUSEMU_GUIDE_MODE=advanced bash
```

The installer saves the choice and reuses it when you run it again. A second run keeps the installed emulator and client, and installs a newer hotel files pack when one exists. Files you added to `hotel-files` stay.

### Save your login details

Save the initial admin login details shown at the end. The installer also saves its answers and credentials in a protected local file.

## Connect your domain

Open the setup guide that the installer prints or opens. On Linux, the installer prints a private address like `http://<server IP>/<token>/`. The token is random. On Windows, the guide opens in your browser, and a copy named **Hotel setup guide** is saved on the desktop.

Follow that guide to:

1. Add the domain to Cloudflare and change its nameservers.
2. Add the proxied DNS records for your server.
3. Generate a private key and certificate-signing request on the server.
4. Request a Cloudflare Origin CA certificate and install the signed certificate on the server.
5. Set Cloudflare SSL/TLS to **Full (strict)** and turn on **Always Use HTTPS**.
6. Check that WebSockets are enabled.

Install the origin certificate before selecting **Full (strict)**. The installer starts with a temporary self-signed certificate. Keep the private key on the server and paste only the certificate-signing request into Cloudflare.

## Check your hotel

1. Open `https://your-domain` and sign in with the initial admin account.
2. Change the initial password.
3. Open the client and enter a room.
4. Open `https://your-domain/housekeeping` to manage the website.

If installation stops, read the error in the installer log, fix its cause, and rerun the same command. The installer reuses your saved answers and keeps the parts that are already installed.

For Cloudflare connection errors, use the troubleshooting section in the generated guide. It contains the paths and commands for your server.

## Next steps

Read [configuration](/getting-started/configuration/) for file locations and service commands. Camera rendering needs a [separate setup](/features/camera-setup/). To update the hotel later, see [update PlusEMU](/getting-started/updates/).

For an emulator-only installation, use the [PlusEMU release archives](https://github.com/plus-emulator/PlusEMU/releases) and the [manual setup instructions](https://github.com/plus-emulator/PlusEMU#setup). The archives are self-contained and do not require a separate .NET installation.
