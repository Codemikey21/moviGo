import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { configuracionSupabase } from "@/compartido/servidor/supabase/config";
import * as productos from "../productos/repositorio";
import * as repositorio from "./repositorio";
import { MAX_FOTOS } from "./validaciones";

const prefijoPublico = () =>
  `${configuracionSupabase().url}/storage/v1/object/public/${repositorio.BUCKET_FOTOS}/`;

/** La foto ya se subió al bucket desde el navegador; aquí se guarda en el catálogo. */
export async function registrarFoto(datos: { productoId: string; ruta: string; textoAlt: string }) {
  if (!datos.ruta.startsWith(`${datos.productoId}/`)) {
    throw new ErrorDominio("La foto no corresponde a este producto.", "ruta");
  }
  const producto = await productos.buscarPorId(datos.productoId);
  if (!producto) throw new ErrorDominio("Ese producto ya no existe.", "no-existe");
  if ((await repositorio.contarFotos(datos.productoId)) >= MAX_FOTOS) {
    await repositorio.borrarArchivo(datos.ruta);
    throw new ErrorDominio(`Cada producto puede tener máximo ${MAX_FOTOS} fotos.`, "maximo");
  }

  return repositorio.crearFoto({
    productoId: datos.productoId,
    url: prefijoPublico() + datos.ruta,
    // Si no escriben descripción, se usa el nombre del producto
    textoAlt: datos.textoAlt || `${producto.marca} ${producto.nombre}`,
  });
}

export async function borrarFoto(id: string) {
  const foto = await repositorio.buscarFoto(id);
  if (!foto) return;
  await repositorio.borrarFoto(id);
  // Solo se borra del bucket si la foto vive en nuestro bucket
  if (foto.url.startsWith(prefijoPublico())) {
    await repositorio.borrarArchivo(foto.url.slice(prefijoPublico().length));
  }
}

export async function hacerPrincipal(id: string) {
  const foto = await repositorio.buscarFoto(id);
  if (!foto) throw new ErrorDominio("Esa foto ya no existe.", "no-existe");
  await repositorio.hacerPrincipal(id, foto.productoId);
}
