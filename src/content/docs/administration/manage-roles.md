---
title: Assign and remove roles
description: Give permanent or temporary roles and remove assignments with the in-game role commands.
sidebar:
  order: 2
---

Use `:giverole` and `:takerole` in room chat. Both commands work for online and offline users.

You need `housekeeping.roles.manage` and the permission for the command you use:

- `command.giverole` to assign a role.
- `command.takerole` to remove a role.

In a room, enter `:commands` to see the commands available to your account. The list checks command permissions. A listed role command still needs `housekeeping.roles.manage` and must pass the hierarchy checks below.

## Assign a permanent role

Use the account's username and the role's exact slug:

```text
:giverole Alice moderator
```

The server confirms `Assigned role 'moderator' to Alice (permanent).`

The assignment adds a role. It does not remove other roles that Alice already holds.

## Assign a temporary role

Add a whole number of days from 1 to 3650:

```text
:giverole Alice trial_moderator 7
```

The server confirms the expiry time in UTC. The role stops contributing access when that time arrives.

Giving the same role again replaces its expiry. Omitting the number of days makes the assignment permanent.

## Remove a role

Enter:

```text
:takerole Alice moderator
```

The server confirms `Revoked role 'moderator' from Alice.`

Other roles and individual permission overrides stay in place. If Alice still has the same permission through another role, removing `moderator` does not remove that permission.

Successful changes refresh online users immediately and create an entry in `acl_audit_log`.

## Check the hierarchy

Both commands require your weight to be higher than the target user's weight and the selected role's weight. You cannot edit yourself or assign or remove `default`.

To assign a role, you must also meet all of these conditions:

- Your security level is at least the role's security level.
- You hold every registered permission that the role grants.
- Your numeric limits are at least the limits configured on the role. If none of your roles sets a limit, PlusEMU uses its built-in default for that limit.
- If the role has `is_staff = 1`, you already hold a staff role.

An owner therefore cannot use these commands to appoint another owner with the same weight. The database operator must handle that account setup deliberately.

## Find the role slug

If you have database access, list the current roles:

```sql
SELECT slug, name, weight, security_level, is_staff
FROM roles
ORDER BY weight, slug;
```

Use `trial_moderator`, for example, rather than its display name `Trial Moderator`. Slugs are case-sensitive.

If a command reports an unknown role, it also lists roles that your account may assign to that user. See [Troubleshoot permissions](/administration/permission-troubleshooting/) for refused changes.
