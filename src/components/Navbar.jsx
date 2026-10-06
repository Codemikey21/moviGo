import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Buscador from './Buscador'
import MegaMenu from './MegaMenu'
import MenuMovil from './MenuMovil'
import { RETRASO_CIERRE_MENU } from '../lib/movimiento'
import './Navbar.css'

// Elementos con los que se navega dentro de un panel.
const SELECTOR_ENLACE = 'a[href]'

// Los tres botones de la barra que abren un mega-menú, y las rutas que cubre cada uno.
const MENUS = [
  { id: 'tienda', etiqueta: 'Tienda', rutas: ['/tienda'] },
  {
    id: 'servicios',
    etiqueta: 'Servicios',
    rutas: ['/servicios', '/puntos-de-servicio', '/soporte'],
  },
  { id: 'empresas', etiqueta: 'Empresas', rutas: ['/empresas', '/portal'] },
]

/**
 * Barra de navegación fija con efecto vidrio.
 *
 * Escritorio: logo, tres menús (Tienda, Servicios, Empresas), búsqueda,
 * carrito e "Ingresar". Cada menú abre un panel a todo el ancho:
 *  - con el mouse, al pasar por encima;
 *  - con el teclado, con Enter, Espacio o flecha abajo en el botón.
 * Móvil: botón hamburguesa que abre un menú de pantalla completa.
 * Buscador: capa de pantalla completa con Ctrl+K o Cmd+K.
 */
