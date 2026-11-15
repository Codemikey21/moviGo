import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { CategoriaResumen } from "../../tipos";

/** Todas las categorías en el orden de la landing, con sus productos activos y precios "desde". */
export async function listarCategorias(): Promise<CategoriaResumen[]> {
  const [filas, precios] = await Promise.all([
    db.categoria.findMany({
      orderBy: { orden: "asc" },
      select: {
        id: true,
        slug: true,
        nombre: true,
        descripcion: true,
        _count: { select: { productos: { where: { activo: true } } } },
      },
    }),
    db.producto.groupBy({
      by: ["categoriaId"],
      where: { activo: true },
      _min: { precioVenta: true, tarifaAlquilerDia: true },
    }),
  ]);
  const minimos = new Map(precios.map((p) => [p.categoriaId, p._min]));
  return filas.map(({ _count, ...c }) => {
    const min = minimos.get(c.id);
    return {
      ...c,
      totalProductos: _count.productos,
      desdeVenta: min?.precioVenta != null ? Number(min.precioVenta) : null,
      desdeAlquiler: min?.tarifaAlquilerDia != null ? Number(min.tarifaAlquilerDia) : null,
    };
  });
}
