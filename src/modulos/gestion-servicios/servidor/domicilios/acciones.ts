"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { texto } from "@/compartido/utilidades/formularios";
import type { DomiciliarioVista, DomicilioVista, Seguimiento } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaAsignar, esquemaId } from "./validaciones";

const esAdmin = (rol: string) => rol === "ADMIN_SISTEMA" || rol === "ADMIN_PUNTO";

/** El domicilio de un pedido o un alquiler (solo su dueño o un administrador). */
export async function obtenerDomicilio(filtro: { pedidoId?: string; alquilerId?: string }): Promise<DomicilioVista | null> {
  const perfil = await requerirSesion();
  const domicilio = filtro.pedidoId
    ? await servicio.dePedido(filtro.pedidoId)
    : filtro.alquilerId
      ? await servicio.deAlquiler(filtro.alquilerId)
      : null;
  if (!domicilio) return null;
  return domicilio.cliente.id === perfil.id || esAdmin(perfil.rol) ? domicilio : null;
}

/** Ruta y posición del domiciliario. La pantalla la pide cada pocos segundos. */
export async function obtenerSeguimiento(domicilioId: string): Promise<Seguimiento | null> {
  const perfil = await requerirSesion();
  if (!esquemaId.safeParse(domicilioId).success) return null;
  const domicilio = await servicio.detalle(domicilioId);
  if (!domicilio || (domicilio.cliente.id !== perfil.id && !esAdmin(perfil.rol))) return null;
  return servicio.seguimiento(domicilioId);
}

// ---------------------------------------------------------------------------
// Panel de administración
// ---------------------------------------------------------------------------

export async function listarDomiciliosAdmin(): Promise<DomicilioVista[]> {
  await requerirAdministrador();
  return servicio.paraPanel();
}

export async function listarDomiciliariosAdmin(): Promise<DomiciliarioVista[]> {
  await requerirAdministrador();
  return servicio.domiciliarios();
}

/** Asignar domiciliario, salir a ruta o marcar entregado. */
export async function gestionarDomicilioAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const admin = await requerirAdministrador();
  const accion = texto(formData, "accion");
  try {
    if (accion === "asignar") {
      const datos = esquemaAsignar.safeParse({
        domicilioId: texto(formData, "domicilioId"),
        domiciliarioId: texto(formData, "domiciliarioId"),
      });
      if (!datos.success) return { estado: "error", mensaje: "Elige un domiciliario." };
      await servicio.asignar(datos.data.domicilioId, datos.data.domiciliarioId);
    } else {
      const id = esquemaId.parse(texto(formData, "domicilioId"));
      if (accion === "salir") await servicio.iniciarRuta(id);
      else if (accion === "entregar") await servicio.completar(id, admin.id);
      else return { estado: "error", mensaje: "Acción no válida." };
    }
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Domicilio actualizado." };
}
