"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// La foto viaja del navegador directo a Supabase Storage (así no pasa por el
// límite de tamaño de las Server Actions); estas acciones solo la registran.
import { refresh } from "next/cache";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import * as servicio from "./servicio";
import { esquemaIdFoto, esquemaRegistrarFoto } from "./validaciones";

export async function registrarFotoAccion(datos: {
  productoId: string;
  ruta: string;
  textoAlt: string;
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
