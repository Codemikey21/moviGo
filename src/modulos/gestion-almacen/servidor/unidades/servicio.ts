import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
// Usa repositorio.ts para leer y escribir datos.
import { randomBytes } from "node:crypto";
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import type { CambioUnidad } from "../../tipos";
import * as colores from "@/modulos/gestion-catalogo/servidor/colores/servicio";
import * as repositorio from "./repositorio";

/** Quién hace el cambio y qué punto puede manejar (null = todos). */
type Administrador = { id: string; puntoId: string | null };

function exigirPunto(admin: Administrador, puntoId: string) {
  if (admin.puntoId && admin.puntoId !== puntoId) {
    throw new ErrorDominio("Solo puedes mover inventario de tu punto de servicio.", "otro-punto");
  }
}

async function exigirEspacio(puntoId: string, cuantas: number) {
  const punto = await repositorio.buscarPunto(puntoId);
  if (!punto) throw new ErrorDominio("Ese punto de servicio no existe o está cerrado.", "punto");
  const libres = punto.capacidad - punto._count.unidades;
  if (cuantas > libres) {
    throw new ErrorDominio(
      libres > 0
        ? `${punto.nombre} solo tiene espacio para ${libres} unidad(es) más.`
        : `${punto.nombre} está lleno (capacidad ${punto.capacidad}).`,
      "capacidad",
    );
  }
  return punto;
}

/** Serial interno cuando el producto no trae uno: MV-2611-K7Q2PX */
function serialInterno() {
  const fecha = new Date();
  const aamm = `${String(fecha.getFullYear()).slice(2)}${String(fecha.getMonth() + 1).padStart(2, "0")}`;
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I
  const aleatorio = [...randomBytes(6)].map((b) => alfabeto[b % alfabeto.length]).join("");
  return `MV-${aamm}-${aleatorio}`;
}

export async function registrar(
  admin: Administrador,
  datos: {
    productoId: string;
    puntoId: string;
    colorId: string | null;
    seriales: string[];
    cantidad: number;
    nota: string | null;
  },
) {
  exigirPunto(admin, datos.puntoId);
  if (!(await repositorio.existeProducto(datos.productoId))) {
    throw new ErrorDominio("Ese producto ya no existe.", "no-existe");
  }
  await colores.validarColor(datos.productoId, datos.colorId);
  await exigirEspacio(datos.puntoId, datos.cantidad);

  let seriales = datos.seriales;
  if (seriales.length) {
    const repetidos = await repositorio.serialesEnUso(seriales);
    if (repetidos.length) {
      throw new ErrorDominio(`Estos seriales ya están registrados: ${repetidos.join(", ")}.`, "serial");
    }
  } else {
    // Seriales internos; si alguno choca (muy raro) se genera otro
    do {
      seriales = Array.from({ length: datos.cantidad }, serialInterno);
    } while (
      new Set(seriales).size < seriales.length ||
      (await repositorio.serialesEnUso(seriales)).length
    );
  }

  await repositorio.registrarUnidades({
    productoId: datos.productoId,
    puntoId: datos.puntoId,
    colorId: datos.colorId,
    seriales,
    registradoPorId: admin.id,
    nota: datos.nota,
  });
  return seriales.length;
}

/** Taller de ida y vuelta, o traslado a otro punto. Solo con unidades libres. */
export async function mover(
  admin: Administrador,
  datos: { unidadId: string; cambio: CambioUnidad; destinoId?: string },
) {
  const unidad = await repositorio.buscarUnidad(datos.unidadId);
  if (!unidad) throw new ErrorDominio("Esa unidad ya no existe.", "no-existe");
  exigirPunto(admin, unidad.puntoServicioId);

  const base = { unidadId: unidad.id, registradoPorId: admin.id, nota: null };

  if (datos.cambio === "A_TALLER") {
    if (unidad.estado !== "DISPONIBLE") {
      throw new ErrorDominio("Solo una unidad disponible puede ir al taller.", "estado");
    }
    return repositorio.moverUnidad({
      ...base,
      estado: "EN_TALLER",
      puntoId: unidad.puntoServicioId,
      tipo: "A_TALLER",
      destinoId: null,
    });
  }

  if (datos.cambio === "DE_TALLER") {
    if (unidad.estado !== "EN_TALLER") {
      throw new ErrorDominio("Esa unidad no está en el taller.", "estado");
    }
    return repositorio.moverUnidad({
      ...base,
      estado: "DISPONIBLE",
      puntoId: unidad.puntoServicioId,
      tipo: "DE_TALLER",
      destinoId: null,
    });
  }

  // Traslado
  if (unidad.estado !== "DISPONIBLE") {
    throw new ErrorDominio("Solo se puede trasladar una unidad disponible.", "estado");
  }
  if (!datos.destinoId || datos.destinoId === unidad.puntoServicioId) {
    throw new ErrorDominio("Elige un punto de destino diferente.", "destino");
  }
  await exigirEspacio(datos.destinoId, 1);
  return repositorio.moverUnidad({
    ...base,
    estado: "DISPONIBLE",
    puntoId: datos.destinoId,
    tipo: "TRASLADO",
    destinoId: datos.destinoId,
  });
}

