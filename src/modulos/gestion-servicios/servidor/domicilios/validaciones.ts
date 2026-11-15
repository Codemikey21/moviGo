// Esquemas zod de entrada de este módulo.
import { z } from "zod";
import { barrios } from "@/compartido/utilidades/barrios";

const nombresBarrio = barrios.map((b) => b.nombre) as [string, ...string[]];

/** Dirección de entrega que escribe el cliente. */
export const esquemaDestino = z.object({
  direccion: z.string().trim().min(6, "Escribe la dirección completa (calle y número).").max(120),
  barrio: z.enum(nombresBarrio, { error: "Elige tu barrio." }),
  indicaciones: z.string().trim().max(120).default(""),
});

export const esquemaAsignar = z.object({
  domicilioId: z.uuid(),
  domiciliarioId: z.uuid("Elige un domiciliario."),
});

export const esquemaId = z.uuid();
