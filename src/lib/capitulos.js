/**
 * Configuración basada en datos del scrollytelling 3D.
 *
 * Cada capítulo define:
 *  - Los textos que se muestran (eyebrow, título y texto).
 *  - El lado donde aparece el texto ("izquierda" o "derecha"). El vehículo
 *    se coloca del lado contrario para que nunca se tapen.
 *  - El estado objetivo del modelo 3D cuando ese capítulo está en pantalla:
 *      rotationY   → giro del vehículo sobre su eje vertical (radianes)
 *      x           → desplazamiento horizontal (unidades de escena)
 *      escala      → tamaño del vehículo
 *      explode     → 0 = ensamblado, 1 = vista explosionada
 *      camaraZ     → distancia de la cámara (menor = más cerca)
 *      giroRuedas  → giro acumulado de las ruedas (radianes)
 *  - El resplandor de fondo (color RGB, intensidad 0..1 y posición
 *    horizontal en %).
 *
 * Todos los valores de `modelo` y `resplandor` deben ser números, porque
 * `interpolar.js` los mezcla uno a uno según el progreso del scroll.
 */

// Estado del modelo cuando el scroll está en 0, antes del primer capítulo.
// Sirve para que el vehículo "gire y se acerque" durante el capítulo 1.
export const ESTADO_INICIAL = {
  modelo: {
    rotationY: -1.5,
    x: 1.3,
    escala: 0.8,
    explode: 0,
    camaraZ: 9,
    giroRuedas: 0,
  },
  resplandor: { r: 41, g: 151, b: 255, intensidad: 0.18, posX: 70 },
}

export const CAPITULOS = [
  {
    id: 'flota',
    eyebrow: 'Una sola flota',
    titulo: 'Alquila. Compra. Entrega.',
    texto: 'Una plataforma para moverte por la ciudad y mover tus pedidos.',
    lado: 'izquierda',
    // El modelo gira y se acerca.
    modelo: {
      rotationY: -2.6,
      x: 1.3,
      escala: 1,
      explode: 0,
      camaraZ: 5.8,
      giroRuedas: 10,
    },
    resplandor: { r: 41, g: 151, b: 255, intensidad: 0.42, posX: 70 },
  },
  {
    id: 'movilidad',
    eyebrow: 'Movilidad ligera',
    titulo: 'Bicis, patinetas y patines.',
    texto:
      'Elige el vehículo ideal por hora, por día o llévatelo para siempre.',
    lado: 'derecha',
    // El modelo gira y se desplaza al otro lado.
    modelo: {
      rotationY: -0.55,
      x: -1.3,
      escala: 1,
      explode: 0,
      camaraZ: 5.8,
      giroRuedas: 22,
    },
    resplandor: { r: 48, g: 209, b: 200, intensidad: 0.36, posX: 30 },
  },
  {
    id: 'mantenimiento',
    eyebrow: 'Siempre listos',
    titulo: 'Mantenimiento inteligente.',
    texto:
      'Alertas automáticas para que cada vehículo salga en perfecto estado.',
    lado: 'izquierda',
    // Vista explosionada: las piezas se separan, flotan y rotan lentamente.
    modelo: {
      rotationY: -0.95,
      x: 1,
      escala: 0.9,
      explode: 1,
      camaraZ: 9.2,
      giroRuedas: 26,
    },
    resplandor: { r: 125, g: 122, b: 255, intensidad: 0.5, posX: 66 },
  },
  {
    id: 'domicilios',
    eyebrow: 'Domicilios',
    titulo: 'La misma flota, tus entregas.',
    texto: 'Entregas en minutos con seguimiento en tiempo real.',
    lado: 'derecha',
    // Las piezas se ensamblan de nuevo y el vehículo avanza girando.
    modelo: {
      rotationY: -2.85,
      x: -1.2,
      escala: 1,
      explode: 0,
      camaraZ: 5.6,
      giroRuedas: 60,
    },
    resplandor: { r: 255, g: 159, b: 10, intensidad: 0.3, posX: 32 },
  },
]
