---
title: Install on your own PC
description: Run the whole hotel on your own Linux or Windows PC at http://localhost, to try PlusEMU or to develop on it.
sidebar:
  order: 1.1
---

A local install puts the whole hotel on your own PC: the emulator, the Volt client, the Atom CMS website, and MariaDB. Use it to try PlusEMU or to develop on it. It needs no domain and no Cloudflare. The hotel runs at `http://localhost`, and only this PC can open it.

A local install is not for a public hotel. It has no HTTPS, no Cloudflare, and no server protection. For a public hotel, [install on a server](/getting-started/installation/).

## Requirements

| Requirement | Linux | Windows |
| --- | --- | --- |
| Operating system | Debian 12 or 13; Ubuntu 22.04, 24.04, or 26.04, desktop editions too | Windows 10 (version 1809 or newer) or Windows 11. Windows Server works too. |
| Free disk space | 10 GB | 15 GB on `C:` |
| Access | `sudo` | PowerShell as Administrator |

## Run the installer

On Linux, run:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo env PLUSEMU_LOCAL=1 bash
```

With a downloaded script, run `sudo bash install.sh --local`.

On Windows, open PowerShell as Administrator and run:

```powershell
$env:PLUSEMU_LOCAL = '1'
irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1 | iex
Remove-Item Env:\PLUSEMU_LOCAL
```

With a downloaded script, run `.\install.ps1 -Local`.

The installer asks three questions. Press Enter to accept the suggested answer:

1. The hotel name. The suggestion is `PlusEMU`.
2. The username for your admin account. The suggestion is `admin`.
3. The email for your admin account. The suggestion is `admin@localhost.test`.

### Ports the hotel needs

Before it installs anything, the installer checks these ports:

| Port | Used by |
| --- | --- |
| 80 | The website and the game connection |
| 3306 | MariaDB |
| 2096 | The emulator's game connection |
| 8080 | The emulator's web API |
| 30001 | The emulator's remote control (RCON) |

When another program uses one of them, for example another web server or database, the installer names the port and the program, stops, and keeps no settings. Stop that program and run the installer again. The hotel's own programs may use these ports, so running the installer again later works.

## Open your hotel

When the installer finishes, it shows your admin login. Then:

1. Open `http://localhost` and sign in.
2. Change the initial password under **Settings** > **Password**.
3. Click **Enter hotel**. The game connects through `ws://localhost/ws`.
4. Open `http://localhost/housekeeping` to manage the hotel.

The installer also writes a short guide for your PC. On Linux, it prints its address, `http://localhost/<token>/`. On Windows, the guide opens in your browser, and a copy named **Hotel setup guide** is saved on the desktop. The guide explains how to log in, start and stop the hotel, see the logs, update it, and find the backups.

## Start, stop, and update

The emulator, the website, and the database start when your PC starts.

| Task | Linux | Windows (Administrator PowerShell) |
| --- | --- | --- |
| Stop the emulator | `sudo systemctl stop plusemu` | `Stop-Service PlusEMU` |
| Start the emulator | `sudo systemctl start plusemu` | `Start-Service PlusEMU` |
| Watch the emulator log | `sudo journalctl -u plusemu -f` | `Get-Content C:\Hotel\emulator\service\shawl_for_PlusEMU_rCURRENT.log -Tail 50 -Wait` |
| Stop everything | `sudo systemctl stop plusemu nginx php8.5-fpm mariadb` | `Stop-Service PlusEMU, W3SVC, MariaDB` |
| Update | `sudo plusemu-update` | `plusemu-update` |

`plusemu-update` works the same way as on a server. See [update PlusEMU](/getting-started/updates/).

## What a local install sets up

- The website, housekeeping, and the game connection on one web server at `http://localhost`. Every web address in the website and client settings is `http://localhost`.
- nginx on Linux listens on `127.0.0.1` and `[::1]` port 80 only. On Windows, the IIS site is bound to `127.0.0.1` and `[::1]` with the name `localhost` only. Your other IIS sites stay.
- On Windows 10 and 11, IIS comes from the optional Windows features.
- Log rotation for the hotel's own logs.
- The [nightly backup](/getting-started/backups-and-health/#nightly-backups) at 04:00. It runs only when your PC is on at that time.
- The [health check](/getting-started/backups-and-health/#health-check-and-discord-alerts) every 5 minutes, without Discord alerts, the certificate check, and the Cloudflare check.

## What a local install does not change

The installer leaves your PC's own settings as they are:

- No HTTPS, no HSTS, and no Cloudflare. HSTS on `localhost` would make your browser use HTTPS for every other project on the PC.
- No firewall changes. Linux does not install or turn on `ufw`. Windows adds no firewall rules.
- On Linux: no SSH changes, no fail2ban, no automatic security updates or restarts, no network settings, no system journal limits, and no CrowdSec.
- On Windows: no account lockout policy, no Windows Update policy, and no change to the header timeout of the Windows web stack.
- No per-visitor request limits. Every local visitor is `127.0.0.1`, so the limits would only block your own logins and test clients.
- Your own Node.js stays as it is. The installer unpacks Node.js 22 into `/opt/plusemu-node` on Linux or `C:\ProgramData\PlusEMU\node` on Windows, and uses it only while it runs.

It does install the programs the hotel needs. On Linux, those are nginx, MariaDB, and PHP 8.5, which becomes the default `php` command. On Windows, those are IIS, MariaDB, PHP in `C:\PHP`, Git, and Composer. The installer turns off nginx's own welcome page on Linux and IIS's own **Default Web Site** on Windows, because they answer on every address. A default site that you changed stays. Other nginx sites that listen on port 80 for every address no longer answer on `localhost`, because the hotel takes `127.0.0.1` and `::1`. The installer names those sites.

## Keep or change the choice

The installer saves the choice with your settings. Reruns and `plusemu-update` keep it, so you do not need `--local` again. The installer does not turn a local install into a server install, or a server install into a local one. It says so and changes nothing.

## Move to a server later

1. On your server, run the installer without `--local` or `-Local`. See [install your hotel](/getting-started/installation/). This makes a new hotel with its own domain, HTTPS, Cloudflare, and server protection.
2. To keep your users, rooms, and furniture, copy `database.sql.gz` from a nightly backup on your PC to the server. The backups are in `/var/backups/plusemu/nightly` on Linux and `C:\ProgramData\PlusEMU\backups\nightly` on Windows.
3. On a Linux server, run this in the folder with the file:

   ```bash
   sudo systemctl stop plusemu
   gunzip -c database.sql.gz | sudo mariadb plus
   sudo systemctl start plusemu
   ```

4. Run the installer on the server once more. It writes the server's own addresses into the website settings. Your accounts keep the passwords they had on your PC.
