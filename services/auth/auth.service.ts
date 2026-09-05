import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { RegisterInput, LoginInput } from "@/types/auth";

export class AuthError extends Error {}

/**
 * Business logic registrasi. Dipanggil dari Server Action, bukan langsung dari komponen.
 */
export async function registerUser(input: RegisterInput) {
  const [existingEmail, existingUsername, existingPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.email } }),
    prisma.user.findUnique({ where: { username: input.username } }),
    prisma.user.findUnique({ where: { phone: input.phone } }),
  ]);

  if (existingEmail) throw new AuthError("Email sudah terdaftar.");
  if (existingUsername) throw new AuthError("Username sudah digunakan.");
  if (existingPhone) throw new AuthError("Nomor HP sudah terdaftar.");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash,
      wallet: { create: { balance: 0 } },
    },
  });

  return user;
}

/**
 * Business logic login. Menerima email ATAU username sebagai identifier.
 * Selalu jalankan bcrypt.compare walau user tidak ditemukan (dummy hash) untuk
 * mencegah timing attack yang membocorkan apakah akun terdaftar.
 */
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8vJk8p1E4pQdY7vJt7T3H0uK7nHzWa";

export async function authenticateUser(input: LoginInput) {
  const isEmail = input.identifier.includes("@");
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: input.identifier.toLowerCase() } : { username: input.identifier },
  });

  const valid = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    throw new AuthError("Email/username atau password salah.");
  }

  if (user.status !== "ACTIVE") {
    throw new AuthError("Akun Anda tidak aktif. Hubungi customer service.");
  }

  return user;
}
