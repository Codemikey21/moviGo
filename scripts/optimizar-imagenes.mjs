#!/usr/bin/env node
/**
 * Optimiza las fotos de los productos y actualiza el manifiesto de medios.
 *
 * Uso:
 *   npm run imagenes                       procesa public/productos-origen/
 *   npm run imagenes -- --solo-manifiesto  solo regenera el manifiesto
 *
 * Qué hace:
 *  1. Lee public/productos-origen/ (no se versiona; ver .gitignore). Los archivos
 *     deben llamarse <categoria>-<slug>-<idVista>.<ext>, por ejemplo
 *     patinetas-niu-kqi3-pro-lateral.jpg. Valida que la categoría, el producto
 *     y la vista existan en el catálogo y avisa de los que no.
 *  2. Genera WebP de 4:3 (1600 × 1200) en public/productos/ con el nombre
 *     <categoria>-<slug>-<idVista>.webp, bajando la calidad hasta que cada
 *     archivo pese 200 KB o menos.
 *  3. Escribe src/data/medios.generado.json con las vistas y los videos que
 *     realmente existen en public/productos/. El catálogo lo lee para armar
 *     `vistas` y `video`, así que no hay que editar los productos a mano.
 *
 * Videos: public/productos/video/<slug>.mp4 (hasta 5 MB) más
 * <slug>-poster.webp. Este script no los convierte: solo los valida y los
 * registra en el manifiesto cuando están completos.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { PRODUCTOS } from '../src/data/catalogo.js'
import { IMAGEN, VISTAS_POR_CATEGORIA } from '../src/data/vistas.js'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGEN = join(RAIZ, 'public', 'productos-origen')
const DESTINO = join(RAIZ, 'public', 'productos')
const VIDEOS = join(DESTINO, 'video')
const MANIFIESTO = join(RAIZ, 'src', 'data', 'medios.generado.json')

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']
const LIMITE_BYTES = 200 * 1024
const LIMITE_VIDEO_BYTES = 5 * 1024 * 1024
const CALIDADES = [88, 82, 76, 70, 64, 58, 52, 46, 40, 34]
const PROPORCION = IMAGEN.ancho / IMAGEN.alto
const TOLERANCIA_PROPORCION = 0.12

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

// ---------------------------------------------------------------------------
// Nombres: <categoria>-<slug>-<idVista>
// ---------------------------------------------------------------------------

function sugerir(base) {
  const categoria = Object.keys(VISTAS_POR_CATEGORIA).find((c) => base.startsWith(`${c}-`))
  if (!categoria) {
    return `La categoría debe ser una de: ${Object.keys(VISTAS_POR_CATEGORIA).join(', ')}.`
  }

  const slugs = PRODUCTOS.filter((p) => p.categoria === categoria).map((p) => p.slug)
  return `Productos de ${categoria}: ${slugs.join(', ')}.`
}

/** Devuelve { producto, vista } o { error } para un nombre sin extensión. */
function interpretar(base) {
  // Si un slug es prefijo de otro, gana el más largo.
  const candidatos = PRODUCTOS.filter((p) => base.startsWith(`${p.categoria}-${p.slug}-`)).sort(
    (a, b) => `${b.categoria}-${b.slug}`.length - `${a.categoria}-${a.slug}`.length,
  )

  if (candidatos.length === 0) {
    return { error: `no coincide con ningún producto del catálogo. ${sugerir(base)}` }
  }

  const producto = candidatos[0]
  const idVista = base.slice(`${producto.categoria}-${producto.slug}-`.length)
  const vistas = VISTAS_POR_CATEGORIA[producto.categoria] ?? []
  const vista = vistas.find((v) => v.id === idVista)

  if (!vista) {
    return {
      error: `la vista "${idVista}" no existe en ${producto.categoria}. Vistas válidas: ${vistas
        .map((v) => v.id)
        .join(', ')}.`,
    }
  }

  return { producto, vista }
}

// ---------------------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------------------

