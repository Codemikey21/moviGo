"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// Son de lectura y públicas: el catálogo muestra dónde hay unidades.
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import type { DisponibilidadColor, DisponibilidadPunto, EstadoUnidad, PuntoResumen } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaIds } from "./validaciones";

/** Puntos de servicio activos (para el mapa y para elegir dónde recoger). */
export async function obtenerPuntos(): Promise<PuntoResumen[]> {
  return servicio.puntos();
}

/** Cuántas unidades de un producto (y de un color, si se pide) hay disponibles en cada punto. */
export async function obtenerDisponibilidad(productoId: string, colorId: string | null = null): Promise<DisponibilidadPunto[]> {
  const resultado = esquemaIds.safeParse(colorId ? [productoId, colorId] : [productoId]);
  return resultado.success ? servicio.disponibilidad(productoId, colorId) : [];
}

/** Unidades de un producto por color y punto (para el configurador). */
export async function obtenerDisponibilidadPorColor(productoId: string): Promise<DisponibilidadColor[]> {
  const resultado = esquemaIds.safeParse([productoId]);
  return resultado.success ? servicio.disponibilidadPorColor(productoId) : [];
}

/** Disponibles y total de varios productos (para las tarjetas del catálogo). */
export async function obtenerConteos(
  productoIds: string[],
): Promise<Record<string, { disponibles: number; total: number }>> {
  const resultado = esquemaIds.safeParse(productoIds);
  return resultado.success ? servicio.conteos(resultado.data) : {};
}

/** Unidades por producto, punto y estado (panel de administración). */
export async function obtenerInventarioDetallado(): Promise<
  { productoId: string; puntoId: string; estado: EstadoUnidad; cantidad: number }[]
> {
  await requerirAdministrador();
  return servicio.detallado();
}

/** Unidades en cada estado en toda la red (panel de administración). */
export async function obtenerUnidadesPorEstado(): Promise<Partial<Record<EstadoUnidad, number>>> {
  await requerirAdministrador();
  return servicio.porEstado();
}
