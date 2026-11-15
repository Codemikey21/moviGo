// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const MAX_FOTOS = 8;

export const esquemaRegistrarFoto = z.object({
  productoId: z.uuid(),
  // Ruta dentro del bucket: <productoId>/<nombre>.<extensión>
  ruta: z
    .string()
    .regex(/^[0-9a-f-]{36}\/[a-z0-9-]{8,64}\.(jpg|jpeg|png|webp|avif)$/, "Ruta de foto no válida."),
  textoAlt: z.string().trim().max(140),
});

export const esquemaIdFoto = z.uuid();
