"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import { idUsuarioActual } from "@/modulos/gestion-usuarios/servidor/servicio";
import type { Carrito } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaAgregar, esquemaCambiarCantidad } from "./validaciones";

export async function obtenerMiCarrito(): Promise<Carrito> {
  const perfil = await requerirSesion();
  return servicio.carritoDe(perfil.id);
}

/** Para el numerito del encabezado: 0 si no hay sesión. */
export async function contarMiCarrito(): Promise<number> {
  const id = await idUsuarioActual();
  return id ? servicio.unidadesEn(id) : 0;
}

/** Agrega al carrito. Con irAlCarrito, después lleva al carrito ("Comprar ahora"). */
export async function agregarAlCarritoAccion(
  _anterior: { error?: string; ok?: boolean },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const perfil = await requerirSesion();
  const datos = esquemaAgregar.safeParse({
    productoId: formData.get("productoId"),
    colorId: formData.get("colorId") ?? "",
    cantidad: formData.get("cantidad"),
  });
  if (!datos.success) return { error: "Elige una cantidad válida." };

  try {
    await servicio.agregar(perfil.id, datos.data.productoId, datos.data.cantidad, datos.data.colorId);
  } catch (error) {
    if (esErrorDominio(error)) return { error: error.message };
    throw error;
  }

  if (formData.get("irAlCarrito")) redirect("/carrito");
  refresh();
  return { ok: true };
}

export async function cambiarCantidadAccion(formData: FormData): Promise<void> {
  const perfil = await requerirSesion();
  const datos = esquemaCambiarCantidad.parse({
    itemId: formData.get("itemId"),
    cantidad: formData.get("cantidad"),
  });
  await servicio.cambiarCantidad(perfil.id, datos.itemId, datos.cantidad);
  refresh();
}
