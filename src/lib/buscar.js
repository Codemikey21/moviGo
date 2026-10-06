import { CATEGORIAS, PRODUCTOS } from '../data/catalogo'

// Pasa a minúsculas y quita tildes para que "bateria" encuentre "Batería".
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/**
 * Puntaje de un conjunto de campos para las palabras buscadas.
 * Cada palabra debe aparecer en algún campo; si falta alguna devuelve 0.
 * Los campos más importantes (primeros) suman más puntos.
 */
function puntuar(palabras, campos) {
  let total = 0

  for (const palabra of palabras) {
    let mejor = 0

    campos.forEach((campo, indice) => {
      if (!campo.includes(palabra)) return
      const peso = campos.length - indice
      mejor = Math.max(mejor, campo.startsWith(palabra) ? peso + 1 : peso)
    })

    if (mejor === 0) return 0
    total += mejor
  }

  return total
}

/**
 * Busca categorías y productos del catálogo.
 * Devuelve { categorias, productos } ordenados por relevancia.
 */
export function buscarEnCatalogo(consulta, limiteProductos = 8) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean)

  if (palabras.length === 0) {
    return { categorias: [], productos: [] }
  }

  const categorias = CATEGORIAS.map((categoria) => ({
    categoria,
    puntaje: puntuar(palabras, [
      normalizar(categoria.nombre),
      normalizar(categoria.tagline),
      normalizar(categoria.descripcion),
    ]),
  }))
    .filter((resultado) => resultado.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .map((resultado) => resultado.categoria)

  const productos = PRODUCTOS.map((producto) => {
    const categoria = CATEGORIAS.find((c) => c.slug === producto.categoria)

    return {
      producto,
      puntaje: puntuar(palabras, [
        normalizar(producto.nombre),
        normalizar(categoria.nombre),
        normalizar(producto.descripcion),
      ]),
    }
  })
    .filter((resultado) => resultado.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limiteProductos)
    .map((resultado) => resultado.producto)

  return { categorias, productos }
}
