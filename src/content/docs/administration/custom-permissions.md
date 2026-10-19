---
title: Create roles and permissions
description: Create a custom role, grant existing permissions, and add a permission key for a new server feature.
sidebar:
  order: 3
---

Use a custom role when several users need the same access. Use a new permission key when you add a server feature with its own access check.

## Create a custom role

This example creates an `event_host` role that can send alerts in rooms the user owns. Run the SQL against your emulator database after taking a backup.

1. Check that the slug is unused and that the permission exists:

   ```sql
   SELECT id, slug FROM roles WHERE slug = 'event_host';
   SELECT `key`, is_orphan FROM acl_permissions
   WHERE `key` = 'command.roomalert';
   ```

   Continue only if the first query returns no role and the second returns the key with `is_orphan = 0`. On a new database, the emulator has not checked its keys yet, so many keys still show `is_orphan = 1`. Start the emulator once, then run the query again.

2. Create the role and grant the permission in one transaction:

   ```sql
   START TRANSACTION;

   INSERT INTO roles (slug, name, description, weight, security_level, is_staff)
   VALUES ('event_host', 'Event host', 'Hosts room events.', 10, 1, 0);

   INSERT INTO role_permissions (role_id, permission_key)
   SELECT id, 'command.roomalert' FROM roles WHERE slug = 'event_host';

   COMMIT;
   ```

   If either insert fails, run `ROLLBACK` instead of `COMMIT`. Choose a weight below the staff who will assign this role.

3. In room chat, reload the access definitions:

   ```text
   :update permissions
   ```

   This requires both `command.update` and `command.update_rights`. A server restart also loads the definitions.

4. Assign the role from an account that meets the [role management requirements](/administration/manage-roles/#check-the-hierarchy):

   ```text
   :giverole Alice event_host
   ```

5. Have Alice enter `:commands` in a room. Check that `:roomalert` appears.
6. In a room Alice owns, enter `:roomalert Welcome to the event`. Another user in the room should receive the alert.

Sending a room alert in someone else's room also requires `moderation.alert`.

## Grant an existing permission

To add another registered permission to the same role, insert an exact key:

```sql
INSERT INTO role_permissions (role_id, permission_key)
SELECT id, 'command.roombadge' FROM roles WHERE slug = 'event_host';
```

Use a key from the active registry:

```sql
SELECT `key`, description
FROM acl_permissions
WHERE is_orphan = 0
ORDER BY `key`;
```

Reload with `:update permissions` after each set of changes. The reload refreshes online users too.

Grant exact keys when possible. A wildcard such as `command.*` also grants new matching permissions after a future update.

## Add a new permission key

Adding a row to `acl_permissions` alone does not implement a permission. The running server builds its registry from code and marks unregistered database entries as orphaned.

To add access control for a new server feature:

1. Add a public string constant to [`HabboHotel/Permissions/PermissionKeys.cs`](https://github.com/plus-emulator/PlusEMU/blob/master/HabboHotel/Permissions/PermissionKeys.cs). For an event schedule feature, an example is:

   ```csharp
   public const string EventsScheduleManage = "events.schedule.manage";
   ```

2. Check the permission in the server operation before changing data:

   ```csharp
   if (!session.GetHabbo().Access.Can(PermissionKeys.EventsScheduleManage)) {
   	return;
   }
   ```

   This example belongs in an authenticated handler where `session.GetHabbo()` is available. A client-side button check alone does not protect the operation.

3. Build and deploy the changed emulator. Restart it so the registry includes the new key.
4. Add `events.schedule.manage` to the intended role's `role_permissions` rows.
5. Reload permissions and verify the feature with both an allowed account and an account without the permission.

For a chat command, use `command.<key>`, where `<key>` is the command's `Key` value. `CommandManager` checks this permission automatically. Register the constant as well.

For an incoming packet handler, `[RequiresPermission(PermissionKeys.EventsScheduleManage)]` applies a server permission check before the handler runs. If the attribute lists several permissions, the user needs all of them.

See [Ranks and permissions](/administration/ranks-and-permissions/) for how grants, denies, and multiple roles combine.
