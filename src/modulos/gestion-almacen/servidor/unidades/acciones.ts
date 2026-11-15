"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// Valida con validaciones.ts, aplica permisos y delega en servicio.ts.
import { refresh } from "next/cache";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { UnidadFila } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaMoverUnidad, esquemaRegistrarUnidades } from "./validaciones";

/** Todas las unidades de un producto, en todos los puntos. */
export async function listarUnidadesAdmin(productoId: string): Promise<UnidadFila[]> {
  await requerirAdministrador();
  return servicio.unidadesDe(productoId);
}

/** Ingreso de unidades nuevas a un punto (queda un movimiento INGRESO por unidad). */
export async function registrarUnidadesAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const admin = await requerirAdministrador();

  const valores = {
    productoId: texto(formData, "productoId"),
    puntoId: texto(formData, "puntoId"),
    colorId: texto(formData, "colorId"),
    seriales: texto(formData, "seriales"),
    cantidad: texto(formData, "cantidad"),
    nota: texto(formData, "nota"),
  };
  const resultado = esquemaRegistrarUnidades.safeParse(valores);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  let registradas: number;
  try {
    registradas = await servicio.registrar(
      { id: admin.id, puntoId: admin.puntoId },
      resultado.data,
    );
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }

  refresh();
  return {
    estado: "exito",
    mensaje: registradas === 1 ? "Se registró 1 unidad." : `Se registraron ${registradas} unidades.`,
  };
}

/** Enviar al taller, volver del taller o trasladar una unidad. */
export async function moverUnidadAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const admin = await requerirAdministrador();
  const resultado = esquemaMoverUnidad.safeParse({
    unidadId: texto(formData, "unidadId"),
    cambio: texto(formData, "cambio"),
    destinoId: texto(formData, "destinoId") || undefined,
  });
  if (!resultado.success) return { estado: "error", mensaje: "Elige un punto de destino." };

  try {
    await servicio.mover({ id: admin.id, puntoId: admin.puntoId }, resultado.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Listo." };
}
