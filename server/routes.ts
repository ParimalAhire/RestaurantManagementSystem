import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { 
  insertMenuItemSchema, 
  insertOrderSchema, 
  insertTableSchema, 
  insertOrderItemSchema, 
  insertCustomerSchema,
  insertEmployeeSchema,
  insertEmployeeRoleSchema,
  insertTableReservationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Menu Items
  app.get("/api/menu-items", async (req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.post("/api/menu-items", async (req, res) => {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const item = await storage.createMenuItem(parsed.data);
    res.status(201).json(item);
  });

  app.patch("/api/menu-items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertMenuItemSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const updated = await storage.updateMenuItem(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(updated);
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.status(204).end();
  });

  // Tables
  app.get("/api/tables", async (req, res) => {
    const tables = await storage.getTables();
    res.json(tables);
  });

  app.post("/api/tables", async (req, res) => {
    const parsed = insertTableSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const table = await storage.createTable(parsed.data);
    res.status(201).json(table);
  });

  app.patch("/api/tables/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertTableSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const updated = await storage.updateTable(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: "Table not found" });
    }
    res.json(updated);
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  });

  app.post("/api/customers", async (req, res) => {
    const parsed = insertCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const customer = await storage.createCustomer(parsed.data);
    res.status(201).json(customer);
  });

  app.get("/api/customers/:id/reservations", async (req, res) => {
    const id = parseInt(req.params.id);
    const reservations = await storage.getTableReservations()
      .then(reservations => reservations.filter(r => r.customerId === id));
    res.json(reservations);
  });

  app.post("/api/table-reservations", async (req, res) => {
    const parsed = insertTableReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const reservation = await storage.createTableReservation(parsed.data);
    res.status(201).json(reservation);
  });

  app.get("/api/customers/:id/orders", async (req, res) => {
    const id = parseInt(req.params.id);
    const orders = await storage.getCustomerOrders(id);
    res.json(orders);
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const items = await storage.getOrderItems(id);
    res.json({ ...order, items });
  });

  app.post("/api/orders", async (req, res) => {
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const order = await storage.createOrder(parsed.data);
    res.status(201).json(order);
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    const orderId = parseInt(req.params.id);
    const parsed = insertOrderItemSchema.safeParse({ ...req.body, orderId });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const item = await storage.createOrderItem(parsed.data);
    res.status(201).json(item);
  });

  app.patch("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertOrderSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const updated = await storage.updateOrder(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(updated);
  });

  // Employee Roles
  app.get("/api/employee-roles", async (req, res) => {
    const roles = await storage.getEmployeeRoles();
    res.json(roles);
  });

  app.post("/api/employee-roles", async (req, res) => {
    const parsed = insertEmployeeRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const role = await storage.createEmployeeRole(parsed.data);
    res.status(201).json(role);
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    const employees = await storage.getEmployees();
    res.json(employees);
  });

  app.post("/api/employees", async (req, res) => {
    const parsed = insertEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const employee = await storage.createEmployee(parsed.data);
    res.status(201).json(employee);
  });

  const httpServer = createServer(app);
  return httpServer;
}