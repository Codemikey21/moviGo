import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { MovimientoFila } from "../../tipos";

/** Los últimos movimientos de todas las unidades de un producto. */
export async function listarPorProducto(productoId: string, limite: number): Promise<MovimientoFila[]> {
  const filas = await db.movimientoStock.findMany({
    where: { unidad: { productoId } },
    orderBy: { fecha: "desc" },
    take: limite,
    select: {
      id: true,
      tipo: true,
      fecha: true,
      nota: true,
      unidad: { select: { serial: true } },
      registradoPor: { select: { nombre: true } },
      destino: { select: { nombre: true } },
    },
  });
  return filas.map(({ unidad, registradoPor, destino, ...m }) => ({
    ...m,
    serial: unidad.serial,
    registradoPor: registradoPor.nombre,
    destino: destino?.nombre ?? null,
  }));
}
