// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const MAX_COLORES = 8;

export const esquemaColor = z.object({
  productoId: z.uuid(),
  nombre: z.string().trim().min(2, "Escribe el nombre del color.").max(40, "Máximo 40 caracteres."),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Elige un color válido.")
    .transform((h) => h.toLowerCase()),
});

export const esquemaIdColor = z.uuid();

/** Cambiar el nombre o el tono de un color que ya existe. */
export const esquemaEditarColor = esquemaColor.extend({ id: z.uuid() });
