import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { EmpresaVista, EstadoSolicitud, SolicitudVista, TipoSolicitud } from "../tipos";

const campos = {
  id: true,
  tipo: true,
  cantidad: true,
  desde: true,
  hasta: true,
  estado: true,
  notas: true,
  creadaEn: true,
  empresa: { select: { razonSocial: true, nit: true } },
  contacto: { select: { cargo: true, cliente: { select: { usuario: { select: { nombre: true, correo: true } } } } } },
  cotizacion: { select: { valor: true, descuentoAplicado: true, validaHasta: true } },
} satisfies Prisma.SolicitudCorporativaSelect;

type Fila = Prisma.SolicitudCorporativaGetPayload<{ select: typeof campos }>;

function aVista(f: Fila): SolicitudVista {
  return {
    id: f.id,
    tipo: f.tipo,
    cantidad: f.cantidad,
    desde: f.desde,
    hasta: f.hasta,
    estado: f.estado,
    notas: f.notas,
    creadaEn: f.creadaEn,
    empresa: f.empresa,
    contacto: f.contacto ? { ...f.contacto.cliente.usuario, cargo: f.contacto.cargo } : null,
    cotizacion: f.cotizacion
      ? { valor: Number(f.cotizacion.valor), descuento: Number(f.cotizacion.descuentoAplicado), validaHasta: f.cotizacion.validaHasta }
      : null,
  };
}

export async function empresaDe(clienteId: string): Promise<EmpresaVista | null> {
  const c = await db.contactoEmpresa.findUnique({
    where: { clienteId },
    select: { cargo: true, empresa: { select: { id: true, razonSocial: true, nit: true, sector: true } } },
  });
  return c ? { ...c.empresa, cargo: c.cargo } : null;
}

/** Crea (o reutiliza por NIT) la empresa y deja al cliente como su contacto. */
export async function registrar(clienteId: string, datos: { razonSocial: string; nit: string; sector: string | null; cargo: string }) {
  const empresa = await db.empresa.upsert({
    where: { nit: datos.nit },
    update: {},
    create: { razonSocial: datos.razonSocial, nit: datos.nit, sector: datos.sector },
    select: { id: true },
  });
  await db.contactoEmpresa.upsert({
    where: { clienteId },
    update: { empresaId: empresa.id, cargo: datos.cargo },
    create: { clienteId, empresaId: empresa.id, cargo: datos.cargo },
  });
  return empresa.id;
}

export async function crearSolicitud(datos: {
  empresaId: string;
  contactoId: string;
  tipo: TipoSolicitud;
  cantidad: number;
  desde: Date;
  hasta: Date;
  notas: string | null;
}) {
  await db.solicitudCorporativa.create({ data: { ...datos, estado: "ENVIADA" } });
}

export async function listarDeEmpresa(empresaId: string): Promise<SolicitudVista[]> {
  const filas = await db.solicitudCorporativa.findMany({ where: { empresaId }, orderBy: { creadaEn: "desc" }, select: campos });
  return filas.map(aVista);
}

export async function listar(): Promise<SolicitudVista[]> {
  const filas = await db.solicitudCorporativa.findMany({ orderBy: { creadaEn: "desc" }, take: 80, select: campos });
  return filas.map(aVista);
}

export async function buscar(id: string) {
  return db.solicitudCorporativa.findUnique({
    where: { id },
    select: { id: true, estado: true, empresaId: true, contactoId: true, cotizacion: { select: { id: true } } },
  });
}

export async function cotizar(solicitudId: string, datos: { valor: number; descuentoAplicado: number; validaHasta: Date }) {
  await db.cotizacion.upsert({ where: { solicitudId }, update: datos, create: { solicitudId, ...datos } });
}

export async function cambiarEstado(id: string, estado: EstadoSolicitud) {
  await db.solicitudCorporativa.update({ where: { id }, data: { estado } });
}
