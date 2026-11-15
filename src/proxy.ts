import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigurado } from "@/compartido/servidor/supabase/config";
import { actualizarSesion } from "@/compartido/servidor/supabase/sesion";

// Páginas que piden haber iniciado sesión.
const PRIVADAS = ["/mi-cuenta", "/nueva-contrasena", "/empresa", "/admin", "/carrito", "/pagar"];

// Páginas que no tienen sentido si ya hay sesión.
const DE_ACCESO = ["/iniciar-sesion", "/registro"];

function coincide(ruta: string, lista: string[]) {
  return lista.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}

/** Redirige sin perder las cookies que Supabase acaba de refrescar. */
function redirigir(destino: URL, respuesta: NextResponse) {
  const redireccion = NextResponse.redirect(destino);
  for (const cookie of respuesta.cookies.getAll()) {
    redireccion.cookies.set(cookie);
  }
  return redireccion;
}

/**
 * Corre antes de cada página: mantiene viva la sesión y protege las rutas
 * privadas. Si faltan las variables de Supabase deja pasar todo, para que
 * la landing nunca se caiga por eso.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseConfigurado()) return NextResponse.next();

  const { respuesta, conSesion } = await actualizarSesion(request);
  const { pathname, search } = request.nextUrl;

  if (!conSesion && coincide(pathname, PRIVADAS)) {
    const destino = new URL("/iniciar-sesion", request.url);
    destino.searchParams.set("siguiente", pathname + search);
    return redirigir(destino, respuesta);
  }

  if (conSesion && coincide(pathname, DE_ACCESO)) {
    return redirigir(new URL("/mi-cuenta", request.url), respuesta);
  }

  return respuesta;
}

export const config = {
  // Todo menos archivos estáticos, imágenes y videos.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|img/|video/|fonts/|models/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
