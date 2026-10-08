/**
 * Catálogo de MoviGo.
 *
 * Los productos son modelos reales de marcas que se consiguen en Colombia. Las
 * marcas y los modelos pertenecen a sus respectivos dueños; aquí solo aparecen
 * como texto. Los precios están en pesos colombianos (COP) y son PRECIOS DE
 * REFERENCIA del mercado: no son ofertas ni precios de MoviGo.
 *
 * Campos de cada producto:
 *  - marca, modelo      → texto. `nombre` se arma como "marca modelo".
 *  - descripcion        → una o dos frases descriptivas, sacadas de las especificaciones.
 *  - colores            → solo los que publica la fuente (puede estar vacío).
 *  - vistas             → [{ id, etiqueta, imagen, imagenPequena, ancho, alto,
 *                         anchoPequeno, altoPequeno, alt, descripcion, credito }].
 *                         Se arma sola con las fotos que existen
 *                         (src/data/medios.generado.json, que crea `npm run imagenes`)
 *                         y las vistas de la categoría (src/data/vistas.js). Las fotos
 *                         no se recortan: `ancho` y `alto` son los reales de cada archivo.
 *                         `credito` trae la marca y la URL de la fuente de la foto.
 *                         Sin fotos queda vacía y la página muestra "Foto pendiente".
 *  - video              → { src, poster, descripcion } o null. También sale del
 *                         manifiesto: public/productos/video/<slug>.mp4 y
 *                         <slug>-poster.webp.
 *  - destacado          → true para el producto estrella de la categoría (lo usará
 *                         el Lote B1-3). Por defecto false; se decide a mano.
 *  - especificaciones   → [{ etiqueta, valor, unidad, clave, nota, porConfirmar }].
 *                         Las tres marcadas con `clave: true` salen en la tarjeta;
 *                         `porConfirmar: true` marca un dato que falta confirmar.
 *  - precioCompra       → número en COP (precio de referencia) o null si no hay una
 *                         fuente colombiana verificable: entonces se muestra "por
 *                         confirmar" y la tarifa de alquiler también queda por confirmar.
 *  - precioFuente       → URL donde se vio el precio (o null).
 *  - precioVerificado   → true solo si el número se leyó en una página abierta.
 *  - tarifasAlquiler    → { hora, dia, semana } en COP, o null si no se alquila.
 *                         Son VALORES DE EJEMPLO (ver "Tarifas de alquiler").
 *  - disponibilidad     → texto simple; MoviGo aún no maneja inventario.
 *  - fuente             → URL oficial de donde salen las especificaciones.
 *  - verificado         → true si TODAS las especificaciones se leyeron en la fuente.
 *  - porConfirmar       → lista de datos que faltan por confirmar (vacía si todo está verificado).
 *
 * Los campos `nombre`, `tarifasAlquiler`, `disponibleAlquiler`,
 * `tarifaPorConfirmar`, `especificacionesClave`, `vistas`, `video` y
 * `destacado` los calcula `completar()` al final del archivo.
 */

import medios from './medios.generado.json' with { type: 'json' }
import { VISTAS_POR_CATEGORIA } from './vistas.js'

// Fecha en la que se consultaron las fuentes (AAAA-MM-DD).
export const FECHA_CONSULTA = '2026-10-06'

// Texto de la disponibilidad mientras no exista inventario real.
const POR_CONFIRMAR = 'Por confirmar'

// Dibuja un círculo con un trazo (para los íconos SVG de 48 × 48).
const circulo = (cx, cy, r) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

// ---------------------------------------------------------------------------
// Categorías
// Cada ícono es una lista de trazos SVG (atributo "d") sobre un lienzo de 48 × 48.
// ---------------------------------------------------------------------------

export const CATEGORIAS = [
  {
    slug: 'bicicletas',
    nombre: 'Bicicletas',
    nombreCorto: 'Bicicletas',
    tagline: 'Pedalea a tu manera.',
    descripcion:
      'Bicicletas de montaña, una urbana y una eléctrica de asistencia, de marcas con presencia en Colombia.',
    colorAcento: '#30d158',
    icono: [
      circulo(11, 32, 8),
      circulo(37, 32, 8),
      'M11 32 L19 16 H31 L37 32 M11 32 H23 L31 16 M23 32 L19 16',
      'M16 13 H22',
      'M31 16 L29 11 H34',
    ],
  },
  {
    slug: 'patinetas',
    nombre: 'Patinetas eléctricas',
    nombreCorto: 'Patinetas',
    tagline: 'La ciudad a tu ritmo.',
    descripcion:
      'Patinetas eléctricas de Xiaomi y Segway-Ninebot para moverte por la ciudad.',
    colorAcento: '#2997ff',
    icono: [
      circulo(11, 38, 4),
      circulo(37, 38, 4),
      'M7 34 H38',
      'M37 34 L32 8',
      'M27 8 H37',
    ],
  },
  {
    slug: 'patines',
    nombre: 'Patines',
    nombreCorto: 'Patines',
    tagline: 'Rueda con estilo.',
    descripcion: 'Patines en línea de ciudad y de fitness de la marca Powerslide.',
    colorAcento: '#ff375f',
    icono: [
      'M9 8 H21 V22 L38 28 V34 H9 Z',
      circulo(12, 38, 3.5),
      circulo(20, 38, 3.5),
      circulo(28, 38, 3.5),
      circulo(36, 38, 3.5),
    ],
  },
  {
    slug: 'drones',
    nombre: 'Drones',
    nombreCorto: 'Drones',
    tagline: 'Mira la ciudad desde arriba.',
    descripcion: 'Drones FIMI con cámara para fotografía y video aéreo.',
    colorAcento: '#bf5af2',
    icono: [
      'M20 21 H28 V27 H20 Z',
      'M20 21 L12 13 M28 21 L36 13 M20 27 L12 35 M28 27 L36 35',
      circulo(12, 13, 5),
      circulo(36, 13, 5),
      circulo(12, 35, 5),
      circulo(36, 35, 5),
    ],
  },
  {
    slug: 'motos',
    nombre: 'Motos eléctricas',
    nombreCorto: 'Motos',
    tagline: 'Potencia eléctrica, cero humo.',
    descripcion:
      'Motos eléctricas de Auteco (línea Starker) y NIU, con distintas autonomías y velocidades.',
    colorAcento: '#ff9f0a',
    icono: [
      circulo(10, 33, 6),
      circulo(38, 33, 6),
      'M10 33 L17 22 H29 M17 22 L23 33 H38 M15 19 H24 M38 33 L34 15 H40',
    ],
  },
  {
    slug: 'carros',
    nombre: 'Carros eléctricos',
    nombreCorto: 'Carros',
    tagline: 'Tu próximo viaje, 100 % eléctrico.',
    descripcion: 'Autos eléctricos compactos de Renault y Dacia.',
    colorAcento: '#40c8e0',
    icono: [
      'M5 30 V25 C5 23 6 22 8 21 L13 16 C14 15 15 15 16 15 H30 C31 15 32 15.5 33 16.5 L38 21 C41 22 43 23 43 25 V30 Z',
      'M15 21 L18 16.5 M15 21 H36 M27 16.5 L31 21',
      circulo(14, 31, 4.5),
      circulo(34, 31, 4.5),
    ],
  },
  {
    slug: 'accesorios',
    nombre: 'Accesorios',
    nombreCorto: 'Accesorios',
    tagline: 'Todo para rodar seguro.',
    descripcion: 'Casco, luz y candado para completar tu equipo.',
    colorAcento: '#ffd60a',
    icono: [
      'M8 30 C8 17 16 10 26 10 C35 10 41 17 41 26 V30 Z',
      'M28 22 H41',
      'M16 14 L22 12 M13 20 L20 16',
      'M10 34 H39',
    ],
  },
]

