import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { EstadoPago } from "../tipos";

export async function crear(datos: { pedidoId?: string; alquilerId?: string; monto: number; referencia: string }) {
  return db.pago.create({ data: datos, select: { id: true, referencia: true } });
}

export async function referenciaEnUso(referencia: string) {
  return (await db.pago.count({ where: { referencia } })) > 0;
}

export async function buscarPorReferencia(referencia: string) {
  return db.pago.findUnique({
    where: { referencia },
    select: {
      id: true,
      referencia: true,
      monto: true,
      estado: true,
      creadoEn: true,
      confirmadoEn: true,
      pedidoId: true,
      alquilerId: true,
      pedido: {
        select: {
          numero: true,
          clienteId: true,
          lineas: { select: { producto: { select: { marca: true, nombre: true } } } },
        },
      },
      alquiler: {
        select: {
          id: true,
          clienteId: true,
          fechaInicio: true,
          fechaFin: true,
          unidad: { select: { producto: { select: { marca: true, nombre: true } } } },
        },
      },
      eventos: { orderBy: { recibidoEn: "desc" }, take: 1, select: { cuerpo: true } },
    },
  });
}

export async function actualizarEstado(id: string, estado: EstadoPago, confirmadoEn: Date | null) {
  await db.pago.update({ where: { id }, data: { estado, confirmadoEn } });
}

export async function guardarEvento(datos: { pagoId: string | null; tipo: string; firma: string; cuerpo: Prisma.InputJsonValue }) {
  const { id } = await db.eventoWebhook.create({ data: datos, select: { id: true } });
  return id;
}

export async function marcarProcesado(eventoId: string) {
  await db.eventoWebhook.update({ where: { id: eventoId }, data: { procesado: true } });
}

export async function reembolsar(filtro: { pedidoId?: string; alquilerId?: string }) {
  await db.pago.updateMany({ where: { ...filtro, estado: "APROBADO" }, data: { estado: "REEMBOLSADO" } });
}

/** Ingresos aprobados (desde una fecha, o todos). */
export async function ingresos(desde?: Date) {
  const r = await db.pago.aggregate({
    where: { estado: "APROBADO", ...(desde ? { confirmadoEn: { gte: desde } } : {}) },
    _sum: { monto: true },
    _count: { _all: true },
  });
  return { total: Number(r._sum.monto ?? 0), cantidad: r._count._all };
}

/** Ingresos aprobados por día (últimos días) para la gráfica del panel. */
export async function ingresosPorDia(desde: Date) {
  const pagos = await db.pago.findMany({
    where: { estado: "APROBADO", confirmadoEn: { gte: desde } },
    select: { monto: true, confirmadoEn: true },
  });
  return pagos.map((p) => ({ monto: Number(p.monto), fecha: p.confirmadoEn! }));
}
