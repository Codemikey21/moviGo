import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { DomiciliarioVista, DomicilioVista, EstadoServicio } from "../../tipos";

const campos = {
  id: true,
  estado: true,
  costo: true,
  descripcionPaquete: true,
  creadaEn: true,
  asignadoEn: true,
  entregadoEn: true,
  pedidoId: true,
  alquilerId: true,
  pedido: { select: { numero: true, estado: true } },
  alquiler: { select: { estado: true } },
  cliente: { select: { usuario: { select: { id: true, nombre: true, telefono: true } } } },
  puntoOrigen: { select: { nombre: true, direccion: true, latitud: true, longitud: true } },
  origen: { select: { etiqueta: true, lineaDireccion: true, latitud: true, longitud: true } },
  destino: { select: { lineaDireccion: true, barrio: true, latitud: true, longitud: true } },
  domiciliario: {
    select: { vehiculo: true, usuario: { select: { id: true, nombre: true, telefono: true } } },
  },
} satisfies Prisma.DomicilioSelect;

type Fila = Prisma.DomicilioGetPayload<{ select: typeof campos }>;

function aVista(f: Fila): DomicilioVista {
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
    entregadoEn: f.entregadoEn,
    pedidoId: f.pedidoId,
    pedidoNumero: f.pedido?.numero ?? null,
    alquilerId: f.alquilerId,
    cliente: f.cliente.usuario,
    origen,
    destino: {
      direccion: f.destino.lineaDireccion,
      barrio: f.destino.barrio,
      latitud: Number(f.destino.latitud ?? 0),
      longitud: Number(f.destino.longitud ?? 0),
    },
    domiciliario: f.domiciliario
      ? { ...f.domiciliario.usuario, vehiculo: f.domiciliario.vehiculo }
      : null,
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
  datos: { estado?: EstadoServicio; domiciliarioId?: string; asignadoEn?: Date; entregadoEn?: Date },
) {
  await db.domicilio.update({ where: { id }, data: datos });
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
    select: { registradaEn: true },
  });
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
