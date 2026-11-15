import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { DisponibilidadColor, DisponibilidadPunto, PuntoResumen } from "../../tipos";

/** Estados que ya no ocupan espacio en un punto. */
const FUERA_DEL_PUNTO = ["VENDIDA", "BAJA"] as const;

export async function listarPuntos(): Promise<PuntoResumen[]> {
  const puntos = await db.puntoServicio.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      direccion: true,
      horario: true,
      latitud: true,
      longitud: true,
      capacidad: true,
      _count: { select: { unidades: { where: { estado: { notIn: [...FUERA_DEL_PUNTO] } } } } },
    },
  });
  return puntos.map(({ _count, latitud, longitud, ...p }) => ({
    ...p,
    latitud: Number(latitud),
    longitud: Number(longitud),
    ocupadas: _count.unidades,
  }));
}

/** Unidades de un producto (de un color, si se pide) en cada punto activo (también los puntos con 0). */
export async function disponibilidadPorPunto(productoId: string, colorId: string | null = null): Promise<DisponibilidadPunto[]> {
  const [puntos, conteos] = await Promise.all([
    db.puntoServicio.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, direccion: true, horario: true },
    }),
    db.unidad.groupBy({
      by: ["puntoServicioId", "estado"],
      where: { productoId, estado: { notIn: [...FUERA_DEL_PUNTO] }, ...(colorId ? { colorId } : {}) },
      _count: { _all: true },
    }),
  ]);

  return puntos.map((punto) => {
    const delPunto = conteos.filter((c) => c.puntoServicioId === punto.id);
    return {
      punto,
      disponibles: delPunto.find((c) => c.estado === "DISPONIBLE")?._count._all ?? 0,
      total: delPunto.reduce((suma, c) => suma + c._count._all, 0),
    };
  });
}

/** Unidades de un producto por color y por punto (solo las combinaciones que existen). */
export async function disponibilidadPorColor(productoId: string): Promise<DisponibilidadColor[]> {
  const conteos = await db.unidad.groupBy({
    by: ["colorId", "puntoServicioId", "estado"],
    where: { productoId, estado: { notIn: [...FUERA_DEL_PUNTO] }, puntoServicio: { activo: true } },
    _count: { _all: true },
  });
  const filas = new Map<string, DisponibilidadColor>();
  for (const c of conteos) {
    const clave = `${c.colorId}|${c.puntoServicioId}`;
    const fila = filas.get(clave) ?? { colorId: c.colorId, puntoId: c.puntoServicioId, disponibles: 0, total: 0 };
    fila.total += c._count._all;
    if (c.estado === "DISPONIBLE") fila.disponibles += c._count._all;
    filas.set(clave, fila);
  }
  return [...filas.values()];
}

/** { productoId: { disponibles, total } } para varios productos a la vez. */
export async function conteoPorProducto(
  productoIds: string[],
): Promise<Record<string, { disponibles: number; total: number }>> {
  const conteos = await db.unidad.groupBy({
    by: ["productoId", "estado"],
    where: { productoId: { in: productoIds }, estado: { notIn: [...FUERA_DEL_PUNTO] } },
    _count: { _all: true },
  });
  const resultado: Record<string, { disponibles: number; total: number }> = {};
  for (const id of productoIds) resultado[id] = { disponibles: 0, total: 0 };
  for (const c of conteos) {
    resultado[c.productoId].total += c._count._all;
    if (c.estado === "DISPONIBLE") resultado[c.productoId].disponibles += c._count._all;
  }
  return resultado;
}

/** Cuántas unidades hay en cada estado, en todos los puntos. */
export async function unidadesPorEstado() {
  const conteos = await db.unidad.groupBy({ by: ["estado"], _count: { _all: true } });
  return Object.fromEntries(conteos.map((c) => [c.estado, c._count._all])) as Partial<
    Record<"DISPONIBLE" | "RESERVADA" | "ALQUILADA" | "VENDIDA" | "EN_TALLER" | "BAJA", number>
  >;
}
