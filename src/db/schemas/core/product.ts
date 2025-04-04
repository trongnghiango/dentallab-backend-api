import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

// Table
export const productSchema = pgTable('product', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});
