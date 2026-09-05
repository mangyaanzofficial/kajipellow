import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "santanic_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Membuat session baru untuk user setelah login/register berhasil.
 * Token mentah disimpan di cookie httpOnly; hanya hash-nya disimpan di DB
 * (mirip prinsip password hashing) supaya jika DB bocor, token tidak bisa dipakai ulang.
 */
export async function createSession(userId: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Mengambil user yang sedang login dari cookie session.
 * Return null jika tidak ada session / session expired / session tidak valid.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  if (session.user.status !== "ACTIVE") {
    return null;
  }

  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
