// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { hoyEnColombia } from "@/compartido/utilidades/formato";

export const MAX_DIAS = 30;
/** Se puede reservar con hasta dos semanas de anticipación */
export const MAX_ANTICIPACION_DIAS = 14;

export const esquemaAlquiler = z
  .object({
    productoId: z.uuid(),
    fechaInicio: z.iso.date({ error: "Elige la fecha de inicio." }),
    dias: z.coerce.number().int().min(1, "Mínimo un día.").max(MAX_DIAS, `Máximo ${MAX_DIAS} días.`),
    entrega: z.enum(["EN_PUNTO", "A_DOMICILIO"]),
    puntoId: z.uuid({ error: "Elige el punto de servicio." }),
  })
  .refine((d) => d.fechaInicio >= hoyEnColombia() && d.fechaInicio <= hoyEnColombia(MAX_ANTICIPACION_DIAS), {
    path: ["fechaInicio"],
    message: `La fecha debe estar entre hoy y los próximos ${MAX_ANTICIPACION_DIAS} días.`,
  });

export const esquemaId = z.uuid();
