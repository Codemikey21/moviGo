/** Pesos colombianos sin decimales: $ 3.299.000 */
export const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** "15 de noviembre" (fechas sin hora, guardadas en UTC) */
export const formatoDia = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "15 nov, 3:40 p. m." */
export const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

/** "sábado 15 de noviembre de 2026" (fechas sin hora, guardadas en UTC) */
export const formatoFechaLarga = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Hoy en Colombia como "2026-11-15" (para los campos de fecha) */
export function hoyEnColombia(desplazamientoDias = 0) {
  const fecha = new Date(Date.now() + desplazamientoDias * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(fecha);
}
