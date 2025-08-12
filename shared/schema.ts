import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("employee"), // "employee" or "manager"
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  position: varchar("position", { length: 255 }),
  age: integer("age"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const shipmentRequests = pgTable("shipment_requests", {
  id: serial("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // "local" or "intercity"
  status: varchar("status", { length: 50 }).notNull().default("new"), // "new", "processing", "assigned", "in_transit", "delivered", "cancelled"
  userId: integer("user_id").references(() => users.id),
  
  // Sender information
  senderName: varchar("sender_name", { length: 100 }).notNull(),
  senderPhone: varchar("sender_phone", { length: 20 }).notNull(),
  senderAddress: text("sender_address").notNull(),
  
  // Recipient information
  recipientName: varchar("recipient_name", { length: 100 }).notNull(),
  recipientPhone: varchar("recipient_phone", { length: 20 }).notNull(),
  recipientAddress: text("recipient_address").notNull(),
  
  // Cargo information
  cargoDescription: text("cargo_description").notNull(),
  cargoWeight: decimal("cargo_weight", { precision: 10, scale: 2 }).notNull(),
  cargoVolume: decimal("cargo_volume", { precision: 10, scale: 3 }).default('0'),
  cargoLength: decimal("cargo_length", { precision: 10, scale: 2 }).default('0'),
  cargoWidth: decimal("cargo_width", { precision: 10, scale: 2 }).default('0'),
  cargoHeight: decimal("cargo_height", { precision: 10, scale: 2 }).default('0'),
  cargoPhotos: jsonb("cargo_photos").default('[]'),
  
  // Pricing
  priceKzt: decimal("price_kzt", { precision: 12, scale: 2 }),
  priceNotes: text("price_notes"),
  
  // Transport assignment
  transport: jsonb("transport"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

export const userRelations = relations(users, ({ many }) => ({
  shipmentRequests: many(shipmentRequests),
}));

export const shipmentRequestRelations = relations(shipmentRequests, ({ one }) => ({
  user: one(users, {
    fields: [shipmentRequests.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  firstName: z.string().min(1, "Имя обязательно"),
  lastName: z.string().min(1, "Фамилия обязательна"),
}).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  position: true,
  age: true,
  phone: true,
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

export const insertShipmentRequestSchema = createInsertSchema(shipmentRequests)
  .omit({
    id: true,
    requestNumber: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    priceKzt: true,
    priceNotes: true,
    transport: true,
    cargoPhotos: true,
    userId: true
  })
  .extend({
    type: z.enum(["local", "intercity"], {
      errorMap: () => ({ message: "Выберите тип доставки" })
    }),
    cargoDescription: z.string().min(1, "Описание груза обязательно"),
    cargoWeight: z.coerce.number().min(0.1, "Вес груза должен быть больше 0"),
    senderName: z.string().min(1, "Имя отправителя обязательно"),
    senderPhone: z.string().min(10, "Номер телефона отправителя обязателен"),
    senderAddress: z.string().min(1, "Адрес отправителя обязателен"),
    recipientName: z.string().min(1, "Имя получателя обязательно"),
    recipientPhone: z.string().min(10, "Номер телефона получателя обязателен"),
    recipientAddress: z.string().min(1, "Адрес получателя обязателен"),
  });

// Public schema for public requests (same structure)
export const publicInsertShipmentRequestSchema = insertShipmentRequestSchema;

export const updateShipmentRequestSchema = z.object({
  id: z.number(),
  status: z.string().optional(),
  type: z.string().optional(),
  senderName: z.string().optional(),
  senderPhone: z.string().optional(),
  senderAddress: z.string().optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  recipientAddress: z.string().optional(),
  cargoDescription: z.string().optional(),
  cargoWeight: z.union([z.string(), z.number()]).optional().nullable(),
  cargoVolume: z.union([z.string(), z.number()]).optional().nullable(),
  cargoLength: z.union([z.string(), z.number()]).optional().nullable(),
  cargoWidth: z.union([z.string(), z.number()]).optional().nullable(),
  cargoHeight: z.union([z.string(), z.number()]).optional().nullable(),
  cargoPhotos: z.array(z.string()).optional().nullable(),
  transport: z.any().optional().nullable(),
  priceKzt: z.union([z.string(), z.number()]).optional().nullable(),
  priceNotes: z.string().optional().nullable(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertShipmentRequest = z.infer<typeof insertShipmentRequestSchema>;
export type PublicInsertShipmentRequest = z.infer<typeof publicInsertShipmentRequestSchema>;
export type UpdateShipmentRequest = z.infer<typeof updateShipmentRequestSchema>;
export type ShipmentRequest = typeof shipmentRequests.$inferSelect;
