import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { ColorProducto } from "../../tipos";

export async function listar(productoId: string): Promise<ColorProducto[]> {
  return db.colorProducto.findMany({
    where: { productoId },
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true, hex: true },
  });
}

/** ¿Otro color del producto ya se llama así? (sinId: el color que se está editando no cuenta) */
export async function nombreEnUso(productoId: string, nombre: string, sinId?: string): Promise<boolean> {
  const donde = { productoId, nombre: { equals: nombre, mode: "insensitive" as const }, ...(sinId ? { id: { not: sinId } } : {}) };
  return (await db.colorProducto.count({ where: donde })) > 0;
}

/** El color nuevo queda de último. */
export async function crear(datos: { productoId: string; nombre: string; hex: string }): Promise<void> {
  const ultimo = await db.colorProducto.aggregate({ where: { productoId: datos.productoId }, _max: { orden: true } });
  await db.colorProducto.create({ data: { ...datos, orden: (ultimo._max.orden ?? -1) + 1 } });
}

/** Cambia el nombre y el tono. Sus fotos y unidades siguen con este color. */
export async function actualizar(id: string, datos: { nombre: string; hex: string }): Promise<void> {
  await db.colorProducto.update({ where: { id }, data: datos });
}

/** Al borrarlo, sus fotos y unidades quedan sin color (no se borran). */
export async function borrar(id: string): Promise<void> {
  await db.colorProducto.delete({ where: { id } });
}

export async function existe(id: string, productoId: string): Promise<boolean> {
  return (await db.colorProducto.count({ where: { id, productoId } })) > 0;
}
