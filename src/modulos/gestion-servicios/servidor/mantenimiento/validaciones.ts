// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { hoyEnColombia } from "@/compartido/utilidades/formato";

export const esquemaSolicitud = z
  .object({
    unidadId: z.uuid({ error: "Elige tu vehículo." }),
    tipo: z.enum(["PREVENTIVO", "CORRECTIVO"]),
    programadoPara: z.iso.date({ error: "Elige el día." }),
    descripcion: z.string().trim().min(10, "Cuéntanos qué necesita (mínimo 10 caracteres).").max(400),
  })
  .refine((d) => d.programadoPara >= hoyEnColombia(1) && d.programadoPara <= hoyEnColombia(30), {
    path: ["programadoPara"],
    message: "Agenda entre mañana y los próximos 30 días.",
  });

export const esquemaGestion = z.object({
  id: z.uuid(),
  accion: z.enum(["iniciar", "terminar"]),
  costo: z.preprocess((v) => (typeof v === "string" ? Number(v.replace(/\D/g, "") || 0) : v), z.number().int().min(0).max(50_000_000)),
});
