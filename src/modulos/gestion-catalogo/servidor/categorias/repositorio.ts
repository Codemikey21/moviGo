import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { CategoriaResumen } from "../../tipos";

/** Todas las categorías en el orden de la landing, con sus productos activos y precios "desde". */
export async function listarCategorias(): Promise<CategoriaResumen[]> {
  const [filas, precios, fotos] = await Promise.all([
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
    // Fotos sin fondo (de lado o de frente) para mostrar la categoría
    db.medio.findMany({
      where: { tipo: "FOTO", vista: { in: ["LATERAL", "FRENTE"] }, producto: { activo: true } },
      orderBy: { orden: "asc" },
      select: {
        id: true,
        url: true,
        textoAlt: true,
        orden: true,
        vista: true,
        producto: { select: { categoriaId: true, precioVenta: true } },
      },
    }),
  ]);
  // Por categoría: primero las de lado, luego la foto principal, luego el producto más barato
  const fotoDe = new Map<string, (typeof fotos)[number]>();
  const puntaje = (f: (typeof fotos)[number]) =>
    (f.vista === "LATERAL" ? 0 : 1_000_000) + f.orden * 10_000 + Number(f.producto.precioVenta) / 1e9;
  for (const f of fotos) {
    const actual = fotoDe.get(f.producto.categoriaId);
    if (!actual || puntaje(f) < puntaje(actual)) fotoDe.set(f.producto.categoriaId, f);
  }
  const minimos = new Map(precios.map((p) => [p.categoriaId, p._min]));
  return filas.map(({ _count, ...c }) => {
    const min = minimos.get(c.id);
    return {
      ...c,
      totalProductos: _count.productos,
      desdeVenta: min?.precioVenta != null ? Number(min.precioVenta) : null,
      desdeAlquiler: min?.tarifaAlquilerDia != null ? Number(min.tarifaAlquilerDia) : null,
      foto: (() => {
        const f = fotoDe.get(c.id);
        return f ? { id: f.id, url: f.url, textoAlt: f.textoAlt, orden: f.orden } : null;
      })(),
    };
  });
}
