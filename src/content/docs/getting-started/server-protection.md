---
title: Server protection
description: What the installer changes on a server to protect the hotel, on Linux and on Windows.
sidebar:
  order: 1.2
---

The installer protects every server install the same way, with the simple or the advanced setup guide. A [local install](/getting-started/local-install/) changes none of this.

## Web server limits

**Linux (nginx)** limits each visitor:

- 5 sign-in, registration, or password reset attempts per minute, plus a burst of 5.
- 30 housekeeping pages per minute, plus a burst of 20.
- 50 open requests and 20 game connections. Many players can share one address, for example at a school.

Over a limit, nginx answers with status 429. Opening the sign-in pages is never limited, only sending the forms. The game client and the hotel files have no limits, because the client loads hundreds of files at once. nginx also drops slow connections after 10 seconds and sends the `Strict-Transport-Security` and `Permissions-Policy` headers. `Strict-Transport-Security` covers the hotel domain only, not its subdomains.

**Windows (IIS)** uses Dynamic IP Restrictions: each visitor gets at most 50 open requests and 1500 requests in 10 seconds. Over the limit, IIS answers with status 403. IIS cannot limit single pages, so the sign-in limit comes from Atom CMS itself (5 attempts per minute). Uploads are limited to 20 MB, and request headers must arrive within 10 seconds.

The limits use the visitor's real address, which nginx and IIS read from Cloudflare. The game connection passes that address to the emulator in the `X-Real-IP` and `X-Forwarded-For` headers.

## Cloudflare-only firewall

The hotel accepts the website only from Cloudflare's addresses, so nobody can go around Cloudflare to reach the server.

- **Linux:** the `ufw` firewall allows only SSH, HTTP, and HTTPS. HTTPS is accepted only from Cloudflare's addresses. HTTP stays open for the setup guide and the redirects, but nginx answers the hotel's own names only for Cloudflare and the server itself. The database and the emulator stay private.
- **Windows:** Windows Firewall accepts HTTP and HTTPS only from Cloudflare's addresses. The installer turns off the **World Wide Web Services** rules that IIS adds, because they let every address in. A rule that you add yourself for port 80 or 443 also lets every address in.

Every Sunday at 03:00, the installer's job downloads Cloudflare's address lists again and updates the firewall. When a download fails, it changes nothing. If the download fails during a new install, the website stays open to every address until the next successful run, and the installer says so.

| | Linux | Windows |
| --- | --- | --- |
| Refresh now | `sudo plusemu-cloudflare-ips` | `Start-ScheduledTask 'PlusEMU Cloudflare addresses'` |
| Log | `/var/log/plusemu-cloudflare-ips.log` | `C:\ProgramData\PlusEMU\cloudflare-ips.log` |

Keep your DNS records orange (**Proxied**) in Cloudflare. With a grey record, the hotel is unreachable.

## Logins and SSH (Linux)

- **fail2ban** bans an address for 1 hour after 5 failed SSH logins in 10 minutes.
- **SSH** lets root log in with a key only. SSH password login goes off only when your login uses an SSH key: this session, or the account that ran `sudo` has a key in `~/.ssh/authorized_keys`. Otherwise password login stays on, and the installer says so. The settings are in `/etc/ssh/sshd_config.d/10-plusemu.conf`. To turn password login off later, add your SSH key, log in with it, and run the installer again.
- **Network settings** in `/etc/sysctl.d/90-plusemu.conf` turn on SYN cookies and raise the queues for new connections, so a flood of connections does not stop the server.

## Logins (Windows)

An account locks for 10 minutes after 10 wrong passwords in 10 minutes. This is the default of new Windows versions. A lower limit would let an attacker keep the built-in Administrator locked out. The installer does not open or change RDP or SSH. On a domain controller, it leaves the lockout policy alone.

## Security updates

- **Linux:** security updates from Debian or Ubuntu install every day at 05:00 server time with `unattended-upgrades`. The server restarts right after, but only when an update needs it. The emulator, the client, the website, and PHP are not touched. Update them with [`plusemu-update`](/getting-started/updates/) and the installer's PHP update script.
- **Windows:** Windows Update installs updates every day at 05:00 and restarts the server only when an update needs it. Windows has no security-only updates, so all quality updates install. Driver updates are left out. A domain Group Policy can replace these settings.

## Logs

- **Linux:** the installer, update, backup, health check, and Cloudflare address logs and the website log rotate daily and are kept for 14 days. The emulator logs to the system journal, which keeps 14 days and at most 1 GB.
- **Windows:** the **PlusEMU log cleanup** task removes emulator, website, and IIS logs older than 14 days, every day at 03:30.

## CrowdSec (advanced, Linux only)

With the advanced setup guide, the Linux installer asks: *Install CrowdSec to detect and block attackers (shared blocklist)?* The default is no. The answer is saved, and reruns keep it. For an unattended install, set `PLUSEMU_CROWDSEC=1`.

[CrowdSec](https://www.crowdsec.net/) reads the server's SSH and nginx logs, finds attack patterns such as password guessing, and bans those addresses. It also shares the attacks it sees and uses a blocklist of known bad addresses that other CrowdSec users report. The installer:

- Installs CrowdSec from CrowdSec's own package repository, with the `crowdsecurity/sshd`, `crowdsecurity/nginx`, `crowdsecurity/base-http-scenarios`, and `crowdsecurity/http-cve` collections.
- Installs a firewall bouncer, which blocks banned addresses at the firewall, and an nginx bouncer, which blocks banned visitors on the website by their real address. Ubuntu 22.04's nginx has no Lua module, so there CrowdSec bans at the firewall only.
- Never bans Cloudflare's addresses or the server itself, because a ban on a Cloudflare address would cut off real players. The weekly Cloudflare address job keeps this list current.
- Moves CrowdSec's local API to `127.0.0.1:8085`, because the emulator uses port 8080.
- Turns fail2ban off while CrowdSec runs, so one tool owns SSH bans. When CrowdSec does not install or start, fail2ban stays on.

```bash
sudo cscli decisions list                   # see who is banned and why
sudo cscli decisions delete --ip 192.0.2.7  # unban an address
sudo cscli alerts list                      # see the attacks CrowdSec found
```

To stop managing CrowdSec, run the installer again with `PLUSEMU_CROWDSEC=0`. fail2ban comes back on. CrowdSec stays installed until you remove it with `sudo apt purge crowdsec crowdsec-firewall-bouncer-iptables crowdsec-nginx-bouncer`.

The Windows installer does not install CrowdSec. IIS logs the address that connects to it, which is always Cloudflare's, so CrowdSec would ban Cloudflare instead of attackers.
