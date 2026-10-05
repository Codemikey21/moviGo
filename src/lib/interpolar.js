/**
 * Funciones de interpolación para el scrollytelling.
 *
 * El progreso del scroll (0 a 1) se reparte en tantas "ventanas" como
 * capítulos haya. El estado del modelo vale exactamente el objetivo del
 * capítulo en el CENTRO de su ventana, y entre dos centros se mezcla con
 * suavizado. Así, mientras se lee un capítulo el modelo queda "retenido" en
 * su pose, y la transición ocurre cerca del cambio de texto.
 */

// Fracción de cada tramo en la que el valor se mantiene fijo, en cada extremo.
const RETENCION = 0.18

// Fracción de la ventana de un capítulo que dura el fundido de su texto.
const FUNDIDO_TEXTO = 0.2

// Distancia (px) que recorre el texto al aparecer y desaparecer.
const DESPLAZAMIENTO_TEXTO = 48

export function limitar(valor, minimo = 0, maximo = 1) {
  return Math.min(maximo, Math.max(minimo, valor))
}

// Curva "smoothstep": arranca y termina suave.
export function suavizar(t) {
  return t * t * (3 - 2 * t)
}

export function mezclar(a, b, t) {
  return a + (b - a) * t
}

// Mezcla dos objetos con las mismas claves numéricas.
export function mezclarObjetos(a, b, t) {
  const resultado = {}
  for (const clave in a) {
    resultado[clave] = mezclar(a[clave], b[clave], t)
  }
  return resultado
}

// Capítulo activo para un progreso dado (0 a total - 1).
export function indiceCapitulo(progreso, total) {
  return limitar(Math.floor(progreso * total), 0, total - 1)
}

// Progreso exacto del centro de la ventana de un capítulo.
export function progresoCentrado(indice, total) {
  return (indice + 0.5) / total
}

/**
 * Interpola una lista de claves { en, valores } según el progreso.
 * Antes de la primera y después de la última devuelve esos valores tal cual.
 */
function interpolarClaves(progreso, claves) {
  const primera = claves[0]
  const ultima = claves[claves.length - 1]

  if (progreso <= primera.en) return { ...primera.valores }
  if (progreso >= ultima.en) return { ...ultima.valores }

  for (let i = 0; i < claves.length - 1; i++) {
    const actual = claves[i]
    const siguiente = claves[i + 1]

    if (progreso <= siguiente.en) {
      const t = (progreso - actual.en) / (siguiente.en - actual.en)

      // El primer tramo (estado inicial → capítulo 1) no retiene al inicio,
      // para que el modelo empiece a moverse desde el primer píxel de scroll.
      const retencionInicial = i === 0 ? 0 : RETENCION
      const util = 1 - retencionInicial - RETENCION
      const tSuave = suavizar(limitar((t - retencionInicial) / util))

      return mezclarObjetos(actual.valores, siguiente.valores, tSuave)
    }
  }

  return { ...ultima.valores }
}

// Las claves solo dependen de los datos, así que se calculan una vez.
const cacheDeClaves = new WeakMap()

function obtenerClaves(capitulos, estadoInicial) {
  let claves = cacheDeClaves.get(capitulos)

  if (!claves) {
    const total = capitulos.length

    claves = {
      modelo: [{ en: 0, valores: estadoInicial.modelo }],
      resplandor: [{ en: 0, valores: estadoInicial.resplandor }],
    }

    capitulos.forEach((capitulo, indice) => {
      const en = progresoCentrado(indice, total)
      claves.modelo.push({ en, valores: capitulo.modelo })
      claves.resplandor.push({ en, valores: capitulo.resplandor })
    })

    cacheDeClaves.set(capitulos, claves)
  }

  return claves
}

/**
 * Estado del modelo y del resplandor para un progreso de scroll.
 *
 * Con `estatico` (prefers-reduced-motion) no hay mezcla: el progreso se ajusta
 * al centro del capítulo activo, de modo que el estado salta de un capítulo
 * al siguiente sin movimiento intermedio.
 */
export function estadoPorProgreso(
  progreso,
  capitulos,
  estadoInicial,
  estatico = false,
) {
  const total = capitulos.length
  const progresoEfectivo = estatico
    ? progresoCentrado(indiceCapitulo(progreso, total), total)
    : progreso

  const claves = obtenerClaves(capitulos, estadoInicial)

  return {
    modelo: interpolarClaves(progresoEfectivo, claves.modelo),
    resplandor: interpolarClaves(progresoEfectivo, claves.resplandor),
  }
}

/**
 * Opacidad y desplazamiento vertical (px) del texto de un capítulo.
 * Aparece subiendo, se mantiene y desaparece subiendo un poco más.
 * El primer capítulo ya está visible al inicio y el último se queda al final.
 */
export function estadoTexto(progreso, indice, total, estatico = false) {
  if (estatico) {
    const activo = indiceCapitulo(progreso, total) === indice
    return { opacidad: activo ? 1 : 0, y: 0 }
  }

  // Posición dentro de la ventana propia: 0 al empezar, 1 al terminar.
  const local = progreso * total - indice

  const entrada =
    indice === 0 ? 1 : suavizar(limitar(local / FUNDIDO_TEXTO))
  const salida =
    indice === total - 1 ? 1 : suavizar(limitar((1 - local) / FUNDIDO_TEXTO))

  return {
    opacidad: Math.min(entrada, salida),
    y: (1 - entrada) * DESPLAZAMIENTO_TEXTO - (1 - salida) * DESPLAZAMIENTO_TEXTO,
  }
}
