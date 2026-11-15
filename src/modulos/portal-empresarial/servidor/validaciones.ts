// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { hoyEnColombia } from "@/compartido/utilidades/formato";

const pesos = z.preprocess((v) => (typeof v === "string" ? Number(v.replace(/\D/g, "") || NaN) : v), z.number({ error: "Escribe el valor." }).int().min(10_000, "Valor muy bajo."));

export const esquemaEmpresa = z.object({
  razonSocial: z.string().trim().min(3, "Escribe la razón social.").max(120),
  nit: z.string().trim().regex(/^\d{6,10}(-\d)?$/, "Escribe el NIT, por ejemplo 900123456-7."),
  sector: z.string().trim().max(60).transform((s) => s || null),
  cargo: z.string().trim().min(2, "Escribe tu cargo.").max(60),
});

export const esquemaSolicitud = z
  .object({
    tipo: z.enum(["FLOTA_ALQUILER", "DOMICILIOS_LOTE"]),
    cantidad: z.coerce.number().int().min(2, "Mínimo 2.").max(500, "Máximo 500."),
    desde: z.iso.date({ error: "Elige la fecha de inicio." }),
    hasta: z.iso.date({ error: "Elige la fecha final." }),
    notas: z.string().trim().max(500).transform((s) => s || null),
  })
  .refine((d) => d.desde >= hoyEnColombia(), { path: ["desde"], message: "Debe ser desde hoy en adelante." })
  .refine((d) => d.hasta >= d.desde, { path: ["hasta"], message: "Debe ser después de la fecha de inicio." });

export const esquemaCotizacion = z.object({
  solicitudId: z.uuid(),
  valor: pesos,
  descuento: z.coerce.number().min(0).max(50),
  validaHasta: z.iso.date({ error: "Elige hasta cuándo vale." }),
});

export const esquemaRespuesta = z.object({ solicitudId: z.uuid(), respuesta: z.enum(["APROBADA", "RECHAZADA"]) });
