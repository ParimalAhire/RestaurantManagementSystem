import { mysqlTable, text, varchar, serial, int, boolean, decimal, timestamp, primaryKey, foreignKey } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Employee Roles Table
export const employeeRoles = mysqlTable("employee_roles", {
  id: serial("id").primaryKey(),
  roleName: varchar("role_name", { length: 50 }).notNull().unique(),
});

// Employee Table
export const employees = mysqlTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  roleId: int("role_id"),
});

// Ensure the foreign key is defined after both tables exist
export const employeeToRoleFk = foreignKey({
  columns: [employees.roleId],
  foreignColumns: [employeeRoles.id],
  name: "employees_role_id_employee_roles_id_fk"
});

// Customer Table
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tables Table
export const tables = mysqlTable("tables", {
  id: serial("id").primaryKey(),
  number: int("number").notNull().unique(),
  capacity: int("capacity").notNull(),
  occupied: boolean("occupied").default(false),
  customerId: int("customer_id"),
});

// Ensure the foreign key is defined after both tables exist
export const tablesToCustomerFk = foreignKey({
  columns: [tables.customerId],
  foreignColumns: [customers.id],
  name: "tables_customer_id_customers_id_fk"
});

// Menu Items Table
export const menuItems = mysqlTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  available: boolean("available").default(true),
});

// Orders Table
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  tableId: int("table_id").notNull(),
  customerId: int("customer_id"),
  employeeId: int("employee_id"),
  status: varchar("status", { length: 50 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).$defaultFn(() => sql`(subtotal + tax - discount)`),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define foreign keys for orders
export const ordersToTablesFk = foreignKey({
  columns: [orders.tableId],
  foreignColumns: [tables.id],
  name: "orders_table_id_tables_id_fk"
});

export const ordersToCustomersFk = foreignKey({
  columns: [orders.customerId],
  foreignColumns: [customers.id],
  name: "orders_customer_id_customers_id_fk"
});

export const ordersToEmployeesFk = foreignKey({
  columns: [orders.employeeId],
  foreignColumns: [employees.id],
  name: "orders_employee_id_employees_id_fk"
});

// Order Items Table
export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: int("order_id").notNull(),
  menuItemId: int("menu_item_id").notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// Define foreign keys for order items
export const orderItemsToOrdersFk = foreignKey({
  columns: [orderItems.orderId],
  foreignColumns: [orders.id],
  name: "order_items_order_id_orders_id_fk"
});

export const orderItemsToMenuItemsFk = foreignKey({
  columns: [orderItems.menuItemId],
  foreignColumns: [menuItems.id],
  name: "order_items_menu_item_id_menu_items_id_fk"
});

// Table Reservations Table
export const tableReservations = mysqlTable("table_reservations", {
  customerId: int("customer_id").notNull(),
  tableId: int("table_id").notNull(),
  reservationTime: timestamp("reservation_time").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.customerId, table.tableId] }),
}));

// Define foreign keys for table reservations
export const tableReservationsToCustomersFk = foreignKey({
  columns: [tableReservations.customerId],
  foreignColumns: [customers.id],
  name: "table_reservations_customer_id_customers_id_fk"
});

export const tableReservationsToTablesFk = foreignKey({
  columns: [tableReservations.tableId],
  foreignColumns: [tables.id],
  name: "table_reservations_table_id_tables_id_fk"
});

// Zod schema definitions
export const insertEmployeeRoleSchema = createInsertSchema(employeeRoles).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true,
  totalAmount: true
});
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertTableReservationSchema = createInsertSchema(tableReservations);

// Types
export type EmployeeRole = typeof employeeRoles.$inferSelect;
export type InsertEmployeeRole = z.infer<typeof insertEmployeeRoleSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Table = typeof tables.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type TableReservation = typeof tableReservations.$inferSelect;
export type InsertTableReservation = z.infer<typeof insertTableReservationSchema>;

