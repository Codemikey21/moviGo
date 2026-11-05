import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { rutaSegura } from "@/compartido/utilidades/rutas";
import { confirmarEnlace } from "@/modulos/gestion-usuarios/servidor/servicio";

/**
 * A esta dirección vuelven los enlaces del correo (confirmar cuenta y
 * recuperar contraseña) y el regreso desde Google. Abre la sesión y manda
 * a la persona a ?siguiente=..., o a iniciar sesión si el enlace no sirve.
 */
export async function GET(request: NextRequest) {
  const parametros = request.nextUrl.searchParams;
  const siguiente = rutaSegura(parametros.get("siguiente"));

  const valido = await confirmarEnlace({
    code: parametros.get("code"),
    tokenHash: parametros.get("token_hash"),
    tipo: parametros.get("type") as EmailOtpType | null,
  });

  const destino = valido ? siguiente : "/iniciar-sesion?error=enlace";
  return NextResponse.redirect(new URL(destino, request.url));
}
