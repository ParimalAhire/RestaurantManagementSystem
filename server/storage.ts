import {
  type MenuItem, type InsertMenuItem,
  type Table, type InsertTable,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Customer, type InsertCustomer,
  type Employee, type InsertEmployee,
  type EmployeeRole, type InsertEmployeeRole,
  type TableReservation, type InsertTableReservation,
  menuItems, tables, orders, orderItems, customers, employees, employeeRoles, tableReservations
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
  
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  
  // Employee Roles
  getEmployeeRoles(): Promise<EmployeeRole[]>;
  getEmployeeRole(id: number): Promise<EmployeeRole | undefined>;
  createEmployeeRole(role: InsertEmployeeRole): Promise<EmployeeRole>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getCustomerOrders(customerId: number): Promise<Order[]>;
  
  // Table Reservations
  getTableReservations(): Promise<TableReservation[]>;
  getTableReservation(customerId: number, tableId: number): Promise<TableReservation | undefined>;
  createTableReservation(reservation: InsertTableReservation): Promise<TableReservation>;
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
    await db.insert(menuItems).values(item);
    const [lastItem] = await db.select().from(menuItems).orderBy(menuItems.id).limit(1);
    return lastItem;
  }

  async createMenuItems(items: InsertMenuItem[]): Promise<MenuItem[]> {
    // Insert menu items one by one
    await Promise.all(
      items.map(async (item) => {
        await db.insert(menuItems).values(item);
      })
    );

    // Just return all menu items for now
    // In a production app, you'd want to filter this better
    return await db.select().from(menuItems);
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    await db.update(menuItems).set(item).where(eq(menuItems.id, id));
    const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return updated;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return true;
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
    await db.insert(tables).values(table);
    const [lastTable] = await db.select().from(tables).orderBy(tables.id).limit(1);
    return lastTable;
  }

  async updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined> {
    await db.update(tables).set(table).where(eq(tables.id, id));
    const [updated] = await db.select().from(tables).where(eq(tables.id, id));
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
    await db.insert(customers).values(customer);
    const [lastCustomer] = await db.select().from(customers).orderBy(customers.id).limit(1);
    return lastCustomer;
  }

  async createCustomers(customersList: InsertCustomer[]): Promise<Customer[]> {
    // Insert customers one by one
    await Promise.all(
      customersList.map(async (customer) => {
        await db.insert(customers).values(customer);
      })
    );

    // Just return all customers for now
    // In a production app, you'd want to filter this better
    return await db.select().from(customers);
  }
  
  // Employees
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    await db.insert(employees).values(employee);
    const [lastEmployee] = await db.select().from(employees).orderBy(employees.id).limit(1);
    return lastEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    await db.update(employees).set(employee).where(eq(employees.id, id));
    const [updated] = await db.select().from(employees).where(eq(employees.id, id));
    return updated;
  }
  
  // Employee Roles
  async getEmployeeRoles(): Promise<EmployeeRole[]> {
    return await db.select().from(employeeRoles);
  }

  async getEmployeeRole(id: number): Promise<EmployeeRole | undefined> {
    const [role] = await db.select().from(employeeRoles).where(eq(employeeRoles.id, id));
    return role;
  }

  async createEmployeeRole(role: InsertEmployeeRole): Promise<EmployeeRole> {
    await db.insert(employeeRoles).values(role);
    const [lastRole] = await db.select().from(employeeRoles).orderBy(employeeRoles.id).limit(1);
    return lastRole;
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
    await db.insert(orders).values(order);
    const [lastOrder] = await db.select().from(orders).orderBy(orders.id).limit(1);
    return lastOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    await db.update(orders).set(order).where(eq(orders.id, id));
    const [updated] = await db.select().from(orders).where(eq(orders.id, id));
    return updated;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    await db.insert(orderItems).values(item);
    const [lastItem] = await db.select().from(orderItems).orderBy(orderItems.id).limit(1);
    return lastItem;
  }

  async getCustomerOrders(customerId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));
  }
  
  // Table Reservations
  async getTableReservations(): Promise<TableReservation[]> {
    return await db.select().from(tableReservations);
  }

  async getTableReservation(customerId: number, tableId: number): Promise<TableReservation | undefined> {
    const [reservation] = await db
      .select()
      .from(tableReservations)
      .where(
        eq(tableReservations.customerId, customerId) && 
        eq(tableReservations.tableId, tableId)
      );
    return reservation;
  }

  async createTableReservation(reservation: InsertTableReservation): Promise<TableReservation> {
    await db.insert(tableReservations).values(reservation);
    const [lastReservation] = await db
      .select()
      .from(tableReservations)
      .where(
        eq(tableReservations.customerId, reservation.customerId) && 
        eq(tableReservations.tableId, reservation.tableId)
      );
    return lastReservation;
  }
}

export const storage = new DatabaseStorage();
