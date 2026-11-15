import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { EstadoMantenimiento, MantenimientoVista, VehiculoPropio } from "../../tipos";

const campos = {
  id: true,
  tipo: true,
  descripcion: true,
  programadoPara: true,
  realizadoEn: true,
  costo: true,
  estado: true,
  creadoEn: true,
  solicitadoPor: { select: { usuario: { select: { id: true, nombre: true } } } },
  unidad: {
    select: {
      id: true,
      serial: true,
      producto: {
        select: {
          nombre: true,
          marca: true,
          categoria: { select: { slug: true } },
          medios: { where: { tipo: "FOTO" }, orderBy: { orden: "asc" }, take: 1, select: { id: true, url: true, textoAlt: true, orden: true } },
        },
      },
    },
  },
} satisfies Prisma.MantenimientoSelect;

type Fila = Prisma.MantenimientoGetPayload<{ select: typeof campos }>;

function aVista(f: Fila): MantenimientoVista {
  const p = f.unidad.producto;
  return {
    id: f.id,
    tipo: f.tipo,
    descripcion: f.descripcion,
    programadoPara: f.programadoPara,
    realizadoEn: f.realizadoEn,
    costo: Number(f.costo),
    estado: f.estado,
    creadoEn: f.creadoEn,
    cliente: f.solicitadoPor?.usuario ?? null,
    unidad: { id: f.unidad.id, serial: f.unidad.serial },
    producto: { nombre: p.nombre, marca: p.marca, categoria: p.categoria.slug, foto: p.medios[0] ?? null },
  };
}

/** Las unidades que el cliente compró y ya recibió. */
export async function vehiculosDelCliente(clienteId: string): Promise<VehiculoPropio[]> {
  const lineas = await db.lineaPedido.findMany({
    where: { pedido: { clienteId, estado: "ENTREGADO" }, unidadId: { not: null } },
    select: { unidad: { select: { id: true, serial: true, producto: { select: { nombre: true, marca: true, categoria: { select: { slug: true } } } } } } },
  });
  return lineas.flatMap((l) =>
    l.unidad
      ? [{ unidadId: l.unidad.id, serial: l.unidad.serial, nombre: l.unidad.producto.nombre, marca: l.unidad.producto.marca, categoria: l.unidad.producto.categoria.slug }]
      : [],
  );
}

export async function crear(datos: {
  unidadId: string;
  solicitadoPorId: string;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  descripcion: string;
  programadoPara: Date;
}) {
  const { id } = await db.mantenimiento.create({ data: datos, select: { id: true } });
  return id;
}

export async function listarDelCliente(clienteId: string): Promise<MantenimientoVista[]> {
  const filas = await db.mantenimiento.findMany({ where: { solicitadoPorId: clienteId }, orderBy: { creadoEn: "desc" }, select: campos });
  return filas.map(aVista);
}

export async function listar(): Promise<MantenimientoVista[]> {
  const filas = await db.mantenimiento.findMany({ orderBy: [{ estado: "asc" }, { programadoPara: "asc" }], take: 80, select: campos });
  return filas.map(aVista);
}

export async function buscar(id: string): Promise<MantenimientoVista | null> {
  const f = await db.mantenimiento.findUnique({ where: { id }, select: campos });
  return f ? aVista(f) : null;
}

export async function actualizar(id: string, datos: { estado: EstadoMantenimiento; costo?: number; realizadoEn?: Date }) {
  await db.mantenimiento.update({ where: { id }, data: datos });
}
