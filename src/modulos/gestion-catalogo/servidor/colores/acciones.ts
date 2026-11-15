"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import * as servicio from "./servicio";
import { esquemaColor, esquemaIdColor } from "./validaciones";

/** Agrega un color al producto (solo el administrador del sistema). */
export async function agregarColorAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await requerirRol("ADMIN_SISTEMA");
  const valores = { productoId: texto(formData, "productoId"), nombre: texto(formData, "nombre"), hex: texto(formData, "hex") };
  const datos = esquemaColor.safeParse(valores);
  if (!datos.success) return { estado: "error", errores: erroresPorCampo(datos.error), valores };

  try {
    await servicio.agregar(datos.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: `Se agregó el color ${datos.data.nombre}.` };
}

export async function borrarColorAccion(formData: FormData): Promise<void> {
  await requerirRol("ADMIN_SISTEMA");
  await servicio.borrar(esquemaIdColor.parse(formData.get("id")));
  refresh();
}
