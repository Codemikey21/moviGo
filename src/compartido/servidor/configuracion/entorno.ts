import "server-only";

import { headers } from "next/headers";

/**
 * Dirección pública del sitio (por ejemplo http://localhost:3000 o el dominio
 * de Vercel). Se usa para armar los enlaces que llegan por correo.
 * Se toma del encabezado Origin de la petición; SITIO_URL es el respaldo.
 */
export async function origenDelSitio(): Promise<string> {
  const encabezados = await headers();
  const origen = encabezados.get("origin");
  if (origen) return origen;

  if (process.env.SITIO_URL) return process.env.SITIO_URL.replace(/\/$/, "");

  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  const protocolo = encabezados.get("x-forwarded-proto") ?? "https";
  return `${protocolo}://${host}`;
}
