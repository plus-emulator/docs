---
title: Backups and health checks
description: The installer's nightly backups, how to restore them, and the health check with optional Discord alerts.
sidebar:
  order: 1.3
---

Every install made with the installer backs up the hotel every night and checks it every 5 minutes, on a server and on a [local install](/getting-started/local-install/).

## Nightly backups

Every night at 04:00, the backup saves what a download cannot bring back. It keeps the newest 7 backups, each in its own folder named by its time in UTC:

- `database.sql.gz`: the whole `plus` database.
- `hotel.tar.gz`: the emulator's `Config` folder, the client's `configuration` folder, the website's `.env` file and uploads (`cms/storage/app`), and the hotel's texts (`hotel-files/gamedata`).
- `settings.tar.gz`: the saved answers, passwords, and versions. On Linux, also the HTTPS certificate in `/etc/ssl/plusemu`. On Windows, the certificate stays in the Windows certificate store.

The backup leaves out what the installer or `plusemu-update` downloads again: the emulator and client programs and the stock hotel files. Furniture, clothes, or badges that you added to `hotel-files` yourself are not in the backup, so keep your own copy of them.

When an update is running, the backup waits for it. When the disk has less than 2 GB free plus the size of the database, the backup is skipped and the reason goes in the backup log. The [update](/getting-started/updates/) backups (newest 3) are separate.

| | Linux | Windows |
| --- | --- | --- |
| Backups | `/var/backups/plusemu/nightly` | `C:\ProgramData\PlusEMU\backups\nightly` |
| Make a backup now | `sudo plusemu-backup` | `Start-ScheduledTask 'PlusEMU nightly backup'` |
| Backup log | `/var/log/plusemu-backup.log` | `C:\ProgramData\PlusEMU\backup.log` |

The backups are on the same machine, so they cannot recover a lost server. Copy them to another place now and then.

### Restore a backup on Linux

Restoring the database brings the hotel back to the moment of the backup. Every change since then is lost.

```bash
sudo systemctl stop plusemu
gunzip -c /var/backups/plusemu/nightly/<time>/database.sql.gz | sudo mariadb plus
sudo systemctl start plusemu
```

To get files back, unpack the file you need from `hotel.tar.gz`, for example:

```bash
sudo tar -xzf /var/backups/plusemu/nightly/<time>/hotel.tar.gz -C /var/www/hotel emulator/Config
```

## Health check and Discord alerts

Every 5 minutes, the health check looks at your hotel. On Linux, cron runs `/usr/local/sbin/plusemu-health`. On Windows, the **PlusEMU health check** task runs `C:\ProgramData\PlusEMU\plusemu-health.ps1`. It checks that:

- The emulator service runs, and the game port 2096 and the emulator API port 8080 answer on `127.0.0.1`.
- The web server (nginx or IIS) runs, and the website answers.
- MariaDB answers.
- The disk with the hotel has more than 2 GB free.
- The newest nightly backup is younger than 36 hours. A new hotel has no backup before its first night, so this check waits for it.
- The HTTPS certificate is valid for more than 30 more days. Not on a local install.
- The last Cloudflare address refresh worked and is younger than 8 days. Not on a local install.

While an update, a nightly backup, or the installer runs, the check skips its run, because they stop or restart services on purpose. The installer also runs it once at the end.

| | Linux | Windows (Administrator PowerShell) |
| --- | --- | --- |
| Check the hotel now | `sudo plusemu-health` | `& C:\ProgramData\PlusEMU\plusemu-health.ps1` |
| Health log | `/var/log/plusemu-health.log` | `C:\ProgramData\PlusEMU\health.log` |

### Discord alerts

On a server install, the installer asks for a Discord webhook. With a webhook, you get one message when a check starts failing and one when it works again. The message says what failed and gives the command to look at it. You get no message while nothing changes. When Discord does not take a message, the next run tries again. Messages contain no passwords or tokens. A local install has no Discord alerts.

To make a webhook in Discord, open your server's **Server Settings** > **Integrations** > **Webhooks** > **New Webhook**, choose the channel, and click **Copy Webhook URL**. When you add a webhook, the installer sends one message so you see that alerts work.

The webhook is saved with your other settings, which only root or Administrators can read. It is never written to the installer log. Reruns keep it. To change it, run the installer again with the new URL. Use `off` to turn alerts off:

```bash
curl -fsSL https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.sh | sudo env PLUSEMU_DISCORD_WEBHOOK=https://discord.com/api/webhooks/... bash
```

```powershell
$env:PLUSEMU_DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/...'
irm https://raw.githubusercontent.com/plus-emulator/plusemu-installer/main/install.ps1 | iex
Remove-Item Env:\PLUSEMU_DISCORD_WEBHOOK
```
