"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: number;
  name: string;
  email: string;
  filiere: string | null;
  moyenne: number | null;
};
type Props = { students: Student[]; role: "ADMIN" | "ENSEIGNANT" };

function readPedagogy(fd: FormData) {
  const filiere = String(fd.get("filiere") ?? "").trim();
  const m = String(fd.get("moyenne") ?? "").trim();
  return { filiere: filiere || null, moyenne: m === "" ? null : Number(m) };
}

export default function StudentsManager({ students, role }: Props) {
  const router = useRouter();
  const isAdmin = role === "ADMIN";
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const cls = "rounded border p-2";

  async function call(url: string, method: string, body?: unknown) {
    setError("");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (res.ok) {
        router.refresh();
        return true;
      }
      const j = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("401 – Session expirée, reconnectez-vous.");
        router.push("/login");
      } else if (res.status === 403) {
        setError("403 – Accès interdit : droits insuffisants.");
      } else {
        setError(`${res.status} – ${j.error ?? "Erreur"}`);
      }
    } catch {
      setError("Erreur réseau");
    }
    return false;
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const ok = await call("/api/students", "POST", {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      ...readPedagogy(fd),
    });
    if (ok) form.reset();
  }

  async function onEdit(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = isAdmin
      ? { name: fd.get("name"), email: fd.get("email"), ...readPedagogy(fd) }
      : readPedagogy(fd); // l'enseignant n'envoie que les champs pédagogiques
    if (await call(`/api/students/${id}`, "PATCH", payload)) setEditingId(null);
  }

  async function onDelete(id: number) {
    if (!confirm("Supprimer cet étudiant ?")) return;
    await call(`/api/students/${id}`, "DELETE");
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>}

      {isAdmin && (
        <form onSubmit={onCreate} className="grid grid-cols-2 gap-2 rounded border p-3">
          <h2 className="col-span-2 font-semibold">Créer un étudiant</h2>
          <input name="name" placeholder="Nom" required className={cls} />
          <input name="email" type="email" placeholder="Email" required className={cls} />
          <input name="password" type="password" placeholder="Mot de passe (8+)" required className={cls} />
          <input name="filiere" placeholder="Filière" className={cls} />
          <input name="moyenne" type="number" step="0.01" min="0" max="20" placeholder="Moyenne" className={cls} />
          <button className="rounded bg-gray-800 p-2 text-white">Créer</button>
        </form>
      )}

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Filière</th>
            <th className="p-2">Moyenne</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) =>
            editingId === s.id ? (
              <tr key={s.id} className="border-b bg-gray-50">
                <td colSpan={5} className="p-2">
                  <form onSubmit={(e) => onEdit(e, s.id)} className="flex flex-wrap gap-2">
                    {isAdmin && (
                      <>
                        <input name="name" defaultValue={s.name} required className={cls} />
                        <input name="email" type="email" defaultValue={s.email} required className={cls} />
                      </>
                    )}
                    <input name="filiere" defaultValue={s.filiere ?? ""} placeholder="Filière" className={cls} />
                    <input name="moyenne" type="number" step="0.01" min="0" max="20"
                      defaultValue={s.moyenne ?? ""} placeholder="Moyenne" className={cls} />
                    <button className="rounded bg-gray-800 px-3 text-white">Enregistrer</button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 underline">
                      Annuler
                    </button>
                  </form>
                </td>
              </tr>
            ) : (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.email}</td>
                <td className="p-2">{s.filiere ?? "—"}</td>
                <td className="p-2">{s.moyenne ?? "—"}</td>
                <td className="space-x-3 p-2">
                  <button onClick={() => setEditingId(s.id)} className="underline">Modifier</button>
                  {isAdmin && (
                    <button onClick={() => onDelete(s.id)} className="text-red-600 underline">
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}