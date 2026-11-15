// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { VISTAS } from "../../tipos";

// Hasta 4 colores con 4 vistas cada uno, más fotos generales
export const MAX_FOTOS = 24;

export const esquemaRegistrarFoto = z.object({
  productoId: z.uuid(),
  // Ruta dentro del bucket: <productoId>/<nombre>.<extensión>
  ruta: z
    .string()
    .regex(/^[0-9a-f-]{36}\/[a-z0-9-]{8,64}\.(jpg|jpeg|png|webp|avif)$/, "Ruta de foto no válida."),
  textoAlt: z.string().trim().max(140),
  colorId: z.uuid().nullable(),
  vista: z.enum(VISTAS).nullable(),
});

/** Cambiar el color o la vista de una foto ya subida. */
export const esquemaEtiquetarFoto = z.object({
  id: z.uuid(),
  colorId: z.union([z.uuid(), z.literal("").transform(() => null)]),
  vista: z.union([z.enum(VISTAS), z.literal("").transform(() => null)]),
});

export const esquemaIdFoto = z.uuid();
