// Esquemas zod de entrada de este módulo.
import { z } from "zod";

/** "3.299.000", "$ 3299000" o "3299000" → 3299000 */
const pesos = (campo: string) =>
  z.preprocess(
    (valor) => (typeof valor === "string" ? Number(valor.replace(/\D/g, "") || NaN) : valor),
    z
      .number({ error: `Escribe ${campo} en pesos.` })
      .int()
      .min(1_000, `${campo[0].toUpperCase()}${campo.slice(1)} parece muy bajo.`)
      .max(9_999_999_999, `${campo[0].toUpperCase()}${campo.slice(1)} es demasiado alto.`),
  );

const textoCorto = (nombre: string, max = 80) =>
  z.string().trim().min(2, `Escribe ${nombre}.`).max(max, `Máximo ${max} caracteres.`);

export const esquemaProducto = z
  .object({
    categoriaId: z.uuid("Elige una categoría."),
    nombre: textoCorto("el nombre"),
    marca: textoCorto("la marca", 40),
    modelo: textoCorto("el modelo"),
    descripcion: z
      .string()
      .trim()
      .min(20, "Cuéntale al cliente un poco más (mínimo 20 caracteres).")
      .max(600, "Máximo 600 caracteres."),
    precioVenta: pesos("el precio de venta"),
    alquila: z.boolean(),
    tarifaAlquilerDia: z.string(),
    especificaciones: z
      .array(z.object({ etiqueta: z.string().trim().max(40), valor: z.string().trim().max(80) }))
      .max(12, "Máximo 12 filas en la ficha técnica."),
  })
  .transform(({ alquila, tarifaAlquilerDia, especificaciones, ...datos }, ctx) => {
    let tarifa: number | null = null;
    if (alquila) {
      const resultado = pesos("la tarifa por día").safeParse(tarifaAlquilerDia);
      if (!resultado.success) {
        ctx.addIssue({
          code: "custom",
          path: ["tarifaAlquilerDia"],
          message: resultado.error.issues[0]?.message ?? "Escribe la tarifa por día.",
        });
        return z.NEVER;
      }
      tarifa = resultado.data;
    }
    return {
      ...datos,
      tarifaAlquilerDia: tarifa,
      modalidades: (alquila ? ["VENTA", "ALQUILER"] : ["VENTA"]) as ("VENTA" | "ALQUILER")[],
      // Filas vacías de la ficha se ignoran
      especificaciones: especificaciones.filter((f) => f.etiqueta && f.valor),
    };
  });

export type ProductoValidado = z.output<typeof esquemaProducto>;

export const esquemaId = z.uuid();

export const esquemaFiltro = z.object({
  categoria: z.string().trim().max(40).optional(),
  modalidad: z.enum(["VENTA", "ALQUILER"]).optional(),
  busqueda: z.string().trim().max(60).optional(),
});
