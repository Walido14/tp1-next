import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, authError } from "@/lib/authorization";
import { createStudentSchema } from "@/lib/validation";
import { studentSelect } from "@/lib/students";

// GET : ADMIN et ENSEIGNANT voient tous les étudiants, un ETUDIANT uniquement lui-même
export async function GET() {
  const auth = await requireRole(["ADMIN", "ENSEIGNANT", "ETUDIANT"]);
  if (!auth.ok) return authError(auth.status);

  const where =
    auth.user.role === "ETUDIANT"
      ? { id: auth.user.id, role: "ETUDIANT" }
      : { role: "ETUDIANT" };

  const students = await prisma.user.findMany({
    where,
    select: studentSelect,
    orderBy: { id: "asc" },
  });
  return NextResponse.json(students);
}

// POST : ADMIN uniquement
export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return authError(auth.status);

  const body = await req.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password, filiere, moyenne } = parsed.data;
  const hash = await bcrypt.hash(password, 10);

  try {
    const student = await prisma.user.create({
      data: { name, email, password: hash, role: "ETUDIANT", filiere, moyenne },
      select: studentSelect,
    });
    return NextResponse.json(student, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    throw e;
  }
}