/**
 * Vistas sugeridas por categoría para las fotos de cada producto.
 *
 * Un producto no está obligado a tener todas: solo muestra las que de verdad
 * tiene (las que aparecen en src/data/medios.generado.json, que genera
 * `npm run imagenes`). El orden de esta lista es el orden en que se muestran.
 *
 * `id` es la parte final del nombre del archivo:
 *   public/productos/<categoria>-<slug>-<id>.webp
 * `etiqueta` es el texto visible del selector de vistas.
 */

// Tamaño de todas las imágenes de producto (proporción 4:3). Se usa para los
// atributos width y height, que evitan saltos de diseño mientras carga la foto.
export const IMAGEN = { ancho: 1600, alto: 1200 }

export const VISTAS_POR_CATEGORIA = {
  carros: [
    { id: 'frente', etiqueta: 'Frente' },
    { id: 'lateral', etiqueta: 'Lateral' },
    { id: 'trasera', etiqueta: 'Trasera' },
    { id: 'interior', etiqueta: 'Interior' },
    { id: 'tablero', etiqueta: 'Tablero' },
    { id: 'maletero', etiqueta: 'Maletero' },
  ],
  motos: [
    { id: 'frente', etiqueta: 'Frente' },
    { id: 'lateral', etiqueta: 'Lateral' },
    { id: 'trasera', etiqueta: 'Trasera' },
    { id: 'tablero', etiqueta: 'Tablero' },
    { id: 'bateria', etiqueta: 'Batería' },
  ],
  bicicletas: [
    { id: 'lateral', etiqueta: 'Lateral' },
    { id: 'frente', etiqueta: 'Frente' },
    { id: 'cambios-frenos', etiqueta: 'Cambios y frenos' },
    { id: 'cuadro', etiqueta: 'Cuadro' },
  ],
  patinetas: [
    { id: 'lateral', etiqueta: 'Lateral' },
    { id: 'plegada', etiqueta: 'Plegada' },
    { id: 'pantalla', etiqueta: 'Pantalla' },
    { id: 'ruedas-frenos', etiqueta: 'Ruedas y frenos' },
  ],
  patines: [
    { id: 'lateral', etiqueta: 'Lateral' },
    { id: 'botin', etiqueta: 'Botín' },
    { id: 'ruedas', etiqueta: 'Ruedas' },
    { id: 'detalle', etiqueta: 'Detalle' },
  ],
  drones: [
    { id: 'frente', etiqueta: 'Frente' },
    { id: 'plegado', etiqueta: 'Plegado' },
    { id: 'control', etiqueta: 'Control' },
    { id: 'camara', etiqueta: 'Cámara' },
  ],
  accesorios: [
    { id: 'vista-1', etiqueta: 'Vista 1' },
    { id: 'vista-2', etiqueta: 'Vista 2' },
    { id: 'vista-3', etiqueta: 'Vista 3' },
  ],
}
