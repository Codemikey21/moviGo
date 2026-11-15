// Esquemas zod de entrada de este módulo.
import { z } from "zod";

export const MAX_UNIDADES_POR_INGRESO = 50;

export const esquemaRegistrarUnidades = z
  .object({
    productoId: z.uuid(),
    puntoId: z.uuid("Elige el punto de servicio."),
    // Seriales del fabricante, uno por línea (o separados por coma).
    // Si se deja vacío, MoviGo genera seriales internos.
    seriales: z.string().max(4000),
    cantidad: z.string(),
    nota: z.string().trim().max(200),
  })
  .transform((datos, ctx) => {
    const seriales = [
      ...new Set(
        datos.seriales
          .split(/[\n,;]+/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean),
      ),
    ];
    if (seriales.some((s) => !/^[A-Z0-9][A-Z0-9-]{3,39}$/.test(s))) {
      ctx.addIssue({
        code: "custom",
        path: ["seriales"],
        message: "Cada serial debe tener entre 4 y 40 letras, números o guiones.",
      });
      return z.NEVER;
    }
    const cantidad = seriales.length || Number(datos.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES_POR_INGRESO) {
      ctx.addIssue({
        code: "custom",
        path: [seriales.length ? "seriales" : "cantidad"],
        message: `Registra entre 1 y ${MAX_UNIDADES_POR_INGRESO} unidades a la vez.`,
      });
      return z.NEVER;
    }
    return { ...datos, seriales, cantidad, nota: datos.nota || null };
  });

export const esquemaMoverUnidad = z.object({
  unidadId: z.uuid(),
  cambio: z.enum(["A_TALLER", "DE_TALLER", "TRASLADO"]),
  destinoId: z.uuid().optional(),
});
