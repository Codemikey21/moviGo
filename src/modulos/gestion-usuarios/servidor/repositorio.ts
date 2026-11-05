import "server-only";

// Acceso a datos (Prisma). Es la unica capa que habla con la base de datos.
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import type { PerfilUsuario } from "../tipos";

const camposPerfil = {
  id: true,
  correo: true,
  nombre: true,
  telefono: true,
  rol: true,
  creadoEn: true,
} as const;

/**
 * El perfil lo crea la base de datos sola cuando alguien se registra
 * (ver database/migraciones/gestion_usuarios_autenticacion.sql).
 */
export async function buscarPerfilPorId(id: string): Promise<PerfilUsuario | null> {
  return db.usuario.findUnique({
    where: { id },
    select: camposPerfil,
  });
}

/**
 * Crea el perfil de cliente de una cuenta que no lo tiene (por ejemplo, una
 * cuenta creada antes de aplicar la migración). Si ya existe, no lo toca.
 */
export async function crearPerfilCliente(datos: {
  id: string;
  correo: string;
  nombre: string;
  telefono: string | null;
}): Promise<PerfilUsuario> {
  return db.usuario.upsert({
    where: { id: datos.id },
    update: {},
    create: { ...datos, rol: "CLIENTE", cliente: { create: {} } },
    select: camposPerfil,
  });
}
