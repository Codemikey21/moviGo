import "server-only";

// Reglas del alquiler:
// SOLICITADO (esperando pago) → ASIGNADO (pagado, unidad apartada)
// → EN_CURSO (el cliente tiene el vehículo) → COMPLETADO (lo devolvió).
// El inventario lo maneja el almacén: aquí solo se le pide.
import { randomBytes } from "node:crypto";
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { formatoFechaLarga } from "@/compartido/utilidades/formato";
import * as almacen from "@/modulos/gestion-almacen/servidor/unidades/servicio";
import * as catalogo from "@/modulos/gestion-catalogo/servidor/productos/servicio";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import * as pagos from "@/modulos/gestion-pagos/servidor/servicio";
import type { EstadoServicio } from "../../tipos";
import { COSTO_DOMICILIO, cancelarDe, crearEntrega, deAlquiler, type DestinoEntrega } from "../domicilios/servicio";
import * as repositorio from "./repositorio";

const DIA = 86_400_000;

/** Código de 6 caracteres que el cliente muestra en el punto: K7Q2PX */
async function codigoNuevo() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const codigo = [...randomBytes(6)].map((b) => alfabeto[b % alfabeto.length]).join("");
    if (!(await repositorio.codigoEnUso(codigo))) return codigo;
  }
}

/** Crea el alquiler, aparta una unidad y deja listo el pago. */
export async function crear(
  clienteId: string,
  datos: { productoId: string; fechaInicio: string; dias: number; entrega: "EN_PUNTO" | "A_DOMICILIO"; puntoId: string },
  destino: DestinoEntrega | null,
) {
  const producto = await catalogo.productoPorId(datos.productoId);
  if (!producto?.activo || producto.tarifaAlquilerDia === null) {
    throw new ErrorDominio("Este producto no se alquila.", "no-alquila");
  }

  const [unidad] = await almacen.reservar({
    productoId: producto.id,
    cantidad: 1,
    puntoId: datos.puntoId,
    usuarioId: clienteId,
    nota: "Reserva de alquiler",
  });

  const inicio = new Date(`${datos.fechaInicio}T00:00:00Z`);
  const total = producto.tarifaAlquilerDia * datos.dias + (datos.entrega === "A_DOMICILIO" ? COSTO_DOMICILIO : 0);

  let alquilerId: string;
  try {
    alquilerId = await repositorio.crear({
      clienteId,
      unidadId: unidad.id,
      puntoRecogidaId: datos.puntoId,
      fechaInicio: inicio,
      fechaFin: new Date(inicio.getTime() + datos.dias * DIA),
      entrega: datos.entrega,
      codigoRecogida: await codigoNuevo(),
      total,
    });
    if (datos.entrega === "A_DOMICILIO" && destino) {
      await crearEntrega({
        clienteId,
        alquilerId,
        puntoOrigenId: datos.puntoId,
        destino,
        descripcion: `Alquiler: ${producto.marca} ${producto.nombre} (${datos.dias} día${datos.dias === 1 ? "" : "s"})`,
      });
    }
  } catch (error) {
    await almacen.liberar([unidad.id], clienteId, "No se pudo crear el alquiler");
    throw error;
  }

  const pago = await pagos.iniciar({ alquilerId, monto: total });
  return { alquilerId, referencia: pago.referencia };
}

export const detalle = (id: string) => repositorio.buscar(id);
export const deCliente = (clienteId: string) => repositorio.listarDelCliente(clienteId);
export const paraPanel = (estados?: EstadoServicio[]) => repositorio.listar(estados);
export const conteos = () => repositorio.contarPorEstado();

/** Lo llama Pagos cuando la pasarela aprueba. */
export async function confirmarPago(alquilerId: string) {
  if (!(await repositorio.cambiarEstado(alquilerId, ["SOLICITADO"], "ASIGNADO"))) return;
  const a = await repositorio.buscar(alquilerId);
  if (!a) return;
  await notificar(
    a.cliente.id,
    "Tu alquiler está confirmado",
    a.entrega === "EN_PUNTO"
      ? `Recoge tu ${a.producto.nombre} en ${a.punto?.nombre} el ${formatoFechaLarga.format(a.fechaInicio)} con el código ${a.codigoRecogida}.`
      : `Te llevamos tu ${a.producto.nombre} el ${formatoFechaLarga.format(a.fechaInicio)}. Te avisamos cuando salga.`,
  );
}

/** Lo llama Pagos cuando la pasarela rechaza: el cliente puede intentar de nuevo. */
export async function pagoRechazado(alquilerId: string) {
  const a = await repositorio.buscar(alquilerId);
  if (a) await notificar(a.cliente.id, "No se pudo cobrar tu alquiler", "Tu banco rechazó el pago. Puedes intentarlo otra vez con otro medio.");
}

/** El cliente recibe el vehículo (en el punto o a domicilio). */
export async function marcarEntregado(alquilerId: string, usuarioId: string) {
  const a = await repositorio.buscar(alquilerId);
  if (!a) throw new ErrorDominio("Ese alquiler ya no existe.", "no-existe");
  if (!(await repositorio.cambiarEstado(alquilerId, ["ASIGNADO"], "EN_CURSO"))) {
    throw new ErrorDominio("El alquiler no está listo para entregar (¿ya está pagado?).", "estado");
  }
  await almacen.entregarAlquiler(a.unidad.id, usuarioId, `Alquiler ${a.codigoRecogida}`);
  await notificar(a.cliente.id, "¡Buen viaje!", `Ya tienes tu ${a.producto.nombre}. Recuerda devolverlo a tiempo.`);
}

/** El cliente devuelve el vehículo: vuelve a estar disponible. */
export async function recibirDevolucion(alquilerId: string, usuarioId: string) {
  const a = await repositorio.buscar(alquilerId);
  if (!a) throw new ErrorDominio("Ese alquiler ya no existe.", "no-existe");
  if (!(await repositorio.cambiarEstado(alquilerId, ["EN_CURSO"], "COMPLETADO"))) {
    throw new ErrorDominio("Ese alquiler no está en curso.", "estado");
  }
  await almacen.recibirDevolucion(a.unidad.id, usuarioId, `Devolución alquiler ${a.codigoRecogida}`);
  await notificar(a.cliente.id, "Gracias por rodar con MoviGo", `Recibimos tu ${a.producto.nombre}. ¡Te esperamos pronto!`);
}

/** Cancela un alquiler que aún no empieza. Si estaba pagado, se reembolsa. */
export async function cancelar(alquilerId: string, usuarioId: string, clienteId?: string) {
  const a = await repositorio.buscar(alquilerId);
  if (!a || (clienteId && a.cliente.id !== clienteId)) throw new ErrorDominio("Ese alquiler no existe.", "no-existe");
  if ((await deAlquiler(alquilerId))?.estado === "EN_CURSO") {
    throw new ErrorDominio("El vehículo ya va en camino: no se puede cancelar.", "en-camino");
  }
  if (!(await repositorio.cambiarEstado(alquilerId, ["SOLICITADO", "ASIGNADO"], "CANCELADO"))) {
    throw new ErrorDominio("Ese alquiler ya empezó o terminó: no se puede cancelar.", "estado");
  }
  await almacen.liberar([a.unidad.id], usuarioId, "Alquiler cancelado");
  await cancelarDe({ alquilerId });
  if (a.pagado) await pagos.reembolsarDe({ alquilerId });
  await notificar(a.cliente.id, "Alquiler cancelado", `Cancelamos el alquiler de tu ${a.producto.nombre}.${a.pagado ? " Te devolvemos el pago." : ""}`);
}
