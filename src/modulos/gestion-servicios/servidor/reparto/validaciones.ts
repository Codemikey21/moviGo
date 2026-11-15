// Esquemas zod de lo que manda el portal del domiciliario.
import { z } from "zod";

export const esquemaId = z.uuid();

export const esquemaAccion = z.object({
  domicilioId: z.uuid(),
  accion: z.enum(["tomar", "aceptar", "rechazar", "salir"]),
});

export const esquemaEntrega = z.object({
  domicilioId: z.uuid(),
  codigo: z.string().trim().regex(/^[0-9]{4}$/, "El código tiene 4 números."),
  // Ruta de la foto dentro del bucket "evidencias": <domicilio>/<uuid>.webp
  foto: z
    .string()
    .trim()
    .regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/, "La foto no se pudo guardar. Tómala de nuevo.")
    .or(z.literal(""))
    .transform((r) => r || null),
  receptor: z
    .string()
    .trim()
    .max(80)
    .transform((r) => r || null),
});

/** Posición del GPS: dentro del área metropolitana con margen. */
export const esquemaPosicion = z.object({
  domicilioId: z.uuid(),
  latitud: z.number().min(6.5).max(7.6),
  longitud: z.number().min(-73.6).max(-72.6),
});
