import { createBrowserClient } from "@supabase/ssr";
import { configuracionSupabase } from "./config";

// Cliente de Supabase para el navegador (solo clave publicable).
// Por ahora la app hace todo desde el servidor; queda listo para cuando se
// necesite algo en vivo, como el mapa con la ubicación de los vehículos.
export function crearClienteNavegador() {
  const { url, clave } = configuracionSupabase();
  return createBrowserClient(url, clave);
}
