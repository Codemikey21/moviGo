"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { EmpresaVista, SolicitudVista } from "../tipos";
import * as servicio from "./servicio";
import { esquemaCotizacion, esquemaEmpresa, esquemaRespuesta, esquemaSolicitud } from "./validaciones";

export async function obtenerMiEmpresa(): Promise<{ empresa: EmpresaVista | null; solicitudes: SolicitudVista[] }> {
  const perfil = await requerirSesion();
  const [empresa, solicitudes] = await Promise.all([servicio.empresaDe(perfil.id), servicio.solicitudesDe(perfil.id)]);
  return { empresa, solicitudes };
}

export async function solicitarCotizacionAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const perfil = await requerirSesion();
  const valores = Object.fromEntries(
    ["razonSocial", "nit", "sector", "cargo", "tipo", "cantidad", "desde", "hasta", "notas"].map((c) => [c, texto(formData, c)]),
  );
  const datos = esquemaSolicitud.safeParse(valores);
  const conEmpresa = formData.get("conEmpresa") === "1";
  const empresa = conEmpresa ? null : esquemaEmpresa.safeParse(valores);
  if (!datos.success || (empresa && !empresa.success)) {
    return {
      estado: "error",
      errores: { ...(datos.success ? {} : erroresPorCampo(datos.error)), ...(empresa && !empresa.success ? erroresPorCampo(empresa.error) : {}) },
      valores,
    };
  }
  try {
    await servicio.solicitar(perfil.id, empresa?.success ? empresa.data : null, datos.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Solicitud enviada. Te avisamos cuando esté la cotización." };
}

export async function responderCotizacionAccion(formData: FormData): Promise<void> {
  const perfil = await requerirSesion();
  const datos = esquemaRespuesta.parse({ solicitudId: formData.get("solicitudId"), respuesta: formData.get("respuesta") });
  await servicio.responder(perfil.id, datos.solicitudId, datos.respuesta);
  refresh();
}

export async function listarSolicitudesAdmin(): Promise<SolicitudVista[]> {
  await requerirAdministrador();
  return servicio.paraPanel();
}

export async function cotizarAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await requerirAdministrador();
  const datos = esquemaCotizacion.safeParse({
    solicitudId: formData.get("solicitudId"),
    valor: texto(formData, "valor"),
    descuento: texto(formData, "descuento") || "0",
    validaHasta: texto(formData, "validaHasta"),
  });
  if (!datos.success) return { estado: "error", mensaje: Object.values(erroresPorCampo(datos.error))[0] ?? "Revisa los datos." };
  try {
    await servicio.cotizar(datos.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Cotización enviada." };
}
