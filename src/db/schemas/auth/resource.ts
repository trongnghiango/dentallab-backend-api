import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const resourcesSchema = pgTable('resources', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(), // Ví dụ: 'article', 'userProfile' (khớp với AppResource enum)
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
