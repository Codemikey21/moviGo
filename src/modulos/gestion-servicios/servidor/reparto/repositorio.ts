import "server-only";

// Acceso a datos del portal del domiciliario (Prisma).
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { DomicilioVista, PerfilReparto } from "../../tipos";
import { aVista, campos } from "../domicilios/repositorio";

export async function perfil(usuarioId: string): Promise<PerfilReparto | null> {
  const d = await db.domiciliario.findUnique({
    where: { usuarioId },
    select: { vehiculo: true, disponible: true, calificacion: true, usuario: { select: { id: true, nombre: true } } },
  });
  if (!d) return null;
  return {
    id: d.usuario.id,
    nombre: d.usuario.nombre,
    vehiculo: d.vehiculo,
    disponible: d.disponible,
    calificacion: d.calificacion === null ? null : Number(d.calificacion),
  };
}

export async function cambiarDisponible(usuarioId: string, disponible: boolean) {
  await db.domiciliario.update({ where: { usuarioId }, data: { disponible } });
}

/** Última posición conocida del domiciliario (para el mapa del administrador). */
export async function actualizarPosicion(usuarioId: string, latitud: number, longitud: number) {
  await db.domiciliario.update({ where: { usuarioId }, data: { latitud, longitud } });
}

/** Entregas que el domiciliario tiene en las manos: asignadas o en ruta. */
export async function activas(usuarioId: string): Promise<DomicilioVista[]> {
  const filas = await db.domicilio.findMany({
    where: { domiciliarioId: usuarioId, estado: { in: ["ASIGNADO", "EN_CURSO"] } },
    orderBy: [{ estado: "desc" }, { asignadoEn: "asc" }],
    select: campos,
  });
  return filas.map(aVista);
}

/** Domicilios pagados que nadie ha tomado, los más antiguos primero. */
export async function libres(limite = 20): Promise<DomicilioVista[]> {
  const filas = await db.domicilio.findMany({
    where: {
      estado: "SOLICITADO",
      domiciliarioId: null,
      OR: [{ pedido: { estado: { in: ["PAGADO", "PREPARANDO"] } } }, { alquiler: { estado: "ASIGNADO" } }],
    },
    orderBy: { creadaEn: "asc" },
    take: limite,
    select: campos,
  });
  return filas.map(aVista);
}

export async function historial(usuarioId: string, limite = 40): Promise<DomicilioVista[]> {
  const filas = await db.domicilio.findMany({
    where: { domiciliarioId: usuarioId, estado: "COMPLETADO" },
    orderBy: { entregadoEn: "desc" },
    take: limite,
    select: campos,
  });
  return filas.map(aVista);
}

export async function contarEntregadas(usuarioId: string, desde?: Date) {
  return db.domicilio.count({
    where: { domiciliarioId: usuarioId, estado: "COMPLETADO", ...(desde ? { entregadoEn: { gte: desde } } : {}) },
  });
}

/** Una entrega del domiciliario (null si no es suya). */
export async function buscarDe(id: string, usuarioId: string): Promise<DomicilioVista | null> {
  const f = await db.domicilio.findFirst({ where: { id, domiciliarioId: usuarioId }, select: campos });
  return f ? aVista(f) : null;
}
