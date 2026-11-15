import "server-only";

// Portal empresarial: la empresa pide una flota o domicilios en lote
// (ENVIADA), MoviGo responde con una cotización y la empresa la acepta
// (APROBADA) o la rechaza (RECHAZADA).
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import type { TipoSolicitud } from "../tipos";
import * as repositorio from "./repositorio";

export const empresaDe = (clienteId: string) => repositorio.empresaDe(clienteId);
export const paraPanel = () => repositorio.listar();

export async function solicitudesDe(clienteId: string) {
  const empresa = await repositorio.empresaDe(clienteId);
  return empresa ? repositorio.listarDeEmpresa(empresa.id) : [];
}

export async function solicitar(
  clienteId: string,
  empresa: { razonSocial: string; nit: string; sector: string | null; cargo: string } | null,
  datos: { tipo: TipoSolicitud; cantidad: number; desde: string; hasta: string; notas: string | null },
) {
  let empresaId = (await repositorio.empresaDe(clienteId))?.id;
  if (!empresaId) {
    if (!empresa) throw new ErrorDominio("Primero registra los datos de tu empresa.", "sin-empresa");
    empresaId = await repositorio.registrar(clienteId, empresa);
  }
  await repositorio.crearSolicitud({
    empresaId,
    contactoId: clienteId,
    tipo: datos.tipo,
    cantidad: datos.cantidad,
    desde: new Date(`${datos.desde}T00:00:00Z`),
    hasta: new Date(`${datos.hasta}T00:00:00Z`),
    notas: datos.notas,
  });
  await notificar(clienteId, "Recibimos tu solicitud", "Te enviamos la cotización en menos de un día hábil.");
}

export async function cotizar(datos: { solicitudId: string; valor: number; descuento: number; validaHasta: string }) {
  const s = await repositorio.buscar(datos.solicitudId);
  if (!s) throw new ErrorDominio("Esa solicitud ya no existe.", "no-existe");
  if (s.estado !== "ENVIADA") throw new ErrorDominio("Esa solicitud ya fue respondida.", "estado");
  await repositorio.cotizar(datos.solicitudId, {
    valor: datos.valor,
    descuentoAplicado: datos.descuento,
    validaHasta: new Date(`${datos.validaHasta}T00:00:00Z`),
  });
  if (s.contactoId) {
    await notificar(s.contactoId, "Tu cotización está lista", `Valor: ${formatoPesos.format(datos.valor)}. Revísala en el portal empresarial.`);
  }
}

export async function responder(clienteId: string, solicitudId: string, respuesta: "APROBADA" | "RECHAZADA") {
  const s = await repositorio.buscar(solicitudId);
  const empresa = await repositorio.empresaDe(clienteId);
  if (!s || !empresa || s.empresaId !== empresa.id) throw new ErrorDominio("Esa solicitud no es de tu empresa.", "ajena");
  if (!s.cotizacion) throw new ErrorDominio("Aún no tiene cotización.", "sin-cotizacion");
  if (s.estado !== "ENVIADA") throw new ErrorDominio("Ya respondiste esta cotización.", "estado");
  await repositorio.cambiarEstado(solicitudId, respuesta);
}
