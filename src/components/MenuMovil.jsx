import { Link } from 'react-router-dom'
import { CATEGORIAS } from '../data/catalogo'
import { SERVICIOS } from '../data/servicios'
import './MenuMovil.css'

/**
 * Menú de pantalla completa para móvil y tablet.
 * Los enlaces entran de forma escalonada gracias a la variable --i.
 * Siempre está montado para poder animar la salida; cerrado es inerte.
 *
 * `data-lenis-prevent` evita que el scroll suave de la página se mueva
 * mientras se desplaza este menú.
 */
function MenuMovil({ abierto, onCerrar }) {
  const enlacesTienda = [
    { nombre: 'Toda la tienda', ruta: '/tienda' },
    ...CATEGORIAS.map((categoria) => ({
      nombre: categoria.nombre,
      ruta: `/tienda/${categoria.slug}`,
    })),
  ]

  const enlacesServicios = [
    ...SERVICIOS.map((servicio) => ({
      nombre: servicio.nombre,
      ruta: servicio.ruta,
    })),
    { nombre: 'Portal empresarial', ruta: '/portal' },
  ]

  // Cada enlace recibe un número de orden consecutivo para escalonar la animación.
  const desplazamiento = enlacesTienda.length + 1

  return (
    <div
      id="menu-movil"
      className={`menu-movil ${abierto ? 'menu-movil--abierto' : ''}`}
      inert={!abierto}
      data-lenis-prevent
    >
      <nav className="menu-movil__contenido" aria-label="Menú móvil">
        <p className="menu-movil__titulo" style={{ '--i': 0 }}>
          Tienda
        </p>
        <ul className="menu-movil__lista">
          {enlacesTienda.map((enlace, indice) => (
            <li key={enlace.ruta} style={{ '--i': indice + 1 }}>
              <Link to={enlace.ruta} className="menu-movil__enlace" onClick={onCerrar}>
                {enlace.nombre}
              </Link>
            </li>
          ))}
        </ul>

        <p className="menu-movil__titulo" style={{ '--i': desplazamiento }}>
          Servicios
        </p>
        <ul className="menu-movil__lista">
          {enlacesServicios.map((enlace, indice) => (
            <li key={enlace.ruta} style={{ '--i': desplazamiento + indice + 1 }}>
              <Link to={enlace.ruta} className="menu-movil__enlace" onClick={onCerrar}>
                {enlace.nombre}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="menu-movil__pie"
          style={{ '--i': desplazamiento + enlacesServicios.length + 1 }}
        >
          <button type="button" className="menu-movil__boton">
            Ingresar
          </button>
        </div>
      </nav>
    </div>
  )
}

export default MenuMovil
