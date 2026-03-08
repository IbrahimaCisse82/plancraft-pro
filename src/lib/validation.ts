import { z } from "zod";

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
