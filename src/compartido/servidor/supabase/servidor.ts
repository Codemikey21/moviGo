import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configuracionSupabase } from "./config";

/**
 * Cliente de Supabase para el servidor: Server Actions, Route Handlers y
 * Server Components. Lee y escribe la sesión en las cookies.
 */
export async function crearClienteServidor() {
  const almacen = await cookies();
  const { url, clave } = configuracionSupabase();

  return createServerClient(url, clave, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) {
            almacen.set(name, value, options);
          }
        } catch {
          // Un Server Component no puede escribir cookies. No pasa nada:
          // el proxy (src/proxy.ts) ya refresca la sesión en cada petición.
        }
      },
    },
  });
}
