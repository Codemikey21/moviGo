import "server-only";

// Reglas de las compras:
// PENDIENTE_PAGO → PAGADO → PREPARANDO → ENTREGADO (o CANCELADO).
// Al crear el pedido se apartan las unidades en el almacén; si el pago no
// llega o se cancela, vuelven al inventario.
import { randomBytes } from "node:crypto";
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import * as stock from "@/modulos/gestion-almacen/servidor/stock/servicio";
import * as almacen from "@/modulos/gestion-almacen/servidor/unidades/servicio";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import * as pagos from "@/modulos/gestion-pagos/servidor/servicio";
import * as domicilios from "@/modulos/gestion-servicios/servidor/domicilios/servicio";
import type { EstadoPedido } from "../../tipos";
import * as carrito from "../carrito/servicio";
import * as repositorio from "./repositorio";

/** MV-261115-K7Q2 */
async function numeroNuevo() {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replaceAll("-", "");
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const numero = `MV-${hoy}-${[...randomBytes(4)].map((b) => alfabeto[b % alfabeto.length]).join("")}`;
    if (!(await repositorio.numeroEnUso(numero))) return numero;
  }
}

/** Para domicilios: el punto que tiene todo lo del carrito (el que más tenga). */
async function puntoConTodo(items: { productoId: string; cantidad: number }[]) {
  const disponibilidad = await Promise.all(items.map((i) => stock.disponibilidad(i.productoId)));
  const puntos = disponibilidad[0]?.map((d) => d.punto.id) ?? [];
  const candidatos = puntos.filter((puntoId) =>
    items.every((item, i) => (disponibilidad[i].find((d) => d.punto.id === puntoId)?.disponibles ?? 0) >= item.cantidad),
  );
  if (!candidatos.length) {
    throw new ErrorDominio(
      "Ningún punto tiene todo tu carrito para enviarlo junto. Quita algún producto o recógelo en un punto.",
      "sin-stock",
    );
  }
  return candidatos[0];
}

/** Convierte el carrito en un pedido y deja listo el pago. */
export async function crearDesdeCarrito(
  clienteId: string,
  entrega: { tipo: "EN_PUNTO"; puntoId: string } | { tipo: "A_DOMICILIO" },
  destino: domicilios.DestinoEntrega | null,
) {
  const { items, subtotal } = await carrito.carritoDe(clienteId);
  if (!items.length) throw new ErrorDominio("Tu carrito está vacío.", "vacio");

  const puntoId = entrega.tipo === "EN_PUNTO" ? entrega.puntoId : await puntoConTodo(items);

  // Se apartan las unidades; si algo falla, se devuelve lo apartado
  const apartadas: { productoId: string; unidadId: string; precioUnitario: number }[] = [];
  try {
    for (const item of items) {
      const unidades = await almacen.reservar({
        productoId: item.productoId,
        cantidad: item.cantidad,
        puntoId,
        usuarioId: clienteId,
        nota: "Reserva de compra",
      });
      apartadas.push(...unidades.map((u) => ({ productoId: item.productoId, unidadId: u.id, precioUnitario: item.precioUnitario })));
    }
  } catch (error) {
    await almacen.liberar(apartadas.map((a) => a.unidadId), clienteId, "Pedido sin completar");
    if (error instanceof ErrorDominio && error.codigo === "sin-stock" && entrega.tipo === "EN_PUNTO") {
      throw new ErrorDominio("Ese punto no tiene todo tu carrito. Prueba con otro punto o a domicilio.", "sin-stock");
    }
    throw error;
  }

  const envio = entrega.tipo === "A_DOMICILIO" ? domicilios.COSTO_DOMICILIO : 0;
  const numero = await numeroNuevo();
  let pedidoId: string;
  try {
    pedidoId = await repositorio.crear({
      numero,
      clienteId,
      entrega: entrega.tipo,
      subtotal,
      total: subtotal + envio,
      lineas: apartadas,
    });
    if (entrega.tipo === "A_DOMICILIO" && destino) {
      const { direccionId } = await domicilios.crearEntrega({
        clienteId,
        pedidoId,
        puntoOrigenId: puntoId,
        destino,
        descripcion: `Pedido ${numero}: ${items.map((i) => `${i.cantidad}× ${i.marca} ${i.nombre}`).join(", ")}`,
      });
      await repositorio.asignarDireccion(pedidoId, direccionId);
    }
  } catch (error) {
    await almacen.liberar(apartadas.map((a) => a.unidadId), clienteId, "Pedido sin completar");
    throw error;
  }

  await carrito.vaciar(clienteId);
  const pago = await pagos.iniciar({ pedidoId, monto: subtotal + envio });
  return { numero, referencia: pago.referencia };
}

