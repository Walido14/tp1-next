export const studentSelect = {
  id: true,
  name: true,
  email: true,
  filiere: true,
  moyenne: true,
  createdAt: true,
} as const;

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}