// ---------------------------------------------------------------------------
// Ayudas para escribir los datos
// ---------------------------------------------------------------------------

// Una especificación: etiqueta, valor, unidad (o null), si es clave, una nota y si
// el dato está por confirmar (por ejemplo, cuando dos fuentes oficiales no coinciden).
const esp = (etiqueta, valor, unidad = null, clave = false, nota = null, porConfirmar = false) => ({
  etiqueta,
  valor,
  unidad,
  clave,
  nota,
  porConfirmar,
})

const color = (nombre, hex) => ({ nombre, hex })

// ---------------------------------------------------------------------------
// Tarifas de alquiler (VALORES DE EJEMPLO)
//
// MoviGo todavía no tiene tarifas reales. Para que cada producto muestre una
// tarifa coherente con su precio de compra se calculan así:
//
//   día    = precio de compra × PORCENTAJE_DIA[categoría]   (redondeado al millar)
//   hora   = 25 % de la tarifa del día                       (redondeado al millar)
//   semana = 7 días con 25 % de descuento                    (redondeado al millar)
//
// El porcentaje diario está entre el 1,5 % y el 3 % del precio de compra en las
// categorías pequeñas y baja a 0,4 % en carros: con precios de 70 millones o
// más, un 1 % diario (700.000 COP) quedaría muy por encima de lo que cuesta
// alquilar un auto en el mercado.
// ---------------------------------------------------------------------------

const PORCENTAJE_DIA = {
  bicicletas: 0.02,
  patinetas: 0.02,
  patines: 0.02,
  drones: 0.03,
  motos: 0.015,
  carros: 0.004,
  accesorios: 0.02,
}

const FRACCION_HORA = 0.25
const DESCUENTO_SEMANA = 0.25

const aMillar = (valor) => Math.max(1000, Math.round(valor / 1000) * 1000)

