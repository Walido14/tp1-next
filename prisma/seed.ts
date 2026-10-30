import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Seed = {
  name: string; email: string; password: string; role: string;
  filiere?: string; moyenne?: number;
};

const users: Seed[] = [
  { name: "Admin", email: "admin@test.com", password: "Admin1234!", role: "ADMIN" },
  { name: "Prof Martin", email: "prof@test.com", password: "Prof12345!", role: "ENSEIGNANT" },
  { name: "Etudiant Un", email: "etudiant1@test.com", password: "Etud12345!", role: "ETUDIANT", filiere: "Informatique", moyenne: 14 },
  { name: "Etudiant Deux", email: "etudiant2@test.com", password: "Etud12345!", role: "ETUDIANT", filiere: "Réseaux", moyenne: 12.5 },
];

async function main() {
  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role },
      create: { ...u, password },
    });
  }
  console.log("Seed terminé");
}

main().finally(() => prisma.$disconnect());