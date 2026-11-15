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

/** Datos de administrador: alcance (todo el sistema o un punto) y su punto. */
export async function buscarAdministrador(usuarioId: string) {
  return db.administrador.findUnique({
    where: { usuarioId },
    select: { alcance: true, puntoAsignadoId: true },
  });
}

/** Usuarios para el panel, con cuántos pedidos y alquileres tienen. */
export async function listarUsuarios(busqueda?: string) {
  const texto = busqueda?.trim();
  const filas = await db.usuario.findMany({
    where: texto
      ? { OR: [{ nombre: { contains: texto, mode: "insensitive" } }, { correo: { contains: texto, mode: "insensitive" } }] }
      : undefined,
    orderBy: { creadoEn: "desc" },
    take: 100,
    select: {
      ...camposPerfil,
      activo: true,
      cliente: { select: { _count: { select: { pedidos: true, alquileres: true } } } },
      administrador: { select: { puntoAsignado: { select: { nombre: true } } } },
      domiciliario: { select: { vehiculo: true } },
    },
  });
  return filas.map(({ cliente, administrador, domiciliario, ...u }) => ({
    ...u,
    pedidos: cliente?._count.pedidos ?? 0,
    alquileres: cliente?._count.alquileres ?? 0,
    puntoAsignado: administrador?.puntoAsignado?.nombre ?? null,
    vehiculo: domiciliario?.vehiculo ?? null,
  }));
}

/** Cambia el rol. Los administradores llevan su fila en administradores y los domiciliarios en domiciliarios. */
export async function cambiarRol(
  usuarioId: string,
  rol: "CLIENTE" | "DOMICILIARIO" | "ADMIN_SISTEMA" | "ADMIN_PUNTO",
  puntoId: string | null,
  vehiculo: string | null,
) {
  await db.$transaction(async (tx) => {
    await tx.usuario.update({ where: { id: usuarioId }, data: { rol } });

    if (rol === "ADMIN_SISTEMA" || rol === "ADMIN_PUNTO") {
      const datos = { alcance: rol === "ADMIN_SISTEMA" ? ("SISTEMA" as const) : ("PUNTO" as const), puntoAsignadoId: rol === "ADMIN_PUNTO" ? puntoId : null };
      await tx.administrador.upsert({ where: { usuarioId }, update: datos, create: { usuarioId, ...datos } });
    } else {
      await tx.administrador.deleteMany({ where: { usuarioId } });
    }

    if (rol === "DOMICILIARIO" && vehiculo) {
      await tx.domiciliario.upsert({ where: { usuarioId }, update: { vehiculo }, create: { usuarioId, vehiculo, disponible: false } });
    } else {
      // Se guarda su ficha para no perder el historial de entregas, pero ya no recibe más
      await tx.domiciliario.updateMany({ where: { usuarioId }, data: { disponible: false } });
    }
  });
}

/** Domicilios que la persona tiene asignados o en ruta como domiciliario. */
export async function entregasActivas(usuarioId: string) {
  return db.domicilio.count({ where: { domiciliarioId: usuarioId, estado: { in: ["ASIGNADO", "EN_CURSO"] } } });
}
