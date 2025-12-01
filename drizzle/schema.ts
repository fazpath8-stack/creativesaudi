import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with userType to differentiate between clients and designers
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["client", "designer"]).notNull(),
  
  // Client specific fields
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  
  // Designer specific fields
  username: varchar("username", { length: 100 }),
  
  // Common fields
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Design software/programs that designers can work with
 */
export const designSoftware = mysqlTable("designSoftware", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // e.g., "photo", "video", "3d", "ui"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DesignSoftware = typeof designSoftware.$inferSelect;
export type InsertDesignSoftware = typeof designSoftware.$inferInsert;

/**
 * Junction table linking designers to their software expertise
 */
export const designerSoftware = mysqlTable("designerSoftware", {
  id: int("id").autoincrement().primaryKey(),
  designerId: int("designerId").notNull(),
  softwareId: int("softwareId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DesignerSoftware = typeof designerSoftware.$inferSelect;
export type InsertDesignerSoftware = typeof designerSoftware.$inferInsert;

/**
 * Services offered on the platform
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  price: int("price").notNull(), // Price in SAR (smallest unit)
  category: varchar("category", { length: 50 }).notNull(), // matches designSoftware category
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Client payment methods (mock data for simulation)
 */
export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  cardHolderName: varchar("cardHolderName", { length: 100 }).notNull(),
  cardNumberLast4: varchar("cardNumberLast4", { length: 4 }).notNull(), // Only store last 4 digits
  expiryMonth: varchar("expiryMonth", { length: 2 }).notNull(),
  expiryYear: varchar("expiryYear", { length: 4 }).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Orders placed by clients
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId").notNull(),
  designerId: int("designerId"), // Assigned when designer accepts
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  price: int("price").notNull(), // Price at time of order
  description: text("description").notNull(), // Client's order details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Files attached to orders (client uploads)
 */
export const orderFiles = mysqlTable("orderFiles", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 100 }), // mime type
  uploadedBy: int("uploadedBy").notNull(), // userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderFile = typeof orderFiles.$inferSelect;
export type InsertOrderFile = typeof orderFiles.$inferInsert;

/**
 * Final deliverables from designers
 */
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;

/**
 * Messages between clients and designers for specific orders
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Password reset tokens
 */
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
