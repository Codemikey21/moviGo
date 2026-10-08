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
 *     patinetas-xiaomi-electric-scooter-4-ultra-lateral.png. Valida que la
 *     categoría, el producto y la vista existan en el catálogo y avisa de los
 *     que no. Las subcarpetas se ignoran.
 *  2. Genera WebP en public/productos/ SIN recortar: conserva la proporción de
 *     la foto original y no la amplía.
 *        <categoria>-<slug>-<idVista>.webp      hasta 1600 px de ancho (≤ 200 KB)
 *        <categoria>-<slug>-<idVista>-sm.webp   800 px de ancho (≤ 100 KB), solo si
 *                                               la foto es más ancha que 800 px
 *     La calidad baja por pasos hasta cumplir el peso máximo.
 *  3. Escribe src/data/medios.generado.json con las vistas y los videos que
 *     realmente existen en public/productos/: ancho y alto de cada vista, su
 *     copia pequeña y los créditos (marca y URL de la fuente). El catálogo lo
 *     lee para armar `vistas` y `video`.
 *
 * Créditos: se toman de fuentes.csv (columnas archivo, url_fuente y
 * titular_o_marca), que se busca en public/productos-origen/ y en
 * public/productos-origen/alternativas/. Si el CSV no está, se conservan los
 * créditos que ya tenía el manifiesto.
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
const CSV_FUENTES = [join(ORIGEN, 'fuentes.csv'), join(ORIGEN, 'alternativas', 'fuentes.csv')]

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif']
const LIMITE_GRANDE = 200 * 1024
const LIMITE_PEQUENO = 100 * 1024
const LIMITE_VIDEO_BYTES = 5 * 1024 * 1024
const CALIDADES = [88, 82, 76, 70, 64, 58, 52, 46, 40, 34]
const SUFIJO_PEQUENO = '-sm'

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

// ---------------------------------------------------------------------------
// CSV (con comillas, comas y saltos de línea dentro de los campos)
// ---------------------------------------------------------------------------

function leerCsv(ruta) {
  const texto = readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '')
  const filas = []
  let fila = []
  let campo = ''
  let entreComillas = false

  for (let i = 0; i < texto.length; i += 1) {
    const c = texto[i]

    if (entreComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"'
        i += 1
      } else if (c === '"') {
        entreComillas = false
      } else {
        campo += c
      }
    } else if (c === '"') {
      entreComillas = true
    } else if (c === ',') {
      fila.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i += 1
      fila.push(campo)
      filas.push(fila)
      fila = []
      campo = ''
    } else {
      campo += c
    }
  }
  if (campo !== '' || fila.length > 0) {
    fila.push(campo)
    filas.push(fila)
  }

  const [encabezado, ...datos] = filas
  return datos
    .filter((f) => f.some((valor) => valor !== ''))
    .map((f) => Object.fromEntries(encabezado.map((nombre, i) => [nombre, f[i] ?? ''])))
}

/** Mapa nombre-sin-extensión → { marca, fuente } con los créditos de los CSV. */
function leerCreditos() {
  const creditos = new Map()

  for (const ruta of CSV_FUENTES) {
    if (!existsSync(ruta)) continue

    for (const fila of leerCsv(ruta)) {
      if (!fila.archivo) continue
      creditos.set(basename(fila.archivo, extname(fila.archivo)), {
        marca: fila.titular_o_marca || null,
        fuente: fila.url_fuente || null,
      })
    }
  }

  return creditos
}

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

/** Codifica a WebP con el ancho indicado y baja la calidad hasta cumplir el límite. */
async function codificar(archivo, ancho, limite) {
  let ultima = null

  for (const calidad of CALIDADES) {
    const { data, info } = await sharp(archivo)
      .rotate()
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: calidad, effort: 5 })
      .toBuffer({ resolveWithObject: true })

    ultima = { buffer: data, ancho: info.width, alto: info.height, calidad }
    if (data.length <= limite) return { ...ultima, cumple: true }
  }

  return { ...ultima, cumple: false }
}

/** Convierte una foto: copia grande y, si hace falta, copia pequeña. Sin recortar. */
async function convertir(archivo) {
  const avisos = []
  const meta = await sharp(archivo).metadata()

  // Con orientación EXIF 5 a 8 el ancho y el alto vienen intercambiados.
  const girada = meta.orientation >= 5
  const ancho = girada ? meta.height : meta.width
  const alto = girada ? meta.width : meta.height

  if (ancho < IMAGEN.anchoMaximo) {
    avisos.push(`mide ${ancho}×${alto}: es más angosta que ${IMAGEN.anchoMaximo} px y se conserva sin ampliar`)
  }

  const grande = await codificar(archivo, IMAGEN.anchoMaximo, LIMITE_GRANDE)
  if (!grande.cumple) {
    avisos.push(`pesa ${kb(grande.buffer.length)} incluso con calidad ${grande.calidad} (límite ${kb(LIMITE_GRANDE)})`)
  }

  let pequena = null
  if (grande.ancho > IMAGEN.anchoPequeno) {
    pequena = await codificar(archivo, IMAGEN.anchoPequeno, LIMITE_PEQUENO)
    if (!pequena.cumple) {
      avisos.push(`la copia pequeña pesa ${kb(pequena.buffer.length)} (límite ${kb(LIMITE_PEQUENO)})`)
    }
  }

  return { grande, pequena, avisos }
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
    // Los .csv y .md de la carpeta son documentación (fuentes, videos, informes), no fotos.
    .filter((nombre) => !/\.(csv|md)$/i.test(nombre))
    .sort()

  if (archivos.length === 0) {
    console.log('public/productos-origen/ no tiene fotos. Solo se actualiza el manifiesto.\n')
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
    const base = `${producto.categoria}-${producto.slug}-${vista.id}`

    try {
      const { grande, pequena, avisos } = await convertir(join(ORIGEN, nombre))
      writeFileSync(join(DESTINO, `${base}.webp`), grande.buffer)
      if (pequena) writeFileSync(join(DESTINO, `${base}${SUFIJO_PEQUENO}.webp`), pequena.buffer)
      resultado.procesadas.push({ nombre, base, grande, pequena, avisos })
    } catch (error) {
      resultado.fallidas.push({ nombre, motivo: error.message })
    }
  }

  return resultado
}

