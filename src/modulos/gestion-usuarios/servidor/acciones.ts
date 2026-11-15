"use server";

// Server Actions: unico punto de entrada que la interfaz puede llamar.
// Valida con validaciones.ts, aplica permisos y delega en servicio.ts.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { origenDelSitio } from "@/compartido/servidor/configuracion/entorno";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import { rutaSegura } from "@/compartido/utilidades/rutas";
import type { EstadoFormulario, PerfilUsuario, UsuarioFila } from "../tipos";
import * as servicio from "./servicio";
import {
  erroresPorCampo,
  esquemaInicioSesion,
  esquemaNuevaContrasena,
  esquemaRecuperar,
  esquemaCambioRol,
  esquemaRegistro,
} from "./validaciones";

/** Convierte un error en estado del formulario; si no es de negocio, lo relanza. */
function aEstado(error: unknown, valores?: Record<string, string>): EstadoFormulario {
  if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
  throw error;
}

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

export async function registrarseAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // La contraseña nunca se devuelve a la pantalla
  const valores = {
    nombre: texto(formData, "nombre"),
    correo: texto(formData, "correo"),
    telefono: texto(formData, "telefono"),
  };

  const resultado = esquemaRegistro.safeParse({
    ...valores,
    contrasena: texto(formData, "contrasena"),
    terminos: formData.get("terminos") ?? undefined,
  });
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  try {
    await servicio.registrar(resultado.data, await origenDelSitio());
  } catch (error) {
    return aEstado(error, valores);
  }

  return {
    estado: "exito",
    correo: resultado.data.correo,
    mensaje: "Te enviamos un enlace para confirmar tu correo. Ábrelo para activar tu cuenta.",
  };
}

export async function iniciarSesionAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const valores = { correo: texto(formData, "correo") };
  const resultado = esquemaInicioSesion.safeParse({
    correo: valores.correo,
    contrasena: texto(formData, "contrasena"),
    siguiente: texto(formData, "siguiente") || undefined,
  });
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  try {
    await servicio.iniciarSesion(resultado.data.correo, resultado.data.contrasena);
  } catch (error) {
    return aEstado(error, valores);
  }

  // redirect va fuera del try: por dentro funciona lanzando una excepción
  redirect(rutaSegura(resultado.data.siguiente));
}

export async function iniciarConGoogleAccion(formData: FormData): Promise<void> {
  const siguiente = rutaSegura(texto(formData, "siguiente"));
  const url = await servicio.enlaceInicioConGoogle(await origenDelSitio(), siguiente);
  redirect(url);
}

export async function recuperarContrasenaAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const valores = { correo: texto(formData, "correo") };
  const resultado = esquemaRecuperar.safeParse(valores);
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error), valores };
  }

  try {
    await servicio.enviarEnlaceRecuperacion(resultado.data.correo, await origenDelSitio());
  } catch (error) {
    return aEstado(error, valores);
  }

  return {
    estado: "exito",
    correo: resultado.data.correo,
    mensaje:
      "Si ese correo tiene una cuenta en MoviGo, te llegará un enlace para crear una contraseña nueva.",
  };
}

export async function nuevaContrasenaAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const resultado = esquemaNuevaContrasena.safeParse({
    contrasena: texto(formData, "contrasena"),
    confirmacion: texto(formData, "confirmacion"),
  });
  if (!resultado.success) {
    return { estado: "error", errores: erroresPorCampo(resultado.error) };
  }

  try {
    await servicio.cambiarContrasena(resultado.data.contrasena);
  } catch (error) {
    return aEstado(error);
  }

  redirect("/mi-cuenta?aviso=contrasena-actualizada");
}

export async function cerrarSesionAccion(): Promise<void> {
  await servicio.cerrarSesion();
  redirect("/");
}

/** Perfil de quien inició sesión, o null. Lo usa la página de mi cuenta. */
export async function obtenerMiPerfil(): Promise<PerfilUsuario | null> {
  return servicio.perfilActual();
}

// ---------------------------------------------------------------------------
// Panel de administración
// ---------------------------------------------------------------------------

export async function listarUsuariosAdmin(busqueda?: string): Promise<UsuarioFila[]> {
  await requerirRol("ADMIN_SISTEMA", "ADMIN_PUNTO");
  return servicio.usuariosParaPanel(busqueda);
}

/** Solo el administrador del sistema cambia roles. */
export async function cambiarRolAccion(_anterior: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const admin = await requerirRol("ADMIN_SISTEMA");
  const datos = esquemaCambioRol.safeParse({
    usuarioId: formData.get("usuarioId"),
    rol: formData.get("rol"),
    puntoId: formData.get("puntoId") || null,
  });
  if (!datos.success) return { estado: "error", mensaje: "Datos no válidos." };
  try {
    await servicio.cambiarRol(admin.id, datos.data.usuarioId, datos.data.rol, datos.data.puntoId);
  } catch (error) {
    return aEstado(error);
  }
  refresh();
  return { estado: "exito", mensaje: "Rol actualizado." };
}