export const porNumero = (numero: string) => repositorio.buscarPorNumero(numero);
export const deCliente = (clienteId: string) => repositorio.listarDelCliente(clienteId);
export const paraPanel = (estados?: EstadoPedido[]) => repositorio.listar(estados);
export const conteos = () => repositorio.contarPorEstado();

/** Lo llama Pagos cuando la pasarela aprueba. */
export async function confirmarPago(pedidoId: string) {
  if (!(await repositorio.cambiarEstado(pedidoId, ["PENDIENTE_PAGO"], "PAGADO"))) return;
  const p = await repositorio.buscarPorId(pedidoId);
  if (!p) return;
  await notificar(
    p.cliente.id,
    `Pedido ${p.numero} pagado`,
    p.entrega === "EN_PUNTO"
      ? `Te avisamos cuando esté listo para recoger en ${p.punto?.nombre}.`
      : "Lo estamos preparando. Te avisamos cuando salga a tu dirección.",
  );
}

/** Lo llama Pagos cuando la pasarela rechaza: el pedido sigue esperando pago. */
export async function pagoRechazado(pedidoId: string) {
  const p = await repositorio.buscarPorId(pedidoId);
  if (p) await notificar(p.cliente.id, `No se pudo cobrar el pedido ${p.numero}`, "Tu banco rechazó el pago. Puedes intentarlo otra vez con otro medio.");
}

export async function marcarPreparando(pedidoId: string) {
  const ok = await repositorio.cambiarEstado(pedidoId, ["PAGADO"], "PREPARANDO");
  if (!ok) return;
  const p = await repositorio.buscarPorId(pedidoId);
  if (p?.entrega === "EN_PUNTO") {
    await notificar(p.cliente.id, `Tu pedido ${p.numero} está listo`, `Recógelo en ${p.punto?.nombre}, ${p.punto?.horario.toLowerCase()}.`);
  }
}

/** El cliente recibió el pedido: las unidades salen del inventario. */
export async function marcarEntregado(pedidoId: string, usuarioId: string) {
  const p = await repositorio.buscarPorId(pedidoId);
  if (!p) throw new ErrorDominio("Ese pedido ya no existe.", "no-existe");
  if (!(await repositorio.cambiarEstado(pedidoId, ["PAGADO", "PREPARANDO"], "ENTREGADO"))) {
    throw new ErrorDominio("El pedido no está pagado o ya se entregó.", "estado");
  }
  await almacen.entregarVenta(p.unidadIds, usuarioId, `Pedido ${p.numero}`);
  await notificar(p.cliente.id, `Pedido ${p.numero} entregado`, "¡Disfrútalo! Si necesitas mantenimiento, agéndalo desde tu cuenta.");
}

/** Cancela un pedido que no se ha entregado. Si estaba pagado, se reembolsa. */
export async function cancelar(pedidoId: string, usuarioId: string, clienteId?: string) {
  const p = await repositorio.buscarPorId(pedidoId);
  if (!p || (clienteId && p.cliente.id !== clienteId)) throw new ErrorDominio("Ese pedido no existe.", "no-existe");
  const pagado = p.estado !== "PENDIENTE_PAGO";
  if ((await domicilios.dePedido(pedidoId))?.estado === "EN_CURSO") {
    throw new ErrorDominio("El pedido ya va en camino: no se puede cancelar.", "en-camino");
  }
  const desde: EstadoPedido[] = clienteId ? ["PENDIENTE_PAGO"] : ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO"];
  if (!(await repositorio.cambiarEstado(pedidoId, desde, "CANCELADO"))) {
    throw new ErrorDominio(
      clienteId ? "Este pedido ya está pagado. Escríbenos para cancelarlo." : "Ese pedido ya se entregó.",
      "estado",
    );
  }
  await almacen.liberar(p.unidadIds, usuarioId, `Pedido ${p.numero} cancelado`);
  await domicilios.cancelarDe({ pedidoId });
  if (pagado) await pagos.reembolsarDe({ pedidoId });
  await notificar(p.cliente.id, `Pedido ${p.numero} cancelado`, pagado ? "Te devolvemos el pago a tu medio de pago." : "Cancelamos tu pedido.");
}
