import { hash, compare } from "bcryptjs";
import { SignJWT } from "jose";
import { ENV } from "./_core/env";

const SALT_ROUNDS = 10;

/**
 * Gera hash bcrypt de uma senha
 */
export async function hashPassword(senha: string): Promise<string> {
  return hash(senha, SALT_ROUNDS);
}

/**
 * Compara senha em texto plano com hash bcrypt
 */
export async function verifyPassword(
  senha: string,
  senhaHash: string
): Promise<boolean> {
  return compare(senha, senhaHash);
}

/**
 * Cria um JWT para autenticação de senha única
 */
export async function createJWT(payload: {
  userId: number;
  openId: string;
  email: string | null;
  name: string | null;
  role: "admin" | "user";
}): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);

  const jwt = await new SignJWT({
    userId: payload.userId,
    openId: payload.openId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return jwt;
}
