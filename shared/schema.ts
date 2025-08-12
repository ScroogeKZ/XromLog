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
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  position: varchar("position", { length: 255 }),
  age: integer("age"),
  phone: varchar("phone", { length: 20 }),
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
  cargoPhotos: text("cargo_photos").array(), // Array of image URLs/paths
  transportInfo: jsonb("transport_info"), // { "driver_name": "...", "driver_phone": "...", "vehicle_model": "...", "vehicle_plate": "..." }
  priceKzt: decimal("price_kzt", { precision: 10, scale: 2 }), // Price in KZT
  priceNotes: text("price_notes"), // Additional pricing notes
  
  // Client contact fields for public tracking
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email")
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
  // role удалено - назначается автоматически администратором
});

// Profile update schema for users
export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
  position: z.string().min(1, "Должность обязательна"),
  age: z.number().min(18, "Возраст должен быть не менее 18 лет").max(100, "Возраст должен быть не более 100 лет"),
  phone: z.string().min(1, "Номер телефона обязателен"),
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Текущий пароль обязателен"),
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

// Protected schema for authenticated users - accepts both strings and numbers for decimal fields
export const insertShipmentRequestSchema = z.object({
  category: z.string(),
  status: z.string().optional(),
  createdByUserId: z.number().optional(),
  cargoName: z.string().min(1, "Наименование груза обязательно"),
  cargoWeightKg: z.union([z.string(), z.number()]).optional().nullable(),
  cargoVolumeM3: z.union([z.string(), z.number()]).optional().nullable(),
  cargoDimensions: z.string().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  loadingCity: z.string().optional().nullable(),
  loadingAddress: z.string().min(1, "Адрес загрузки обязателен"),
  loadingContactPerson: z.string().optional().nullable(),
  loadingContactPhone: z.string().optional().nullable(),
  unloadingCity: z.string().optional().nullable(),
  unloadingAddress: z.string().min(1, "Адрес выгрузки обязателен"),
  unloadingContactPerson: z.string().optional().nullable(),
  unloadingContactPhone: z.string().optional().nullable(),
  desiredShipmentDatetime: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  cargoPhotos: z.array(z.string()).optional().nullable(),
  transportInfo: z.any().optional().nullable(),
  priceKzt: z.union([z.string(), z.number()]).optional().nullable(),
  priceNotes: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientPhone: z.string().optional().nullable(),
  clientEmail: z.string().optional().nullable(),
});

// Public schema for frontend forms - accepts both strings and numbers for decimal fields
export const publicInsertShipmentRequestSchema = z.object({
  category: z.string(),
  cargoName: z.string().min(1, "Наименование груза обязательно"),
  cargoWeightKg: z.union([z.string(), z.number()]).optional().nullable(),
  cargoVolumeM3: z.union([z.string(), z.number()]).optional().nullable(),
  cargoDimensions: z.string().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  loadingCity: z.string().optional().nullable(),
  loadingAddress: z.string().min(1, "Адрес загрузки обязателен"),
  loadingContactPerson: z.string().optional().nullable(),
  loadingContactPhone: z.string().optional().nullable(),
  unloadingCity: z.string().optional().nullable(),
  unloadingAddress: z.string().min(1, "Адрес выгрузки обязателен"),
  unloadingContactPerson: z.string().optional().nullable(),
  unloadingContactPhone: z.string().optional().nullable(),
  desiredShipmentDatetime: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  cargoPhotos: z.array(z.string()).optional().nullable(),
  // Client contact fields for public requests
  clientName: z.string().optional().nullable(),
  clientPhone: z.string().min(1, "Номер телефона обязателен"),
  clientEmail: z.string().optional().nullable(),
});

export const updateShipmentRequestSchema = z.object({
  status: z.string().optional(),
  cargoName: z.string().optional(),
  cargoWeightKg: z.union([z.string(), z.number()]).optional().nullable(),
  cargoVolumeM3: z.union([z.string(), z.number()]).optional().nullable(),
  cargoDimensions: z.string().optional().nullable(),
  specialRequirements: z.string().optional().nullable(),
  loadingCity: z.string().optional().nullable(),
  loadingAddress: z.string().optional(),
  loadingContactPerson: z.string().optional().nullable(),
  loadingContactPhone: z.string().optional().nullable(),
  unloadingCity: z.string().optional().nullable(),
  unloadingAddress: z.string().optional(),
  unloadingContactPerson: z.string().optional().nullable(),
  unloadingContactPhone: z.string().optional().nullable(),
  desiredShipmentDatetime: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
  cargoPhotos: z.array(z.string()).optional().nullable(),
  transportInfo: z.any().optional().nullable(),
  priceKzt: z.union([z.string(), z.number()]).optional().nullable(),
  priceNotes: z.string().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShipmentRequest = z.infer<typeof insertShipmentRequestSchema>;
export type PublicInsertShipmentRequest = z.infer<typeof publicInsertShipmentRequestSchema>;
export type UpdateShipmentRequest = z.infer<typeof updateShipmentRequestSchema>;
export type ShipmentRequest = typeof shipmentRequests.$inferSelect;
