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

export function rutaProducto(producto) {
  return `/tienda/${producto.categoria}/${producto.slug}`
}

// Productos con insignia ("Nuevo" o "Más vendido"), en el orden del catálogo.
export function productosConInsignia(limite = Infinity) {
  return PRODUCTOS.filter((producto) => producto.insignia).slice(0, limite)
}

// Productos pensados para hacer domicilios.
export function productosParaDomicilio(limite = Infinity) {
  return PRODUCTOS.filter((producto) => producto.usoDomicilio).slice(0, limite)
}

// Cuántos productos tiene una categoría.
export function contarProductos(slugCategoria) {
  return productosDeCategoria(slugCategoria).length
}

// Menor tarifa de alquiler por día dentro de un conjunto de productos (o null).
export function alquilerDesdePorDia(productos) {
  const tarifas = productos
    .filter((producto) => producto.precioAlquiler)
    .map((producto) => producto.precioAlquiler.dia)

  return tarifas.length ? Math.min(...tarifas) : null
}
