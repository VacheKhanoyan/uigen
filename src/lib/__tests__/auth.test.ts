// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

const mockGet = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mockGet }),
}));

import { getSession } from "@/lib/auth";

const SECRET = Buffer.from("development-secret-key");

async function makeToken(payload: object, expirationTime = "7d") {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .setIssuedAt()
    .sign(SECRET);
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("returns null when cookie is absent", async () => {
  mockGet.mockReturnValue(undefined);
  expect(await getSession()).toBeNull();
});

test("returns session payload for a valid token", async () => {
  const token = await makeToken({ userId: "u1", email: "a@b.com", expiresAt: new Date().toISOString() });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("u1");
  expect(session?.email).toBe("a@b.com");
});

test("returns null for a malformed token", async () => {
  mockGet.mockReturnValue({ value: "not.a.jwt" });
  expect(await getSession()).toBeNull();
});

test("returns null for an expired token", async () => {
  const token = await makeToken({ userId: "u1", email: "a@b.com" }, "-1s");
  mockGet.mockReturnValue({ value: token });
  expect(await getSession()).toBeNull();
});

test("returns null for a token signed with the wrong secret", async () => {
  const wrongSecret = Buffer.from("wrong-secret");
  const token = await new SignJWT({ userId: "u1", email: "a@b.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(wrongSecret);
  mockGet.mockReturnValue({ value: token });
  expect(await getSession()).toBeNull();
});
