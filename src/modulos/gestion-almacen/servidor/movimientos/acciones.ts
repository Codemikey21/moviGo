"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import type { MovimientoFila } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaProductoId } from "./validaciones";

/** Últimos movimientos de inventario de un producto (panel de administración). */
export async function listarMovimientosAdmin(productoId: string): Promise<MovimientoFila[]> {
  await requerirAdministrador();
  if (!esquemaProductoId.safeParse(productoId).success) return [];
  return servicio.historial(productoId);
}
