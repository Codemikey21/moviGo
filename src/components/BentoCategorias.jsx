import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import Revelar from './Revelar'
import Seccion from './Seccion'
import { CATEGORIAS } from '../data/catalogo'
import {
  alquilerDesdePorDia,
  contarProductos,
  productosDeCategoria,
  rutaCategoria,
} from '../lib/formato'
import './BentoCategorias.css'

// Cuántas de las 6 columnas ocupa cada tarjeta: da el aspecto "bento".
const COLUMNAS = {
  bicicletas: 3,
  patinetas: 3,
  patines: 2,
  drones: 2,
  motos: 2,
  carros: 4,
  accesorios: 2,
}

/**
 * Cuadrícula "bento" de la portada: una tarjeta grande por categoría,
 * con su color de acento, un degradado de fondo y un foco de luz que sigue
 * al cursor. No usa canvas: todo es CSS y SVG.
 */
function BentoCategorias() {
  const moverFoco = (evento) => {
    const tarjeta = evento.currentTarget
    const caja = tarjeta.getBoundingClientRect()
    tarjeta.style.setProperty('--mx', `${evento.clientX - caja.left}px`)
    tarjeta.style.setProperty('--my', `${evento.clientY - caja.top}px`)
  }

  return (
    <Seccion
      tono="oscuro"
      eyebrow="La flota"
      titulo="Un vehículo para cada trayecto."
      descripcion="Compra el tuyo o alquílalo por horas, días o semanas. Elige una línea y explora todos sus modelos."
    >
      <div className="bento">
        {CATEGORIAS.map((categoria, indice) => {
          const ruta = rutaCategoria(categoria)
          const cantidad = contarProductos(categoria.slug)
          const tieneAlquiler = alquilerDesdePorDia(
            productosDeCategoria(categoria.slug),
          )

          return (
            <Revelar
              key={categoria.slug}
              retraso={indice % 3}
              className={`bento__celda bento__celda--${COLUMNAS[categoria.slug]}`}
            >
              <article
                className="bento__tarjeta"
                style={{ '--acento': categoria.colorAcento }}
                onPointerMove={moverFoco}
              >
                <IconoCategoria
                  categoria={categoria}
                  grosor={0.9}
                  className="bento__icono"
                />

                <div className="bento__texto">
                  <p className="bento__cantidad">
                    {cantidad} {cantidad === 1 ? 'modelo' : 'modelos'}
                  </p>
                  <h3 className="bento__nombre">
                    <Link to={ruta} className="bento__enlace-principal">
                      {categoria.nombre}
                    </Link>
                  </h3>
                  <p className="bento__tagline">{categoria.tagline}</p>
                </div>

                <div className="bento__acciones">
                  <Link to={ruta} className="bento__boton bento__boton--lleno">
                    Comprar
                  </Link>
                  {tieneAlquiler && (
                    <Link
                      to={`${ruta}?modo=alquilar`}
                      className="bento__boton bento__boton--borde"
                    >
                      Alquilar
                    </Link>
                  )}
                </div>
              </article>
            </Revelar>
          )
        })}
      </div>
    </Seccion>
  )
}

export default BentoCategorias
