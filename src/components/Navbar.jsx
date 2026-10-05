import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Buscador from './Buscador'
import MegaMenu from './MegaMenu'
import MenuMovil from './MenuMovil'
import { CATEGORIAS } from '../data/catalogo'
import './Navbar.css'

// Pausa antes de cerrar el mega-menú al sacar el mouse, para evitar parpadeos.
const RETRASO_CIERRE = 160

// Rutas que pertenecen al grupo "Servicios".
const RUTAS_SERVICIOS = ['/servicios', '/puntos-de-servicio', '/soporte']

/**
 * Barra de navegación fija con efecto vidrio.
 *
 * Escritorio: logo, categorías, "Servicios", búsqueda, carrito e "Ingresar".
 * "Tienda" y "Servicios" abren un mega-menú a todo el ancho.
 * Móvil: botón hamburguesa que abre un menú de pantalla completa.
 * Buscador: capa de pantalla completa con Ctrl+K o Cmd+K.
 */
function Navbar() {
  const { pathname } = useLocation()

  const [menuAbierto, setMenuAbierto] = useState(null) // 'tienda' | 'servicios' | null
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [rutaAnterior, setRutaAnterior] = useState(pathname)
  const temporizadorRef = useRef(null)

  // Al cambiar de ruta se cierra todo (ajuste de estado durante el render).
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname)
    setMenuAbierto(null)
    setMenuMovilAbierto(false)
    setBuscadorAbierto(false)
  }

  const cancelarCierre = () => clearTimeout(temporizadorRef.current)

  const abrirMenu = (nombre) => {
    cancelarCierre()
    setMenuAbierto(nombre)
  }

  const cerrarMenu = () => {
    cancelarCierre()
    setMenuAbierto(null)
  }

  const cerrarMenuConRetraso = () => {
    cancelarCierre()
    temporizadorRef.current = setTimeout(() => setMenuAbierto(null), RETRASO_CIERRE)
  }

  const abrirBuscador = () => {
    cerrarMenu()
    setMenuMovilAbierto(false)
    setBuscadorAbierto(true)
  }

  const cerrarBuscador = () => setBuscadorAbierto(false)

  // Limpia el temporizador pendiente al desmontar.
  useEffect(() => {
    const temporizador = temporizadorRef
    return () => clearTimeout(temporizador.current)
  }, [])

  // Atajos de teclado: Ctrl+K / Cmd+K alterna el buscador y Esc cierra el mega-menú.
  useEffect(() => {
    const alPresionarTecla = (evento) => {
      const esAtajoDeBusqueda =
        (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k'

      if (esAtajoDeBusqueda) {
        evento.preventDefault()
        setMenuAbierto(null)
        setMenuMovilAbierto(false)
        setBuscadorAbierto((abierto) => !abierto)
      } else if (evento.key === 'Escape') {
        setMenuAbierto(null)
        setMenuMovilAbierto(false)
      }
    }

    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [])

  const enServicios = RUTAS_SERVICIOS.some((ruta) => pathname.startsWith(ruta))
  const claseEnlace = ({ isActive }) =>
    `navbar__enlace ${isActive ? 'navbar__enlace--activo' : ''}`

  return (
    <>
      <div
        className="navbar"
        onMouseEnter={cancelarCierre}
        onMouseLeave={cerrarMenuConRetraso}
      >
        <header className="navbar__barra">
          <nav className="navbar__contenido" aria-label="Navegación principal">
            <Link to="/" className="navbar__logo">
              MoviGo
            </Link>

            <ul className="navbar__enlaces">
              <li>
                <NavLink
                  to="/tienda"
                  end
                  className={claseEnlace}
                  aria-haspopup="true"
                  aria-expanded={menuAbierto === 'tienda'}
                  aria-controls="mega-tienda"
                  onMouseEnter={() => abrirMenu('tienda')}
                  onFocus={() => abrirMenu('tienda')}
                >
                  Tienda
                </NavLink>
              </li>

              {CATEGORIAS.map((categoria) => (
                <li key={categoria.slug}>
                  <NavLink
                    to={`/tienda/${categoria.slug}`}
                    className={claseEnlace}
                    onMouseEnter={cerrarMenu}
                    onFocus={cerrarMenu}
                  >
                    {categoria.nombreCorto}
                  </NavLink>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  className={`navbar__enlace navbar__enlace--boton ${
                    enServicios || menuAbierto === 'servicios'
                      ? 'navbar__enlace--activo'
                      : ''
                  }`}
                  aria-haspopup="true"
                  aria-expanded={menuAbierto === 'servicios'}
                  aria-controls="mega-servicios"
                  onMouseEnter={() => abrirMenu('servicios')}
                  onClick={() =>
                    setMenuAbierto((actual) =>
                      actual === 'servicios' ? null : 'servicios',
                    )
                  }
                >
                  Servicios
                </button>
              </li>
            </ul>

            <div className="navbar__acciones">
              <button
                type="button"
                className="navbar__icono"
                aria-label="Buscar (Ctrl+K)"
                onClick={abrirBuscador}
                onMouseEnter={cerrarMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </button>

              <button
                type="button"
                className="navbar__icono"
                aria-label="Carrito, 0 productos"
                onMouseEnter={cerrarMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" />
                  <path d="M9 8V7a3 3 0 0 1 6 0v1" />
                </svg>
                <span className="navbar__contador">0</span>
              </button>

              <button
                type="button"
                className="navbar__boton"
                onMouseEnter={cerrarMenu}
              >
                Ingresar
              </button>

              <button
                type="button"
                className={`navbar__hamburguesa ${
                  menuMovilAbierto ? 'navbar__hamburguesa--abierta' : ''
                }`}
                aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuMovilAbierto}
                aria-controls="menu-movil"
                onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
              >
                <span />
                <span />
              </button>
            </div>
          </nav>
        </header>

        <MegaMenu tipo="tienda" abierto={menuAbierto === 'tienda'} onNavegar={cerrarMenu} />
        <MegaMenu
          tipo="servicios"
          abierto={menuAbierto === 'servicios'}
          onNavegar={cerrarMenu}
        />

        {/* Oscurece el resto de la página mientras hay un mega-menú abierto */}
        <div
          className={`navbar__velo ${menuAbierto ? 'navbar__velo--visible' : ''}`}
          aria-hidden="true"
        />
      </div>

      <MenuMovil abierto={menuMovilAbierto} onCerrar={() => setMenuMovilAbierto(false)} />
      <Buscador abierto={buscadorAbierto} onCerrar={cerrarBuscador} />
    </>
  )
}

export default Navbar
