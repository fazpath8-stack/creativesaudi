import { eq, and, or, desc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  designSoftware,
  designerSoftware,
  services,
  paymentMethods,
  orders,
  orderFiles,
  deliverables,
  messages,
  passwordResetTokens,
  InsertDesignSoftware,
  InsertDesignerSoftware,
  InsertService,
  InsertPaymentMethod,
  InsertOrder,
  InsertOrderFile,
  InsertDeliverable,
  InsertMessage,
  InsertPasswordResetToken,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Management ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
      password: user.password || "",
      userType: user.userType,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "firstName", "lastName", "username", "phoneNumber"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  return result;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, id));
}

// ============ Design Software ============

export async function getAllDesignSoftware() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(designSoftware);
}

export async function createDesignSoftware(software: InsertDesignSoftware) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(designSoftware).values(software);
}

// ============ Designer Software ============

export async function addDesignerSoftware(designerId: number, softwareIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values = softwareIds.map((softwareId) => ({
    designerId,
    softwareId,
  }));

  return await db.insert(designerSoftware).values(values);
}

export async function getDesignerSoftware(designerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: designerSoftware.id,
      softwareId: designerSoftware.softwareId,
      name: designSoftware.name,
      nameAr: designSoftware.nameAr,
      category: designSoftware.category,
    })
    .from(designerSoftware)
    .leftJoin(designSoftware, eq(designerSoftware.softwareId, designSoftware.id))
    .where(eq(designerSoftware.designerId, designerId));
}

export async function removeDesignerSoftware(designerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(designerSoftware).where(eq(designerSoftware.designerId, designerId));
}

// ============ Services ============

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(services).where(eq(services.isActive, true));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(services).values(service);
}

// ============ Payment Methods ============

export async function getClientPaymentMethods(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(paymentMethods).where(eq(paymentMethods.clientId, clientId));
}

export async function createPaymentMethod(method: InsertPaymentMethod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(paymentMethods).values(method);
}

export async function updatePaymentMethod(id: number, data: Partial<InsertPaymentMethod>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(paymentMethods).set(data).where(eq(paymentMethods.id, id));
}

export async function deletePaymentMethod(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
}

// ============ Orders ============

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getClientOrders(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      order: orders,
      service: services,
    })
    .from(orders)
    .leftJoin(services, eq(orders.serviceId, services.id))
    .where(eq(orders.clientId, clientId))
    .orderBy(desc(orders.createdAt));
}

export async function getPendingOrdersForDesigner(designerId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get designer's software categories
  const designerSoft = await getDesignerSoftware(designerId);
  const categoriesSet = new Set<string>();
  designerSoft.forEach((s) => {
    if (s.category) categoriesSet.add(s.category);
  });
  const categories = Array.from(categoriesSet);

  if (categories.length === 0) return [];

  // Get services in those categories
  const relevantServices = await db
    .select()
    .from(services)
    .where(inArray(services.category, categories as string[]));

  const serviceIds = relevantServices.map((s) => s.id);

  if (serviceIds.length === 0) return [];

  // Get pending orders for those services
  return await db
    .select({
      order: orders,
      service: services,
      client: users,
    })
    .from(orders)
    .leftJoin(services, eq(orders.serviceId, services.id))
    .leftJoin(users, eq(orders.clientId, users.id))
    .where(and(eq(orders.status, "pending"), inArray(orders.serviceId, serviceIds)))
    .orderBy(desc(orders.createdAt));
}

export async function getDesignerOrders(designerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      order: orders,
      service: services,
      client: users,
    })
    .from(orders)
    .leftJoin(services, eq(orders.serviceId, services.id))
    .leftJoin(users, eq(orders.clientId, users.id))
    .where(eq(orders.designerId, designerId))
    .orderBy(desc(orders.createdAt));
}

export async function assignOrderToDesigner(orderId: number, designerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(orders)
    .set({
      designerId,
      status: "assigned",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === "completed") {
    updateData.completedAt = new Date();
  }

  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

// ============ Order Files ============

export async function createOrderFile(file: InsertOrderFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(orderFiles).values(file);
}

export async function getOrderFiles(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderFiles).where(eq(orderFiles.orderId, orderId));
}

// ============ Deliverables ============

export async function createDeliverable(deliverable: InsertDeliverable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(deliverables).values(deliverable);
}

export async function getOrderDeliverables(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(deliverables).where(eq(deliverables.orderId, orderId));
}

// ============ Messages ============

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(messages).values(message);
}

export async function getOrderMessages(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(messages)
    .where(eq(messages.orderId, orderId))
    .orderBy(messages.createdAt);
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
}

export async function getUnreadMessagesCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

  return result.length;
}

// ============ Password Reset ============

export async function createPasswordResetToken(token: InsertPasswordResetToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(passwordResetTokens).values(token);
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, false)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markTokenAsUsed(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
}
