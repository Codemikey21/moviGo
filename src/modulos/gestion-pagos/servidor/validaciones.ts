// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { BANCOS_PSE } from "./pasarela";

/** Algoritmo de Luhn: el dígito de control de las tarjetas. */
function luhn(numero: string) {
  let suma = 0;
  for (let i = 0; i < numero.length; i++) {
    let d = Number(numero[numero.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
  }
  return suma % 10 === 0;
}

const soloDigitos = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "") : v);

export const esquemaTarjeta = z.object({
  metodo: z.literal("TARJETA"),
  numero: z.preprocess(
    soloDigitos,
    z.string().regex(/^\d{13,19}$/, "Revisa el número de la tarjeta.").refine(luhn, "Ese número de tarjeta no es válido."),
  ),
  nombre: z.string().trim().min(5, "Escribe el nombre como aparece en la tarjeta.").max(60),
  vence: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Usa el formato MM/AA.")
    .refine((v) => {
      const [mm, aa] = v.split("/").map(Number);
      const ahora = new Date();
      const anio = 2000 + aa;
      return anio > ahora.getFullYear() || (anio === ahora.getFullYear() && mm >= ahora.getMonth() + 1);
    }, "La tarjeta está vencida."),
  cvv: z.preprocess(soloDigitos, z.string().regex(/^\d{3,4}$/, "El CVV tiene 3 o 4 dígitos.")),
  cuotas: z.coerce.number().int().min(1).max(36),
});

export const esquemaNequi = z.object({
  metodo: z.literal("NEQUI"),
  celular: z.preprocess(soloDigitos, z.string().regex(/^3\d{9}$/, "Escribe tu celular de 10 dígitos.")),
});

export const esquemaPse = z.object({
  metodo: z.literal("PSE"),
  banco: z.enum(BANCOS_PSE as [string, ...string[]], { error: "Elige tu banco." }),
  tipoPersona: z.enum(["NATURAL", "JURIDICA"]),
  documento: z.preprocess(soloDigitos, z.string().regex(/^\d{6,12}$/, "Escribe tu número de documento.")),
});

export const esquemaCobro = z.discriminatedUnion("metodo", [esquemaTarjeta, esquemaNequi, esquemaPse]);

export const esquemaReferencia = z.string().regex(/^MVP-[A-Z0-9]{10}$/);

/** El aviso que manda la pasarela al webhook. */
export const esquemaEvento = z.object({
  tipo: z.literal("transaccion.actualizada"),
  referencia: esquemaReferencia,
  estado: z.enum(["APROBADO", "RECHAZADO"]),
  transaccionId: z.string(),
  metodo: z.enum(["TARJETA", "NEQUI", "PSE"]),
  detalle: z.string(),
  motivo: z.string().nullable(),
  monto: z.number(),
  fecha: z.string(),
});
