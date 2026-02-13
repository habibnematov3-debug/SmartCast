import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "adslots_admin";

function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(`adslots:${password}`).digest("hex");
}

export function verifyAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || input.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export function isAdminAuthenticated() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  const expectedToken = getExpectedToken();
  if (token.length !== expectedToken.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

export function setAdminSession() {
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: getExpectedToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAdminSession() {
  cookies().set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0
  });
}