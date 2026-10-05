import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import { CATEGORIAS } from '../data/catalogo'
import { SERVICIOS } from '../data/servicios'
import { productosDeCategoria, rutaCategoria, rutaProducto } from '../lib/formato'
import './MegaMenu.css'

// Cómo se agrupan los servicios dentro del panel "Servicios".
const GRUPOS_SERVICIOS = [
  { titulo: 'Servicios', slugs: ['domicilios', 'alquiler', 'mantenimiento'] },
  { titulo: 'Ayuda', slugs: ['puntos-de-servicio', 'soporte'] },
]

/**
 * Panel grande desplegable bajo la barra de navegación (mega-menú).
 * Hay dos: "tienda" (categorías con sus productos destacados) y "servicios".
 * Siempre está montado para poder animar la entrada y la salida con CSS;
 * cerrado queda invisible e inerte (sin foco ni clics).
 */
function MegaMenu({ tipo, abierto, onNavegar }) {
  return (
    <div
      id={`mega-${tipo}`}
      className={`mega ${abierto ? 'mega--abierto' : ''}`}
      inert={!abierto}
    >
      <div className="mega__interior">
        {tipo === 'tienda' ? (
          <PanelTienda onNavegar={onNavegar} />
        ) : (
          <PanelServicios onNavegar={onNavegar} />
        )}
      </div>
    </div>
  )
}

function PanelTienda({ onNavegar }) {
  return (
    <>
      <div className="mega__cabecera mega__item" style={{ '--i': 0 }}>
        <p className="mega__etiqueta">Explorar la tienda</p>
        <Link to="/tienda" className="mega__ver-todo" onClick={onNavegar}>
          Ver toda la tienda ›
        </Link>
      </div>

      <div className="mega__columnas mega__columnas--tienda">
        {CATEGORIAS.map((categoria, indice) => (
          <div
            key={categoria.slug}
            className="mega__columna mega__item"
            style={{ '--i': indice + 1, '--acento': categoria.colorAcento }}
          >
            <Link
              to={rutaCategoria(categoria)}
              className="mega__categoria"
              onClick={onNavegar}
            >
              <IconoCategoria categoria={categoria} className="mega__icono" />
              <span>{categoria.nombreCorto}</span>
            </Link>

            <ul className="mega__lista">
              {productosDeCategoria(categoria.slug)
                .slice(0, 3)
                .map((producto) => (
                  <li key={producto.id}>
                    <Link
                      to={rutaProducto(producto)}
                      className="mega__enlace"
                      onClick={onNavegar}
                    >
                      {producto.nombre}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

function PanelServicios({ onNavegar }) {
  let orden = 0

  return (
    <div className="mega__columnas mega__columnas--servicios">
      {GRUPOS_SERVICIOS.map((grupo) => (
        <div key={grupo.titulo} className="mega__columna">
          <p className="mega__etiqueta mega__item" style={{ '--i': orden++ }}>
            {grupo.titulo}
          </p>

          <ul className="mega__lista">
            {grupo.slugs.map((slug) => {
              const servicio = SERVICIOS.find((s) => s.slug === slug)

              return (
                <li key={slug} className="mega__item" style={{ '--i': orden++ }}>
                  <Link
                    to={servicio.ruta}
                    className="mega__servicio"
                    onClick={onNavegar}
                  >
                    <span className="mega__servicio-nombre">{servicio.nombre}</span>
                    <span className="mega__servicio-resumen">{servicio.resumen}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      <div className="mega__columna">
        <p className="mega__etiqueta mega__item" style={{ '--i': orden++ }}>
          Empresas
        </p>
        <ul className="mega__lista">
          <li className="mega__item" style={{ '--i': orden++ }}>
            <Link to="/portal" className="mega__servicio" onClick={onNavegar}>
              <span className="mega__servicio-nombre">Portal empresarial</span>
              <span className="mega__servicio-resumen">
                Gestiona tu flota, tus entregas y tu facturación.
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MegaMenu
