import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIAS } from '../data/catalogo'
import { useEntradaHero } from '../lib/useEntradaHero'
import { useTitulo } from '../lib/useTitulo'
import './NoEncontrado.css'

/**
 * Página 404. También se usa cuando una categoría o un producto no existe,
 * y en ese caso recibe un mensaje más específico.
 */
function NoEncontrado({ mensaje }) {
  const contenedorRef = useRef(null)
  useEntradaHero(contenedorRef)
  useTitulo('Página no encontrada')

  return (
    <div ref={contenedorRef} className="no-encontrado">
      <div className="no-encontrado__fondo" aria-hidden="true" />

      <div className="no-encontrado__interior">
        <p className="no-encontrado__codigo" data-entrada>
          404
        </p>

        <h1 className="no-encontrado__titulo" data-entrada>
          Esta ruta se perdió en el camino.
        </h1>

        <p className="no-encontrado__texto" data-entrada>
          {mensaje ??
            'La página que buscas no existe o cambió de lugar. Vuelve al inicio o explora la tienda para encontrar lo que necesitas.'}
        </p>

        <div className="no-encontrado__acciones" data-entrada>
          <Link to="/" className="no-encontrado__boton no-encontrado__boton--lleno">
            Volver al inicio
          </Link>
          <Link to="/tienda" className="no-encontrado__boton no-encontrado__boton--borde">
            Ir a la tienda
          </Link>
        </div>

        <ul className="no-encontrado__categorias" data-entrada>
          {CATEGORIAS.map((categoria) => (
            <li key={categoria.slug}>
              <Link
                to={`/tienda/${categoria.slug}`}
                className="no-encontrado__chip"
                style={{ '--acento': categoria.colorAcento }}
              >
                {categoria.nombreCorto}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default NoEncontrado
