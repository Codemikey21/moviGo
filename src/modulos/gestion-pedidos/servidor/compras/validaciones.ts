// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const esquemaEntrega = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("EN_PUNTO"), puntoId: z.uuid({ error: "Elige dónde lo recoges." }) }),
  z.object({ tipo: z.literal("A_DOMICILIO") }),
]);

export const esquemaNumero = z.string().regex(/^MV-\d{6}-[A-Z0-9]{4}$/);
export const esquemaId = z.uuid();

export const ESTADOS_PANEL = ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO", "ENTREGADO", "CANCELADO"] as const;
