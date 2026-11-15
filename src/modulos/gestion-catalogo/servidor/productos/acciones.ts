"use server";

// Server Actions: único punto de entrada que la interfaz puede llamar.
// Valida con validaciones.ts, aplica permisos y delega en servicio.ts.
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { esErrorDominio } from "@/compartido/servidor/errores/errores";
import type { EstadoFormulario } from "@/compartido/tipos/formulario";
import { erroresPorCampo, texto } from "@/compartido/utilidades/formularios";
import type { FiltroCatalogo, ProductoDetalle, ProductoResumen } from "../../tipos";
import * as servicio from "./servicio";
import { esquemaFiltro, esquemaId, esquemaProducto } from "./validaciones";

// ---------------------------------------------------------------------------
// Catálogo público (no pide sesión)
// ---------------------------------------------------------------------------

/** Productos activos, filtrados por categoría, comprar/alquilar o texto. */
export async function listarCatalogo(filtro: FiltroCatalogo = {}): Promise<ProductoResumen[]> {
  const resultado = esquemaFiltro.safeParse(filtro);
  return servicio.catalogo(resultado.success ? resultado.data : {});
}

/** Ficha de un producto activo por su slug; null si no existe. */
export async function obtenerProducto(slug: string): Promise<ProductoDetalle | null> {
  return servicio.fichaPublica(slug);
}

// ---------------------------------------------------------------------------
// Panel de administración
// ---------------------------------------------------------------------------

/** Todos los productos, también los desactivados. */
export async function listarProductosAdmin(filtro: FiltroCatalogo = {}): Promise<ProductoResumen[]> {
  await requerirRol("ADMIN_SISTEMA", "ADMIN_PUNTO");
  const resultado = esquemaFiltro.safeParse(filtro);
  return servicio.catalogoCompleto(resultado.success ? resultado.data : {});
}

export async function obtenerProductoAdmin(
  id: string,
): Promise<(ProductoDetalle & { categoriaId: string }) | null> {
  await requerirRol("ADMIN_SISTEMA", "ADMIN_PUNTO");
  if (!esquemaId.safeParse(id).success) return null;
  return servicio.productoPorId(id);
}

/** Crea el producto (sin id) o lo actualiza (con id). */
export async function guardarProductoAccion(
  _anterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requerirRol("ADMIN_SISTEMA");

  const id = texto(formData, "id");
  const etiquetas = formData.getAll("especEtiqueta").map(String);
  const valoresEspec = formData.getAll("especValor").map(String);

  const valores = {
    categoriaId: texto(formData, "categoriaId"),
    nombre: texto(formData, "nombre"),
    marca: texto(formData, "marca"),
    modelo: texto(formData, "modelo"),
    descripcion: texto(formData, "descripcion"),
    precioVenta: texto(formData, "precioVenta"),
    tarifaAlquilerDia: texto(formData, "tarifaAlquilerDia"),
    alquila: formData.get("alquila") ? "on" : "",
    especificaciones: JSON.stringify(etiquetas.map((etiqueta, i) => ({ etiqueta, valor: valoresEspec[i] ?? "" }))),
  };

  const resultado = esquemaProducto.safeParse({
    ...valores,
    alquila: valores.alquila === "on",
    especificaciones: etiquetas.map((etiqueta, i) => ({ etiqueta, valor: valoresEspec[i] ?? "" })),
  });
  if (!resultado.success) {
    return {
      estado: "error",
      mensaje: "Revisa los campos marcados.",
      errores: erroresPorCampo(resultado.error),
      valores,
    };
  }

  let nuevoId: string;
  try {
    if (id) {
      if (!esquemaId.safeParse(id).success) return { estado: "error", mensaje: "Producto no válido." };
      await servicio.actualizar(id, resultado.data);
      refresh();
      return { estado: "exito", mensaje: "Cambios guardados." };
    }
    nuevoId = await servicio.crear(resultado.data);
  } catch (error) {
    if (esErrorDominio(error)) return { estado: "error", mensaje: error.message, valores };
    throw error;
  }

  // Al crear, se pasa a la ficha del producto para subir fotos y unidades
  redirect(`/admin/inventario/${nuevoId}?aviso=creado`);
}

/** Muestra u oculta el producto en el catálogo público. */
export async function cambiarActivoProductoAccion(formData: FormData): Promise<void> {
  await requerirRol("ADMIN_SISTEMA");
  const id = esquemaId.parse(texto(formData, "id"));
  await servicio.cambiarActivo(id, texto(formData, "activo") === "true");
  refresh();
}
