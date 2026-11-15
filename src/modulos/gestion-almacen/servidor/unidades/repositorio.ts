import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
// Cada cambio de una unidad deja su MovimientoStock en la misma transacción.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { EstadoUnidad, TipoMovimiento, UnidadFila } from "../../tipos";

export async function listarPorProducto(productoId: string): Promise<UnidadFila[]> {
  const filas = await db.unidad.findMany({
    where: { productoId },
    orderBy: [{ puntoServicio: { nombre: "asc" } }, { serial: "asc" }],
    select: {
      id: true,
      serial: true,
      estado: true,
      kilometraje: true,
      ingresoEn: true,
      puntoServicio: { select: { id: true, nombre: true } },
      color: { select: { id: true, nombre: true, hex: true } },
    },
  });
  return filas.map(({ puntoServicio, kilometraje, ...u }) => ({
    ...u,
    punto: puntoServicio,
    kilometraje: Number(kilometraje),
  }));
}

export async function buscarUnidad(id: string) {
  return db.unidad.findUnique({
    where: { id },
    select: { id: true, serial: true, estado: true, puntoServicioId: true },
  });
}

export async function buscarPunto(id: string) {
  return db.puntoServicio.findFirst({
    where: { id, activo: true },
    select: {
      id: true,
      nombre: true,
      capacidad: true,
      _count: { select: { unidades: { where: { estado: { notIn: ["VENDIDA", "BAJA"] } } } } },
    },
  });
}

export async function existeProducto(id: string): Promise<boolean> {
  return (await db.producto.count({ where: { id } })) > 0;
}

/** De la lista, los seriales que ya están registrados. */
export async function serialesEnUso(seriales: string[]): Promise<string[]> {
  const filas = await db.unidad.findMany({
    where: { serial: { in: seriales } },
    select: { serial: true },
  });
  return filas.map((f) => f.serial);
}

/** Crea las unidades y su movimiento de INGRESO, todo o nada. */
export async function registrarUnidades(datos: {
  productoId: string;
  puntoId: string;
  colorId: string | null;
  seriales: string[];
  registradoPorId: string;
  nota: string | null;
}): Promise<void> {
  await db.$transaction(
    datos.seriales.map((serial) =>
      db.unidad.create({
        data: {
          serial,
          productoId: datos.productoId,
          puntoServicioId: datos.puntoId,
          colorId: datos.colorId,
          movimientos: {
            create: { tipo: "INGRESO", registradoPorId: datos.registradoPorId, nota: datos.nota },
          },
        },
        select: { id: true },
      }),
    ),
  );
}

/** Cambia estado y/o punto de una unidad y registra el movimiento. */
export async function moverUnidad(datos: {
  unidadId: string;
  estado: EstadoUnidad;
  puntoId: string;
  tipo: TipoMovimiento;
  registradoPorId: string;
  destinoId: string | null;
  nota: string | null;
}): Promise<void> {
  await db.$transaction([
    db.unidad.update({
      where: { id: datos.unidadId },
      data: { estado: datos.estado, puntoServicioId: datos.puntoId },
    }),
    db.movimientoStock.create({
      data: {
        unidadId: datos.unidadId,
        tipo: datos.tipo,
        registradoPorId: datos.registradoPorId,
        destinoId: datos.destinoId,
        nota: datos.nota,
      },
    }),
  ]);
}

// ---------------------------------------------------------------------------
// Reservas y salidas (las usan pedidos y alquileres a través de servicio.ts)
// ---------------------------------------------------------------------------

/** Unidades disponibles de un producto; primero las del punto preferido. */
export async function buscarDisponibles(productoId: string, puntoId: string | null, colorId: string | null = null) {
  return db.unidad.findMany({
    where: {
      productoId,
      estado: "DISPONIBLE",
      ...(puntoId ? { puntoServicioId: puntoId } : {}),
      ...(colorId ? { colorId } : {}),
    },
    orderBy: [{ kilometraje: "asc" }, { serial: "asc" }],
    select: { id: true, serial: true, puntoServicioId: true },
  });
}

/**
 * Pasa las unidades de un estado a otro solo si siguen en el estado
 * esperado (así dos clientes no se llevan la misma unidad). Devuelve las
 * que sí cambiaron. Cada una deja su movimiento.
 */
export async function cambiarEstado(datos: {
  unidadIds: string[];
  desde: EstadoUnidad[];
  hacia: EstadoUnidad;
  tipo: TipoMovimiento;
  registradoPorId: string;
  nota: string | null;
}): Promise<string[]> {
  return db.$transaction(async (tx) => {
    const cambiadas: string[] = [];
    for (const id of datos.unidadIds) {
      const { count } = await tx.unidad.updateMany({
        where: { id, estado: { in: datos.desde } },
        data: { estado: datos.hacia },
      });
      if (count === 1) {
        cambiadas.push(id);
        await tx.movimientoStock.create({
          data: { unidadId: id, tipo: datos.tipo, registradoPorId: datos.registradoPorId, nota: datos.nota },
        });
      }
    }
    return cambiadas;
  });
}
