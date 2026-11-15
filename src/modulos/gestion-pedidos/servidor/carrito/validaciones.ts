// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const MAX_POR_PRODUCTO = 5;

export const esquemaAgregar = z.object({
  productoId: z.uuid(),
  cantidad: z.coerce.number().int().min(1).max(MAX_POR_PRODUCTO),
});

export const esquemaCambiarCantidad = z.object({
  itemId: z.uuid(),
  cantidad: z.coerce.number().int().min(0).max(MAX_POR_PRODUCTO),
});
