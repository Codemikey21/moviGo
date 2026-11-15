import "server-only";

// Guardas por rol: cliente, empresa y administrador.
// El proxy ya manda a iniciar sesión a quien no tiene sesión; estas guardas
// van dentro de las páginas y acciones para revisar además el rol.
import { redirect } from "next/navigation";
import { administradorActual, perfilActual } from "@/modulos/gestion-usuarios/servidor/servicio";
import type { PerfilUsuario } from "@/modulos/gestion-usuarios/tipos";

/** Devuelve el perfil o manda a iniciar sesión. */
export async function requerirSesion(): Promise<PerfilUsuario> {
  const perfil = await perfilActual();
  if (!perfil) redirect("/iniciar-sesion");
  return perfil;
}

/** Igual que requerirSesion, pero además exige uno de los roles dados. */
export async function requerirRol(...roles: PerfilUsuario["rol"][]): Promise<PerfilUsuario> {
  const perfil = await requerirSesion();
  if (!roles.includes(perfil.rol)) redirect("/mi-cuenta?aviso=sin-permiso");
  return perfil;
}

/**
 * Exige un administrador (del sistema o de punto). Devuelve también el punto
 * que puede manejar: puntoId null significa todos los puntos.
 */
export async function requerirAdministrador() {
  await requerirRol("ADMIN_SISTEMA", "ADMIN_PUNTO");
  const admin = await administradorActual();
  if (!admin) redirect("/mi-cuenta?aviso=sin-permiso");
  return admin;
}
