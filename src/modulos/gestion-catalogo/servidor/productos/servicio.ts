import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
// Usa repositorio.ts para leer y escribir datos.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import type { FiltroCatalogo } from "../../tipos";
import * as repositorio from "./repositorio";
import type { ProductoValidado } from "./validaciones";

/** "Xiaomi" + "Electric Scooter 4 Pro" → "xiaomi-electric-scooter-4-pro" */
export function crearSlug(...partes: string[]) {
  return partes
    .join(" ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

/** Si el nombre ya existe (dos colores del mismo modelo), agrega -2, -3… */
async function slugLibre(base: string) {
  let slug = base;
  for (let n = 2; await repositorio.slugEnUso(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function catalogo(filtro: FiltroCatalogo) {
  return repositorio.listarProductos(filtro);
}

export function catalogoCompleto(filtro: FiltroCatalogo) {
  return repositorio.listarProductos({ ...filtro, incluirInactivos: true });
}

/** Ficha pública: un producto desactivado no se muestra. */
export async function fichaPublica(slug: string) {
  const producto = await repositorio.buscarPorSlug(slug);
  return producto?.activo ? producto : null;
}

export function productoPorId(id: string) {
  return repositorio.buscarPorId(id);
}

export async function crear(datos: ProductoValidado) {
  const slug = await slugLibre(crearSlug(datos.marca, datos.nombre));
  return repositorio.crearProducto({ ...datos, slug });
}

/** El slug no cambia al editar, así los enlaces que ya se compartieron siguen sirviendo. */
export async function actualizar(id: string, datos: ProductoValidado) {
  if (!(await repositorio.buscarPorId(id))) {
    throw new ErrorDominio("Ese producto ya no existe.", "no-existe");
  }
  await repositorio.actualizarProducto(id, datos);
}

export async function cambiarActivo(id: string, activo: boolean) {
  if (!(await repositorio.buscarPorId(id))) {
    throw new ErrorDominio("Ese producto ya no existe.", "no-existe");
  }
  await repositorio.cambiarActivo(id, activo);
}
