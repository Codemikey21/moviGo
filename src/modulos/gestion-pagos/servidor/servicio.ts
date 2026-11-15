import "server-only";

// Reglas de los pagos.
// 1. Al crear un pedido o un alquiler se crea su Pago (PENDIENTE).
// 2. El cliente paga en /pagar/<referencia>: la pasarela cobra y manda un
//    aviso firmado (webhook) con el resultado.
// 3. recibirEvento() revisa la firma, guarda el aviso, actualiza el pago y
//    le avisa a pedidos o alquileres. El mismo camino lo usa la ruta
//    /api/webhooks/pagos, que es por donde llegaría una pasarela real.
import { randomBytes } from "node:crypto";
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { formatoFechaLarga } from "@/compartido/utilidades/formato";
import * as pedidos from "@/modulos/gestion-pedidos/servidor/compras/servicio";
import * as alquileres from "@/modulos/gestion-servicios/servidor/alquiler/servicio";
import type { MetodoPago, PagoParaPagar, ResultadoPago } from "../tipos";
import { firmaValida, firmar, pasarelaActual, type SolicitudCobro } from "./pasarela";
import * as repositorio from "./repositorio";
import { esquemaEvento } from "./validaciones";

async function referenciaNueva() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const ref = `MVP-${[...randomBytes(10)].map((b) => alfabeto[b % alfabeto.length]).join("")}`;
    if (!(await repositorio.referenciaEnUso(ref))) return ref;
  }
}

export async function iniciar(datos: { pedidoId?: string; alquilerId?: string; monto: number }) {
  return repositorio.crear({ ...datos, referencia: await referenciaNueva() });
}

/** Datos de la pantalla de pago. Solo el dueño del pedido o alquiler los ve. */
export async function paraPagar(referencia: string, clienteId: string): Promise<PagoParaPagar | null> {
  const p = await repositorio.buscarPorReferencia(referencia);
  const dueno = p?.pedido?.clienteId ?? p?.alquiler?.clienteId;
  if (!p || dueno !== clienteId) return null;

  const evento = p.eventos[0]?.cuerpo as
    | { metodo: MetodoPago; detalle: string; motivo: string | null; transaccionId: string }
    | undefined;

  let concepto: string;
  if (p.pedido) {
    const nombres = p.pedido.lineas.map((l) => `${l.producto.marca} ${l.producto.nombre}`);
    const unicos = [...new Set(nombres)];
    concepto = `Pedido ${p.pedido.numero} · ${unicos[0]}${unicos.length > 1 ? ` y ${unicos.length - 1} más` : ""}`;
  } else {
    const a = p.alquiler!;
    const dias = Math.round((a.fechaFin.getTime() - a.fechaInicio.getTime()) / 86_400_000);
    concepto = `Alquiler ${a.unidad.producto.marca} ${a.unidad.producto.nombre} · ${dias} día${dias === 1 ? "" : "s"} desde el ${formatoFechaLarga.format(a.fechaInicio)}`;
  }

  return {
    referencia: p.referencia,
    monto: Number(p.monto),
    estado: p.estado,
    creadoEn: p.creadoEn,
    confirmadoEn: p.confirmadoEn,
    concepto,
    tipo: p.pedido ? "pedido" : "alquiler",
    destino: p.pedido ? `/mi-cuenta/pedidos/${p.pedido.numero}` : `/mi-cuenta/alquileres/${p.alquiler!.id}`,
    ultimoEvento: evento ?? null,
  };
}

/** Cobra con la pasarela y procesa su aviso. */
export async function pagar(referencia: string, clienteId: string, solicitud: SolicitudCobro): Promise<ResultadoPago> {
  const pago = await paraPagar(referencia, clienteId);
  if (!pago) throw new ErrorDominio("Ese pago no existe.", "no-existe");
  if (pago.estado === "APROBADO") return { estado: "APROBADO", transaccionId: pago.ultimoEvento?.transaccionId ?? "" };
  if (pago.estado === "REEMBOLSADO") throw new ErrorDominio("Este pago fue cancelado.", "estado");

  const respuesta = await pasarelaActual.cobrar(referencia, pago.monto, solicitud);

  // La pasarela manda su aviso firmado; se procesa igual que el webhook
  const cuerpo = JSON.stringify({
    tipo: "transaccion.actualizada",
    referencia,
    monto: pago.monto,
    fecha: new Date().toISOString(),
    ...respuesta,
  });
  await recibirEvento(cuerpo, firmar(cuerpo));

  return respuesta.estado === "APROBADO"
    ? { estado: "APROBADO", transaccionId: respuesta.transaccionId }
    : { estado: "RECHAZADO", motivo: respuesta.motivo ?? "Pago rechazado" };
}

/** Procesa un aviso de la pasarela. Devuelve false si la firma no sirve. */
export async function recibirEvento(cuerpo: string, firma: string): Promise<boolean> {
  if (!firma || !firmaValida(cuerpo, firma)) return false;

  const evento = esquemaEvento.parse(JSON.parse(cuerpo));
  const pago = await repositorio.buscarPorReferencia(evento.referencia);
  const eventoId = await repositorio.guardarEvento({
    pagoId: pago?.id ?? null,
    tipo: evento.tipo,
    firma,
    cuerpo: evento,
  });
  if (!pago) return true;

  // Un aviso repetido de un pago ya aprobado no hace nada (idempotente)
  if (pago.estado !== "APROBADO" && pago.estado !== "REEMBOLSADO") {
    if (evento.estado === "APROBADO") {
      await repositorio.actualizarEstado(pago.id, "APROBADO", new Date());
      if (pago.pedidoId) await pedidos.confirmarPago(pago.pedidoId);
      if (pago.alquilerId) await alquileres.confirmarPago(pago.alquilerId);
    } else {
      await repositorio.actualizarEstado(pago.id, "RECHAZADO", null);
      if (pago.pedidoId) await pedidos.pagoRechazado(pago.pedidoId);
      if (pago.alquilerId) await alquileres.pagoRechazado(pago.alquilerId);
    }
  }
  await repositorio.marcarProcesado(eventoId);
  return true;
}

export const reembolsarDe = (filtro: { pedidoId?: string; alquilerId?: string }) => repositorio.reembolsar(filtro);

/** Para el panel: ingresos del mes, totales y por día (últimos 14 días). */
/** Fecha AAAA-MM-DD en la hora de Colombia. */
const diaEnColombia = (fecha: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(fecha);

export async function resumenIngresos() {
  // Los días se cuentan en la hora de Colombia (UTC-5), no en la del servidor
  const hoy = diaEnColombia(new Date());
  const dias = Array.from({ length: 14 }, (_, i) => {
    const dia = new Date(`${hoy}T12:00:00Z`);
    dia.setUTCDate(dia.getUTCDate() - (13 - i));
    return { clave: dia.toISOString().slice(0, 10), total: 0 };
  });
  const desde = new Date(`${dias[0].clave}T00:00:00-05:00`);
  const inicioMes = new Date(`${hoy.slice(0, 7)}-01T00:00:00-05:00`);
  const [mes, total, pagos] = await Promise.all([
    repositorio.ingresos(inicioMes),
    repositorio.ingresos(),
    repositorio.ingresosPorDia(desde),
  ]);
  const periodo = { ventas: 0, alquileres: 0 };
  for (const p of pagos) {
    const dia = dias.find((d) => d.clave === diaEnColombia(p.fecha));
    if (dia) dia.total += p.monto;
    if (p.tipo === "alquiler") periodo.alquileres += p.monto;
    else periodo.ventas += p.monto;
  }
  return { mes, total, dias, periodo };
}
