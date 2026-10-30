import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/authorization";
import LogoutButton from "@/components/LogoutButton";

const ACTIONS = {
  ADMIN: ["Créer, modifier et supprimer des étudiants", "Consulter la liste complète"],
  ENSEIGNANT: ["Consulter la liste des étudiants", "Modifier filière et moyenne"],
  ETUDIANT: ["Consulter mes informations"],
} as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { filiere: true, moyenne: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-lg space-y-4 pt-24">
      <h1 className="text-2xl font-bold">Bonjour {user.name} !</h1>
      <p>
        Email : {user.email} — rôle :{" "}
        <span className="rounded bg-gray-200 px-2 py-1 text-sm font-semibold">{user.role}</span>
      </p>
      <p>Membre depuis le {profile?.createdAt.toLocaleDateString("fr-FR")}</p>

      {user.role === "ETUDIANT" && (
        <div className="rounded border p-3">
          <p>Filière : {profile?.filiere ?? "non renseignée"}</p>
          <p>Moyenne : {profile?.moyenne ?? "non renseignée"}</p>
        </div>
      )}

      <section>
        <h2 className="font-semibold">Actions disponibles</h2>
        <ul className="list-disc pl-6">
          {ACTIONS[user.role].map((a) => <li key={a}>{a}</li>)}
        </ul>
      </section>

      <div className="flex gap-3">
        {user.role !== "ETUDIANT" && (
          <Link href="/students" className="rounded border px-3 py-2">Gérer les étudiants</Link>
        )}
        <LogoutButton />
      </div>
    </main>
  );
}