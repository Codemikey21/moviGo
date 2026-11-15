"use server";

// Server Actions del portal del domiciliario. Todas exigen el rol DOMICILIARIO.
import { refresh } from "next/cache";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { EntregaReparto, PerfilReparto, ResumenReparto } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaAccion, esquemaEntrega, esquemaId, esquemaPosicion } from "./validaciones";

const requerirDomiciliario = () => requerirRol("DOMICILIARIO");

export async function obtenerInicioReparto(): Promise<{
  perfil: PerfilReparto;
  resumen: ResumenReparto;
  activas: EntregaReparto[];
  libres: EntregaReparto[];
}> {
  const { id } = await requerirDomiciliario();
  const [perfil, resumen, activas, libres] = await Promise.all([
    servicio.perfil(id),
    servicio.resumen(id),
    servicio.activas(id),
    servicio.libres(id),
  ]);
  return { perfil, resumen, activas, libres };
}

export async function obtenerPerfilReparto(): Promise<PerfilReparto> {
  const { id } = await requerirDomiciliario();
  return servicio.perfil(id);
}

export async function obtenerEntregaReparto(domicilioId: string): Promise<EntregaReparto | null> {
  const { id } = await requerirDomiciliario();
  if (!esquemaId.safeParse(domicilioId).success) return null;
  return servicio.entrega(domicilioId, id);
}

export async function obtenerHistorialReparto(): Promise<{ resumen: ResumenReparto; entregas: EntregaReparto[] }> {
  const { id } = await requerirDomiciliario();
  const [resumen, entregas] = await Promise.all([servicio.resumen(id), servicio.historial(id)]);
  return { resumen, entregas };
}

export async function cambiarDisponibleAccion(formData: FormData): Promise<void> {
  const { id } = await requerirDomiciliario();
  await servicio.cambiarDisponible(id, formData.get("disponible") === "1");
  refresh();
}

/** Tomar, aceptar, rechazar o salir a ruta. */
export async function accionRepartoAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { id } = await requerirDomiciliario();
  const datos = esquemaAccion.safeParse({ domicilioId: texto(formData, "domicilioId"), accion: texto(formData, "accion") });
  if (!datos.success) return { estado: "error", mensaje: "Acción no válida." };
  const { domicilioId, accion } = datos.data;
  try {
    if (accion === "tomar") await servicio.tomar(domicilioId, id);
    else if (accion === "aceptar") await servicio.aceptar(domicilioId, id);
    else if (accion === "rechazar") await servicio.rechazar(domicilioId, id);
    else await servicio.salir(domicilioId, id);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  const mensajes = {
    tomar: "Entrega tomada. Recógela en el punto.",
    aceptar: "Aceptada. Ve al punto a recogerla.",
    rechazar: "Listo, la devolvimos para otro domiciliario.",
    salir: "¡En ruta! El cliente ya te ve en el mapa.",
  };
  return { estado: "exito", mensaje: mensajes[accion] };
}

/** Confirma la entrega con el código del cliente (y la foto, si la tomó). */
export async function entregarAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const { id } = await requerirDomiciliario();
  const valores = Object.fromEntries(["domicilioId", "codigo", "foto", "receptor"].map((c) => [c, texto(formData, c)]));
  const datos = esquemaEntrega.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };
  try {
    await servicio.entregar(datos.data.domicilioId, id, datos.data);
  } catch (error) {
    if (esErrorDominio(error)) {
      return error.codigo === "codigo"
        ? { estado: "error", errores: { codigo: error.message }, valores }
        : { estado: "error", mensaje: error.message, valores };
    }
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "¡Entregado! Buen trabajo." };
}

/** Lo llama el navegador del domiciliario cada pocos segundos mientras va en ruta. */
export async function reportarPosicionAccion(domicilioId: string, latitud: number, longitud: number): Promise<boolean> {
  const { id } = await requerirDomiciliario();
  const datos = esquemaPosicion.safeParse({ domicilioId, latitud, longitud });
  if (!datos.success) return false;
  try {
    await servicio.registrarPosicion(datos.data.domicilioId, id, datos.data);
    return true;
  } catch (error) {
    if (esErrorDominio(error)) return false;
    throw error;
  }
}
