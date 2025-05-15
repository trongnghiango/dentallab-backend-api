import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const rolesSchema = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // Ví dụ: 'admin', 'user', 'editor' (khớp với AppRole enum)
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// import { relations } from 'drizzle-orm';
// import { userRolesSchema } from './user-roles';
// import { rolePermissionsSchema } from './role-permissions';
// export const rolesRelations = relations(rolesSchema, ({ many }) => ({
//   userRoles: many(userRolesSchema),
//   rolePermissions: many(rolePermissionsSchema),
// }));
