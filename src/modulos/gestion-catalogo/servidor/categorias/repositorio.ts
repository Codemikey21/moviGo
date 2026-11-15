import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { CategoriaResumen } from "../../tipos";

/** Todas las categorías en el orden de la landing, con sus productos activos. */
export async function listarCategorias(): Promise<CategoriaResumen[]> {
  const filas = await db.categoria.findMany({
    orderBy: { orden: "asc" },
    select: {
      id: true,
      slug: true,
      nombre: true,
      descripcion: true,
      _count: { select: { productos: { where: { activo: true } } } },
    },
  });
  return filas.map(({ _count, ...c }) => ({ ...c, totalProductos: _count.productos }));
}
