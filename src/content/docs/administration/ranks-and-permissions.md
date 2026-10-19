---
title: Ranks and permissions
description: Understand how roles, permissions, and rank levels control access in PlusEMU.
sidebar:
  order: 1
---

PlusEMU gives users access through roles. A user can hold several roles, such as `moderator` and `vip`, at the same time.

Every user also receives the `default` role automatically. This role supplies ordinary player permissions, including `camera.use` in the fresh database.

## Roles and rank levels

A role groups permissions and numeric limits. Its `slug` is the name used in commands, such as `trial_moderator`.

Two role values have different jobs:

- `weight` controls who outranks whom. A larger value means higher authority.
- `security_level` is the rank level sent to the client. The database allows values from 0 to 7.

The user's highest active role weight determines their authority. The highest active security level determines their client rank. These values can come from different roles.

The fresh database includes these staff roles:

| Role slug | Weight | Security level |
| --- | --- | --- |
| `trial_moderator` | 20 | 2 |
| `moderator` | 30 | 3 |
| `senior_moderator` | 40 | 4 |
| `administrator` | 50 | 5 |
| `manager` | 60 | 6 |
| `community_leader` | 70 | 7 |
| `developer` | 80 | 7 |
| `owner` | 90 | 7 |

For example, an owner outranks a developer even though both have security level 7.

The `users.rank` column stores a value derived from active roles. Changing this column alone does not grant a role or its permissions. See [Assign and remove roles](/administration/manage-roles/).

## How permissions combine

A permission is a named action, such as `camera.use`, `command.ban`, or `moderation.tool`.

PlusEMU combines the permissions from all active roles and any individual grants. A higher role weight does not automatically inherit another role's permissions.

Individual overrides live in `user_permissions`. A `deny` override wins over every matching grant, including a wildcard grant. PlusEMU has no chat command for overrides. Add or remove rows in `user_permissions` with SQL, then run `:update permissions`.

Permission patterns support:

- An exact key, such as `camera.use`.
- A prefix wildcard, such as `command.*`.
- `*`, which matches every registered permission.

Keys are case-sensitive. A prefix wildcard includes the dot, so `command.*` matches `command.ban`. Patterns such as `command.b*` are not supported.

Wildcards expand against the server's permission registry. A database row with an unknown key does not create a new working permission.

## Expiry, limits, and client details

Role assignments and individual overrides can have an expiry time. Expired assignments stop contributing access. PlusEMU refreshes affected online users automatically.

For a numeric limit, PlusEMU takes the largest configured value across the user's active roles. Examples include `limit.daily_respects` and `limit.flood_tolerance`.

The primary role supplies the role name and badge sent to the client. PlusEMU selects the role with the highest weight, then the lowest role ID if weights match.

Habbo Club membership has its own records. Assigning a role does not create a timed Habbo Club subscription.

See [Create roles and permissions](/administration/custom-permissions/) to change access, or [Troubleshoot permissions](/administration/permission-troubleshooting/) when a grant does not work.
