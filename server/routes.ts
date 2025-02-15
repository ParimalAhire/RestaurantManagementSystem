import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertMenuItemSchema, insertOrderSchema, insertTableSchema, insertOrderItemSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
