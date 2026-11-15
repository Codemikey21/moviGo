"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { AlquilerVista, EstadoServicio } from "../../tipos";
import { esquemaDestino } from "../domicilios/validaciones";
import * as servicio from "./servicio";
import { esquemaAlquiler, esquemaId } from "./validaciones";

/** Reserva el alquiler y lleva a la pasarela de pagos. */
export async function reservarAlquilerAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const perfil = await requerirSesion();
  const valores = {
    productoId: texto(formData, "productoId"),
    fechaInicio: texto(formData, "fechaInicio"),
    dias: texto(formData, "dias"),
    entrega: texto(formData, "entrega"),
    puntoId: texto(formData, "puntoId"),
    direccion: texto(formData, "direccion"),
    barrio: texto(formData, "barrio"),
    indicaciones: texto(formData, "indicaciones"),
  };
  const datos = esquemaAlquiler.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };

  let destino = null;
  if (datos.data.entrega === "A_DOMICILIO") {
    const d = esquemaDestino.safeParse(valores);
    if (!d.success) return { estado: "error", errores: erroresPorCampo(d.error), valores };
    destino = d.data;
  }

  let referencia: string;
  try {
    ({ referencia } = await servicio.crear(perfil.id, datos.data, destino));
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }
  redirect(`/pagar/${referencia}`);
}

export async function obtenerMisAlquileres(): Promise<AlquilerVista[]> {
  const perfil = await requerirSesion();
  return servicio.deCliente(perfil.id);
}

export async function obtenerMiAlquiler(id: string): Promise<AlquilerVista | null> {
  const perfil = await requerirSesion();
  if (!esquemaId.safeParse(id).success) return null;
  const alquiler = await servicio.detalle(id);
  return alquiler?.cliente.id === perfil.id ? alquiler : null;
}

export async function cancelarMiAlquilerAccion(formData: FormData): Promise<void> {
  const perfil = await requerirSesion();
  await servicio.cancelar(esquemaId.parse(texto(formData, "id")), perfil.id, perfil.id);
  refresh();
}

// ---------------------------------------------------------------------------
// Panel de administración
// ---------------------------------------------------------------------------

const ESTADOS: EstadoServicio[] = ["SOLICITADO", "ASIGNADO", "EN_CURSO", "COMPLETADO", "CANCELADO"];

export async function listarAlquileresAdmin(estado?: string): Promise<AlquilerVista[]> {
  await requerirAdministrador();
  const filtro = ESTADOS.find((e) => e === estado);
  return servicio.paraPanel(filtro ? [filtro] : undefined);
}

export async function conteosAlquileresAdmin() {
  await requerirAdministrador();
  return servicio.conteos();
}

/** Entregar, recibir devolución o cancelar un alquiler desde el panel. */
export async function gestionarAlquilerAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const admin = await requerirAdministrador();
  const id = esquemaId.safeParse(texto(formData, "id"));
  if (!id.success) return { estado: "error", mensaje: "Alquiler no válido." };
  try {
    switch (texto(formData, "accion")) {
      case "entregar":
        await servicio.marcarEntregado(id.data, admin.id);
        break;
      case "devolver":
        await servicio.recibirDevolucion(id.data, admin.id);
        break;
      case "cancelar":
        await servicio.cancelar(id.data, admin.id);
        break;
      default:
        return { estado: "error", mensaje: "Acción no válida." };
    }
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Alquiler actualizado." };
}
