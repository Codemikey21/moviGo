"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { MantenimientoVista, VehiculoPropio } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaGestion, esquemaSolicitud } from "./validaciones";

export async function obtenerMisVehiculos(): Promise<VehiculoPropio[]> {
  const perfil = await requerirSesion();
  return servicio.vehiculos(perfil.id);
}

export async function obtenerMisMantenimientos(): Promise<MantenimientoVista[]> {
  const perfil = await requerirSesion();
  return servicio.deCliente(perfil.id);
}

export async function agendarMantenimientoAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const perfil = await requerirSesion();
  const valores = {
    unidadId: texto(formData, "unidadId"),
    tipo: texto(formData, "tipo") || "PREVENTIVO",
    programadoPara: texto(formData, "programadoPara"),
    descripcion: texto(formData, "descripcion"),
  };
  const datos = esquemaSolicitud.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };
  try {
    await servicio.agendar(perfil.id, datos.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Listo, quedó agendado. Te esperamos en el taller." };
}

export async function listarMantenimientosAdmin(): Promise<MantenimientoVista[]> {
  await requerirAdministrador();
  return servicio.paraPanel();
}

export async function gestionarMantenimientoAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await requerirAdministrador();
  const datos = esquemaGestion.safeParse({ id: formData.get("id"), accion: formData.get("accion"), costo: formData.get("costo") ?? "0" });
  if (!datos.success) return { estado: "error", mensaje: "Datos no válidos." };
  try {
    await servicio.gestionar(datos.data.id, datos.data.accion, datos.data.costo);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Actualizado." };
}
