import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Use vi.hoisted to create mock functions that can be referenced in vi.mock
const { mockSign, mockJwtVerify, mockCookieStore } = vi.hoisted(() => ({
  mockSign: vi.fn().mockResolvedValue("mock-jwt-token"),
  mockJwtVerify: vi.fn(),
  mockCookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock server-only to prevent errors
vi.mock("server-only", () => ({}));

// Mock jose
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: mockSign,
  })),
  jwtVerify: mockJwtVerify,
}));

// Mock next/headers cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

// Import after mocks are set up
import {
  createSession,
  getSession,
  deleteSession,
  verifySession,
  SessionPayload,
} from "../auth";

describe("auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSign.mockResolvedValue("mock-jwt-token");
  });

  describe("createSession", () => {
    it("creates a JWT token with correct payload", async () => {
      const userId = "user-123";
      const email = "test@example.com";

      await createSession(userId, email);

      // Verify SignJWT was called
      const { SignJWT } = await import("jose");
      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          email,
          expiresAt: expect.any(Date),
        })
      );
    });

    it("sets the auth cookie with correct options", async () => {
      const userId = "user-123";
      const email = "test@example.com";

      await createSession(userId, email);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "auth-token",
        "mock-jwt-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          expires: expect.any(Date),
        })
      );
    });

    it("sets cookie expiration to 7 days from now", async () => {
      const before = Date.now();
      await createSession("user-123", "test@example.com");
      const after = Date.now();

      const setCall = mockCookieStore.set.mock.calls[0];
      const cookieOptions = setCall[2];
      const expiresTime = cookieOptions.expires.getTime();

      // Should be approximately 7 days from now (with some tolerance)
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(expiresTime).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
      expect(expiresTime).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
    });
  });

  describe("getSession", () => {
    it("returns null when no token cookie exists", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const session = await getSession();

      expect(session).toBeNull();
    });

    it("returns null when token cookie value is empty", async () => {
      mockCookieStore.get.mockReturnValue({ value: undefined });

      const session = await getSession();

      expect(session).toBeNull();
    });

    it("returns session payload when token is valid", async () => {
      const expectedPayload: SessionPayload = {
        userId: "user-123",
        email: "test@example.com",
        expiresAt: new Date(),
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      mockJwtVerify.mockResolvedValue({ payload: expectedPayload });

      const session = await getSession();

      expect(session).toEqual(expectedPayload);
      expect(mockJwtVerify).toHaveBeenCalled();
      expect(mockJwtVerify.mock.calls[0][0]).toBe("valid-token");
    });

    it("returns null when token verification fails", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid-token" });
      mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe("deleteSession", () => {
    it("deletes the auth cookie", async () => {
      await deleteSession();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("auth-token");
    });
  });

  describe("verifySession", () => {
    it("returns null when no token cookie in request", async () => {
      const mockRequest = {
        cookies: {
          get: vi.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest;

      const session = await verifySession(mockRequest);

      expect(session).toBeNull();
    });

    it("returns null when token cookie value is empty", async () => {
      const mockRequest = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: undefined }),
        },
      } as unknown as NextRequest;

      const session = await verifySession(mockRequest);

      expect(session).toBeNull();
    });

    it("returns session payload when request token is valid", async () => {
      const expectedPayload: SessionPayload = {
        userId: "user-456",
        email: "user@example.com",
        expiresAt: new Date(),
      };

      const mockRequest = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: "request-token" }),
        },
      } as unknown as NextRequest;

      mockJwtVerify.mockResolvedValue({ payload: expectedPayload });

      const session = await verifySession(mockRequest);

      expect(session).toEqual(expectedPayload);
      expect(mockJwtVerify).toHaveBeenCalled();
      expect(mockJwtVerify.mock.calls[0][0]).toBe("request-token");
    });

    it("returns null when request token verification fails", async () => {
      const mockRequest = {
        cookies: {
          get: vi.fn().mockReturnValue({ value: "bad-token" }),
        },
      } as unknown as NextRequest;

      mockJwtVerify.mockRejectedValue(new Error("Token expired"));

      const session = await verifySession(mockRequest);

      expect(session).toBeNull();
    });
  });
});
