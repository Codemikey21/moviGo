import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { AlquilerVista, EstadoServicio } from "../../tipos";

const campos = {
  id: true,
  estado: true,
  fechaInicio: true,
  fechaFin: true,
  entrega: true,
  codigoRecogida: true,
  total: true,
  creadaEn: true,
  cliente: { select: { usuario: { select: { id: true, nombre: true, correo: true } } } },
  puntoRecogida: { select: { id: true, nombre: true, direccion: true, horario: true } },
  unidad: {
    select: {
      id: true,
      serial: true,
      producto: {
        select: {
          id: true,
          slug: true,
          nombre: true,
          marca: true,
          categoria: { select: { slug: true } },
          medios: {
            where: { tipo: "FOTO" },
            orderBy: { orden: "asc" },
            take: 1,
            select: { id: true, url: true, textoAlt: true, orden: true },
          },
        },
      },
    },
  },
  pagos: { orderBy: { creadoEn: "desc" }, take: 1, select: { referencia: true, estado: true } },
  domicilios: { orderBy: { creadaEn: "desc" }, take: 1, select: { id: true } },
} satisfies Prisma.AlquilerSelect;

type Fila = Prisma.AlquilerGetPayload<{ select: typeof campos }>;

const DIA = 86_400_000;

function aVista(f: Fila): AlquilerVista {
  const { producto } = f.unidad;
  return {
    id: f.id,
    estado: f.estado,
    fechaInicio: f.fechaInicio,
    fechaFin: f.fechaFin,
    dias: Math.round((f.fechaFin.getTime() - f.fechaInicio.getTime()) / DIA),
    entrega: f.entrega,
    codigoRecogida: f.codigoRecogida,
    total: Number(f.total),
    creadaEn: f.creadaEn,
    cliente: f.cliente.usuario,
    producto: {
      id: producto.id,
      slug: producto.slug,
      nombre: producto.nombre,
      marca: producto.marca,
      categoria: producto.categoria.slug,
      foto: producto.medios[0] ?? null,
    },
    unidad: { id: f.unidad.id, serial: f.unidad.serial },
    punto: f.puntoRecogida,
    pagado: f.pagos[0]?.estado === "APROBADO" || ["ASIGNADO", "EN_CURSO", "COMPLETADO"].includes(f.estado),
    referenciaPago: f.pagos[0]?.referencia ?? null,
    domicilioId: f.domicilios[0]?.id ?? null,
  };
}

export async function crear(datos: {
  clienteId: string;
  unidadId: string;
  puntoRecogidaId: string;
  fechaInicio: Date;
  fechaFin: Date;
  entrega: "EN_PUNTO" | "A_DOMICILIO";
  codigoRecogida: string;
  total: number;
}): Promise<string> {
  const { id } = await db.alquiler.create({ data: datos, select: { id: true } });
  return id;
}

export async function codigoEnUso(codigo: string) {
  return (await db.alquiler.count({ where: { codigoRecogida: codigo } })) > 0;
}

export async function buscar(id: string): Promise<AlquilerVista | null> {
  const f = await db.alquiler.findUnique({ where: { id }, select: campos });
  return f ? aVista(f) : null;
}

export async function listarDelCliente(clienteId: string): Promise<AlquilerVista[]> {
  const filas = await db.alquiler.findMany({ where: { clienteId }, orderBy: { creadaEn: "desc" }, select: campos });
  return filas.map(aVista);
}

export async function listar(estados?: EstadoServicio[]): Promise<AlquilerVista[]> {
  const filas = await db.alquiler.findMany({
    where: estados ? { estado: { in: estados } } : undefined,
    orderBy: { creadaEn: "desc" },
    take: 80,
    select: campos,
  });
  return filas.map(aVista);
}

export async function cambiarEstado(id: string, desde: EstadoServicio[], hacia: EstadoServicio) {
  const { count } = await db.alquiler.updateMany({ where: { id, estado: { in: desde } }, data: { estado: hacia } });
  return count === 1;
}

export async function contarPorEstado() {
  const filas = await db.alquiler.groupBy({ by: ["estado"], _count: { _all: true } });
  return Object.fromEntries(filas.map((f) => [f.estado, f._count._all])) as Partial<Record<EstadoServicio, number>>;
}
