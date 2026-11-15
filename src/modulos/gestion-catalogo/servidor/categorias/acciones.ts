"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
import type { CategoriaResumen } from "../../tipos";
import * as servicio from "./servicio";

/** Categorías del catálogo (público). */
export async function obtenerCategorias(): Promise<CategoriaResumen[]> {
  return servicio.categorias();
}
