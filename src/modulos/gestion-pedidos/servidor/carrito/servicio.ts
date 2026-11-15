import "server-only";

// Reglas de negocio del carrito. El precio se toma del catálogo en el
// momento de agregar; al pagar se vuelve a revisar contra el inventario.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import * as catalogo from "@/modulos/gestion-catalogo/servidor/productos/servicio";
import * as repositorio from "./repositorio";
import { MAX_POR_PRODUCTO } from "./validaciones";

export const carritoDe = (clienteId: string) => repositorio.obtener(clienteId);
export const unidadesEn = (clienteId: string) => repositorio.contarUnidades(clienteId);
export const vaciar = (clienteId: string) => repositorio.vaciar(clienteId);

export async function agregar(clienteId: string, productoId: string, cantidad: number) {
  const producto = await catalogo.productoPorId(productoId);
  if (!producto?.activo) throw new ErrorDominio("Ese producto ya no está en el catálogo.", "no-existe");

  const yaTiene = await repositorio.cantidadDe(clienteId, productoId);
  if (yaTiene + cantidad > MAX_POR_PRODUCTO) {
    throw new ErrorDominio(`Puedes llevar máximo ${MAX_POR_PRODUCTO} unidades de cada producto.`, "maximo");
  }
  await repositorio.agregar({ clienteId, productoId, cantidad, precioUnitario: producto.precioVenta });
}

export async function cambiarCantidad(clienteId: string, itemId: string, cantidad: number) {
  if (cantidad === 0) return repositorio.quitar(clienteId, itemId);
  await repositorio.cambiarCantidad(clienteId, itemId, cantidad);
}

export const quitar = (clienteId: string, itemId: string) => repositorio.quitar(clienteId, itemId);
