import "server-only";

// Reglas de los domicilios: salen de un punto de servicio, el administrador
// asigna un domiciliario, sale a ruta y lo marca entregado.
// La ubicación del domiciliario se simula sobre la ruta real de calles.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { buscarBarrio } from "@/compartido/utilidades/barrios";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import * as pedidos from "@/modulos/gestion-pedidos/servidor/compras/servicio";
import type { Seguimiento } from "../../tipos";
import * as alquileres from "../alquiler/servicio";
import * as repositorio from "./repositorio";
import { puntoEnRuta, rutaEntre } from "./ruta";

/** Lo que cobra MoviGo por llevar el pedido o el vehículo a la puerta. */
export const COSTO_DOMICILIO = 12_000;

/** Cuánto tarda la entrega simulada desde que sale el domiciliario. */
const DURACION_MS = 8 * 60_000;

export type DestinoEntrega = { direccion: string; barrio: string; indicaciones: string };

export async function crearEntrega(datos: {
  clienteId: string;
  pedidoId?: string;
  alquilerId?: string;
  puntoOrigenId: string;
  destino: DestinoEntrega;
  descripcion: string;
}) {
  const barrio = buscarBarrio(datos.destino.barrio);
  if (!barrio) throw new ErrorDominio("Elige un barrio de la lista.", "barrio");
  return repositorio.crear({
    clienteId: datos.clienteId,
    pedidoId: datos.pedidoId,
    alquilerId: datos.alquilerId,
    puntoOrigenId: datos.puntoOrigenId,
    destino: {
      linea: datos.destino.direccion,
      barrio: barrio.nombre,
      ciudad: barrio.ciudad,
      latitud: barrio.latitud,
      longitud: barrio.longitud,
      indicaciones: datos.destino.indicaciones,
    },
    descripcion: datos.descripcion,
    costo: COSTO_DOMICILIO,
  });
}

export const detalle = (id: string) => repositorio.buscar(id);
export const dePedido = (pedidoId: string) => repositorio.buscarPorPedido(pedidoId);
export const deAlquiler = (alquilerId: string) => repositorio.buscarPorAlquiler(alquilerId);
export const cancelarDe = (filtro: { pedidoId?: string; alquilerId?: string }) => repositorio.cancelarDe(filtro);
export const domiciliarios = () => repositorio.listarDomiciliarios();
export const paraPanel = () => repositorio.listar(["SOLICITADO", "ASIGNADO", "EN_CURSO", "COMPLETADO"]);

async function exigir(id: string) {
  const domicilio = await repositorio.buscar(id);
  if (!domicilio) throw new ErrorDominio("Ese domicilio ya no existe.", "no-existe");
  return domicilio;
}

export async function asignar(id: string, domiciliarioId: string) {
  const domicilio = await exigir(id);
  if (!domicilio.listoParaDespachar) {
    throw new ErrorDominio("Este domicilio todavía no está pagado.", "sin-pago");
  }
  if (!["SOLICITADO", "ASIGNADO"].includes(domicilio.estado)) {
    throw new ErrorDominio("Este domicilio ya salió a ruta.", "estado");
  }
  await repositorio.actualizar(id, { estado: "ASIGNADO", domiciliarioId, asignadoEn: new Date() });
  if (domicilio.pedidoId) await pedidos.marcarPreparando(domicilio.pedidoId);
}

export async function iniciarRuta(id: string) {
  const domicilio = await exigir(id);
  if (domicilio.estado !== "ASIGNADO") throw new ErrorDominio("Primero asigna un domiciliario.", "estado");
  await repositorio.actualizar(id, { estado: "EN_CURSO" });
  await repositorio.registrarUbicacion(id, domicilio.origen.latitud, domicilio.origen.longitud);
  await notificar(
    domicilio.cliente.id,
    "Tu entrega va en camino",
    `${domicilio.domiciliario?.nombre ?? "Tu domiciliario"} salió de ${domicilio.origen.nombre}. Síguelo en el mapa.`,
  );
}

export async function completar(id: string, usuarioId: string) {
  const domicilio = await exigir(id);
  if (domicilio.estado !== "EN_CURSO") throw new ErrorDominio("El domicilio no está en ruta.", "estado");
  await repositorio.actualizar(id, { estado: "COMPLETADO", entregadoEn: new Date() });
  if (domicilio.pedidoId) await pedidos.marcarEntregado(domicilio.pedidoId, usuarioId);
  if (domicilio.alquilerId) await alquileres.marcarEntregado(domicilio.alquilerId, usuarioId);
}

/** Ruta y posición del domiciliario para el mapa. */
export async function seguimiento(id: string): Promise<Seguimiento | null> {
  const d = await repositorio.buscar(id);
  if (!d) return null;
  const ruta = await rutaEntre(d.origen, d.destino);

  let progreso = 0;
  if (d.estado === "COMPLETADO") progreso = 1;
  else if (d.estado === "EN_CURSO") {
    const salida = await repositorio.primeraUbicacion(id);
    const transcurrido = salida ? Date.now() - salida.registradaEn.getTime() : 0;
    // Se queda "llegando" hasta que lo marquen entregado
    progreso = Math.min(transcurrido / DURACION_MS, 0.97);
  }

  return {
    estado: d.estado,
    ruta,
    posicion: ["EN_CURSO", "COMPLETADO"].includes(d.estado) ? puntoEnRuta(ruta, progreso) : null,
    progreso,
    minutosRestantes: d.estado === "EN_CURSO" ? Math.max(1, Math.ceil(((1 - progreso) * DURACION_MS) / 60_000)) : null,
  };
}
