import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";
import { studentSelect } from "@/lib/students";
import StudentsManager from "@/components/StudentsManager";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "ETUDIANT") {
    return (
      <main className="mx-auto max-w-md space-y-3 pt-24">
        <h1 className="text-2xl font-bold text-red-600">403 – Accès interdit</h1>
        <p>Votre rôle ne permet pas d&apos;accéder à cette page.</p>
        <Link href="/dashboard" className="underline">Retour au tableau de bord</Link>
      </main>
    );
  }

  const students = await prisma.user.findMany({
    where: { role: "ETUDIANT" },
    select: studentSelect,
    orderBy: { id: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6 pt-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Étudiants ({user.role})</h1>
        <Link href="/dashboard" className="underline">Tableau de bord</Link>
      </div>
      <StudentsManager students={students} role={user.role} />
    </main>
  );
}