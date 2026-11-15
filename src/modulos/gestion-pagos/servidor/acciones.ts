"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import { erroresPorCampo } from "@/compartido/utilidades/formularios";
import type { PagoParaPagar, ResultadoPago } from "../tipos";
import * as servicio from "./servicio";
import { esquemaCobro, esquemaReferencia } from "./validaciones";

export async function obtenerPago(referencia: string): Promise<PagoParaPagar | null> {
  const perfil = await requerirSesion();
  if (!esquemaReferencia.safeParse(referencia).success) return null;
  return servicio.paraPagar(referencia, perfil.id);
}

/** Paga con tarjeta, Nequi o PSE en la pasarela (simulada). */
export async function pagarAccion(referencia: string, datos: Record<string, string>): Promise<ResultadoPago> {
  const perfil = await requerirSesion();
  if (!esquemaReferencia.safeParse(referencia).success) return { estado: "ERROR", mensaje: "Pago no válido." };

  const cobro = esquemaCobro.safeParse(datos);
  if (!cobro.success) {
    return { estado: "ERROR", mensaje: "Revisa los datos marcados.", errores: erroresPorCampo(cobro.error) };
  }

  try {
    return await servicio.pagar(referencia, perfil.id, cobro.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "ERROR", mensaje: error.message };
    throw error;
  }
}

/** Ingresos del mes, totales y de los últimos 14 días (panel de administración). */
export async function obtenerResumenIngresos() {
  await requerirAdministrador();
  return servicio.resumenIngresos();
}
