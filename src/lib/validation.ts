import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim()
    .min(2, "Nom : 2 caractères minimum"),
  email: z.string().trim().toLowerCase()
    .email("Email invalide"),
  password: z.string()
    .min(8, "Mot de passe : 8 caractères minimum"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase()
    .email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
// ---------- TP2 : étudiants ----------
const pedagogy = {
  filiere: z.string().trim().min(1, "Filière vide").max(60).nullable().optional(),
  moyenne: z
    .number()
    .min(0, "Moyenne : 0 minimum")
    .max(20, "Moyenne : 20 maximum")
    .nullable()
    .optional(),
};

const notEmpty = (d: object) => Object.keys(d).length > 0;

// ADMIN : création (le rôle est forcé à ETUDIANT côté serveur)
export const createStudentSchema = registerSchema.extend(pedagogy).strict();

// ADMIN : peut modifier identité + champs pédagogiques
export const adminUpdateStudentSchema = z
  .object({
    name: z.string().trim().min(2, "Nom : 2 caractères minimum"),
    email: z.string().trim().toLowerCase().email("Email invalide"),
    ...pedagogy,
  })
  .partial()
  .strict()
  .refine(notEmpty, "Aucun champ à modifier");

// ENSEIGNANT : uniquement les champs pédagogiques
export const teacherUpdateStudentSchema = z
  .object({ ...pedagogy })
  .strict()
  .refine(notEmpty, "Aucun champ à modifier");