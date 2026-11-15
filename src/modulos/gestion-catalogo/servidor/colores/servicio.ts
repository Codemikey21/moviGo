import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import * as repositorio from "./repositorio";
import { MAX_COLORES } from "./validaciones";

export const coloresDe = (productoId: string) => repositorio.listar(productoId);

export async function agregar(datos: { productoId: string; nombre: string; hex: string }) {
  const actuales = await repositorio.listar(datos.productoId);
  if (actuales.length >= MAX_COLORES) {
    throw new ErrorDominio(`Cada producto puede tener máximo ${MAX_COLORES} colores.`, "maximo");
  }
  if (await repositorio.nombreEnUso(datos.productoId, datos.nombre)) {
    throw new ErrorDominio("Ese producto ya tiene un color con ese nombre.", "repetido");
  }
  await repositorio.crear(datos);
}

export const borrar = (id: string) => repositorio.borrar(id);

/** Para otros módulos: confirma que el color es de ese producto. */
export async function validarColor(productoId: string, colorId: string | null) {
  if (colorId && !(await repositorio.existe(colorId, productoId))) {
    throw new ErrorDominio("Ese color no es de este producto.", "color");
  }
}
