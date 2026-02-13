import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const ADVERTISER_COOKIE_NAME = "adslots_user";

const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(`adslots-user:${token}`).digest("hex");
}

export function hashAdvertiserPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

export function verifyAdvertiserPassword(password: string, passwordHash: string) {
  const [salt, digest] = passwordHash.split(":");
  if (!salt || !digest) {
    return false;
  }

  const check = crypto.scryptSync(password, salt, 64).toString("hex");

  if (check.length !== digest.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(check), Buffer.from(digest));
}

export async function setAdvertiserSession(advertiserId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);

  await prisma.advertiserSession.create({
    data: {
      advertiserId,
      tokenHash,
      expiresAt
    }
  });

  cookies().set({
    name: ADVERTISER_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS
  });
}

export async function clearAdvertiserSession() {
  const rawToken = cookies().get(ADVERTISER_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.advertiserSession.deleteMany({
      where: {
        tokenHash: hashToken(rawToken)
      }
    });
  }

  cookies().set({
    name: ADVERTISER_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentAdvertiser() {
  const rawToken = cookies().get(ADVERTISER_COOKIE_NAME)?.value;
  if (!rawToken) {
    return null;
  }

  const session = await prisma.advertiserSession.findUnique({
    where: {
      tokenHash: hashToken(rawToken)
    },
    include: {
      advertiser: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.advertiserSession.delete({
      where: {
        id: session.id
      }
    });
    return null;
  }

  return session.advertiser;
}

export async function cleanupExpiredAdvertiserSessions() {
  await prisma.advertiserSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}