function Navbar() {
  const { pathname } = useLocation()

  const [menuAbierto, setMenuAbierto] = useState(null) // 'tienda' | 'servicios' | 'empresas' | null
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [buscadorAbierto, setBuscadorAbierto] = useState(false)
  const [rutaAnterior, setRutaAnterior] = useState(pathname)

  const barraRef = useRef(null)
  const disparadoresRef = useRef({})
  const panelesRef = useRef({})
  const buscadorBotonRef = useRef(null)
  const hamburguesaRef = useRef(null)
  const temporizadorRef = useRef(null)
  const focoPendienteRef = useRef(null)
  const menuAbiertoRef = useRef(null)

  // Al cambiar de ruta se cierra todo (ajuste de estado durante el render).
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname)
    setMenuAbierto(null)
    setMenuMovilAbierto(false)
    setBuscadorAbierto(false)
  }

  // Los manejadores de eventos del documento leen siempre el menú abierto más reciente.
  useEffect(() => {
    menuAbiertoRef.current = menuAbierto
  })

  const cancelarCierre = () => clearTimeout(temporizadorRef.current)

  const abrirMenu = (id) => {
    cancelarCierre()
    setMenuAbierto(id)
  }

  const cerrarMenu = () => {
    cancelarCierre()
    setMenuAbierto(null)
  }

  // Al sacar el mouse el menú se cierra, salvo que el teclado esté usándolo.
  const cerrarMenuConRetraso = () => {
    cancelarCierre()
    temporizadorRef.current = setTimeout(() => {
      const id = menuAbiertoRef.current
      const activo = document.activeElement
      const tecladoEnElMenu =
        id &&
        activo?.matches(':focus-visible') &&
        (disparadoresRef.current[id]?.contains(activo) ||
          panelesRef.current[id]?.contains(activo))

      if (!tecladoEnElMenu) setMenuAbierto(null)
    }, RETRASO_CIERRE_MENU)
  }

  const enfocarPrimeroDelPanel = (id) => {
    panelesRef.current[id]?.querySelector(SELECTOR_ENLACE)?.focus()
  }

  // Abre el panel y lleva el foco a su primer enlace.
  const abrirConFoco = (id) => {
    cancelarCierre()

    if (menuAbiertoRef.current === id) {
      enfocarPrimeroDelPanel(id)
      return
    }

    // El panel es inerte hasta que se abre: el foco se mueve cuando ya está disponible.
    focoPendienteRef.current = id
    setMenuAbierto(id)
  }

  useEffect(() => {
    if (menuAbierto && focoPendienteRef.current === menuAbierto) {
      focoPendienteRef.current = null
      panelesRef.current[menuAbierto]?.querySelector(SELECTOR_ENLACE)?.focus()
    }
  }, [menuAbierto])

  // Clic o Enter/Espacio en un botón de menú. Con el mouse el menú ya se abrió al
  // pasar por encima, así que el clic lo deja abierto. Con el teclado (detail === 0)
  // y con el dedo, el botón alterna el panel.
  const alActivarDisparador = (evento, id) => {
    const porTeclado = evento.detail === 0
    const porToque = evento.nativeEvent.pointerType === 'touch'

    if (menuAbierto === id && (porTeclado || porToque)) {
      cerrarMenu()
    } else if (porTeclado) {
      abrirConFoco(id)
    } else {
      abrirMenu(id)
    }
  }

  const alPresionarEnDisparador = (evento, id) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      abrirConFoco(id)
    }
  }

  // Teclado dentro de un panel: Escape lo cierra y devuelve el foco al botón;
  // Shift+Tab desde su primer enlace también vuelve al botón.
  const alPresionarEnPanel = (evento, id) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      evento.stopPropagation()
      cerrarMenu()
      disparadoresRef.current[id]?.focus()
      return
    }

    if (evento.key === 'Tab' && evento.shiftKey) {
      const primero = panelesRef.current[id]?.querySelector(SELECTOR_ENLACE)
      if (document.activeElement === primero) {
        evento.preventDefault()
        disparadoresRef.current[id]?.focus()
      }
    }
  }

  // El menú se cierra cuando el foco sale del botón y de su panel (por ejemplo,
  // con Tab desde el último enlace). Mover el foco dentro de ellos no lo cierra.
  const alPerderFoco = (evento) => {
    const id = menuAbiertoRef.current
    const siguiente = evento.relatedTarget
    if (!id || !siguiente) return

    const dentro =
      disparadoresRef.current[id]?.contains(siguiente) ||
      panelesRef.current[id]?.contains(siguiente)

    if (!dentro) cerrarMenu()
  }

  const abrirBuscador = () => {
    cerrarMenu()
    setMenuMovilAbierto(false)
    setBuscadorAbierto(true)
  }

  // Limpia el temporizador pendiente al desmontar.
  useEffect(() => {
    const temporizador = temporizadorRef
    return () => clearTimeout(temporizador.current)
  }, [])

  // Atajo Ctrl+K / Cmd+K: alterna el buscador.
  useEffect(() => {
    const alPresionarTecla = (evento) => {
      const esAtajoDeBusqueda =
        (evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k'
      if (!esAtajoDeBusqueda) return

      evento.preventDefault()
      setMenuAbierto(null)
      setMenuMovilAbierto(false)
      setBuscadorAbierto((abierto) => !abierto)
    }

    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [])

  // Escape cierra el mega-menú aunque se abriera con el mouse; si el foco estaba
  // en el menú, vuelve al botón que lo abrió.
  useEffect(() => {
    const alPresionarTecla = (evento) => {
      const id = menuAbiertoRef.current
      if (evento.key !== 'Escape' || !id) return

      const activo = document.activeElement
      const focoEnMenu =
        disparadoresRef.current[id]?.contains(activo) ||
        panelesRef.current[id]?.contains(activo)

      setMenuAbierto(null)
      if (focoEnMenu) disparadoresRef.current[id]?.focus()
    }

    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [])

  // En pantallas táctiles no hay "salir con el mouse": un toque fuera cierra el menú.
  useEffect(() => {
    if (!menuAbierto) return

    const alTocarFuera = (evento) => {
      if (!barraRef.current?.contains(evento.target)) setMenuAbierto(null)
    }

    document.addEventListener('pointerdown', alTocarFuera)
    return () => document.removeEventListener('pointerdown', alTocarFuera)
  }, [menuAbierto])

  const esActivo = (menu) => menu.rutas.some((ruta) => pathname.startsWith(ruta))

  return (
    <>
      <div
        ref={barraRef}
        className="navbar"
        onMouseEnter={cancelarCierre}
        onMouseLeave={cerrarMenuConRetraso}
        onBlur={alPerderFoco}
      >
        <header className="navbar__barra">
          <nav className="navbar__contenido" aria-label="Navegación principal">
            <NavLink to="/" end className="navbar__logo" inert={menuMovilAbierto}>
              MoviGo
            </NavLink>

            <ul className="navbar__enlaces" inert={menuMovilAbierto}>
              {MENUS.map((menu) => (
                <li key={menu.id}>
                  <button
                    ref={(elemento) => {
                      disparadoresRef.current[menu.id] = elemento
                    }}
                    type="button"
                    id={`disparador-${menu.id}`}
                    className={`navbar__enlace navbar__enlace--boton ${
                      esActivo(menu) || menuAbierto === menu.id
                        ? 'navbar__enlace--activo'
                        : ''
                    }`}
                    aria-haspopup="true"
                    aria-expanded={menuAbierto === menu.id}
                    aria-controls={`mega-${menu.id}`}
                    aria-current={esActivo(menu) ? 'true' : undefined}
                    onMouseEnter={() => abrirMenu(menu.id)}
                    onClick={(evento) => alActivarDisparador(evento, menu.id)}
                    onKeyDown={(evento) => alPresionarEnDisparador(evento, menu.id)}
                  >
                    {menu.etiqueta}
                  </button>
                </li>
              ))}
            </ul>

            <div className="navbar__acciones">
              <button
                ref={buscadorBotonRef}
                type="button"
                className="navbar__icono"
                aria-label="Buscar (Ctrl+K)"
                aria-haspopup="dialog"
                aria-expanded={buscadorAbierto}
                inert={menuMovilAbierto}
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
                inert={menuMovilAbierto}
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
                inert={menuMovilAbierto}
                onMouseEnter={cerrarMenu}
              >
                Ingresar
              </button>

              <button
                ref={hamburguesaRef}
                type="button"
                className={`navbar__hamburguesa ${
                  menuMovilAbierto ? 'navbar__hamburguesa--abierta' : ''
                }`}
                aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
                aria-haspopup="dialog"
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

        {MENUS.map((menu) => (
          <MegaMenu
            key={menu.id}
            tipo={menu.id}
            abierto={menuAbierto === menu.id}
            onNavegar={cerrarMenu}
            disparadorId={`disparador-${menu.id}`}
            panelRef={(elemento) => {
              panelesRef.current[menu.id] = elemento
            }}
            alPresionarTecla={(evento) => alPresionarEnPanel(evento, menu.id)}
          />
        ))}

        {/* Oscurece el resto de la página mientras hay un mega-menú abierto */}
        <div
          className={`navbar__velo ${menuAbierto ? 'navbar__velo--visible' : ''}`}
          aria-hidden="true"
        />
      </div>

      <MenuMovil
        abierto={menuMovilAbierto}
        onCerrar={() => setMenuMovilAbierto(false)}
        hamburguesaRef={hamburguesaRef}
      />
      <Buscador
        abierto={buscadorAbierto}
        onCerrar={() => setBuscadorAbierto(false)}
        disparadorRef={buscadorBotonRef}
      />
    </>
  )
}

export default Navbar
