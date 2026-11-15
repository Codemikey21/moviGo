import "server-only";

// Mantenimiento de los vehículos que los clientes compraron en MoviGo:
// PROGRAMADO → EN_CURSO (en el taller) → REALIZADO (con su costo).
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { formatoFechaLarga, formatoPesos } from "@/compartido/utilidades/formato";
import { notificar } from "@/modulos/gestion-notificaciones/servidor/servicio";
import * as repositorio from "./repositorio";

export const vehiculos = (clienteId: string) => repositorio.vehiculosDelCliente(clienteId);
export const deCliente = (clienteId: string) => repositorio.listarDelCliente(clienteId);
export const paraPanel = () => repositorio.listar();

export async function agendar(
  clienteId: string,
  datos: { unidadId: string; tipo: "PREVENTIVO" | "CORRECTIVO"; programadoPara: string; descripcion: string },
) {
  const propios = await repositorio.vehiculosDelCliente(clienteId);
  if (!propios.some((v) => v.unidadId === datos.unidadId)) {
    throw new ErrorDominio("Ese vehículo no está en tu cuenta.", "ajeno");
  }
  const fecha = new Date(`${datos.programadoPara}T00:00:00Z`);
  await repositorio.crear({ ...datos, solicitadoPorId: clienteId, programadoPara: fecha });
  await notificar(clienteId, "Mantenimiento agendado", `Te esperamos el ${formatoFechaLarga.format(fecha)} en el taller MoviGo.`);
}

export async function gestionar(id: string, accion: "iniciar" | "terminar", costo: number) {
  const m = await repositorio.buscar(id);
  if (!m) throw new ErrorDominio("Ese mantenimiento ya no existe.", "no-existe");
  if (accion === "iniciar") {
    if (m.estado !== "PROGRAMADO") throw new ErrorDominio("Ya está en el taller.", "estado");
    await repositorio.actualizar(id, { estado: "EN_CURSO" });
    if (m.cliente) await notificar(m.cliente.id, "Tu vehículo está en el taller", `Estamos revisando tu ${m.producto.nombre}.`);
    return;
  }
  if (m.estado === "REALIZADO") throw new ErrorDominio("Ya estaba terminado.", "estado");
  await repositorio.actualizar(id, { estado: "REALIZADO", costo, realizadoEn: new Date() });
  if (m.cliente) {
    await notificar(m.cliente.id, "Mantenimiento listo", `Tu ${m.producto.nombre} quedó listo${costo ? ` (${formatoPesos.format(costo)})` : ""}. Pásalo a recoger.`);
  }
}
