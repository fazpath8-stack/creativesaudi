import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authentication System", () => {
  beforeAll(async () => {
    // Clean up test users
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, "test@creativesaudi.com"));
      await db.delete(users).where(eq(users.email, "designer@creativesaudi.com"));
    }
  });

  it("should register a new client user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      email: "test@creativesaudi.com",
      password: "password123",
      userType: "client",
      firstName: "Test",
      lastName: "User",
      phoneNumber: "+966500000000",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("test@creativesaudi.com");
    expect(result.user?.userType).toBe("client");
  });

  it("should register a new designer user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      email: "designer@creativesaudi.com",
      password: "password123",
      userType: "designer",
      username: "TestDesigner",
      phoneNumber: "+966500000001",
      softwareIds: [1, 2], // Assuming these IDs exist from seed data
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("designer@creativesaudi.com");
    expect(result.user?.userType).toBe("designer");
  });

  it("should login with correct credentials", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({
      email: "test@creativesaudi.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("test@creativesaudi.com");
  });

  it("should fail login with incorrect password", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "test@creativesaudi.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow();
  });

  it("should request password reset", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.requestPasswordReset({
      email: "test@creativesaudi.com",
    });

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
  });

  it("should reset password with valid token", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First request reset
    const resetRequest = await caller.auth.requestPasswordReset({
      email: "test@creativesaudi.com",
    });

    // Then reset with token
    const result = await caller.auth.resetPassword({
      token: resetRequest.token!,
      newPassword: "newpassword123",
    });

    expect(result.success).toBe(true);

    // Verify new password works
    const loginResult = await caller.auth.login({
      email: "test@creativesaudi.com",
      password: "newpassword123",
    });

    expect(loginResult.success).toBe(true);
  });
});

describe("Services System", () => {
  it("should list all services", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const services = await caller.services.list();

    expect(services).toBeDefined();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
  });

  it("should get service by ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const service = await caller.services.getById({ id: 1 });

    expect(service).toBeDefined();
    expect(service?.id).toBe(1);
    expect(service?.name).toBeDefined();
    expect(service?.price).toBeGreaterThan(0);
  });
});

describe("Software System", () => {
  it("should list all design software", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const software = await caller.software.list();

    expect(software).toBeDefined();
    expect(Array.isArray(software)).toBe(true);
    expect(software.length).toBeGreaterThan(0);
  });
});
