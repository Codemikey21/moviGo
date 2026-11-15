import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type { EstadoPedido, LineaVista, PedidoDetalle, PedidoResumen } from "../../tipos";

const campos = {
  id: true,
  numero: true,
  estado: true,
  entrega: true,
  subtotal: true,
  total: true,
  creadoEn: true,
  cliente: { select: { usuario: { select: { id: true, nombre: true, correo: true } } } },
  direccionEntrega: { select: { lineaDireccion: true, barrio: true, ciudad: true } },
  lineas: {
    select: {
      cantidad: true,
      precioUnitario: true,
      unidad: {
        select: {
          id: true,
          serial: true,
          puntoServicio: { select: { id: true, nombre: true, direccion: true, horario: true } },
        },
      },
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
  pagos: { orderBy: { creadoEn: "desc" }, take: 1, select: { referencia: true, estado: true, confirmadoEn: true } },
} satisfies Prisma.PedidoSelect;

type Fila = Prisma.PedidoGetPayload<{ select: typeof campos }>;

/** Una línea por producto (en la base hay una por unidad). */
function agrupar(f: Fila): LineaVista[] {
  const porProducto = new Map<string, LineaVista>();
  for (const l of f.lineas) {
    const actual = porProducto.get(l.producto.id);
    if (actual) {
      actual.cantidad += l.cantidad;
      if (l.unidad) actual.seriales.push(l.unidad.serial);
    } else {
      porProducto.set(l.producto.id, {
        productoId: l.producto.id,
        slug: l.producto.slug,
        nombre: l.producto.nombre,
        marca: l.producto.marca,
        categoria: l.producto.categoria.slug,
        foto: l.producto.medios[0] ?? null,
        cantidad: l.cantidad,
        precioUnitario: Number(l.precioUnitario),
        seriales: l.unidad ? [l.unidad.serial] : [],
      });
    }
  }
  return [...porProducto.values()];
}

function aDetalle(f: Fila): PedidoDetalle {
  const subtotal = Number(f.subtotal);
  const total = Number(f.total);
  const pago = f.pagos[0];
  return {
    id: f.id,
    numero: f.numero,
    estado: f.estado,
    entrega: f.entrega,
    total,
    subtotal,
    envio: total - subtotal,
    creadoEn: f.creadoEn,
    cliente: f.cliente.usuario,
    lineas: agrupar(f),
    direccion: f.direccionEntrega
      ? { linea: f.direccionEntrega.lineaDireccion, barrio: f.direccionEntrega.barrio, ciudad: f.direccionEntrega.ciudad }
      : null,
    punto: f.lineas.find((l) => l.unidad)?.unidad?.puntoServicio ?? null,
    unidadIds: f.lineas.flatMap((l) => (l.unidad ? [l.unidad.id] : [])),
    referenciaPago: pago?.referencia ?? null,
    pagadoEn: pago?.estado === "APROBADO" ? pago.confirmadoEn : null,
  };
}

function aResumen(f: Fila): PedidoResumen {
  const d = aDetalle(f);
  return {
    id: d.id,
    numero: d.numero,
    estado: d.estado,
    entrega: d.entrega,
    total: d.total,
    creadoEn: d.creadoEn,
    cliente: d.cliente,
    lineas: d.lineas,
  };
}

export async function numeroEnUso(numero: string) {
  return (await db.pedido.count({ where: { numero } })) > 0;
}

/** Crea el pedido (una línea por unidad) y, si es a domicilio, su dirección. */
export async function crear(datos: {
  numero: string;
  clienteId: string;
  entrega: "EN_PUNTO" | "A_DOMICILIO";
  subtotal: number;
  total: number;
  lineas: { productoId: string; unidadId: string; precioUnitario: number }[];
}): Promise<string> {
  const { id } = await db.pedido.create({
    data: {
      numero: datos.numero,
      clienteId: datos.clienteId,
      entrega: datos.entrega,
      subtotal: datos.subtotal,
      total: datos.total,
      lineas: { create: datos.lineas.map((l) => ({ ...l, cantidad: 1 })) },
    },
    select: { id: true },
  });
  return id;
}

export async function asignarDireccion(pedidoId: string, direccionId: string) {
  await db.pedido.update({ where: { id: pedidoId }, data: { direccionEntregaId: direccionId } });
}

export async function buscarPorId(id: string): Promise<PedidoDetalle | null> {
  const f = await db.pedido.findUnique({ where: { id }, select: campos });
  return f ? aDetalle(f) : null;
}

export async function buscarPorNumero(numero: string): Promise<PedidoDetalle | null> {
  const f = await db.pedido.findUnique({ where: { numero }, select: campos });
  return f ? aDetalle(f) : null;
}

export async function listarDelCliente(clienteId: string): Promise<PedidoResumen[]> {
  const filas = await db.pedido.findMany({ where: { clienteId }, orderBy: { creadoEn: "desc" }, select: campos });
  return filas.map(aResumen);
}

export async function listar(estados?: EstadoPedido[]): Promise<PedidoResumen[]> {
  const filas = await db.pedido.findMany({
    where: estados ? { estado: { in: estados } } : undefined,
    orderBy: { creadoEn: "desc" },
    take: 80,
    select: campos,
  });
  return filas.map(aResumen);
}

/** Cambia el estado solo si está en uno de los esperados. */
export async function cambiarEstado(id: string, desde: EstadoPedido[], hacia: EstadoPedido) {
  const { count } = await db.pedido.updateMany({ where: { id, estado: { in: desde } }, data: { estado: hacia } });
  return count === 1;
}

export async function contarPorEstado() {
  const filas = await db.pedido.groupBy({ by: ["estado"], _count: { _all: true } });
  return Object.fromEntries(filas.map((f) => [f.estado, f._count._all])) as Partial<Record<EstadoPedido, number>>;
}