function tarifasDeEjemplo(precioCompra, categoria) {
  const dia = aMillar(precioCompra * PORCENTAJE_DIA[categoria])

  return {
    hora: aMillar(dia * FRACCION_HORA),
    dia,
    semana: aMillar(dia * 7 * (1 - DESCUENTO_SEMANA)),
  }
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

const PRODUCTOS_BASE = [
  // ===== BICICLETAS =====================================================
  {
    id: 'bic-rockhopper-sport',
    slug: 'rockhopper-sport',
    categoria: 'bicicletas',
    marca: 'Specialized',
    modelo: 'Rockhopper Sport',
    descripcion:
      'Bicicleta de montaña de aluminio con horquilla de suspensión, frenos de disco hidráulicos y transmisión 1×9.',
    colores: [],
    especificaciones: [
      esp('Cuadro', 'Aluminio A1 Premium con tubos butted'),
      esp('Horquilla', 'SR Suntour XCM 29 con bloqueo'),
      esp('Recorrido de la horquilla', '90 / 100', 'mm', true, 'Según la talla del cuadro.'),
      esp('Frenos', 'Shimano BR-MT200, disco hidráulico', null, true),
      esp('Rotores', 180, 'mm'),
      esp('Transmisión', 'microSHIFT Advent, 1×9', null, true),
      esp('Piñón', '11–46', 'dientes'),
      esp('Neumáticos', 'Ground Control, 2,35 pulgadas de ancho'),
      esp('Pedales', 'Specialized, de plataforma'),
    ],
    precioCompra: 2490000,
    precioFuente: 'https://www.specialized.com/co/es/shop/bicicletas/bicicletas-de-montana/bicis-de-trail/rockhopper',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.specialized.com/co/es/rockhopper-sport/p/4263615',
    verificado: true,
    porConfirmar: [],
  },
  {
    id: 'bic-rockhopper-comp',
    slug: 'rockhopper-comp',
    categoria: 'bicicletas',
    marca: 'Specialized',
    modelo: 'Rockhopper Comp',
    descripcion:
      'Bicicleta de montaña de aluminio con horquilla RockShox Judy, frenos hidráulicos de dos pistones y transmisión SRAM de 12 velocidades.',
    colores: [],
    especificaciones: [
      esp('Cuadro', 'Aluminio A1 Premium con tubos butted'),
      esp('Horquilla', 'RockShox Judy, Solo Air'),
      esp('Recorrido de la horquilla', '80 / 90 / 100', 'mm', true, 'Según la talla del cuadro.'),
      esp('Frenos', 'Tektro HD-M280, disco hidráulico de 2 pistones', null, true),
      esp('Rotores', 180, 'mm'),
      esp('Transmisión', 'SRAM S100, 1×12', null, true),
      esp('Piñón', '11–50', 'dientes'),
      esp('Plato', 30, 'dientes'),
      esp('Aros', 'Aluminio, listos para neumáticos sin cámara (tubeless)'),
    ],
    precioCompra: 3490000,
    precioFuente: 'https://www.specialized.com/co/es/shop/bicicletas/bicicletas-de-montana/bicis-de-trail/rockhopper',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.specialized.com/co/es/rockhopper-comp/p/4263610',
    verificado: true,
    porConfirmar: [],
  },
  {
    id: 'bic-escape-3',
    slug: 'escape-3',
    categoria: 'bicicletas',
    marca: 'Giant',
    modelo: 'Escape 3',
    descripcion:
      'Bicicleta urbana de aluminio con ruedas 700c, transmisión Shimano de 3×7 velocidades y soportes para portaequipaje.',
    colores: [color('Negro metálico', '#2d2f33'), color('Azul ceniza', '#7d93a8')],
    especificaciones: [
      esp('Cuadro', 'Aluminio ALUXX', null, true),
      esp('Horquilla', 'Acero de alta resistencia, con soporte para portaequipaje'),
      esp('Transmisión', 'Shimano Tourney, 3×7 velocidades', null, true),
      esp('Piñón', 'MF-TZ500, 14–34', 'dientes'),
      esp('Frenos', 'V-brake de aluminio (linear pull)'),
      esp('Neumáticos', 'Giant S-X3, 700×38c', null, true),
      esp('Neumático máximo', 45, 'mm'),
      esp('Pedales', 'Giant Urban Fitness'),
      esp('Tallas', 'S, M, L, XL'),
    ],
    precioCompra: 1436500,
    precioFuente: null,
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://giant-bicycles.com.co/escape-3-2022.html',
    verificado: true,
    porConfirmar: [
      'Año modelo: la página oficial dice "Escape 3 2023" y el listado de Giant Colombia lo muestra como 2024.',
      'Precio: 1.436.500 COP salió de un resumen de búsqueda de tiendas colombianas; no abrí la página del vendedor.',
    ],
  },
  {
    id: 'bic-starker-t-flex',
    slug: 'starker-t-flex',
    categoria: 'bicicletas',
    marca: 'Starker',
    modelo: 'T-Flex Aluminio',
    descripcion:
      'Bicicleta eléctrica de Auteco con asistencia de pedaleo, motor de buje de 350 W, batería extraíble de 48 V y ruedas de 20 pulgadas.',
    colores: [],
    especificaciones: [
      esp('Autonomía', 'Hasta 60', 'km', true, 'A 25 km/h, terreno plano, 1.500 msnm, conductor de 70 kg y batería nueva al 100 %.'),
      esp('Velocidad máxima de asistencia', 25, 'km/h', true),
      esp('Motor', 'Buje (hub) DC sin escobillas, 350 W'),
      esp('Batería', '48 V / 10 Ah', null, true, 'De ion de litio y extraíble.'),
      esp('Tiempo de carga', '6–8', 'h'),
      esp('Velocidades', 6),
      esp('Frenos', 'Disco delantero y trasero'),
      esp('Llantas', 'Kenda de 20 pulgadas'),
      esp('Peso', 24, 'kg'),
      esp('Carga máxima', 110, 'kg'),
    ],
    precioCompra: 2599000,
    precioFuente: 'https://www.auteco.com.co/bicicleta-electrica-starker-t-flex-aluminio/p',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.auteco.com.co/bicicleta-electrica-starker-t-flex-aluminio/p',
    verificado: true,
    porConfirmar: [],
  },

  // ===== PATINETAS ELÉCTRICAS ===========================================
  {
    id: 'pat-xiaomi-4-lite',
    slug: 'xiaomi-electric-scooter-4-lite',
    categoria: 'patinetas',
    marca: 'Xiaomi',
    modelo: 'Electric Scooter 4 Lite (2nd Gen)',
    descripcion:
      'Patineta eléctrica con motor de 300 W, llantas de 10 pulgadas y frenado combinado E-ABS y de tambor.',
    colores: [],
    especificaciones: [
      esp('Velocidad máxima', 24, 'km/h', true, 'La ficha de Xiaomi Colombia la publica como 15 mph.'),
      esp('Autonomía', 24, 'km', true, 'La ficha de Xiaomi Colombia la publica como 15 millas.'),
      esp('Peso', 16.2, 'kg', true),
      esp('Motor', '300 W nominal / 500 W máximo'),
      esp('Batería', 221, 'Wh'),
      esp('Tiempo de carga', 'Aprox. 8', 'h'),
      esp('Neumáticos', 10, 'pulgadas'),
      esp('Frenos', 'E-ABS y de tambor'),
      esp('Pendiente máxima', 15, '%'),
      esp('Carga máxima', 100, 'kg'),
    ],
    precioCompra: 1299900,
    precioFuente: 'https://www.mi.com/co/product-list/outdoor/scooter/',
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.mi.com/co/product/xiaomi-electric-scooter-4-lite-2nd-gen/specs/',
    verificado: true,
    porConfirmar: [
      'Precio: 1.299.900 COP (tienda oficial de Xiaomi Colombia) salió de un resumen de búsqueda; la página del listado me devolvió 403.',
      'Velocidad y autonomía: Xiaomi Colombia las publica en mph y millas (15 mph y 15 millas); aquí están convertidas a km/h y km.',
    ],
  },
  {
    id: 'pat-xiaomi-4-pro',
    slug: 'xiaomi-electric-scooter-4-pro',
    categoria: 'patinetas',
    marca: 'Xiaomi',
    modelo: 'Electric Scooter 4 Pro (2nd Gen)',
    descripcion:
      'Patineta eléctrica con motor de 400 W, batería de 468 Wh y llantas de 10 pulgadas sin cámara.',
    colores: [],
    especificaciones: [
      esp('Velocidad máxima', 25, 'km/h', true),
      esp('Autonomía', 'Aprox. 60', 'km', true),
      esp('Peso', 19, 'kg', true),
      esp('Motor', '400 W nominal / 1.000 W máximo'),
      esp('Batería', '468 Wh (10 Ah)'),
      esp('Tiempo de carga', 'Aprox. 9', 'h'),
      esp('Llantas', '10 pulgadas, sin cámara'),
      esp('Frenos', 'De tambor y E-ABS'),
      esp('Pendiente máxima', 'Aprox. 22', '%'),
      esp('Carga máxima', 120, 'kg'),
    ],
    precioCompra: 1799900,
    precioFuente: 'https://www.mi.com/co/product-list/outdoor/scooter/',
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.mi.com/co/product/xiaomi-electric-scooter-4-pro-2nd-gen/specs/',
    verificado: true,
    porConfirmar: [
      'Precio: 1.799.900 COP (tienda oficial de Xiaomi Colombia, agotada al consultar) salió de un resumen de búsqueda; otras tiendas la venden entre 2.000.000 y 2.500.000 COP.',
    ],
  },
  {
    id: 'pat-xiaomi-4-ultra',
    slug: 'xiaomi-electric-scooter-4-ultra',
    categoria: 'patinetas',
    marca: 'Xiaomi',
    modelo: 'Electric Scooter 4 Ultra',
    descripcion:
      'Patineta eléctrica con sistema de doble suspensión, motor de 500 W, batería de 561,5 Wh y llantas DuraGel de 10 pulgadas.',
    colores: [],
    especificaciones: [
      esp('Velocidad máxima', 25, 'km/h', true, 'Por modo: peatón 6 km/h, D 20 km/h, S y S+ 25 km/h.'),
      esp('Autonomía', 'Aprox. 70', 'km', true),
      esp('Peso', 'Aprox. 24,5', 'kg', true),
      esp('Motor', '500 W nominal / 940 W máximo'),
      esp('Batería', '561,5 Wh (12.000 mAh), de ion de litio'),
      esp('Tiempo de carga', 'Aprox. 6,5', 'h'),
      esp('Suspensión', 'Doble'),
      esp('Llantas', '10 pulgadas Xiaomi DuraGel'),
      esp('Frenos', 'E-ABS y de tambor'),
      esp('Carga máxima', 120, 'kg'),
    ],
    precioCompra: 2833290,
    precioFuente: 'https://www.falabella.com.co/falabella-co/product/73200526/Xiaomi-Electric-Scooter-4-Ultra-Velocidad-Max-25km-h-Autonomia-de-viaje-70-km-940-W-Doble-suspencion/73200526',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.mi.com/global/product/xiaomi-electric-scooter-4-ultra/specs/',
    verificado: true,
    porConfirmar: [
      'Precio: 2.833.290 COP es el precio con 29 % de descuento que mostraba Falabella Colombia el 7 de octubre de 2026 (precio de lista: 3.999.900 COP). La página de Xiaomi Colombia (mi.com/co) no mostró este modelo.',
      'Colores: Xiaomi no publica un nombre de color; las fotos oficiales muestran la patineta en negro y gris con detalles amarillos.',
    ],
  },
  {
    id: 'pat-segway-max-g2',
    slug: 'segway-ninebot-max-g2',
    categoria: 'patinetas',
    marca: 'Segway-Ninebot',
    modelo: 'KickScooter Max G2',
    descripcion:
      'Patineta eléctrica con motor de 450 W, batería de 551 Wh, llantas de 10 pulgadas y suspensión delantera y trasera.',
    colores: [],
    especificaciones: [
      esp('Velocidad máxima', 35, 'km/h', true, 'Dato de la tienda oficial de Segway Colombia; la página de Asia-Pacífico indica 25 km/h.'),
      esp('Autonomía', 'Aprox. 75', 'km', true, 'Dato de la tienda oficial de Segway Colombia.'),
      esp('Motor', '450 W nominal / 900 W máximo'),
      esp('Peso', 24.3, 'kg', true, 'Dato de la página oficial de Segway (Asia-Pacífico).'),
      esp('Batería', 551, 'Wh', false, 'Dato de la página oficial de Segway (Asia-Pacífico).'),
      esp('Tiempo de carga', 'Aprox. 6', 'h', false, 'Dato de la página oficial de Segway (Asia-Pacífico).'),
      esp('Llantas', '10 pulgadas, autosellantes y sin cámara'),
      esp('Frenos', 'Tambor delantero y freno electrónico regenerativo trasero'),
      esp('Suspensión', 'Hidráulica delantera y de resorte trasera'),
      esp('Carga máxima', 110, 'kg', false, 'Dato de la tienda oficial de Segway Colombia; la página de Asia-Pacífico indica 120 kg.'),
    ],
    precioCompra: 3549900,
    precioFuente: 'https://tienda.segway.center/tienda/ninebot-kickscooter-max-g2/',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://tienda.segway.center/tienda/ninebot-kickscooter-max-g2/',
    verificado: false,
    porConfirmar: [
      'Velocidad máxima: 35 km/h (tienda de Segway Colombia) frente a 25 km/h (página oficial de Asia-Pacífico).',
      'Carga máxima: 110 kg (Colombia) frente a 120 kg (Asia-Pacífico).',
      'Peso, batería y tiempo de carga salen solo de la página de Asia-Pacífico (https://ap-en.segway.com/ekickscooter/products/max-g2.html).',
      'Precio: 3.549.900 COP era un precio en oferta (antes 5.999.900) y la tienda la mostraba sin existencias.',
    ],
  },

  // ===== PATINES ========================================================
  {
    id: 'pts-next-black-80',
    slug: 'next-black-80',
    categoria: 'patines',
    marca: 'Powerslide',
    modelo: 'Next Black 80',
    descripcion:
      'Patines en línea urbanos de bota rígida con ruedas de 80 mm, rodamientos ABEC 9 y chasis de aluminio fundido.',
    colores: [color('Negro', '#1d1d1f')],
    especificaciones: [
      esp('Tipo', 'Bota rígida urbana'),
      esp('Diámetro de las ruedas', 80, 'mm', true, 'En las tallas grandes las ruedas son de 90 mm.'),
      esp('Dureza de las ruedas', '88A'),
      esp('Rodamientos', 'Wicked ABEC 9', null, true),
      esp('Chasis', 'Elite fundido, con montaje TRINITY de 3 puntos'),
      esp('Cierre', 'Hebilla Kizer Clipper de 8 clips, correa V-Power de 45° y cordones'),
      esp('Caña', 'Ajustable en altura'),
      esp('Tallas', 'EU 36–47', null, true),
    ],
    precioCompra: 1040000,
    precioFuente: 'https://www.powerslide.com/products/powerslide-next-black-80',
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.powerslide.com/products/powerslide-next-black-80',
    verificado: true,
    porConfirmar: [
      'Precio estimado: el fabricante lo publica en dólares (259,99 USD); 1.040.000 COP es ese valor por 4.000 COP/USD, sin impuestos de importación. Falta un precio de un distribuidor en Colombia.',
    ],
  },
  {
    id: 'pts-phuzion-radon-90-pds',
    slug: 'phuzion-radon-90-pds',
    categoria: 'patines',
    marca: 'Powerslide',
    modelo: 'Phuzion Radon 90 PDS',
    descripcion:
      'Patines en línea de fitness con bota blanda, cierre PDS y chasis para ruedas de hasta 90 mm.',
    colores: [color('Ciruela', '#5e3552')],
    especificaciones: [
      esp('Tipo', 'Fitness, de bota blanda'),
      esp('Cierre', 'PDS (Power Disc System)', null, true),
      esp('Chasis', 'Elite fundido, para ruedas de hasta 4 × 90 mm', null, true),
      esp('Montaje del chasis', 'TRINITY'),
      esp('Rodamientos', 'Wicked ABEC 9'),
      esp('Freno', 'HABS, preinstalado'),
      esp('Horma', 'Más ancha, con puño nuevo'),
      esp('Tallas', 'EU 37–42', null, true),
    ],
    precioCompra: 800000,
    precioFuente: 'https://www.powerslide.com/products/powerslide-phuzion-radon-90-pds-plum',
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.powerslide.com/products/powerslide-phuzion-radon-90-pds-plum',
    verificado: true,
    porConfirmar: [
      'Precio estimado: el fabricante lo publica en dólares (199,99 USD); 800.000 COP es ese valor por 4.000 COP/USD, sin impuestos de importación. Falta un precio de un distribuidor en Colombia.',
    ],
  },
  {
    id: 'pts-zoom-pro-80-black',
    slug: 'zoom-pro-80-black',
    categoria: 'patines',
    marca: 'Powerslide',
    modelo: 'Zoom Pro 80 Black',
    descripcion:
      'Patines en línea urbanos con ruedas de 80 mm, chasis de aluminio fundido y forro termomoldeable.',
    colores: [color('Negro', '#1d1d1f')],
    especificaciones: [
      esp('Diámetro de las ruedas', 80, 'mm', true, 'En las tallas grandes las ruedas son de 90 mm.'),
      esp('Dureza de las ruedas', '85A'),
      esp('Rodamientos', 'Wicked ABEC 9', null, true, 'De acero cromado.'),
      esp('Chasis', 'Elite FSK de aluminio fundido (243 mm para 4 × 80, 275 mm para 4 × 90)'),
      esp('Montaje del chasis', 'TRINITY'),
      esp('Forro', 'MYFIT Basic Dual Fit, termomoldeable'),
      esp('Cierre', 'Hebilla Kizer Clipper, hebillas Crown y cordones'),
      esp('Tallas', 'EU 37–47', null, true),
    ],
    precioCompra: 800000,
    precioFuente: 'https://www.powerslide.com/products/powerslide-zoom-pro-80-black',
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.powerslide.com/products/powerslide-zoom-pro-80-black',
    verificado: true,
    porConfirmar: [
      'Precio estimado: el fabricante lo publica en dólares (199,99 USD); 800.000 COP es ese valor por 4.000 COP/USD, sin impuestos de importación. Falta un precio de un distribuidor en Colombia.',
    ],
  },

  // ===== DRONES =========================================================
  {
    id: 'dro-fimi-mini-3',
    slug: 'fimi-mini-3',
    categoria: 'drones',
    marca: 'FIMI',
    modelo: 'Mini 3',
    descripcion:
      'Dron plegable de unos 245 g con cámara de 48 MP, gimbal de 3 ejes, video 4K hasta 60 fps y vuelo de hasta 32 minutos.',
    colores: [],
    especificaciones: [
      esp('Peso de despegue', 'Aprox. 245', 'g', true),
      esp('Tiempo máximo de vuelo', 32, 'min', true, 'Medido a 21,6 km/h, sin viento y a nivel del mar. En vuelo estacionario: 29 min.'),
      esp('Video máximo', '4K hasta 60 fps', null, true, 'Resolución de 3840×2160 a 60, 30, 25 y 24 fps; tasa máxima de 100 Mbps.'),
      esp('Cámara', '1/2 pulgada CMOS, 48 MP, f/1,6'),
      esp('Gimbal', 'Mecánico de 3 ejes'),
      esp('Velocidad máxima de vuelo', 18, 'm/s', false, 'Sin viento y a nivel del mar.'),
      esp('Resistencia al viento', 10.7, 'm/s'),
      esp('Alcance de transmisión', 'Aprox. 9', 'km', false, 'Norma FCC, sin interferencias ni obstáculos.'),
      esp('Batería', '2.200 mAh (16,94 Wh)', null, false, 'Pesa unos 86 g.'),
      esp('Dimensiones plegado', '145 × 85 × 56', 'mm', false, 'Sin hélices.'),
    ],
    precioCompra: null,
    precioFuente: null,
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.fimi.com/fimi-mini-3.html',
    verificado: true,
    porConfirmar: [
      'Precio: no encontré una fuente colombiana que se pueda abrir y verificar; en Mercado Libre Colombia lo ofrecen distintos vendedores, en paquetes con precios muy diferentes. La tarifa de alquiler queda por confirmar.',
      'Colores: FIMI no publica un nombre de color; las fotos oficiales muestran el dron en naranja.',
      'Las especificaciones están en imágenes de la ficha oficial de FIMI: las transcribí a mano.',
    ],
  },
  {
    id: 'dro-fimi-x8-tele-max',
    slug: 'fimi-x8-tele-max',
    categoria: 'drones',
    marca: 'FIMI',
    modelo: 'X8 Tele Max',
    descripcion:
      'Dron con cámara gran angular de 48 MP y teleobjetivo de 13 MP, video 4K y vuelo de hasta 38 minutos con la batería estándar.',
    colores: [],
    especificaciones: [
      esp('Peso de despegue', 760, 'g', true, 'Con la batería estándar; con la batería Plus pesa 832 g.'),
      esp('Tiempo máximo de vuelo', 38, 'min', true, 'Con la batería estándar; con la Plus llega a 47 min. Medido a 25,2 km/h a nivel del mar, con video de 720p/30 fps.'),
      esp('Cámaras', 'Gran angular y teleobjetivo', null, true),
      esp('Cámara gran angular', '1/2 pulgada CMOS, 48 MP, f/1,6'),
      esp('Teleobjetivo', '1/2,5 pulgadas CMOS, 13 MP, f/3,0 (equivale a 120 mm)'),
      esp('Video máximo', '4K hasta 60 fps', null, false, 'En la cámara gran angular; el teleobjetivo graba 4K hasta 30 fps.'),
      esp('Velocidad máxima de vuelo', 18, 'm/s', false, 'Sin viento y a nivel del mar.'),
      esp('Alcance de transmisión', 'Aprox. 20', 'km', false, 'Norma FCC, sin interferencias ni obstáculos.'),
      esp('Gimbal', 'Mecánico de 3 ejes'),
      esp('Dimensiones plegado', '204 × 106 × 72,6', 'mm', false, 'Sin hélices.'),
    ],
    precioCompra: null,
    precioFuente: null,
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.fimi.com/fimi-x8-tele-max.html',
    verificado: true,
    porConfirmar: [
      'Precio: no encontré ninguna fuente colombiana con precio. La tarifa de alquiler queda por confirmar.',
      'Colores: FIMI no publica un nombre de color en la ficha; las fotos oficiales muestran el dron en blanco.',
      'Las especificaciones están en imágenes de la ficha oficial de FIMI: las transcribí a mano.',
    ],
  },

  // ===== MOTOS ELÉCTRICAS ===============================================
  {
    id: 'mot-niu-nqi-sport',
    slug: 'niu-nqi-sport',
    categoria: 'motos',
    marca: 'NIU',
    modelo: 'NQi Sport',
    descripcion:
      'Moto eléctrica para dos personas con motor de 1.500 W, batería de litio extraíble de 60 V y frenos de disco hidráulicos.',
    colores: [color('Blanco', '#f5f5f7')],
    especificaciones: [
      esp('Velocidad máxima', 55, 'km/h', true, 'NIU Colombia publica 55 km/h y NIU Francia publica 45 km/h; la diferencia puede deberse a la homologación de cada región. Falta confirmar cuál corresponde a la moto que se vende en Colombia.', true),
      esp('Autonomía', '55–65', 'km', true),
      esp('Motor', '1.500 W nominal'),
      esp('Batería', '60 V / 26 Ah', null, true, 'De litio y extraíble.'),
      esp('Frenos', 'Disco hidráulico delantero y trasero, con frenado regenerativo EBS'),
      esp('Suspensión', 'Telescópica hidráulica delante y doble amortiguador atrás'),
      esp('Pasajeros', 'Hasta 2'),
    ],
    precioCompra: 6990000,
    precioFuente: 'https://niucolombia.com/productos/nqi-sport/',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://niucolombia.com/productos/nqi-sport/',
    verificado: false,
    porConfirmar: [
      'Velocidad máxima: NIU Colombia publica 55 km/h y la página de NIU Francia (france.niu.com/collections/best-selling-collection/products/nqi-sport) publica 45 km/h. Falta confirmar cuál aplica a la moto vendida en Colombia.',
      'Autonomía: la página de NIU Francia publica de 45 a 65 km; el catálogo, tomado de NIU Colombia, indica de 55 a 65 km.',
      'Las fotos oficiales son del NQi Sport blanco de NIU Francia; no certifican la configuración colombiana.',
    ],
  },
  {
    id: 'mot-starker-thunder-1500',
    slug: 'starker-thunder-1500',
    categoria: 'motos',
    marca: 'Starker',
    modelo: 'Thunder 1500',
    descripcion:
      'Moto eléctrica de Auteco con motor de 1.500 W, batería de litio removible de 72 V y velocidad máxima de 76 km/h.',
    colores: [],
    especificaciones: [
      esp('Potencia del motor', 1500, 'W', true),
      esp('Velocidad máxima', 76, 'km/h', true, 'Con un conductor de 70 kg.'),
      esp('Autonomía', 'Hasta 60', 'km', true, 'A 60 km/h, terreno plano, 1.500 msnm, conductor de 65 kg y batería nueva al 100 %.'),
      esp('Batería', '72 V / 26 Ah, ion de litio, 1,87 kWh, removible'),
      esp('Tiempo de carga', '6–8', 'h'),
      esp('Frenos', 'Disco delantero y trasero'),
      esp('Llantas', '110/70-12 delante y 120/70-12 atrás'),
      esp('Freno regenerativo', 'No'),
      esp('Peso en seco', 100, 'kg'),
      esp('Carga máxima', 150, 'kg'),
    ],
    precioCompra: 8999000,
    precioFuente: 'https://www.auteco.com.co/moto-electrica-starker-thunder-1500/p',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.auteco.com.co/moto-electrica-starker-thunder-1500/p',
    verificado: true,
    porConfirmar: [],
  },
  {
    id: 'mot-starker-cool-joy',
    slug: 'starker-cool-joy',
    categoria: 'motos',
    marca: 'Starker',
    modelo: 'Cool Joy',
    descripcion:
      'Moto eléctrica de Auteco con motor de 500 W, batería de plomo-ácido de 48 V y velocidad máxima de 32 km/h.',
    colores: [],
    especificaciones: [
      esp('Potencia del motor', '500 nominal / 750 máxima', 'W', true),
      esp('Velocidad máxima', 32, 'km/h', true),
      esp('Autonomía', 'Hasta 60', 'km', true),
      esp('Batería', '48 V / 20 Ah, plomo-ácido, 0,96 kWh, no removible'),
      esp('Tiempo de carga', '6–8', 'h'),
      esp('Frenos', 'De campana, delantero y trasero'),
      esp('Llantas', '2.5-10, sin cámara (tubeless)'),
      esp('Peso en seco', 69, 'kg'),
      esp('Carga máxima', 100, 'kg'),
    ],
    precioCompra: 3449000,
    precioFuente: 'https://www.auteco.com.co/moto-electrica-starker-cooljoy/p',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.auteco.com.co/moto-electrica-starker-cooljoy/p',
    verificado: true,
    porConfirmar: [],
  },

  // ===== CARROS ELÉCTRICOS ==============================================
  {
    id: 'car-renault-kwid-e-tech',
    slug: 'renault-kwid-e-tech',
    categoria: 'carros',
    marca: 'Renault',
    modelo: 'Kwid E-Tech',
    descripcion:
      'Auto eléctrico de cuatro plazas con motor de 48 kW, batería de 26,8 kWh y autonomía de hasta 298 km en ciclo urbano.',
    colores: [],
    especificaciones: [
      esp('Autonomía', 'Hasta 298', 'km', true, 'Ciclo urbano, norma SAE J1634.'),
      esp('Motor', '48 kW (65 CV)', null, true),
      esp('Batería', 26.8, 'kWh'),
      esp('Aceleración', '0–50 km/h en 4,1 s'),
      esp('Carga en corriente alterna', 'Hasta 7 kW (toma doméstica o cargador de pared)'),
      esp('Carga rápida en corriente continua', '15–80 % en unos 40 min'),
      esp('Plazas', 4, null, true),
      esp('Baúl', '290 L (hasta 1.100 L con el asiento trasero abatido)'),
      esp('Pantalla multimedia', 10.1, 'pulgadas'),
    ],
    precioCompra: 72990000,
    precioFuente: 'https://www.renault.com.co/electricos/kwid-etech0/autonomia-y-recarga.html',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://prensa.renault.com.co/prensa/renault-anuncia-la-llegada-del-renault-kwid-e-tech-electrico-en-colombia/',
    verificado: true,
    porConfirmar: [
      'La ficha de potencia, batería y carga es la del comunicado de lanzamiento (2023); el modelo se actualizó en Colombia en 2026. Conviene confirmar contra la ficha vigente.',
      'Precio: 72.990.000 COP es el "precio sugerido desde" de renault.com.co; el comunicado de prensa menciona 73 millones.',
    ],
  },
  {
    id: 'car-dacia-spring-2026',
    slug: 'dacia-spring-2026',
    categoria: 'carros',
    marca: 'Dacia',
    modelo: 'Spring (nueva generación 2026)',
    descripcion:
      'Auto eléctrico de nueva generación, presentado en septiembre de 2026, con motor de 60 kW, batería LFP de 27,5 kWh útiles y autonomía de hasta 250 km.',
    colores: [
      color('Agave', '#4f8f8b'),
      color('Schist Grey', '#6e7377'),
      color('Diamond Black', '#1a1a1c'),
      color('Glacier White', '#f2f4f5'),
    ],
    especificaciones: [
      esp('Autonomía', 'Hasta 250', 'km', true, 'Ciclo combinado WLTP.'),
      esp('Motor', '60 kW (80 hp)', null, true),
      esp('Batería', 'LFP, 27,5 kWh útiles', null, true),
      esp('Par máximo', 175, 'N·m'),
      esp('Aceleración de 0 a 100 km/h', 12.1, 's'),
      esp('Velocidad máxima', 130, 'km/h'),
      esp('Carga en corriente alterna', '6,6 kW de serie', null, false, 'De 15 % a 80 % en 9 h en una toma doméstica; en 5 h 40 min con una toma reforzada y en 2 h 55 min con un cargador de pared de 7 kW.'),
      esp('Carga rápida en corriente continua', 50, 'kW', false, 'Con el paquete de carga rápida: de 15 % a 80 % en 28 min.'),
      esp('Radio de giro', 4.95, 'm'),
      esp('Pantalla multimedia', 10.1, 'pulgadas', false, 'El cuadro de instrumentos digital es de 7 pulgadas.'),
    ],
    precioCompra: null,
    precioFuente: null,
    precioVerificado: false,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://media.dacia.com/new-dacia-spring-100-per-cent-electric-100-per-cent-dacia/?lang=eng',
    verificado: true,
    porConfirmar: [
      'Disponibilidad en Colombia: no verificada. La fuente es el comunicado de prensa global de Dacia (8 de septiembre de 2026), no una página de Dacia Colombia.',
      'Precio: no hay una fuente colombiana. La tarifa de alquiler queda por confirmar.',
      'Versiones: las cifras son las del comunicado de prensa; no revisé si hay variantes distintas según el país.',
    ],
  },

  // ===== ACCESORIOS =====================================================
  {
    id: 'acc-specialized-align-ii-mips',
    slug: 'specialized-align-ii-mips',
    categoria: 'accesorios',
    marca: 'Specialized',
    modelo: 'Align II MIPS',
    descripcion:
      'Casco de ciclismo con protección MIPS, sistema de ajuste Headset SX con dial micrométrico y carcasa en molde.',
    colores: [color('Negro / Negro reflectante', '#1d1d1f')],
    especificaciones: [
      esp('Protección rotacional', 'MIPS', null, true, 'Capa de baja fricción que permite un deslizamiento de 10 a 15 mm en todas las direcciones.'),
      esp('Sistema de ajuste', 'Headset SX con dial micrométrico', null, true),
      esp('Ventilación', 'Sistema 4th Dimension Cooling', null, true),
      esp('Carcasa', 'En molde (in-mold)', null, false, 'La ficha indica que mejora la resistencia y reduce el peso.'),
      esp('Tallas', 'S/M, M/L y XL'),
      esp('Calificación Virginia Tech', '5 estrellas', null, false, 'Según la ficha de Specialized.'),
      esp('Certificación', 'CPSC (EE. UU.)', null, false, 'Para los cascos que se venden en EE. UU. y Canadá.'),
      esp('Visibilidad', 'Calcomanías reflectantes'),
    ],
    precioCompra: 260000,
    precioFuente: 'https://www.specialized.com/co/es/align-ii/p/1000207922',
    precioVerificado: true,
    alquilable: true,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.specialized.com/us/en/align-ii/p/1000207992',
    verificado: true,
    porConfirmar: [
      'Peso: la ficha oficial no lo publica; no lo incluí.',
      'Precio: 260.000 COP es el de la página de Specialized Colombia para el color Black/Black Reflective; las especificaciones salen de la ficha de Specialized en Estados Unidos.',
    ],
  },
  {
    id: 'acc-kryptonite-evolution-mini-7',
    slug: 'kryptonite-evolution-mini-7',
    categoria: 'accesorios',
    marca: 'Kryptonite',
    modelo: 'Evolution Mini-7 con cable Flex',
    descripcion:
      'Candado en U con grillete de acero endurecido de 13 mm, cilindro de alta seguridad y cable KryptoFlex de doble lazo.',
    colores: [],
    especificaciones: [
      esp('Tipo', 'Candado en U'),
      esp('Grillete', '13 mm, acero endurecido', null, true),
      esp('Resistencia', 'A cizallas y ataques de apalancamiento'),
      esp('Cilindro', 'Tipo disco', null, true, 'De alta seguridad.'),
      esp('Mango', 'Reforzado sobre el travesaño y el cilindro'),
      esp('Diseño del grillete', 'Bent Foot'),
      esp('Cable', 'KryptoFlex de 4 pies', null, true, 'De doble lazo.'),
    ],
    precioCompra: 533900,
    precioFuente: 'https://www.kryptonitelock.com.co/producto/candado-para-bicicleta-evolution-series-mini-7-w-4-flex/',
    precioVerificado: false,
    alquilable: false,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.kryptonitelock.com.co/producto/candado-para-bicicleta-evolution-series-mini-7-w-4-flex/',
    verificado: true,
    porConfirmar: [
      'Peso y dimensiones: la página de Kryptonite Colombia publica 3 kg y 15 × 8 × 20 cm (parecen medidas de empaque) y la global otras cifras; no los incluí.',
      'Precio: 533.900 COP (kryptonitelock.com.co) salió de un resumen de búsqueda; en Mercado Libre va de 385.000 a 605.000 COP.',
    ],
  },
  {
    id: 'acc-specialized-stix-elite-2',
    slug: 'specialized-stix-elite-2-headlight',
    categoria: 'accesorios',
    marca: 'Specialized',
    modelo: 'Stix Elite 2 Headlight',
    descripcion:
      'Luz delantera recargable por USB con 100 lúmenes continuos, 200 lúmenes en destello y batería de 540 mAh.',
    colores: [color('Negro', '#1d1d1f')],
    especificaciones: [
      esp('Luminosidad continua', 100, 'lm', true, 'Modo Steady High.'),
      esp('Luminosidad en destello', 200, 'lm', true, 'Modo Power Flash.'),
      esp('Modos de luz', 6),
      esp('Duración en continuo alto (100 lm)', '2 h 30 min'),
      esp('Duración en continuo bajo (38 lm)', 10, 'h'),
      esp('Duración en destello (200 lm)', 10, 'h'),
      esp('Duración máxima (12 lm, Eco Flash)', 112, 'h'),
      esp('Batería', 540, 'mAh', true, 'Se recarga por el conector USB integrado en 2 horas, sin cable adicional.'),
      esp('Montaje', 'Manubrios de 22,2 a 35 mm de diámetro'),
      esp('Indicador de carga', 'Rojo y verde'),
    ],
    precioCompra: 192000,
    precioFuente: 'https://www.specialized.com/co/es/stix-elite-2-headlight/p/174109',
    precioVerificado: true,
    alquilable: false,
    disponibilidad: POR_CONFIRMAR,
    fuente: 'https://www.specialized.com/us/en/stix-elite-2-headlight/p/174109',
    verificado: true,
    porConfirmar: [
      'Precio: 192.000 COP es el de la página de Specialized Colombia; las especificaciones salen de la ficha de Specialized en Estados Unidos.',
    ],
  },
]

// ---------------------------------------------------------------------------
// Productos completos: agrega los campos que se calculan a partir de los datos.
// ---------------------------------------------------------------------------

// Vistas con foto: las del manifiesto, en el orden que define la categoría.
// Cada vista queda como { id, etiqueta, imagen, imagenPequena, ancho, alto,
// anchoPequeno, altoPequeno, alt, descripcion, credito }. Las fotos no se recortan:
// el ancho y el alto son los reales de cada archivo (los componentes los usan para
// reservar el espacio y para elegir cómo encajar la imagen). La descripción es null
// porque no hay textos escritos para las fotos.
function armarVistas(producto, nombre) {
  const registradas = medios.vistas?.[`${producto.categoria}/${producto.slug}`] ?? {}

  return (VISTAS_POR_CATEGORIA[producto.categoria] ?? [])
    .filter((vista) => registradas[vista.id])
    .map((vista) => {
      const datos = registradas[vista.id]
      const base = `/productos/${producto.categoria}-${producto.slug}-${vista.id}`
      const pequeno = datos.pequeno ?? { ancho: datos.ancho, alto: datos.alto }

      return {
        id: vista.id,
        etiqueta: vista.etiqueta,
        imagen: `${base}.webp`,
        imagenPequena: datos.pequeno ? `${base}-sm.webp` : `${base}.webp`,
        ancho: datos.ancho,
        alto: datos.alto,
        anchoPequeno: pequeno.ancho,
        altoPequeno: pequeno.alto,
        alt: `${nombre}, ${vista.etiqueta.toLowerCase()}`,
        descripcion: null,
        credito: { marca: datos.marca ?? null, fuente: datos.fuente ?? null },
      }
    })
}

// Video del producto: solo si el manifiesto lo registra (video y póster existen).
function armarVideo(producto) {
  const registrado = medios.videos?.[`${producto.categoria}/${producto.slug}`]
  if (!registrado) return null

  return {
    src: `/productos/video/${producto.slug}.mp4`,
    poster: `/productos/video/${producto.slug}-poster.webp`,
    descripcion: null,
  }
}

function completar({ alquilable, ...producto }) {
  const nombre = `${producto.marca} ${producto.modelo}`
  const sinPrecio = producto.precioCompra === null

  return {
    ...producto,
    nombre,
    // Sin precio de referencia no se inventa una tarifa: queda "por confirmar".
    tarifasAlquiler:
      alquilable && !sinPrecio
        ? tarifasDeEjemplo(producto.precioCompra, producto.categoria)
        : null,
    disponibleAlquiler: alquilable,
    tarifaPorConfirmar: alquilable && sinPrecio,
    especificacionesClave: producto.especificaciones.filter((e) => e.clave),
    vistas: armarVistas(producto, nombre),
    video: armarVideo(producto),
    destacado: producto.destacado ?? false,
  }
}

export const PRODUCTOS = PRODUCTOS_BASE.map(completar)
