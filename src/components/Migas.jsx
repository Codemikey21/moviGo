import { Link } from 'react-router-dom'
import './Migas.css'

/**
 * Migas de pan: Tienda / Categoría / Producto.
 * Cada elemento es { nombre, ruta }; el último no lleva ruta.
 */
function Migas({ elementos }) {
  return (
    <nav className="migas" aria-label="Migas de pan">
      <ol className="migas__lista">
        {elementos.map((elemento) => (
          <li key={elemento.nombre} className="migas__item">
            {elemento.ruta ? (
              <Link to={elemento.ruta} className="migas__enlace">
                {elemento.nombre}
              </Link>
            ) : (
              <span className="migas__actual" aria-current="page">
                {elemento.nombre}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Migas
