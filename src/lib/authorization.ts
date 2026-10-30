import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isRole, type Role } from "@/lib/roles";

export type AuthUser = { id: number; name: string; email: string; role: Role };
export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; status: 401 | 403 };

// Session JWT + relecture de l'utilisateur et de son rôle en base
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user || !isRole(user.role)) return null;

  return { ...user, role: user.role };
}

export async function requireRole(allowed: Role[]): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401 };
  if (!allowed.includes(user.role)) return { ok: false, status: 403 };
  return { ok: true, user };
}

export function authError(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 401 ? "Non authentifié" : "Accès interdit" },
    { status }
  );
}