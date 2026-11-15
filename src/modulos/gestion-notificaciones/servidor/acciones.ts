"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import type { NotificacionFila } from "../tipos";
import * as servicio from "./servicio";

/** Últimas novedades de quien inició sesión. */
export async function obtenerMisNotificaciones(): Promise<NotificacionFila[]> {
  const perfil = await requerirSesion();
  return servicio.recientes(perfil.id);
}

export async function marcarNotificacionesLeidasAccion(): Promise<void> {
  const perfil = await requerirSesion();
  await servicio.marcarLeidas(perfil.id);
  refresh();
}
