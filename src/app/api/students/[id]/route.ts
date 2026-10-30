import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, authError } from "@/lib/authorization";
import {
  adminUpdateStudentSchema,
  teacherUpdateStudentSchema,
} from "@/lib/validation";
import { studentSelect, parseId } from "@/lib/students";

type Ctx = { params: Promise<{ id: string }> };

const badId = () =>
  NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
const notFound = () =>
  NextResponse.json({ error: "Introuvable" }, { status: 404 });

// GET : rôle ET propriété de la ressource (anti-IDOR)
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if (!auth.ok) return authError(auth.status);

  const id = parseId((await params).id);
  if (!id) return badId();

  // Un étudiant ne peut lire que sa propre fiche : 404 sinon
  if (auth.user.role === "ETUDIANT" && auth.user.id !== id) return notFound();

  const student = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: studentSelect,
  });
  return student ? NextResponse.json(student) : notFound();
}

// PATCH : ADMIN (tout) ou ENSEIGNANT (champs pédagogiques seulement)
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT"]);
  if (!auth.ok) return authError(auth.status);

  const id = parseId((await params).id);
  if (!id) return badId();

  const body = await req.json().catch(() => null);
  const schema =
    auth.user.role === "ADMIN"
      ? adminUpdateStudentSchema
      : teacherUpdateStudentSchema;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const target = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: { id: true },
  });
  if (!target) return notFound();

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: studentSelect,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    throw e;
  }
}

// DELETE : ADMIN uniquement, et seulement sur un étudiant
export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return authError(auth.status);

  const id = parseId((await params).id);
  if (!id) return badId();

  const target = await prisma.user.findFirst({
    where: { id, role: "ETUDIANT" },
    select: { id: true },
  });
  if (!target) return notFound();

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}