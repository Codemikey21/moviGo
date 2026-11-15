import "server-only";

// Acceso a datos: la tabla medios (Prisma) y el bucket "productos" (Storage).
import { db } from "@/compartido/servidor/base-de-datos/cliente";
import { crearClienteServidor } from "@/compartido/servidor/supabase/servidor";
import type { Foto } from "../../tipos";

export const BUCKET_FOTOS = "productos";

const camposFoto = { id: true, url: true, textoAlt: true, orden: true, productoId: true } as const;

export async function contarFotos(productoId: string): Promise<number> {
  return db.medio.count({ where: { productoId, tipo: "FOTO" } });
}

/** La foto nueva queda de última. */
export async function crearFoto(datos: {
  productoId: string;
  url: string;
  textoAlt: string;
  colorId: string | null;
  vista: string | null;
}): Promise<Foto> {
  const ultima = await db.medio.aggregate({
    where: { productoId: datos.productoId },
    _max: { orden: true },
  });
  return db.medio.create({
    data: { ...datos, tipo: "FOTO", orden: (ultima._max.orden ?? -1) + 1 },
    select: { id: true, url: true, textoAlt: true, orden: true },
  });
}

export async function buscarFoto(id: string) {
  return db.medio.findUnique({ where: { id }, select: camposFoto });
}

export async function etiquetarFoto(id: string, datos: { colorId: string | null; vista: string | null }): Promise<void> {
  await db.medio.update({ where: { id }, data: datos });
}

export async function borrarFoto(id: string): Promise<void> {
  await db.medio.delete({ where: { id } });
}

/** Pasa la foto al primer lugar: es la que sale en la tarjeta del catálogo. */
export async function hacerPrincipal(id: string, productoId: string): Promise<void> {
  const primera = await db.medio.aggregate({ where: { productoId }, _min: { orden: true } });
  await db.medio.update({ where: { id }, data: { orden: (primera._min.orden ?? 0) - 1 } });
}

/**
 * Borra el archivo del bucket con la sesión del administrador (las políticas
 * de gestion_catalogo_fotos.sql solo se lo permiten a administradores).
 */
export async function borrarArchivo(ruta: string): Promise<void> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.storage.from(BUCKET_FOTOS).remove([ruta]);
  if (error) console.error("No se pudo borrar la foto del bucket:", error.message);
}
