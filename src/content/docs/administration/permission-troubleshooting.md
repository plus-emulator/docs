---
title: Troubleshoot permissions
description: Find missing command access, refused role changes, stale permissions, and grants that do not take effect.
sidebar:
  order: 4
---

Start with the exact permission key and the affected username. The queries below only read data. Replace `Alice` with the account you want to inspect.

## A command is missing

Enter `:commands` while in a room. Chat commands require `command.<key>`, such as `command.giverole`.

For role commands, also check `housekeeping.roles.manage`. For `:update permissions`, also check `command.update_rights`.

Use the dotted keys in these docs. Some error messages still show the old underscore names, such as `command_update_rights`. The real key is `command.update_rights`.

## A role change is refused

Compare your roles and the target user's roles:

```sql
SELECT u.username, r.slug, r.weight, r.security_level, ur.expires_at
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.username IN ('Alice', 'YourUsername')
ORDER BY u.username, r.weight DESC;
```

Every user also has `default`, even without a row in `user_roles`. Check its values separately if you changed that role.

Confirm that:

- The target is another user with a lower active weight.
- The selected role has a lower weight than yours.
- The selected role is not `default`.
- For removal, the user has an explicit assignment for that role.
- For assignment, you meet the permission, limit, security level, and staff requirements in [Assign and remove roles](/administration/manage-roles/#check-the-hierarchy).

An expired role does not contribute to a user's weight or permissions.

## A grant has no effect

1. Inspect the user's individual overrides:

   ```sql
   SELECT up.permission_key, up.effect, up.expires_at, up.reason
   FROM user_permissions up
   JOIN users u ON u.id = up.user_id
   WHERE u.username = 'Alice';
   ```

   An active matching `deny` overrides grants from every role. Check prefix wildcards and `*` as well as the exact key.

2. Check that the key is registered:

   ```sql
   SELECT `key`, is_orphan
   FROM acl_permissions
   WHERE `key` = 'camera.use';
   ```

   After the emulator has started at least once, a key with `is_orphan = 1` is not in the server's registry. Correct a typo or implement the key in code. See [Add a new permission key](/administration/custom-permissions/#add-a-new-permission-key).

3. After database changes, run `:update permissions` from an authorized account, or restart the emulator.
4. Try the actual feature again. A visible command or button does not confirm that every feature-specific condition passes.

Changing `users.rank` alone does not grant access. Assign a role instead.

## Access remains after removing a role

Check the user's other active roles and individual grants. Permissions combine across roles, and all users retain the implicit `default` role.

Also check that a previous `:giverole` command did not replace a temporary expiry with a permanent assignment.

## Inspect recent changes

`:giverole`, `:takerole` and automatic expiry cleanup create audit entries. Direct SQL changes do not.

```sql
SELECT created_at, actor_id, action, target_id, payload
FROM acl_audit_log
WHERE target_type = 'user'
  AND target_id = (SELECT id FROM users WHERE username = 'Alice')
ORDER BY id DESC
LIMIT 20;
```

Direct SQL edits bypass the access service's audit log and hierarchy checks. Prefer the role commands for ordinary assignments.
