import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
import * as repositorio from "./repositorio";

export const puntos = () => repositorio.listarPuntos();
export const disponibilidad = (productoId: string) => repositorio.disponibilidadPorPunto(productoId);
export const conteos = (productoIds: string[]) =>
  productoIds.length ? repositorio.conteoPorProducto(productoIds) : Promise.resolve({});
export const porEstado = () => repositorio.unidadesPorEstado();
