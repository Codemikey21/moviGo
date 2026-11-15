"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import { idUsuarioActual } from "@/modulos/gestion-usuarios/servidor/servicio";
import type { MensajeContactoFila, NotificacionFila } from "../tipos";
import * as servicio from "./servicio";
import { esquemaBoletin, esquemaContacto, esquemaId } from "./validaciones";

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

/* --- Contacto (público) --- */

export async function enviarMensajeContactoAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  // Campo trampa: las personas no lo ven; los robots lo llenan
  if (texto(formData, "sitio")) return { estado: "exito", mensaje: "¡Gracias! Te respondemos pronto." };

  const valores = Object.fromEntries(["nombre", "correo", "telefono", "motivo", "mensaje"].map((c) => [c, texto(formData, c)]));
  const datos = esquemaContacto.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };

  await servicio.recibirMensaje(datos.data, await idUsuarioActual());
  return {
    estado: "exito",
    mensaje: `¡Gracias, ${datos.data.nombre.split(" ")[0]}! Te respondemos a ${datos.data.correo} en menos de un día hábil.`,
  };
}

/* --- Boletín (público) --- */

export async function suscribirBoletinAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const valores = { correo: texto(formData, "correo") };
  const datos = esquemaBoletin.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };

  const nuevo = await servicio.suscribir(datos.data.correo);
  return {
    estado: "exito",
    correo: datos.data.correo,
    mensaje: nuevo ? "Listo, ya estás en la lista. Te escribimos con lo nuevo." : "Ese correo ya estaba en la lista. ¡Gracias!",
  };
}

/* --- Panel de administración --- */

export async function listarMensajesAdmin(atendidos: boolean): Promise<MensajeContactoFila[]> {
  await requerirAdministrador();
  return servicio.mensajes(atendidos);
}

export async function resumenBuzonAdmin() {
  await requerirAdministrador();
  const [mensajes, suscriptores] = await Promise.all([servicio.conteoMensajes(), servicio.suscriptores()]);
  return { ...mensajes, suscriptores };
}

export async function marcarMensajeAtendidoAccion(formData: FormData): Promise<void> {
  await requerirAdministrador();
  const id = esquemaId.parse(formData.get("id"));
  await servicio.marcarAtendido(id, formData.get("atendido") !== "0");
  refresh();
}
