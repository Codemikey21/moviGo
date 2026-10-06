import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { CATEGORIAS } from '../data/catalogo'
import { EMPRESAS, SERVICIOS } from '../data/servicios'
import { useDialogoModal } from '../lib/useDialogoModal'
import './MenuMovil.css'

/**
 * Menú de pantalla completa para móvil y tablet. Es un diálogo modal:
 * mientras está abierto el foco queda atrapado en él (junto con el botón
 * hamburguesa, que lo cierra), Escape lo cierra y devuelve el foco a ese
 * botón, y la página de fondo queda inerte y sin scroll.
 *
 * Los enlaces entran de forma escalonada gracias a la variable --i.
 * Siempre está montado para poder animar la salida; cerrado es inerte.
 *
 * `data-lenis-prevent` evita que el scroll suave de la página se mueva
 * mientras se desplaza este menú.
 *
 * @param hamburguesaRef  ref al botón que abre y cierra el menú
 */
function MenuMovil({ abierto, onCerrar, hamburguesaRef }) {
  const menuRef = useRef(null)

  useDialogoModal({
    abierto,
    obtenerZonas: () => [hamburguesaRef.current, menuRef.current],
    selectoresFondo: ['main', 'footer'],
    alCerrar: onCerrar,
    obtenerFocoInicial: () => menuRef.current?.querySelector('a[href]'),
    disparadorRef: hamburguesaRef,
  })

  const enlacesTienda = [
    { nombre: 'Toda la tienda', ruta: '/tienda' },
    ...CATEGORIAS.map((categoria) => ({
      nombre: categoria.nombre,
      ruta: `/tienda/${categoria.slug}`,
    })),
  ]

  const enlacesServicios = SERVICIOS.map((servicio) => ({
    nombre: servicio.nombre,
    ruta: servicio.ruta,
  }))

  const enlacesEmpresas = [
    { nombre: 'Portal empresarial', ruta: '/portal' },
    ...EMPRESAS.map((servicio) => ({ nombre: servicio.nombre, ruta: servicio.ruta })),
  ]

  // Cada título y enlace recibe un número de orden consecutivo para escalonar la animación.
  const inicioServicios = enlacesTienda.length + 1
  const inicioEmpresas = inicioServicios + enlacesServicios.length + 1
  const inicioPie = inicioEmpresas + enlacesEmpresas.length + 1

  const lista = (enlaces, inicio) => (
    <ul className="menu-movil__lista">
      {enlaces.map((enlace, indice) => (
        <li key={enlace.ruta} style={{ '--i': inicio + indice + 1 }}>
          <NavLink
            to={enlace.ruta}
            end
            className="menu-movil__enlace"
            onClick={onCerrar}
          >
            {enlace.nombre}
          </NavLink>
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={menuRef}
      id="menu-movil"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      className={`menu-movil ${abierto ? 'menu-movil--abierto' : ''}`}
      inert={!abierto}
      data-lenis-prevent
    >
      <nav className="menu-movil__contenido" aria-label="Menú móvil">
        <p className="menu-movil__titulo" style={{ '--i': 0 }}>
          Tienda
        </p>
        {lista(enlacesTienda, 0)}

        <p className="menu-movil__titulo" style={{ '--i': inicioServicios }}>
          Servicios
        </p>
        {lista(enlacesServicios, inicioServicios)}

        <p className="menu-movil__titulo" style={{ '--i': inicioEmpresas }}>
          Empresas
        </p>
        {lista(enlacesEmpresas, inicioEmpresas)}

        <div className="menu-movil__pie" style={{ '--i': inicioPie }}>
          <button type="button" className="menu-movil__boton">
            Ingresar
          </button>
        </div>
      </nav>
    </div>
  )
}

export default MenuMovil
