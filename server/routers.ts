import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

// Helper to hash passwords (simple for demo - in production use bcrypt)
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString("base64") === hash;
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Register new user (client or designer)
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
          userType: z.enum(["client", "designer"]),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string().optional(),
          phoneNumber: z.string().optional(),
          softwareIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Check if email exists
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }

        // Create user with generated openId
        const openId = `local-${nanoid()}`;
        await db.createUser({
          openId,
          email: input.email,
          password: hashPassword(input.password),
          userType: input.userType,
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          phoneNumber: input.phoneNumber,
          name: input.userType === "client" 
            ? `${input.firstName || ""} ${input.lastName || ""}`.trim()
            : input.username,
          loginMethod: "local",
        });

        // If designer, add software expertise
        if (input.userType === "designer" && input.softwareIds && input.softwareIds.length > 0) {
          const user = await db.getUserByEmail(input.email);
          if (user) {
            await db.addDesignerSoftware(user.id, input.softwareIds);
          }
        }

        // Get the created user
        const createdUser = await db.getUserByEmail(input.email);

        return { success: true, user: createdUser };
      }),

    // Login with email and password
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        
        if (!user || !verifyPassword(input.password, user.password)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Update last signed in
        await db.updateUser(user.id, { lastSignedIn: new Date() });

// حوالي السطر 108
// Create session (simplified - in production use proper JWT)
const sessionToken = Buffer.from(JSON.stringify({ userId: user.id, openId: user.openId })).toString("base64");

// تم التعليق على الكوكي لتجاوز مشكلة Railway
// const cookieOptions = getSessionCookieOptions(ctx.req);
// ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

// إرجاع رمز الجلسة في جسم الاستجابة
return { success: true, user, sessionToken };

      }),

    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists
          return { success: true };
        }

        const token = nanoid(32);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.createPasswordResetToken({
          userId: user.id,
          token,
          expiresAt,
          used: false,
        });

        // In production, send email with token
        // For now, just return success
        return { success: true, token }; // Remove token in production
      }),

    // Reset password with token
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const resetToken = await db.getPasswordResetToken(input.token);
        
        if (!resetToken || resetToken.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired token",
          });
        }

        await db.updateUser(resetToken.userId, {
          password: hashPassword(input.newPassword),
        });

        await db.markTokenAsUsed(resetToken.id);

        return { success: true };
      }),
  }),

  // Design software endpoints
  software: router({
    list: publicProcedure.query(async () => {
      return await db.getAllDesignSoftware();
    }),
  }),

  // Services endpoints
  services: router({
    list: publicProcedure.query(async () => {
      return await db.getAllServices();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getServiceById(input.id);
      }),
  }),

  // User profile endpoints
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      let software: Awaited<ReturnType<typeof db.getDesignerSoftware>> = [];
      if (user.userType === "designer") {
        software = await db.getDesignerSoftware(user.id);
      }

      return { ...user, software };
    }),

    update: protectedProcedure
      .input(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string().optional(),
          phoneNumber: z.string().optional(),
          softwareIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;

        await db.updateUser(user.id, {
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          phoneNumber: input.phoneNumber,
          name: user.userType === "client"
            ? `${input.firstName || ""} ${input.lastName || ""}`.trim()
            : input.username,
        });

        // Update designer software if provided
        if (user.userType === "designer" && input.softwareIds) {
          await db.removeDesignerSoftware(user.id);
          if (input.softwareIds.length > 0) {
            await db.addDesignerSoftware(user.id, input.softwareIds);
          }
        }

        return { success: true };
      }),
  }),

  // Payment methods endpoints
  payment: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientPaymentMethods(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          cardHolderName: z.string(),
          cardNumber: z.string(), // We'll only store last 4 digits
          expiryMonth: z.string(),
          expiryYear: z.string(),
          cvv: z.string(), // Not stored, just validated
          isDefault: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const last4 = input.cardNumber.slice(-4);

        await db.createPaymentMethod({
          clientId: ctx.user.id,
          cardHolderName: input.cardHolderName,
          cardNumberLast4: last4,
          expiryMonth: input.expiryMonth,
          expiryYear: input.expiryYear,
          isDefault: input.isDefault ?? false,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          isDefault: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updatePaymentMethod(input.id, {
          isDefault: input.isDefault,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePaymentMethod(input.id);
        return { success: true };
      }),
  }),

  // Orders endpoints
  orders: router({
    // Create new order (client)
    create: protectedProcedure
      .input(
        z.object({
          serviceId: z.number(),
          description: z.string(),
          paymentMethodId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const service = await db.getServiceById(input.serviceId);
        if (!service) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        }

        const result = await db.createOrder({
          clientId: ctx.user.id,
          serviceId: input.serviceId,
          price: service.price,
          description: input.description,
          status: "pending",
        });

        // Get the created order ID from result
        const orderId = Number(result[0].insertId);

        return { success: true, orderId };
      }),

    // Upload files for order
    uploadFile: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          fileName: z.string(),
          fileData: z.string(), // base64
          fileType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `orders/${input.orderId}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        await db.createOrderFile({
          orderId: input.orderId,
          fileName: input.fileName,
          fileUrl: url,
          fileKey,
          fileType: input.fileType,
          uploadedBy: ctx.user.id,
        });

        return { success: true, url };
      }),

    // Get client's orders
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientOrders(ctx.user.id);
    }),

    // Get order details
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        const files = await db.getOrderFiles(input.id);
        const deliverables = await db.getOrderDeliverables(input.id);
        const messages = await db.getOrderMessages(input.id);

        return { order, files, deliverables, messages };
      }),

    // Get pending orders for designer
    pending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.userType !== "designer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only designers can view pending orders" });
      }

      return await db.getPendingOrdersForDesigner(ctx.user.id);
    }),

    // Get designer's assigned orders
    myDesigns: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.userType !== "designer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only designers can view their designs" });
      }

      return await db.getDesignerOrders(ctx.user.id);
    }),

    // Accept order (designer)
    accept: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.userType !== "designer") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only designers can accept orders" });
        }

        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        if (order.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Order already assigned" });
        }

        await db.assignOrderToDesigner(input.orderId, ctx.user.id);

        return { success: true };
      }),

    // Update order status
    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    // Upload deliverable (designer)
    uploadDeliverable: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          fileName: z.string(),
          fileData: z.string(), // base64
          fileType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.userType !== "designer") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only designers can upload deliverables" });
        }

        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `deliverables/${input.orderId}/${nanoid()}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        await db.createDeliverable({
          orderId: input.orderId,
          fileName: input.fileName,
          fileUrl: url,
          fileKey,
          fileType: input.fileType,
        });

        // Update order status to completed
        await db.updateOrderStatus(input.orderId, "completed");

        return { success: true, url };
      }),
  }),

  // Messages endpoints
  messages: router({
    // Send message
    send: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          receiverId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createMessage({
          orderId: input.orderId,
          senderId: ctx.user.id,
          receiverId: input.receiverId,
          content: input.content,
          isRead: false,
        });

        return { success: true };
      }),

    // Get messages for order
    getByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderMessages(input.orderId);
      }),

    // Mark message as read
    markRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        await db.markMessageAsRead(input.messageId);
        return { success: true };
      }),

    // Get unread count
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadMessagesCount(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
