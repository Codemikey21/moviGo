import "server-only";

// Reglas de los domicilios: salen de un punto de servicio, el administrador
// asigna un domiciliario (o él mismo lo toma desde su portal), sale a ruta
// y lo entrega con el código del cliente.
// La ubicación es la del GPS del domiciliario cuando la comparte; si no, se
// simula sobre la ruta real de calles.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { buscarBarrio } from "@/compartido/utilidades/barrios";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import * as pedidos from "@/modulos/gestion-pedidos/servidor/compras/servicio";
import type { Seguimiento } from "../../tipos";
import * as alquileres from "../alquiler/servicio";
import * as repositorio from "./repositorio";
import { distancia, puntoEnRuta, rutaEntre } from "./ruta";

/** Lo que cobra MoviGo por llevar el pedido o el vehículo a la puerta. */
export const COSTO_DOMICILIO = 12_000;

/** Cuánto tarda la entrega simulada desde que sale el domiciliario. */
const DURACION_MS = 8 * 60_000;

/** Velocidad promedio en la ciudad para estimar la llegada (≈ 18 km/h). */
const METROS_POR_MINUTO = 300;

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
  if (domicilio.domiciliario?.id === domiciliarioId) return;
  // Al cambiar de domiciliario, el nuevo tiene que aceptarlo otra vez
  await repositorio.actualizar(id, { estado: "ASIGNADO", domiciliarioId, asignadoEn: new Date(), aceptadoEn: null });
  if (domicilio.pedidoId) await pedidos.marcarPreparando(domicilio.pedidoId);
  await notificar(
    domiciliarioId,
    "Tienes una entrega nueva",
    `${domicilio.descripcion}. Recoge en ${domicilio.origen.nombre} y lleva a ${domicilio.destino.barrio ?? domicilio.destino.direccion}.`,
  );
}

/** El domiciliario toma un domicilio libre desde su portal. */
export async function tomar(id: string, domiciliarioId: string) {
  const domicilio = await exigir(id);
  if (!domicilio.listoParaDespachar) throw new ErrorDominio("Este domicilio todavía no está pagado.", "sin-pago");
  const ahora = new Date();
  const ok = await repositorio.actualizarSi(
    id,
    { estado: "SOLICITADO", domiciliarioId: null },
    { estado: "ASIGNADO", domiciliarioId, asignadoEn: ahora, aceptadoEn: ahora },
  );
  if (!ok) throw new ErrorDominio("Otro domiciliario tomó esta entrega primero.", "tomado");
  if (domicilio.pedidoId) await pedidos.marcarPreparando(domicilio.pedidoId);
}

/** El domiciliario acepta la entrega que le asignaron. */
export async function aceptar(id: string, domiciliarioId: string) {
  const ok = await repositorio.actualizarSi(id, { estado: "ASIGNADO", domiciliarioId, aceptado: false }, { aceptadoEn: new Date() });
  if (!ok) throw new ErrorDominio("Esta entrega ya no está esperando tu respuesta.", "estado");
  const domicilio = await exigir(id);
  await notificar(
    domicilio.cliente.id,
    "Ya tienes domiciliario",
    `${domicilio.domiciliario?.nombre ?? "Tu domiciliario"} recogerá tu entrega en ${domicilio.origen.nombre}.`,
  );
}

/** El domiciliario no puede llevarla: vuelve a quedar libre para otro. */
export async function rechazar(id: string, domiciliarioId: string) {
  const ok = await repositorio.actualizarSi(
    id,
    { estado: "ASIGNADO", domiciliarioId },
    { estado: "SOLICITADO", domiciliarioId: null, asignadoEn: null, aceptadoEn: null },
  );
  if (!ok) throw new ErrorDominio("Esta entrega ya salió a ruta: no se puede devolver.", "estado");
}

export async function iniciarRuta(id: string) {
  const domicilio = await exigir(id);
  if (domicilio.estado !== "ASIGNADO") throw new ErrorDominio("Primero asigna un domiciliario.", "estado");
  await repositorio.actualizar(id, { estado: "EN_CURSO", aceptadoEn: domicilio.aceptadoEn ?? new Date() });
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

/** Posición que manda el GPS del domiciliario mientras va en ruta. */
export async function registrarPosicion(id: string, posicion: { latitud: number; longitud: number }) {
  const [salida, ultima] = await Promise.all([repositorio.primeraUbicacion(id), repositorio.ultimaUbicacion(id)]);
  // Con una cada 8 segundos basta para el mapa (el registro de salida no cuenta)
  if (ultima && ultima.id !== salida?.id && Date.now() - ultima.registradaEn.getTime() < 8_000) return;
  await repositorio.registrarUbicacion(id, posicion.latitud, posicion.longitud);
}

/** Ruta y posición del domiciliario para el mapa. */
export async function seguimiento(id: string): Promise<Seguimiento | null> {
  const d = await repositorio.buscar(id);
  if (!d) return null;
  const ruta = await rutaEntre(d.origen, d.destino);

  if (d.estado === "COMPLETADO") {
    return { estado: d.estado, ruta, posicion: d.destino, progreso: 1, minutosRestantes: null };
  }
  if (d.estado !== "EN_CURSO") {
    return { estado: d.estado, ruta, posicion: null, progreso: 0, minutosRestantes: null };
  }

  const [salida, ultima] = await Promise.all([repositorio.primeraUbicacion(id), repositorio.ultimaUbicacion(id)]);

  // GPS real: el primer registro es la salida del punto; los demás los manda el domiciliario
  if (salida && ultima && ultima.id !== salida.id) {
    const falta = distancia(ultima, d.destino);
    const total = Math.max(distancia(d.origen, d.destino), 1);
    return {
      estado: d.estado,
      ruta,
      posicion: { latitud: ultima.latitud, longitud: ultima.longitud },
      progreso: Math.min(Math.max(1 - falta / total, 0), 0.97),
      minutosRestantes: Math.max(1, Math.ceil(falta / METROS_POR_MINUTO)),
    };
  }

  // Sin GPS: se simula el avance sobre la ruta. Se queda "llegando" hasta que lo entreguen.
  const transcurrido = salida ? Date.now() - salida.registradaEn.getTime() : 0;
  const progreso = Math.min(transcurrido / DURACION_MS, 0.97);
  return {
    estado: d.estado,
    ruta,
    posicion: puntoEnRuta(ruta, progreso),
    progreso,
    minutosRestantes: Math.max(1, Math.ceil(((1 - progreso) * DURACION_MS) / 60_000)),
  };
}
