import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
// Usa repositorio.ts para leer y escribir datos.
import * as repositorio from "./repositorio";

export function categorias() {
  return repositorio.listarCategorias();
}
