import { z } from "zod";

// Note: Validation messages are in French by default.
// For i18n, the calling code can override with translated messages.

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(255, "Email trop long"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(128, "Mot de passe trop long"),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(255, "Email trop long"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(128, "Mot de passe trop long"),
  displayName: z.string().trim().max(100, "Nom trop long").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(255, "Email trop long"),
});

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(150, "Nom trop long"),
  secteur: z.string().max(100, "Secteur trop long").optional(),
  devise: z.string().min(1, "La devise est requise"),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Le nom ne peut pas être vide").max(100, "Nom trop long"),
});

/** Create i18n-aware validation schemas */
export const createI18nSchemas = (t: (key: string) => string) => ({
  login: z.object({
    email: z.string().trim().email(t("validation.emailInvalid")).max(255, t("validation.emailTooLong")),
    password: z.string().min(6, t("validation.passwordMin")).max(128, t("validation.passwordMax")),
  }),
  register: z.object({
    email: z.string().trim().email(t("validation.emailInvalid")).max(255, t("validation.emailTooLong")),
    password: z.string().min(6, t("validation.passwordMin")).max(128, t("validation.passwordMax")),
    displayName: z.string().trim().max(100, t("validation.nameTooLong")).optional(),
  }),
  forgotPassword: z.object({
    email: z.string().trim().email(t("validation.emailInvalid")).max(255, t("validation.emailTooLong")),
  }),
  createPlan: z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")).max(150, t("validation.nameTooLong")),
    secteur: z.string().max(100, t("validation.sectorTooLong")).optional(),
    devise: z.string().min(1, t("validation.currencyRequired")),
  }),
  profile: z.object({
    displayName: z.string().trim().min(1, t("validation.nameEmpty")).max(100, t("validation.nameTooLong")),
  }),
});
