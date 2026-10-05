import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import Revelar from './Revelar'
import {
  alquilerDesdePorDia,
  contarProductos,
  formatearPrecio,
  productosDeCategoria,
  rutaCategoria,
} from '../lib/formato'
import './TarjetaCategoria.css'

/**
 * Tarjeta de categoría para la página de la tienda.
 * Muestra el ícono, la descripción y enlaces a comprar y a alquilar.
 */
function TarjetaCategoria({ categoria, indice = 0 }) {
  const ruta = rutaCategoria(categoria)
  const cantidad = contarProductos(categoria.slug)
  const alquilerDesde = alquilerDesdePorDia(productosDeCategoria(categoria.slug))

  return (
    <Revelar retraso={indice % 4} className="tarjeta-categoria-envoltorio">
      <article
        className="tarjeta-categoria"
        style={{ '--acento': categoria.colorAcento }}
      >
        <div className="tarjeta-categoria__icono">
          <IconoCategoria categoria={categoria} grosor={2} />
        </div>

        <h3 className="tarjeta-categoria__nombre">
          <Link to={ruta} className="tarjeta-categoria__enlace">
            {categoria.nombre}
          </Link>
        </h3>
        <p className="tarjeta-categoria__descripcion">{categoria.descripcion}</p>

        <p className="tarjeta-categoria__meta">
          {cantidad} {cantidad === 1 ? 'modelo' : 'modelos'}
          {alquilerDesde && ` · Alquiler desde ${formatearPrecio(alquilerDesde)} / día`}
        </p>

        <div className="tarjeta-categoria__acciones">
          <Link to={ruta}>Comprar ›</Link>
          {alquilerDesde && <Link to={`${ruta}?modo=alquilar`}>Alquilar ›</Link>}
        </div>
      </article>
    </Revelar>
  )
}

export default TarjetaCategoria
