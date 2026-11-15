import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { Prisma } from "@/generated/prisma/client";
import type {
  Especificacion,
  FiltroCatalogo,
  Modalidad,
  ProductoDetalle,
  ProductoResumen,
} from "../../tipos";

const camposResumen = {
  id: true,
  slug: true,
  nombre: true,
  marca: true,
  modelo: true,
  precioVenta: true,
  tarifaAlquilerDia: true,
  modalidades: true,
  activo: true,
  categoria: { select: { slug: true, nombre: true } },
  medios: {
    where: { tipo: "FOTO" },
    orderBy: { orden: "asc" },
    take: 1,
    select: { id: true, url: true, textoAlt: true, orden: true },
  },
} satisfies Prisma.ProductoSelect;

const camposDetalle = {
  ...camposResumen,
  descripcion: true,
  especificaciones: true,
  medios: {
    where: { tipo: "FOTO" },
    orderBy: { orden: "asc" },
    select: { id: true, url: true, textoAlt: true, orden: true },
  },
} satisfies Prisma.ProductoSelect;

type FilaResumen = Prisma.ProductoGetPayload<{ select: typeof camposResumen }>;
type FilaDetalle = Prisma.ProductoGetPayload<{ select: typeof camposDetalle }>;

// Prisma devuelve los precios como Decimal; la interfaz recibe number.
function aResumen({ medios, precioVenta, tarifaAlquilerDia, ...p }: FilaResumen): ProductoResumen {
  return {
    ...p,
    precioVenta: Number(precioVenta),
    tarifaAlquilerDia: tarifaAlquilerDia === null ? null : Number(tarifaAlquilerDia),
    foto: medios[0] ?? null,
  };
}

function aDetalle(fila: FilaDetalle): ProductoDetalle {
  const { medios, descripcion, especificaciones } = fila;
  return {
    ...aResumen({ ...fila, medios: medios.slice(0, 1) }),
    descripcion,
    especificaciones: leerEspecificaciones(especificaciones),
    fotos: medios,
  };
}

/** La columna es JSON libre: se toman solo las filas con la forma esperada. */
function leerEspecificaciones(valor: Prisma.JsonValue): Especificacion[] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((fila) =>
    fila &&
    typeof fila === "object" &&
    !Array.isArray(fila) &&
    typeof fila.etiqueta === "string" &&
    typeof fila.valor === "string"
      ? [{ etiqueta: fila.etiqueta, valor: fila.valor }]
      : [],
  );
}

export async function listarProductos(
  filtro: FiltroCatalogo & { incluirInactivos?: boolean },
): Promise<ProductoResumen[]> {
  const busqueda = filtro.busqueda?.trim();
  const filas = await db.producto.findMany({
    where: {
      activo: filtro.incluirInactivos ? undefined : true,
      categoria: filtro.categoria ? { slug: filtro.categoria } : undefined,
      modalidades: filtro.modalidad ? { has: filtro.modalidad } : undefined,
      OR: busqueda
        ? [
            { nombre: { contains: busqueda, mode: "insensitive" } },
            { marca: { contains: busqueda, mode: "insensitive" } },
            { modelo: { contains: busqueda, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: [{ categoria: { orden: "asc" } }, { precioVenta: "asc" }],
    select: camposResumen,
  });
  return filas.map(aResumen);
}

export async function buscarPorSlug(slug: string): Promise<ProductoDetalle | null> {
  const fila = await db.producto.findUnique({ where: { slug }, select: camposDetalle });
  return fila ? aDetalle(fila) : null;
}

export async function buscarPorId(id: string): Promise<(ProductoDetalle & { categoriaId: string }) | null> {
  const fila = await db.producto.findUnique({
    where: { id },
    select: { ...camposDetalle, categoriaId: true },
  });
  return fila ? { ...aDetalle(fila), categoriaId: fila.categoriaId } : null;
}

export async function slugEnUso(slug: string): Promise<boolean> {
  return (await db.producto.count({ where: { slug } })) > 0;
}

export type DatosProducto = {
  categoriaId: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precioVenta: number;
  tarifaAlquilerDia: number | null;
  modalidades: Modalidad[];
  especificaciones: Especificacion[];
};

export async function crearProducto(datos: DatosProducto & { slug: string }): Promise<string> {
  const { id } = await db.producto.create({ data: datos, select: { id: true } });
  return id;
}

export async function actualizarProducto(id: string, datos: DatosProducto): Promise<void> {
  await db.producto.update({ where: { id }, data: datos });
}

export async function cambiarActivo(id: string, activo: boolean): Promise<void> {
  await db.producto.update({ where: { id }, data: { activo } });
}
