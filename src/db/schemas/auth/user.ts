import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
// Bạn có thể cần import các schema khác nếu có foreign key

export const usersSchema = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // Lưu trữ mật khẩu đã hash
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nếu bạn muốn định nghĩa relations ở đây (Drizzle ORM >= 0.29.0)
// import { relations } from 'drizzle-orm';
// import { userRolesSchema } from './user-roles';
// export const usersRelations = relations(usersSchema, ({ many }) => ({
//   userRoles: many(userRolesSchema),
// }));
