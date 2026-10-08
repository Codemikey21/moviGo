// Ayudas para encajar las fotos de producto en su contenedor.
//
// Las fotos NO se recortan al procesarlas (ver scripts/optimizar-imagenes.mjs):
// cada una conserva su proporción original, y el manifiesto guarda su ancho y su
// alto reales. Los contenedores reservan su espacio con una proporción fija (así
// la página no se mueve mientras carga la foto) y la foto se encaja dentro.

// Diferencia máxima de proporción (10 %) para llenar el contenedor recortando
// un poco. Con más diferencia la foto se ve completa sobre un fondo neutro.
export const DIFERENCIA_MAXIMA_PARA_CUBRIR = 0.1

// Proporción (ancho / alto) de una vista del catálogo.
export function proporcionDe(vista) {
  return vista.ancho / vista.alto
}

/**
 * Cómo encajar una foto en un contenedor:
 *  - "cubrir"  (object-fit: cover): la foto llena el contenedor; solo si las dos
 *              proporciones difieren menos del 10 %, así el recorte es mínimo;
 *  - "contener" (object-fit: contain): la foto se ve completa y el espacio que
 *              sobra queda con el fondo neutro (--color-fondo-foto).
 */
export function ajusteDeImagen(proporcionImagen, proporcionContenedor) {
  const diferencia = Math.abs(proporcionImagen / proporcionContenedor - 1)
  return diferencia < DIFERENCIA_MAXIMA_PARA_CUBRIR ? 'cubrir' : 'contener'
}

// Valor de la propiedad CSS aspect-ratio para una proporción (ancho / alto).
export function aspectRatioCss(proporcion) {
  return String(Number(proporcion.toFixed(4)))
}
