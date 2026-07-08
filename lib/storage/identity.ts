import { z } from "zod";

export const IDENTITY_STORAGE_KEY = "sourdough:v1:identity";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const EmailSchema = z.email();

export function isValidEmail(raw: string): boolean {
  return EmailSchema.safeParse(normalizeEmail(raw)).success;
}

export const IdentitySchema = z.object({
  name: z.string().min(1),
  email: EmailSchema,
  identifiedAt: z.string(),
});

export type Identity = z.infer<typeof IdentitySchema>;

export function loadIdentity(): Identity | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(IDENTITY_STORAGE_KEY);
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = IdentitySchema.safeParse(parsed);
  if (!result.success) return null;
  return result.data;
}

export function saveIdentity(identity: Identity): void {
  const normalized: Identity = {
    ...identity,
    name: identity.name.trim(),
    email: normalizeEmail(identity.email),
  };
  localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(normalized));
}
