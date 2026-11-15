"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// La foto viaja del navegador directo a Supabase Storage (así no pasa por el
// límite de tamaño de las Server Actions); estas acciones solo la registran.
import { refresh } from "next/cache";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import * as servicio from "./servicio";
import { esquemaEtiquetarFoto, esquemaIdFoto, esquemaRegistrarFoto } from "./validaciones";

export async function registrarFotoAccion(datos: {
  productoId: string;
  ruta: string;
  textoAlt: string;
  colorId: string | null;
  vista: string | null;
}): Promise<{ ok: true } | { ok: false; mensaje: string }> {
  await requerirRol("ADMIN_SISTEMA");
  const resultado = esquemaRegistrarFoto.safeParse(datos);
  if (!resultado.success) return { ok: false, mensaje: "No pudimos registrar esa foto." };

  try {
    await servicio.registrarFoto(resultado.data);
  } catch (error) {
    if (esErrorDominio(error)) return { ok: false, mensaje: error.message };
    throw error;
  }
  refresh();
  return { ok: true };
}

export async function borrarFotoAccion(formData: FormData): Promise<void> {
  await requerirRol("ADMIN_SISTEMA");
  await servicio.borrarFoto(esquemaIdFoto.parse(formData.get("id")));
  refresh();
}

export async function hacerPrincipalAccion(formData: FormData): Promise<void> {
  await requerirRol("ADMIN_SISTEMA");
  await servicio.hacerPrincipal(esquemaIdFoto.parse(formData.get("id")));
  refresh();
}

/** Cambia el color o la vista de una foto ya subida. */
export async function etiquetarFotoAccion(formData: FormData): Promise<void> {
  await requerirRol("ADMIN_SISTEMA");
  const datos = esquemaEtiquetarFoto.parse({
    id: formData.get("id"),
    colorId: formData.get("colorId") ?? "",
    vista: formData.get("vista") ?? "",
  });
  await servicio.etiquetar(datos);
  refresh();
}
