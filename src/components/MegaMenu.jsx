import { NavLink } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import { CATEGORIAS } from '../data/catalogo'
import { EMPRESAS, SERVICIOS } from '../data/servicios'
import { productosDeCategoria, rutaCategoria, rutaProducto } from '../lib/formato'
import './MegaMenu.css'

// Cómo se agrupan los servicios dentro del panel "Servicios".
const GRUPOS_SERVICIOS = [
  { titulo: 'Servicios', slugs: ['domicilios', 'alquiler', 'mantenimiento'] },
  { titulo: 'Ayuda', slugs: ['puntos-de-servicio', 'soporte'] },
]

// Entradas del panel "Empresas": el portal y las dos páginas provisionales.
const ENLACES_EMPRESAS = [
  {
    nombre: 'Portal empresarial',
    ruta: '/portal',
    resumen: 'Un espacio para empresas, en construcción.',
  },
  ...EMPRESAS.map((servicio) => ({
    nombre: servicio.nombre,
    ruta: servicio.ruta,
    resumen: servicio.resumen,
  })),
]

/**
 * Panel grande desplegable bajo la barra de navegación (mega-menú).
 * Hay tres: "tienda" (categorías con sus productos destacados), "servicios"
 * y "empresas". Siempre está montado para poder animar la entrada y la salida
 * con CSS; cerrado queda invisible e inerte (sin foco ni clics).
 *
 * @param panelRef          ref al contenedor, que usa la barra para mover el foco
 * @param disparadorId      id del botón que lo abre (lo nombra para lectores de pantalla)
 * @param alPresionarTecla  teclado dentro del panel (Escape, Shift+Tab)
 */
function MegaMenu({ tipo, abierto, onNavegar, panelRef, disparadorId, alPresionarTecla }) {
  return (
    <div
      ref={panelRef}
      id={`mega-${tipo}`}
      role="group"
      aria-labelledby={disparadorId}
      className={`mega ${abierto ? 'mega--abierto' : ''}`}
      inert={!abierto}
      onKeyDown={alPresionarTecla}
    >
      <div className="mega__interior">
        {tipo === 'tienda' && <PanelTienda onNavegar={onNavegar} />}
        {tipo === 'servicios' && <PanelServicios onNavegar={onNavegar} />}
        {tipo === 'empresas' && <PanelEmpresas onNavegar={onNavegar} />}
      </div>
    </div>
  )
}

function PanelTienda({ onNavegar }) {
  return (
    <>
      <div className="mega__cabecera mega__item" style={{ '--i': 0 }}>
        <p className="mega__etiqueta">Explorar la tienda</p>
        <NavLink to="/tienda" end className="mega__ver-todo" onClick={onNavegar}>
          Ver toda la tienda ›
        </NavLink>
      </div>

      <div className="mega__columnas mega__columnas--tienda">
        {CATEGORIAS.map((categoria, indice) => (
          <div
            key={categoria.slug}
            className="mega__columna mega__item"
            style={{ '--i': indice + 1, '--acento': categoria.colorAcento }}
          >
            <NavLink
              to={rutaCategoria(categoria)}
              end
              className="mega__categoria"
              onClick={onNavegar}
            >
              <IconoCategoria categoria={categoria} className="mega__icono" />
              <span>{categoria.nombreCorto}</span>
            </NavLink>

            <ul className="mega__lista">
              {productosDeCategoria(categoria.slug)
                .slice(0, 3)
                .map((producto) => (
                  <li key={producto.id}>
                    <NavLink
                      to={rutaProducto(producto)}
                      end
                      className="mega__enlace"
                      onClick={onNavegar}
                    >
                      {producto.nombre}
                    </NavLink>
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
                  <NavLink
                    to={servicio.ruta}
                    end
                    className="mega__servicio"
                    onClick={onNavegar}
                  >
                    <span className="mega__servicio-nombre">{servicio.nombre}</span>
                    <span className="mega__servicio-resumen">{servicio.resumen}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function PanelEmpresas({ onNavegar }) {
  return (
    <>
      <p className="mega__etiqueta mega__item" style={{ '--i': 0 }}>
        Empresas
      </p>

      <ul className="mega__columnas mega__columnas--empresas">
        {ENLACES_EMPRESAS.map((enlace, indice) => (
          <li key={enlace.ruta} className="mega__item" style={{ '--i': indice + 1 }}>
            <NavLink to={enlace.ruta} end className="mega__servicio" onClick={onNavegar}>
              <span className="mega__servicio-nombre">{enlace.nombre}</span>
              <span className="mega__servicio-resumen">{enlace.resumen}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  )
}

export default MegaMenu
