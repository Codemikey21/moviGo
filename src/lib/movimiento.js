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

// Pausa antes de cerrar un menú al sacar el puntero. No es una animación: es
// la tolerancia que evita que el menú parpadee si el puntero roza el borde.
export const RETRASO_CIERRE_MENU = 160
