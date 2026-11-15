import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { randomInt } from "node:crypto";
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { DomiciliarioVista, DomicilioVista, EstadoServicio } from "../../tipos";

export const campos = {
  id: true,
  estado: true,
  costo: true,
  codigoEntrega: true,
  descripcionPaquete: true,
  creadaEn: true,
  asignadoEn: true,
  aceptadoEn: true,
  entregadoEn: true,
  pedidoId: true,
  alquilerId: true,
  pedido: { select: { numero: true, estado: true } },
  alquiler: { select: { estado: true } },
  cliente: { select: { usuario: { select: { id: true, nombre: true, telefono: true } } } },
  puntoOrigen: { select: { nombre: true, direccion: true, latitud: true, longitud: true } },
  origen: { select: { etiqueta: true, lineaDireccion: true, latitud: true, longitud: true } },
  destino: { select: { etiqueta: true, lineaDireccion: true, barrio: true, latitud: true, longitud: true } },
  domiciliario: {
    select: { vehiculo: true, usuario: { select: { id: true, nombre: true, telefono: true } } },
  },
} satisfies Prisma.DomicilioSelect;

export type Fila = Prisma.DomicilioGetPayload<{ select: typeof campos }>;

export function aVista(f: Fila): DomicilioVista {
  const origen = f.puntoOrigen
    ? { nombre: f.puntoOrigen.nombre, direccion: f.puntoOrigen.direccion, latitud: Number(f.puntoOrigen.latitud), longitud: Number(f.puntoOrigen.longitud) }
    : {
        nombre: f.origen?.etiqueta ?? "Origen",
        direccion: f.origen?.lineaDireccion ?? "",
        latitud: Number(f.origen?.latitud ?? 0),
        longitud: Number(f.origen?.longitud ?? 0),
      };
  return {
    id: f.id,
    estado: f.estado,
    costo: Number(f.costo),
    descripcion: f.descripcionPaquete,
    creadaEn: f.creadaEn,
    asignadoEn: f.asignadoEn,
    aceptadoEn: f.aceptadoEn,
    entregadoEn: f.entregadoEn,
    pedidoId: f.pedidoId,
    pedidoNumero: f.pedido?.numero ?? null,
    alquilerId: f.alquilerId,
    cliente: f.cliente.usuario,
    origen,
    destino: {
      direccion: f.destino.lineaDireccion,
      barrio: f.destino.barrio,
      // La etiqueta de la dirección de entrega es "Entrega · <indicaciones>"
      indicaciones: f.destino.etiqueta.replace(/^Entrega( · )?/, ""),
      latitud: Number(f.destino.latitud ?? 0),
      longitud: Number(f.destino.longitud ?? 0),
    },
    domiciliario: f.domiciliario
      ? { ...f.domiciliario.usuario, vehiculo: f.domiciliario.vehiculo }
      : null,
    codigoEntrega: f.codigoEntrega,
    listoParaDespachar:
      (f.pedido ? ["PAGADO", "PREPARANDO"].includes(f.pedido.estado) : false) ||
      (f.alquiler ? f.alquiler.estado === "ASIGNADO" : false),
  };
}

/** Crea la dirección de destino y el domicilio en una sola transacción. */
export async function crear(datos: {
  clienteId: string;
  pedidoId?: string;
  alquilerId?: string;
  puntoOrigenId: string;
  destino: { linea: string; barrio: string; ciudad: string; latitud: number; longitud: number; indicaciones: string };
  descripcion: string;
  costo: number;
}): Promise<{ domicilioId: string; direccionId: string }> {
  return db.$transaction(async (tx) => {
    const destino = await tx.direccion.create({
      data: {
        clienteId: datos.clienteId,
        etiqueta: datos.destino.indicaciones ? `Entrega · ${datos.destino.indicaciones}` : "Entrega",
        lineaDireccion: datos.destino.linea,
        barrio: datos.destino.barrio,
        ciudad: datos.destino.ciudad,
        latitud: datos.destino.latitud,
        longitud: datos.destino.longitud,
      },
      select: { id: true },
    });
    const domicilio = await tx.domicilio.create({
      data: {
        clienteId: datos.clienteId,
        pedidoId: datos.pedidoId,
        alquilerId: datos.alquilerId,
        puntoOrigenId: datos.puntoOrigenId,
        destinoId: destino.id,
        descripcionPaquete: datos.descripcion,
        costo: datos.costo,
        codigoEntrega: String(randomInt(0, 10_000)).padStart(4, "0"),
      },
      select: { id: true },
    });
    return { domicilioId: domicilio.id, direccionId: destino.id };
  });
}

export async function buscar(id: string): Promise<DomicilioVista | null> {
  const f = await db.domicilio.findUnique({ where: { id }, select: campos });
  return f ? aVista(f) : null;
}

