/**
 * Credenciais da área restrita — este arquivo é só de servidor.
 * Visitantes públicos nunca recebem este módulo.
 */
import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_USER = "flavio";
const ADMIN_PASS = "consagracao";
const SALT = "cmt-v1";

function digest(username: string, password: string): string {
  return createHash("sha256")
    .update(`${username}:${password}:${SALT}`)
    .digest("hex");
}

const EXPECTED_TOKEN = digest(ADMIN_USER, ADMIN_PASS);

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyCredentials(username: string, password: string): boolean {
  const user = username.trim().toLowerCase();
  const token = digest(user, password);
  return user === ADMIN_USER && safeEqual(token, EXPECTED_TOKEN);
}

export function verifyToken(token: string): boolean {
  if (!token) return false;
  return safeEqual(token, EXPECTED_TOKEN);
}

export function issueToken(): string {
  return EXPECTED_TOKEN;
}

export function assertAdmin(token: string) {
  if (!verifyToken(token)) {
    throw new Error("Não autorizado. Entre na área restrita para editar.");
  }
}
