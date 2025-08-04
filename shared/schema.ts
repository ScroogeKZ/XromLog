import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("employee"), // "employee" or "manager"
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const shipmentRequests = pgTable("shipment_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(), // "astana" or "intercity"
  status: varchar("status", { length: 50 }).notNull().default("new"), // "new", "processing", "assigned", "transit", "delivered", "cancelled"
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  cargoName: varchar("cargo_name", { length: 255 }).notNull(),
  cargoWeightKg: decimal("cargo_weight_kg", { precision: 10, scale: 2 }),
  cargoVolumeM3: decimal("cargo_volume_m3", { precision: 10, scale: 2 }),
  cargoDimensions: varchar("cargo_dimensions", { length: 255 }),

  specialRequirements: text("special_requirements"),
  loadingCity: varchar("loading_city", { length: 255 }), // For intercity shipments
  loadingAddress: text("loading_address").notNull(),
  loadingContactPerson: varchar("loading_contact_person", { length: 255 }),
  loadingContactPhone: varchar("loading_contact_phone", { length: 20 }),
  unloadingCity: varchar("unloading_city", { length: 255 }), // For intercity shipments
  unloadingAddress: text("unloading_address").notNull(),
  unloadingContactPerson: varchar("unloading_contact_person", { length: 255 }),
  unloadingContactPhone: varchar("unloading_contact_phone", { length: 20 }),
  desiredShipmentDatetime: timestamp("desired_shipment_datetime", { withTimezone: true }),
  notes: text("notes"),
  transportInfo: jsonb("transport_info"), // { "driver_name": "...", "driver_phone": "...", "vehicle_model": "...", "vehicle_plate": "..." }
});

export const userRelations = relations(users, ({ many }) => ({
  shipmentRequests: many(shipmentRequests),
}));

export const shipmentRequestRelations = relations(shipmentRequests, ({ one }) => ({
  createdBy: one(users, {
    fields: [shipmentRequests.createdByUserId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertShipmentRequestSchema = createInsertSchema(shipmentRequests).omit({
  id: true,
  requestNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const updateShipmentRequestSchema = createInsertSchema(shipmentRequests).omit({
  id: true,
  requestNumber: true,
  createdAt: true,
  createdByUserId: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShipmentRequest = z.infer<typeof insertShipmentRequestSchema>;
export type UpdateShipmentRequest = z.infer<typeof updateShipmentRequestSchema>;
export type ShipmentRequest = typeof shipmentRequests.$inferSelect;
