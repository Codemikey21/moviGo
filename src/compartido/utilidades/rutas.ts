// Rutas internas a donde se puede volver después de iniciar sesión.

export const RUTA_CUENTA = "/mi-cuenta";

/**
 * Solo acepta rutas del mismo sitio ("/algo"). Cualquier otra cosa, como
 * "https://otro-sitio.com" o "//otro-sitio.com", vuelve a la cuenta.
 * Así nadie puede usar el enlace de inicio de sesión para mandar a la
 * persona a una página falsa.
 */
export function rutaSegura(ruta: string | null | undefined): string {
  if (!ruta || !ruta.startsWith("/") || ruta.startsWith("//") || ruta.startsWith("/\\")) {
    return RUTA_CUENTA;
  }
  return ruta;
}
