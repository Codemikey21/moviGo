import "server-only";

// Reglas de negocio de este modulo. No conoce HTTP ni React.
// Usa repositorio.ts para leer y escribir datos y Supabase Auth para las cuentas.
import type { EmailOtpType } from "@supabase/supabase-js";
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { crearClienteServidor } from "@/compartido/servidor/supabase/servidor";
import { RUTA_CUENTA } from "@/compartido/utilidades/rutas";
import type { PerfilUsuario } from "../tipos";
import * as repositorio from "./repositorio";
import { buscarAdministrador, buscarPerfilPorId, crearPerfilCliente } from "./repositorio";

/** Enlace al que vuelve la persona desde el correo o desde Google. */
function enlaceDeRegreso(origen: string, siguiente: string) {
  return `${origen}/auth/confirmar?siguiente=${encodeURIComponent(siguiente)}`;
}

/** Traduce los errores de Supabase Auth a mensajes en español. */
function traducir(codigo: string | undefined, mensaje: string): ErrorDominio {
  switch (codigo) {
    case "invalid_credentials":
      return new ErrorDominio("El correo o la contraseña no son correctos.", codigo);
    case "email_not_confirmed":
      return new ErrorDominio(
        "Todavía no confirmas tu correo. Abre el enlace que te enviamos para activar tu cuenta.",
        codigo,
      );
    case "user_already_exists":
    case "email_exists":
      return new ErrorDominio("Ese correo ya tiene una cuenta. Inicia sesión.", codigo);
    case "weak_password":
      return new ErrorDominio("Esa contraseña es muy fácil de adivinar. Prueba con otra.", codigo);
    case "same_password":
      return new ErrorDominio("La contraseña nueva debe ser distinta a la anterior.", codigo);
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return new ErrorDominio(
        "Hiciste muchos intentos seguidos. Espera unos minutos y vuelve a intentarlo.",
        codigo,
      );
    default:
      console.error("[gestion-usuarios] Error de Supabase Auth:", codigo, mensaje);
      return new ErrorDominio("Algo salió mal. Inténtalo de nuevo en un momento.", codigo);
  }
}

export async function registrar(
  datos: { nombre: string; correo: string; telefono?: string; contrasena: string },
  origen: string,
) {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email: datos.correo,
    password: datos.contrasena,
    options: {
      emailRedirectTo: enlaceDeRegreso(origen, RUTA_CUENTA),
      // Estos datos los lee la base de datos para crear el perfil
      data: { nombre: datos.nombre, telefono: datos.telefono || null },
    },
  });
  if (error) throw traducir(error.code, error.message);

  // Con la confirmación por correo activa, Supabase no dice si el correo ya
  // existía: devuelve un usuario sin identidades. Lo avisamos de forma amable.
  if (data.user && data.user.identities?.length === 0) {
    throw new ErrorDominio("Ese correo ya tiene una cuenta. Inicia sesión.", "email_exists");
  }
}

export async function iniciarSesion(correo: string, contrasena: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  if (error) throw traducir(error.code, error.message);
}

/** Devuelve la página de Google a la que hay que mandar a la persona. */
export async function enlaceInicioConGoogle(origen: string, siguiente: string) {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: enlaceDeRegreso(origen, siguiente) },
  });
  if (error || !data.url) throw traducir(error?.code, error?.message ?? "sin url");
  return data.url;
}

export async function enviarEnlaceRecuperacion(correo: string, origen: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.resetPasswordForEmail(correo, {
    redirectTo: enlaceDeRegreso(origen, "/nueva-contrasena"),
  });
  // Si el correo no existe Supabase no da error, y está bien: así nadie
  // puede averiguar qué correos tienen cuenta.
  if (error) throw traducir(error.code, error.message);
}

export async function cambiarContrasena(contrasena: string) {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: contrasena });
  if (error) throw traducir(error.code, error.message);
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
}

/**
 * Abre la sesión a partir del enlace del correo (confirmación o recuperar
 * contraseña) o del regreso desde Google. Devuelve false si el enlace no sirve.
 */
export async function confirmarEnlace(params: {
  code: string | null;
  tokenHash: string | null;
  tipo: EmailOtpType | null;
}): Promise<boolean> {
  const supabase = await crearClienteServidor();

  if (params.tokenHash && params.tipo) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.tokenHash,
      type: params.tipo,
    });
    return !error;
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    return !error;
  }

  return false;
}

/** Id de la persona con sesión, verificado con Supabase. */
export async function idUsuarioActual(): Promise<string | null> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

export async function perfilActual(): Promise<PerfilUsuario | null> {
  const id = await idUsuarioActual();
  if (!id) return null;

  const perfil = await buscarPerfilPorId(id);
  if (perfil) return perfil;

  // La cuenta existe en Supabase Auth pero no tiene perfil en MoviGo (pasa
  // con cuentas creadas antes de aplicar gestion_usuarios_autenticacion.sql).
  // Se crea ahora con los datos que guardó el registro o Google.
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  const usuario = data.user;
  if (!usuario?.email) return null;

  const meta = usuario.user_metadata ?? {};
  const nombre =
    [meta.nombre, meta.full_name, meta.name].find(
      (valor): valor is string => typeof valor === "string" && valor.trim() !== "",
    ) ?? usuario.email.split("@")[0];

  return crearPerfilCliente({
    id: usuario.id,
    correo: usuario.email,
    nombre: nombre.trim(),
    telefono: typeof meta.telefono === "string" && meta.telefono.trim() ? meta.telefono.trim() : null,
  });
}

/**
 * El perfil de quien inició sesión si es administrador, con el punto que
 * puede manejar. puntoId null = todos los puntos (administrador del sistema).
 */
export async function administradorActual(): Promise<
  (PerfilUsuario & { puntoId: string | null }) | null
> {
  const perfil = await perfilActual();
  if (!perfil) return null;
  if (perfil.rol === "ADMIN_SISTEMA") return { ...perfil, puntoId: null };
  if (perfil.rol !== "ADMIN_PUNTO") return null;
  const datos = await buscarAdministrador(perfil.id);
  // Un administrador de punto sin punto asignado no puede mover inventario
  return datos?.puntoAsignadoId ? { ...perfil, puntoId: datos.puntoAsignadoId } : null;
}

export const usuariosParaPanel = (busqueda?: string) => repositorio.listarUsuarios(busqueda);

export async function cambiarRol(
  adminId: string,
  usuarioId: string,
  rol: "CLIENTE" | "DOMICILIARIO" | "ADMIN_SISTEMA" | "ADMIN_PUNTO",
  puntoId: string | null,
  vehiculo: string | null = null,
) {
  if (adminId === usuarioId) throw new ErrorDominio("No puedes cambiar tu propio rol.", "propio");
  if (rol === "ADMIN_PUNTO" && !puntoId) throw new ErrorDominio("Elige el punto que va a administrar.", "punto");
  if (rol === "DOMICILIARIO" && !vehiculo) throw new ErrorDominio("Elige el vehículo con el que reparte.", "vehiculo");
  if (rol !== "DOMICILIARIO" && (await repositorio.entregasActivas(usuarioId)) > 0) {
    throw new ErrorDominio("Tiene entregas asignadas o en ruta. Reasígnalas antes de cambiarle el rol.", "entregas");
  }
  await repositorio.cambiarRol(usuarioId, rol, puntoId, vehiculo);
}
