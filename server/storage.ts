import {
  type MenuItem, type InsertMenuItem,
  type Table, type InsertTable,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Customer, type InsertCustomer,
  type CustomerVisit, type InsertCustomerVisit,
  menuItems, tables, orders, orderItems, customers, customerVisits
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;

  // Tables
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomerVisits(customerId: number): Promise<CustomerVisit[]>;
  createCustomerVisit(visit: InsertCustomerVisit): Promise<CustomerVisit>;
  updateCustomerVisit(id: number, endTime: Date): Promise<CustomerVisit | undefined>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getCustomerOrders(customerId: number): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {
  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db.insert(menuItems).values(item).returning();
    return menuItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [updated] = await db
      .update(menuItems)
      .set(item)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(menuItems)
      .where(eq(menuItems.id, id))
      .returning();
    return !!deleted;
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables);
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async createTable(table: InsertTable): Promise<Table> {
    const [newTable] = await db.insert(tables).values(table).returning();
    return newTable;
  }

  async updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined> {
    const [updated] = await db
      .update(tables)
      .set(table)
      .where(eq(tables.id, id))
      .returning();
    return updated;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getCustomerVisits(customerId: number): Promise<CustomerVisit[]> {
    return await db
      .select()
      .from(customerVisits)
      .where(eq(customerVisits.customerId, customerId));
  }

  async createCustomerVisit(visit: InsertCustomerVisit): Promise<CustomerVisit> {
    const [newVisit] = await db.insert(customerVisits).values(visit).returning();
    return newVisit;
  }

  async updateCustomerVisit(id: number, endTime: Date): Promise<CustomerVisit | undefined> {
    const [updated] = await db
      .update(customerVisits)
      .set({ endTime })
      .where(eq(customerVisits.id, id))
      .returning();
    return updated;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getCustomerOrders(customerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));
  }
}

export const storage = new DatabaseStorage();