import { CATEGORIAS, PRODUCTOS } from '../data/catalogo'

// ---------------------------------------------------------------------------
// Precios
// ---------------------------------------------------------------------------

const formateadorPesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Ejemplo: 3290000 → "$ 3.290.000"
export function formatearPrecio(valor) {
  return formateadorPesos.format(valor)
}

// Texto para los datos que faltan por confirmar (precio, tarifa, disponibilidad…).
export const TEXTO_POR_CONFIRMAR = 'Por confirmar'

// Precio de referencia en COP o, si el catálogo no tiene una fuente colombiana
// verificable (precioCompra es null), "Por confirmar".
export function formatearPrecioReferencia(valor) {
  return valor === null ? TEXTO_POR_CONFIRMAR : formateadorPesos.format(valor)
}

// Textos que acompañan a los precios: no son ofertas ni tarifas reales de MoviGo.
export const ETIQUETA_PRECIO = 'Precio de referencia'
export const ETIQUETA_TARIFA = 'Tarifa de ejemplo'

// Explicación que acompaña a "Alquilar" cuando el producto no se alquila.
export const MOTIVO_SIN_ALQUILER = 'Este producto solo se ofrece para compra.'

// ---------------------------------------------------------------------------
// Especificaciones
// ---------------------------------------------------------------------------

// Con separador de miles aunque tenga cuatro cifras (1500 → "1.500") y coma decimal.
const formateadorNumeros = new Intl.NumberFormat('es-CO', {
  useGrouping: 'always',
  maximumFractionDigits: 2,
})

// Une el valor con su unidad usando un espacio que no se parte entre líneas.
// Ejemplos: { valor: 16.2, unidad: 'kg' } → "16,2 kg"; { valor: 'Hasta 60', unidad: 'km' } → "Hasta 60 km"
export function formatearEspecificacion({ valor, unidad }) {
  const texto = typeof valor === 'number' ? formateadorNumeros.format(valor) : valor
  return unidad ? `${texto}\u00A0${unidad}` : texto
}

// ---------------------------------------------------------------------------
// Búsqueda por slug
// ---------------------------------------------------------------------------

export function buscarCategoria(slug) {
  return CATEGORIAS.find((categoria) => categoria.slug === slug) ?? null
}

export function buscarProducto(slugCategoria, slugProducto) {
  return (
    PRODUCTOS.find(
      (producto) =>
        producto.categoria === slugCategoria && producto.slug === slugProducto,
    ) ?? null
  )
}

export function productosDeCategoria(slugCategoria) {
  return PRODUCTOS.filter((producto) => producto.categoria === slugCategoria)
}

// ---------------------------------------------------------------------------
// Rutas y selecciones de productos
// ---------------------------------------------------------------------------

export function rutaCategoria(categoria) {
  return `/tienda/${categoria.slug}`
}

// Con modo "alquilar" el enlace conserva el modo (?modo=alquilar); con "comprar"
// no lleva parámetro, porque es el modo por defecto.
export function rutaProducto(producto, modo = 'comprar') {
  const ruta = `/tienda/${producto.categoria}/${producto.slug}`
  return modo === 'alquilar' ? `${ruta}?modo=alquilar` : ruta
}

// Un producto por categoría (el primero del catálogo), para mostrar una muestra.
export function productosMuestra(limite = Infinity) {
  return CATEGORIAS.map((categoria) => productosDeCategoria(categoria.slug)[0])
    .filter(Boolean)
    .slice(0, limite)
}

// Cuántos productos tiene una categoría.
export function contarProductos(slugCategoria) {
  return productosDeCategoria(slugCategoria).length
}

// Menor tarifa de ejemplo por día dentro de un conjunto de productos (o null).
export function alquilerDesdePorDia(productos) {
  const tarifas = productos
    .filter((producto) => producto.tarifasAlquiler)
    .map((producto) => producto.tarifasAlquiler.dia)

  return tarifas.length ? Math.min(...tarifas) : null
}
