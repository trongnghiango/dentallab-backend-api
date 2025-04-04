import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

// Table
export const customerSchema = pgTable('customer', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
