// Valores de movimiento para el código JS. Son los mismos que los tokens de la
// sección "Movimiento" de src/index.css (--dur-*, --escalon, --ease-*): si
// cambias uno aquí, cámbialo también allí para que CSS y JS no se desincronicen.
//
// Fuera de este módulo quedan, a propósito:
//  - la coreografía de entrada del hero (GSAP, entre 0,9 y 1,2 s): son tiempos
//    de presentación, mucho más largos que los de la interfaz;
//  - Lenis, que usa sus valores por defecto.

// Duraciones en milisegundos.
export const DURACION = {
  instante: 120, // fundido corto con movimiento reducido
  rapida: 200, // color, borde y pequeños desplazamientos al pasar el puntero
  media: 250, // cambio de estado habitual
  lenta: 350, // paneles, menús y tarjetas
  entrada: 400, // llegada de paneles y capas
}

// Retraso entre elementos de una lista que entra, en milisegundos.
export const ESCALON = 45

// Curvas como los cuatro números de cubic-bezier (x1, y1, x2, y2).
export const CURVA = {
  estandar: [0.25, 0.1, 0.25, 1], // equivale a la palabra clave "ease" de CSS
  entrada: [0.2, 0.7, 0.2, 1], // llegadas: desacelera
  ambos: [0.65, 0, 0.35, 1], // ida y vuelta, movimiento continuo
}

// Convierte milisegundos a segundos (GSAP trabaja en segundos).
export const aSegundos = (ms) => ms / 1000

// Texto de una curva para usarlo en estilos o en la Web Animations API.
export const cubicBezier = (curva) => `cubic-bezier(${curva.join(', ')})`

// Convierte una curva en una función de easing que GSAP acepta (progreso 0..1 →
// valor 0..1), para que las animaciones de GSAP usen las mismas curvas que el CSS
// sin cargar el plugin CustomEase.
export function easeDe([x1, y1, x2, y2]) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const x = (t) => ((ax * t + bx) * t + cx) * t
  const y = (t) => ((ay * t + by) * t + cy) * t
  const derivadaX = (t) => (3 * ax * t + 2 * bx) * t + cx

  return (progreso) => {
    if (progreso <= 0) return 0
    if (progreso >= 1) return 1

    // Newton-Raphson: casi siempre converge en 2 o 3 pasos.
    let t = progreso
    for (let i = 0; i < 8; i += 1) {
      const error = x(t) - progreso
      if (Math.abs(error) < 1e-5) return y(t)
      const pendiente = derivadaX(t)
      if (Math.abs(pendiente) < 1e-6) break
      t -= error / pendiente
    }

    // Respaldo por bisección si Newton no converge.
    let bajo = 0
    let alto = 1
    t = progreso
    while (bajo < alto) {
      const valor = x(t)
      if (Math.abs(valor - progreso) < 1e-5) break
      if (valor < progreso) bajo = t
      else alto = t
      t = (alto + bajo) / 2
      if (alto - bajo < 1e-7) break
    }
    return y(t)
  }
}

// Pausa antes de cerrar un menú al sacar el puntero. No es una animación: es
// la tolerancia que evita que el menú parpadee si el puntero roza el borde.
export const RETRASO_CIERRE_MENU = 160
