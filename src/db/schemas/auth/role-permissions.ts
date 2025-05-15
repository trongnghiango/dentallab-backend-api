import { pgTable, primaryKey, integer, timestamp } from 'drizzle-orm/pg-core';
import { rolesSchema } from './role';
import { permissionsSchema } from './permission';

export const rolePermissionsSchema = pgTable(
  'role_permissions',
  {
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesSchema.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissionsSchema.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    };
  },
);

// import { relations } from 'drizzle-orm';
// export const rolePermissionsRelations = relations(rolePermissionsSchema, ({ one }) => ({
//   role: one(rolesSchema, {
//     fields: [rolePermissionsSchema.roleId],
//     references: [rolesSchema.id],
//   }),
//   permission: one(permissionsSchema, {
//     fields: [rolePermissionsSchema.permissionId],
//     references: [permissionsSchema.id],
//   }),
// }));
