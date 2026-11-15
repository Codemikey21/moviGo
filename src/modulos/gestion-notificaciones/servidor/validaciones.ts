import { z } from "zod";
import { MOTIVOS_CONTACTO } from "../tipos";

// Las notificaciones las crea el sistema; estos son los dos formularios
// públicos del módulo: contacto y boletín.

const correo = z.email("Escribe un correo válido.").max(160).transform((c) => c.toLowerCase());

export const esquemaContacto = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre.").max(80),
  correo,
  telefono: z
    .string()
    .trim()
    .max(20)
    .refine((t) => t === "" || /^[0-9 +()-]{7,20}$/.test(t), "Escribe un teléfono válido.")
    .transform((t) => (t === "" ? null : t)),
  motivo: z.enum(MOTIVOS_CONTACTO, "Elige un tema."),
  mensaje: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(2000, "Máximo 2.000 caracteres."),
});

export const esquemaBoletin = z.object({ correo });

export const esquemaId = z.uuid();
