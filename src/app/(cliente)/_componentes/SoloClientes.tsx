import { redirect } from "next/navigation";
import { connection } from "next/server";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";

/**
 * El domiciliario no navega la tienda: si entra a cualquier página del
 * cliente (inicio, catálogo, Mi cuenta…), lo manda a su portal de reparto.
 * Va dentro de un Suspense en el layout del cliente, así la página sigue
 * siendo rápida para todos los demás.
 */
export async function SoloClientes() {
  await connection();
  const perfil = await obtenerMiPerfil();
  if (perfil?.rol === "DOMICILIARIO") redirect("/domiciliario");
  return null;
}