export const unidadesDe = (productoId: string) => repositorio.listarPorProducto(productoId);

// ---------------------------------------------------------------------------
// API del almacén para los otros módulos (pedidos y alquileres).
// Ellos nunca tocan las unidades directamente: piden aquí.
// ---------------------------------------------------------------------------

/**
 * Aparta unidades disponibles de un producto. Con punto, solo de ese punto;
 * sin punto, de cualquiera. Con color, solo de ese color. Si no alcanzan,
 * no aparta ninguna.
 */
export async function reservar(datos: {
  productoId: string;
  cantidad: number;
  puntoId: string | null;
  colorId?: string | null;
  usuarioId: string;
  nota: string;
}): Promise<{ id: string; serial: string; puntoServicioId: string }[]> {
  const candidatas = await repositorio.buscarDisponibles(datos.productoId, datos.puntoId, datos.colorId ?? null);
  if (candidatas.length < datos.cantidad) {
    throw new ErrorDominio(
      candidatas.length === 0
        ? datos.colorId
          ? "Ya no quedan unidades de ese color en ese punto."
          : "Ya no quedan unidades disponibles de este producto en ese punto."
        : `Solo quedan ${candidatas.length} unidad(es) disponibles.`,
      "sin-stock",
    );
  }
  const elegidas = candidatas.slice(0, datos.cantidad);
  const reservadas = await repositorio.cambiarEstado({
    unidadIds: elegidas.map((u) => u.id),
    desde: ["DISPONIBLE"],
    hacia: "RESERVADA",
    tipo: "RESERVA",
    registradoPorId: datos.usuarioId,
    nota: datos.nota,
  });
  if (reservadas.length < elegidas.length) {
    // Otro cliente se llevó alguna en el mismo instante: se devuelve lo apartado
    await liberar(reservadas, datos.usuarioId, "Reserva incompleta");
    throw new ErrorDominio("Alguien acaba de apartar la última unidad. Intenta de nuevo.", "sin-stock");
  }
  return elegidas;
}

/** Devuelve al inventario unidades apartadas (pago rechazado o pedido cancelado). */
export async function liberar(unidadIds: string[], usuarioId: string, nota: string) {
  if (!unidadIds.length) return;
  await repositorio.cambiarEstado({
    unidadIds,
    desde: ["RESERVADA"],
    hacia: "DISPONIBLE",
    tipo: "DEVOLUCION",
    registradoPorId: usuarioId,
    nota,
  });
}

/** La unidad vendida sale del punto. */
export async function entregarVenta(unidadIds: string[], usuarioId: string, nota: string) {
  await repositorio.cambiarEstado({
    unidadIds,
    desde: ["RESERVADA"],
    hacia: "VENDIDA",
    tipo: "SALIDA_VENTA",
    registradoPorId: usuarioId,
    nota,
  });
}

/** El cliente se lleva la unidad alquilada. */
export async function entregarAlquiler(unidadId: string, usuarioId: string, nota: string) {
  await repositorio.cambiarEstado({
    unidadIds: [unidadId],
    desde: ["RESERVADA"],
    hacia: "ALQUILADA",
    tipo: "SALIDA_ALQUILER",
    registradoPorId: usuarioId,
    nota,
  });
}

/** El cliente devuelve la unidad alquilada: queda disponible otra vez. */
export async function recibirDevolucion(unidadId: string, usuarioId: string, nota: string) {
  await repositorio.cambiarEstado({
    unidadIds: [unidadId],
    desde: ["ALQUILADA", "RESERVADA"],
    hacia: "DISPONIBLE",
    tipo: "DEVOLUCION",
    registradoPorId: usuarioId,
    nota,
  });
}
