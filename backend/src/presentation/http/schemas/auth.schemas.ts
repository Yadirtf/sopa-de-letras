import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(25),
  age: z.number().int().min(5, "Edad mínima: 5 años").max(120),
  email: z.string().email("Correo electrónico inválido"),
  pin: z.string().regex(/^\d{4}$/, "El PIN debe consistir de exactamente 4 dígitos numéricos"),
  avatarUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  pin: z.string().regex(/^\d{4}$/, "El PIN debe ser de 4 dígitos"),
});

export const guestLoginSchema = z.object({
  name: z.string().min(3).max(25).optional(),
  avatarUrl: z.string().optional(),
});

export const forgotPinSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export const resetPinSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  otpCode: z.string().length(6, "El código debe ser de 6 dígitos"),
  newPin: z.string().regex(/^\d{4}$/, "El nuevo PIN debe ser de 4 dígitos"),
});

export const updatePinSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, "El PIN actual debe ser de 4 dígitos"),
  newPin: z.string().regex(/^\d{4}$/, "El nuevo PIN debe ser de 4 dígitos"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 letras")
    .max(25, "El nombre no puede pasar de 25 letras")
    .optional(),
  avatarUrl: z.string().optional(),
});
