import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

/**
 * Barra de navegación fija con efecto vidrio.
 */
function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__contenido" aria-label="Navegación principal">
        <Link to="/" className="navbar__logo">
          MoviGo
        </Link>

        <ul className="navbar__enlaces">
          <li>
            <NavLink to="/" end className="navbar__enlace">
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink to="/portal" className="navbar__enlace">
              Portal empresarial
            </NavLink>
          </li>
        </ul>

        <button type="button" className="navbar__boton">
          Ingresar
        </button>
      </nav>
    </header>
  )
}

export default Navbar
