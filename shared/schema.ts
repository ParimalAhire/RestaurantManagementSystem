import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price").notNull(),
  category: text("category").notNull(),
  available: boolean("available").default(true),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  occupied: boolean("occupied").default(false),
  arrivalTime: timestamp("arrival_time"),
});

// New customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track customer visits and table allocations
export const customerVisits = pgTable("customer_visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  tableId: integer("table_id").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(), // Link to customer
  tableId: integer("table_id").notNull(),
  status: text("status").notNull(), // pending, preparing, served, completed
  totalAmount: decimal("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  menuItemId: integer("menu_item_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price").notNull(),
});

// Schema for data insertion
export const insertMenuItemSchema = createInsertSchema(menuItems)
  .omit({ id: true })
  .extend({
    price: z.string().regex(/^\d*\.?\d{0,2}$/, "Price must be a valid decimal with up to 2 decimal places"),
  });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertCustomerVisitSchema = createInsertSchema(customerVisits).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// Types for TypeScript
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type CustomerVisit = typeof customerVisits.$inferSelect;
export type InsertCustomerVisit = z.infer<typeof insertCustomerVisitSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;