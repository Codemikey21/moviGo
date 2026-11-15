"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// Valida con validaciones.ts, aplica permisos y delega en servicio.ts.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdministrador, requerirSesion } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import { esquemaDestino } from "@/modulos/gestion-servicios/servidor/domicilios/validaciones";
import type { EstadoPedido, PedidoDetalle, PedidoResumen } from "../../tipos";
import * as servicio from "./servicio";
import { ESTADOS_PANEL, esquemaEntrega, esquemaNumero } from "./validaciones";

/** Confirma el carrito: crea el pedido y lleva a la pasarela de pagos. */
export async function confirmarCompraAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const perfil = await requerirSesion();
  const valores = {
    tipo: texto(formData, "tipo"),
    puntoId: texto(formData, "puntoId"),
    direccion: texto(formData, "direccion"),
    barrio: texto(formData, "barrio"),
    indicaciones: texto(formData, "indicaciones"),
  };

  const entrega = esquemaEntrega.safeParse(valores);
  if (!entrega.success) return { estado: "error", errores: erroresPorCampo(entrega.error), valores };

  let destino = null;
  if (entrega.data.tipo === "A_DOMICILIO") {
    const d = esquemaDestino.safeParse(valores);
    if (!d.success) return { estado: "error", errores: erroresPorCampo(d.error), valores };
    destino = d.data;
  }

  let referencia: string;
  try {
    ({ referencia } = await servicio.crearDesdeCarrito(perfil.id, entrega.data, destino));
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }
  redirect(`/pagar/${referencia}`);
}

export async function obtenerMisPedidos(): Promise<PedidoResumen[]> {
  const perfil = await requerirSesion();
  return servicio.deCliente(perfil.id);
}

export async function obtenerMiPedido(numero: string): Promise<PedidoDetalle | null> {
  const perfil = await requerirSesion();
  if (!esquemaNumero.safeParse(numero).success) return null;
  const pedido = await servicio.porNumero(numero);
  return pedido?.cliente.id === perfil.id ? pedido : null;
}

export async function cancelarMiPedidoAccion(formData: FormData): Promise<void> {
  const perfil = await requerirSesion();
  const pedido = await servicio.porNumero(texto(formData, "numero"));
  if (pedido) await servicio.cancelar(pedido.id, perfil.id, perfil.id);
  refresh();
}

// ---------------------------------------------------------------------------
// Panel de administración
// ---------------------------------------------------------------------------

export async function listarPedidosAdmin(estado?: string): Promise<PedidoResumen[]> {
  await requerirAdministrador();
  const filtro = ESTADOS_PANEL.find((e) => e === estado);
  return servicio.paraPanel(filtro ? [filtro] : undefined);
}

export async function obtenerPedidoAdmin(numero: string): Promise<PedidoDetalle | null> {
  await requerirAdministrador();
  if (!esquemaNumero.safeParse(numero).success) return null;
  return servicio.porNumero(numero);
}

export async function conteosPedidosAdmin(): Promise<Partial<Record<EstadoPedido, number>>> {
  await requerirAdministrador();
  return servicio.conteos();
}

/** Preparar, entregar o cancelar un pedido desde el panel. */
export async function gestionarPedidoAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const admin = await requerirAdministrador();
  const pedido = await servicio.porNumero(texto(formData, "numero"));
  if (!pedido) return { estado: "error", mensaje: "Ese pedido no existe." };
  try {
    switch (texto(formData, "accion")) {
      case "preparar":
        await servicio.marcarPreparando(pedido.id);
        break;
      case "entregar":
        await servicio.marcarEntregado(pedido.id, admin.id);
        break;
      case "cancelar":
        await servicio.cancelar(pedido.id, admin.id);
        break;
      default:
        return { estado: "error", mensaje: "Acción no válida." };
    }
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message };
    throw error;
  }
  refresh();
  return { estado: "exito", mensaje: "Pedido actualizado." };
}
