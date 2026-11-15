import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Carrito } from "../../tipos";

export async function obtener(clienteId: string): Promise<Carrito> {
  const carrito = await db.carrito.findUnique({
    where: { clienteId },
    select: {
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          cantidad: true,
          precioUnitario: true,
          color: { select: { id: true, nombre: true, hex: true } },
          producto: {
            select: {
              id: true,
              slug: true,
              nombre: true,
              marca: true,
              activo: true,
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
    },
  });

  const items = (carrito?.items ?? [])
    .filter((i) => i.producto.activo)
    .map((i) => ({
      id: i.id,
      productoId: i.producto.id,
      slug: i.producto.slug,
      nombre: i.producto.nombre,
      marca: i.producto.marca,
      categoria: i.producto.categoria.slug,
      foto: i.producto.medios[0] ?? null,
      cantidad: i.cantidad,
      precioUnitario: Number(i.precioUnitario),
      color: i.color,
    }));
  return {
    items,
    subtotal: items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
    unidades: items.reduce((s, i) => s + i.cantidad, 0),
  };
}

export async function contarUnidades(clienteId: string): Promise<number> {
  const resultado = await db.itemCarrito.aggregate({
    where: { carrito: { clienteId } },
    _sum: { cantidad: true },
  });
  return resultado._sum.cantidad ?? 0;
}

export async function cantidadDe(clienteId: string, productoId: string): Promise<number> {
  const item = await db.itemCarrito.findFirst({
    where: { carrito: { clienteId }, productoId },
    select: { cantidad: true },
  });
  return item?.cantidad ?? 0;
}

/** Suma unidades del producto (crea el carrito si no existe). Queda con el último color elegido. */
export async function agregar(datos: {
  clienteId: string;
  productoId: string;
  colorId: string | null;
  cantidad: number;
  precioUnitario: number;
}) {
  const carrito = await db.carrito.upsert({
    where: { clienteId: datos.clienteId },
    update: {},
    create: { clienteId: datos.clienteId },
    select: { id: true },
  });
  await db.itemCarrito.upsert({
    where: { carritoId_productoId: { carritoId: carrito.id, productoId: datos.productoId } },
    update: { cantidad: { increment: datos.cantidad }, precioUnitario: datos.precioUnitario, colorId: datos.colorId },
    create: {
      carritoId: carrito.id,
      productoId: datos.productoId,
      colorId: datos.colorId,
      cantidad: datos.cantidad,
      precioUnitario: datos.precioUnitario,
    },
  });
}

export async function cambiarCantidad(clienteId: string, itemId: string, cantidad: number) {
  await db.itemCarrito.updateMany({ where: { id: itemId, carrito: { clienteId } }, data: { cantidad } });
}

export async function quitar(clienteId: string, itemId: string) {
  await db.itemCarrito.deleteMany({ where: { id: itemId, carrito: { clienteId } } });
}

export async function vaciar(clienteId: string) {
  await db.itemCarrito.deleteMany({ where: { carrito: { clienteId } } });
}