// ---------------------------------------------------------------------------
// Manifiesto
// ---------------------------------------------------------------------------

function leerManifiestoPrevio() {
  try {
    return JSON.parse(readFileSync(MANIFIESTO, 'utf8'))
  } catch {
    return { vistas: {}, videos: {} }
  }
}

/** Revisa lo que hay en public/productos/ y arma el manifiesto. */
async function armarManifiesto() {
  const avisos = []
  const previo = leerManifiestoPrevio()
  const creditos = leerCreditos()
  const presentes = new Map() // "categoria/slug" → Map(idVista → { ancho, alto, pequeno })

  if (existsSync(DESTINO)) {
    const nombres = readdirSync(DESTINO).filter((n) => extname(n).toLowerCase() === '.webp').sort()
    const pequenas = new Set(nombres.filter((n) => n.endsWith(`${SUFIJO_PEQUENO}.webp`)))

    for (const nombre of nombres) {
      if (pequenas.has(nombre)) continue

      const base = basename(nombre, '.webp')
      const interpretado = interpretar(base)
      if (interpretado.error) {
        avisos.push(`public/productos/${nombre}: ${interpretado.error} (no se registra)`)
        continue
      }

      const { producto, vista } = interpretado
      const clave = `${producto.categoria}/${producto.slug}`
      const meta = await sharp(join(DESTINO, nombre)).metadata()
      const datos = { ancho: meta.width, alto: meta.height }

      const archivoPequeno = `${base}${SUFIJO_PEQUENO}.webp`
      if (pequenas.has(archivoPequeno)) {
        const metaPequena = await sharp(join(DESTINO, archivoPequeno)).metadata()
        datos.pequeno = { ancho: metaPequena.width, alto: metaPequena.height }
      }

      const credito = creditos.get(base) ?? previo.vistas?.[clave]?.[vista.id] ?? {}
      if (credito.marca) datos.marca = credito.marca
      if (credito.fuente) datos.fuente = credito.fuente
      if (!datos.marca || !datos.fuente) avisos.push(`${nombre}: sin créditos (marca o URL de la fuente); agrégala a fuentes.csv`)

      if (!presentes.has(clave)) presentes.set(clave, new Map())
      presentes.get(clave).set(vista.id, datos)
    }

    for (const nombre of pequenas) {
      if (!nombres.includes(nombre.replace(`${SUFIJO_PEQUENO}.webp`, '.webp'))) {
        avisos.push(`public/productos/${nombre}: no tiene su copia grande (no se registra)`)
      }
    }
  }

  const vistas = {}
  const videos = {}

  for (const producto of PRODUCTOS) {
    const clave = `${producto.categoria}/${producto.slug}`

    // En el orden que define la categoría, no en el del sistema de archivos.
    const ordenadas = (VISTAS_POR_CATEGORIA[producto.categoria] ?? []).filter((vista) =>
      presentes.get(clave)?.has(vista.id),
    )
    if (ordenadas.length > 0) {
      vistas[clave] = Object.fromEntries(ordenadas.map((vista) => [vista.id, presentes.get(clave).get(vista.id)]))
    }

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
      const { grande, pequena } = p
      const medidas = `${grande.ancho}×${grande.alto}, calidad ${grande.calidad}, ${kb(grande.buffer.length)}`
      const copia = pequena ? ` + pequeña ${pequena.ancho}×${pequena.alto}, ${kb(pequena.buffer.length)}` : ' (sin copia pequeña)'
      console.log(`  ✓ ${p.nombre} → ${p.base}.webp  (${medidas}${copia})`)
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

  const { manifiesto, avisos } = await armarManifiesto()
  if (avisos.length > 0) {
    console.log('Avisos del manifiesto:')
    for (const aviso of avisos) console.log(`  ! ${aviso}`)
    console.log('')
  }

  const cambio = guardarManifiesto(manifiesto)

  const productosConFotos = Object.keys(manifiesto.vistas).length
  const totalVistas = Object.values(manifiesto.vistas).reduce((suma, v) => suma + Object.keys(v).length, 0)
  const bytes = resultado.procesadas.reduce(
    (suma, p) => suma + p.grande.buffer.length + (p.pequena?.buffer.length ?? 0),
    0,
  )

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
