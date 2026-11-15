import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { MensajeContactoFila, MotivoContacto, NotificacionFila } from "../tipos";

export async function crear(datos: { usuarioId: string; asunto: string; mensaje: string }) {
  await db.notificacion.create({ data: { ...datos, canal: "EN_APP" } });
}

export async function listar(usuarioId: string, limite: number): Promise<NotificacionFila[]> {
  return db.notificacion.findMany({
    where: { usuarioId },
    orderBy: { enviadaEn: "desc" },
    take: limite,
    select: { id: true, asunto: true, mensaje: true, enviadaEn: true, leida: true },
  });
}

export async function marcarLeidas(usuarioId: string) {
  await db.notificacion.updateMany({ where: { usuarioId, leida: false }, data: { leida: true } });
}

/* --- Contacto --- */

export async function crearMensaje(datos: {
  nombre: string;
  correo: string;
  telefono: string | null;
  motivo: MotivoContacto;
  mensaje: string;
}) {
  await db.mensajeContacto.create({ data: datos });
}

export async function listarMensajes(atendidos: boolean, limite = 100): Promise<MensajeContactoFila[]> {
  const filas = await db.mensajeContacto.findMany({
    where: { atendido: atendidos },
    orderBy: { creadoEn: atendidos ? "desc" : "asc" },
    take: limite,
  });
  return filas.map((f) => ({ ...f, motivo: f.motivo as MotivoContacto }));
}

export async function contarMensajes() {
  const [pendientes, atendidos] = await Promise.all([
    db.mensajeContacto.count({ where: { atendido: false } }),
    db.mensajeContacto.count({ where: { atendido: true } }),
  ]);
  return { pendientes, atendidos };
}

export async function marcarAtendido(id: string, atendido: boolean) {
  await db.mensajeContacto.updateMany({ where: { id }, data: { atendido } });
}

/* --- Boletín --- */

/** Devuelve true si el correo es nuevo. */
export async function suscribir(correo: string): Promise<boolean> {
  const { count } = await db.suscripcionBoletin.createMany({ data: [{ correo }], skipDuplicates: true });
  return count > 0;
}

export async function contarSuscriptores() {
  return db.suscripcionBoletin.count();
}
