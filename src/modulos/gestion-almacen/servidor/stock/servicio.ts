import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
import * as repositorio from "./repositorio";

export const puntos = () => repositorio.listarPuntos();
export const disponibilidad = (productoId: string, colorId: string | null = null) =>
  repositorio.disponibilidadPorPunto(productoId, colorId);
export const disponibilidadPorColor = (productoId: string) => repositorio.disponibilidadPorColor(productoId);
export const conteos = (productoIds: string[]) =>
  productoIds.length ? repositorio.conteoPorProducto(productoIds) : Promise.resolve({});
export const porEstado = () => repositorio.unidadesPorEstado();
export const detallado = () => repositorio.conteoDetallado();
