import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
import * as repositorio from "./repositorio";

export const historial = (productoId: string) => repositorio.listarPorProducto(productoId, 20);
