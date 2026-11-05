import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { configuracionSupabase } from "./config";

/**
 * Lo usa el proxy en cada petición: refresca la sesión de Supabase si el
 * token está por vencer y devuelve la respuesta con las cookies al día.
 */
export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });
  const { url, clave } = configuracionSupabase();

  const supabase = createServerClient(url, clave, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of lista) {
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  // No poner código entre crearlo y getClaims: es lo que refresca la sesión.
  const { data } = await supabase.auth.getClaims();
  const conSesion = Boolean(data?.claims?.sub);

  return { respuesta, conSesion };
}