/** Convierte una foto a WebP 4:3 y baja la calidad hasta pesar <= 200 KB. */
async function convertir(archivo) {
  const avisos = []
  const meta = await sharp(archivo).metadata()

  // Con orientación EXIF 5 a 8 el ancho y el alto vienen intercambiados.
  const girada = meta.orientation >= 5
  const ancho = girada ? meta.height : meta.width
  const alto = girada ? meta.width : meta.height

  if (ancho < IMAGEN.ancho || alto < IMAGEN.alto) {
    avisos.push(`es más pequeña (${ancho}×${alto}) que ${IMAGEN.ancho}×${IMAGEN.alto}: se amplía y puede verse borrosa`)
  }
  if (Math.abs(ancho / alto / PROPORCION - 1) > TOLERANCIA_PROPORCION) {
    avisos.push(`proporción ${(ancho / alto).toFixed(2)} (se espera 4:3): se recorta al centro`)
  }

  let ultima = null
  for (const calidad of CALIDADES) {
    const buffer = await sharp(archivo)
      .rotate()
      .resize(IMAGEN.ancho, IMAGEN.alto, { fit: 'cover', position: 'centre' })
      .webp({ quality: calidad, effort: 5 })
      .toBuffer()

    ultima = { buffer, calidad }
    if (buffer.length <= LIMITE_BYTES) return { ...ultima, avisos }
  }

  avisos.push(`pesa ${kb(ultima.buffer.length)} incluso con calidad ${ultima.calidad} (límite ${kb(LIMITE_BYTES)})`)
  return { ...ultima, avisos }
}

async function procesarOrigen() {
  const resultado = { procesadas: [], omitidas: [], fallidas: [] }

  if (!existsSync(ORIGEN)) {
    console.log(`No existe ${ORIGEN}.`)
    console.log('Créala y copia ahí las fotos originales (ver ASSETS.md). Solo se actualiza el manifiesto.\n')
    return resultado
  }

  const archivos = readdirSync(ORIGEN)
    .filter((nombre) => statSync(join(ORIGEN, nombre)).isFile())
    .sort()

  if (archivos.length === 0) {
    console.log('public/productos-origen/ está vacía. Solo se actualiza el manifiesto.\n')
    return resultado
  }

  mkdirSync(DESTINO, { recursive: true })

  for (const nombre of archivos) {
    const extension = extname(nombre).toLowerCase()
    if (!EXTENSIONES.includes(extension)) {
      resultado.omitidas.push({ nombre, motivo: `extensión ${extension || '(ninguna)'} no admitida (usa ${EXTENSIONES.join(', ')})` })
      continue
    }

    const interpretado = interpretar(basename(nombre, extension))
    if (interpretado.error) {
      resultado.omitidas.push({ nombre, motivo: interpretado.error })
      continue
    }

    const { producto, vista } = interpretado
    const salida = `${producto.categoria}-${producto.slug}-${vista.id}.webp`

    try {
      const { buffer, calidad, avisos } = await convertir(join(ORIGEN, nombre))
      writeFileSync(join(DESTINO, salida), buffer)
      resultado.procesadas.push({ nombre, salida, calidad, bytes: buffer.length, avisos })
    } catch (error) {
      resultado.fallidas.push({ nombre, motivo: error.message })
    }
  }

  return resultado
}

// ---------------------------------------------------------------------------
// Manifiesto
// ---------------------------------------------------------------------------

/** Revisa lo que hay en public/productos/ y arma el manifiesto. */
function armarManifiesto() {
  const avisos = []
  const presentes = new Map() // "categoria/slug" → Set de ids de vista

  if (existsSync(DESTINO)) {
    for (const nombre of readdirSync(DESTINO).sort()) {
      if (extname(nombre).toLowerCase() !== '.webp') continue

      const interpretado = interpretar(basename(nombre, '.webp'))
      if (interpretado.error) {
        avisos.push(`public/productos/${nombre}: ${interpretado.error} (no se registra)`)
        continue
      }

      const clave = `${interpretado.producto.categoria}/${interpretado.producto.slug}`
      if (!presentes.has(clave)) presentes.set(clave, new Set())
      presentes.get(clave).add(interpretado.vista.id)
    }
  }

  const vistas = {}
  const videos = {}

  for (const producto of PRODUCTOS) {
    const clave = `${producto.categoria}/${producto.slug}`

    // En el orden que define la categoría, no en el del sistema de archivos.
    const ids = (VISTAS_POR_CATEGORIA[producto.categoria] ?? [])
      .map((vista) => vista.id)
      .filter((id) => presentes.get(clave)?.has(id))
    if (ids.length > 0) vistas[clave] = ids

    const mp4 = join(VIDEOS, `${producto.slug}.mp4`)
    const poster = join(VIDEOS, `${producto.slug}-poster.webp`)
    if (!existsSync(mp4) && !existsSync(poster)) continue

    if (!existsSync(mp4)) {
      avisos.push(`video/${producto.slug}-poster.webp: falta ${producto.slug}.mp4 (no se registra el video)`)
    } else if (!existsSync(poster)) {
      avisos.push(`video/${producto.slug}.mp4: falta ${producto.slug}-poster.webp (no se registra el video)`)
    } else if (statSync(mp4).size > LIMITE_VIDEO_BYTES) {
      avisos.push(
        `video/${producto.slug}.mp4: pesa ${(statSync(mp4).size / 1024 / 1024).toFixed(1)} MB y el máximo es 5 MB (no se registra el video)`,
      )
    } else {
      videos[clave] = {
        src: `/productos/video/${producto.slug}.mp4`,
        poster: `/productos/video/${producto.slug}-poster.webp`,
      }
    }
  }

  // Videos sueltos que no corresponden a ningún producto.
  if (existsSync(VIDEOS)) {
    const slugs = new Set(PRODUCTOS.map((p) => p.slug))
    for (const nombre of readdirSync(VIDEOS).sort()) {
      const ext = extname(nombre).toLowerCase()
      if (!['.mp4', '.webp'].includes(ext)) continue
      const slug = basename(nombre, ext).replace(/-poster$/, '')
      if (!slugs.has(slug)) avisos.push(`video/${nombre}: no coincide con ningún producto del catálogo (no se registra)`)
    }
  }

  return { manifiesto: { vistas, videos }, avisos }
}