export async function buscarPorPedido(pedidoId: string): Promise<DomicilioVista | null> {
  const f = await db.domicilio.findFirst({ where: { pedidoId }, orderBy: { creadaEn: "desc" }, select: campos });
  return f ? aVista(f) : null;
}

export async function buscarPorAlquiler(alquilerId: string): Promise<DomicilioVista | null> {
  const f = await db.domicilio.findFirst({ where: { alquilerId }, orderBy: { creadaEn: "desc" }, select: campos });
  return f ? aVista(f) : null;
}

/** Domicilios para el panel: los que están en juego primero. */
export async function listar(estados: EstadoServicio[]): Promise<DomicilioVista[]> {
  const filas = await db.domicilio.findMany({
    where: { estado: { in: estados } },
    orderBy: { creadaEn: "desc" },
    take: 60,
    select: campos,
  });
  return filas.map(aVista);
}

export async function actualizar(
  id: string,
  datos: {
    estado?: EstadoServicio;
    domiciliarioId?: string | null;
    asignadoEn?: Date | null;
    aceptadoEn?: Date | null;
    entregadoEn?: Date;
  },
) {
  await db.domicilio.update({ where: { id }, data: datos });
}

/**
 * Cambia el domicilio solo si sigue como se espera (por ejemplo, que nadie
 * más lo haya tomado). Devuelve false si otro llegó primero.
 */
export async function actualizarSi(
  id: string,
  condicion: { estado: EstadoServicio; domiciliarioId?: string | null; aceptado?: boolean },
  datos: Parameters<typeof actualizar>[1],
): Promise<boolean> {
  const { count } = await db.domicilio.updateMany({
    where: {
      id,
      estado: condicion.estado,
      ...(condicion.domiciliarioId !== undefined ? { domiciliarioId: condicion.domiciliarioId } : {}),
      ...(condicion.aceptado !== undefined ? { aceptadoEn: condicion.aceptado ? { not: null } : null } : {}),
    },
    data: datos,
  });
  return count > 0;
}

export async function cancelarDe(filtro: { pedidoId?: string; alquilerId?: string }) {
  await db.domicilio.updateMany({
    where: { ...filtro, estado: { in: ["SOLICITADO", "ASIGNADO"] } },
    data: { estado: "CANCELADO" },
  });
}

/** Primer punto del recorrido: marca cuándo salió el domiciliario. */
export async function registrarUbicacion(domicilioId: string, latitud: number, longitud: number) {
  await db.registroUbicacion.create({ data: { domicilioId, latitud, longitud } });
}

export async function primeraUbicacion(domicilioId: string) {
  return db.registroUbicacion.findFirst({
    where: { domicilioId },
    orderBy: { registradaEn: "asc" },
    select: { id: true, registradaEn: true },
  });
}

/** Última posición registrada (la del GPS del domiciliario, si la comparte). */
export async function ultimaUbicacion(domicilioId: string) {
  const f = await db.registroUbicacion.findFirst({
    where: { domicilioId },
    orderBy: { registradaEn: "desc" },
    select: { id: true, latitud: true, longitud: true, registradaEn: true },
  });
  return f ? { id: f.id, latitud: Number(f.latitud), longitud: Number(f.longitud), registradaEn: f.registradaEn } : null;
}

/** Foto de la entrega (la ruta dentro del bucket privado "evidencias"). */
export async function guardarEvidencia(domicilioId: string, ruta: string, nombreReceptor: string | null) {
  await db.evidencia.create({ data: { domicilioId, tipo: "FOTO", url: ruta, nombreReceptor } });
}

export async function evidenciasDe(domicilioIds: string[]) {
  if (domicilioIds.length === 0) return new Map<string, { ruta: string; nombreReceptor: string | null }>();
  const filas = await db.evidencia.findMany({
    where: { domicilioId: { in: domicilioIds } },
    orderBy: { tomadaEn: "desc" },
    select: { domicilioId: true, url: true, nombreReceptor: true },
  });
  const mapa = new Map<string, { ruta: string; nombreReceptor: string | null }>();
  for (const f of filas) if (!mapa.has(f.domicilioId)) mapa.set(f.domicilioId, { ruta: f.url, nombreReceptor: f.nombreReceptor });
  return mapa;
}

export async function listarDomiciliarios(): Promise<DomiciliarioVista[]> {
  const filas = await db.domiciliario.findMany({
    orderBy: { usuario: { nombre: "asc" } },
    select: {
      vehiculo: true,
      disponible: true,
      usuario: { select: { id: true, nombre: true } },
      _count: { select: { domicilios: { where: { estado: { in: ["ASIGNADO", "EN_CURSO"] } } } } },
    },
  });
  return filas.map((d) => ({
    id: d.usuario.id,
    nombre: d.usuario.nombre,
    vehiculo: d.vehiculo,
    disponible: d.disponible,
    enCurso: d._count.domicilios,
  }));
}
