import "server-only";

// Acceso a datos (Prisma). Es la única capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { NotificacionFila } from "../tipos";

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
