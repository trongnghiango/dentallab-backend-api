import { pgTable, primaryKey, integer, timestamp } from 'drizzle-orm/pg-core';
import { usersSchema } from './user';
import { rolesSchema } from './role';

export const userRolesSchema = pgTable(
  'user_roles',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => usersSchema.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => rolesSchema.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      // Khóa chính kết hợp để đảm bảo một user chỉ có một role cụ thể một lần
      pk: primaryKey({ columns: [table.userId, table.roleId] }),
    };
  },
);

// import { relations } from 'drizzle-orm';
// export const userRolesRelations = relations(userRolesSchema, ({ one }) => ({
//   user: one(usersSchema, {
//     fields: [userRolesSchema.userId],
//     references: [usersSchema.id],
//   }),
//   role: one(rolesSchema, {
//     fields: [userRolesSchema.roleId],
//     references: [rolesSchema.id],
//   }),
// }));