function guardarManifiesto(manifiesto) {
  const texto = `${JSON.stringify(manifiesto, null, 2)}\n`
  const actual = existsSync(MANIFIESTO) ? readFileSync(MANIFIESTO, 'utf8').replace(/\r\n/g, '\n') : null

  if (actual === texto) return false
  writeFileSync(MANIFIESTO, texto)
  return true
}

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------

async function principal() {
  if (process.argv.includes('--ayuda') || process.argv.includes('-h')) {
    console.log('Uso: npm run imagenes [-- --solo-manifiesto]\nLee public/productos-origen/ y escribe public/productos/ y src/data/medios.generado.json (ver ASSETS.md).')
    return 0
  }

  const soloManifiesto = process.argv.includes('--solo-manifiesto')
  const resultado = soloManifiesto
    ? { procesadas: [], omitidas: [], fallidas: [] }
    : await procesarOrigen()

  if (resultado.procesadas.length > 0) {
    console.log('Imágenes procesadas:')
    for (const p of resultado.procesadas) {
      console.log(`  ✓ ${p.nombre} → ${p.salida}  (calidad ${p.calidad}, ${kb(p.bytes)})`)
      for (const aviso of p.avisos) console.log(`      ! ${aviso}`)
    }
    console.log('')
  }

  if (resultado.omitidas.length > 0) {
    console.log('Archivos omitidos (no se procesaron):')
    for (const o of resultado.omitidas) console.log(`  ✗ ${o.nombre}: ${o.motivo}`)
    console.log('')
  }

  if (resultado.fallidas.length > 0) {
    console.log('Archivos con error:')
    for (const f of resultado.fallidas) console.log(`  ✗ ${f.nombre}: ${f.motivo}`)
    console.log('')
  }

  const { manifiesto, avisos } = armarManifiesto()
  if (avisos.length > 0) {
    console.log('Avisos del manifiesto:')
    for (const aviso of avisos) console.log(`  ! ${aviso}`)
    console.log('')
  }

  const cambio = guardarManifiesto(manifiesto)

  const productosConFotos = Object.keys(manifiesto.vistas).length
  const totalVistas = Object.values(manifiesto.vistas).reduce((suma, ids) => suma + ids.length, 0)
  const bytes = resultado.procesadas.reduce((suma, p) => suma + p.bytes, 0)

  console.log('Resumen')
  console.log(`  Procesadas: ${resultado.procesadas.length}${bytes ? ` (${kb(bytes)} en total)` : ''}`)
  console.log(`  Omitidas por nombre o extensión: ${resultado.omitidas.length}`)
  console.log(`  Con error: ${resultado.fallidas.length}`)
  console.log(`  Productos con fotos: ${productosConFotos} de ${PRODUCTOS.length} (${totalVistas} vistas)`)
  console.log(`  Productos con video: ${Object.keys(manifiesto.videos).length}`)
  console.log(`  Manifiesto ${cambio ? 'actualizado' : 'sin cambios'}: src/data/medios.generado.json`)

  return resultado.fallidas.length > 0 ? 1 : 0
}

process.exit(await principal())
