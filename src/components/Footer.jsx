import { NavLink } from 'react-router-dom'
import { CATEGORIAS } from '../data/catalogo'
import './Footer.css'

// Columnas del pie de página. Todas las rutas existen en la aplicación.
const COLUMNAS = [
  {
    titulo: 'Tienda',
    enlaces: [
      { nombre: 'Toda la tienda', ruta: '/tienda' },
      ...CATEGORIAS.map((categoria) => ({
        nombre: categoria.nombreCorto,
        ruta: `/tienda/${categoria.slug}`,
      })),
    ],
  },
  {
    titulo: 'Servicios',
    enlaces: [
      { nombre: 'Domicilios', ruta: '/servicios/domicilios' },
      { nombre: 'Alquiler', ruta: '/servicios/alquiler' },
      { nombre: 'Mantenimiento', ruta: '/servicios/mantenimiento' },
    ],
  },
  {
    titulo: 'Empresas',
    enlaces: [
      { nombre: 'Portal empresarial', ruta: '/portal' },
      { nombre: 'Domicilios para negocios', ruta: '/empresas/domicilios' },
      { nombre: 'Alquiler para flotas', ruta: '/empresas/alquiler' },
    ],
  },
  {
    titulo: 'Soporte',
    enlaces: [
      { nombre: 'Centro de soporte', ruta: '/soporte' },
      { nombre: 'Puntos de servicio', ruta: '/puntos-de-servicio' },
      { nombre: 'Mantenimiento', ruta: '/servicios/mantenimiento' },
    ],
  },
  {
    titulo: 'Compañía',
    enlaces: [
      { nombre: 'Inicio', ruta: '/' },
      { nombre: 'Tienda', ruta: '/tienda' },
      { nombre: 'Puntos de servicio', ruta: '/puntos-de-servicio' },
    ],
  },
]

/**
 * Pie de página grande con columnas de enlaces y la nota académica.
 */
function Footer() {
  const anio = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__interior">
        <p className="footer__lema">
          <strong>MoviGo.</strong> Muévete. Entrega. Repite.
        </p>

        <nav className="footer__columnas" aria-label="Mapa del sitio">
          {COLUMNAS.map((columna) => (
            <div key={columna.titulo} className="footer__columna">
              <h2 className="footer__titulo">{columna.titulo}</h2>
              <ul className="footer__lista">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.nombre}>
                    <NavLink to={enlace.ruta} end className="footer__enlace">
                      {enlace.nombre}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer__pie">
          <p>
            MoviGo es un proyecto académico de la UNAB. Las marcas y los modelos
            pertenecen a sus respectivos dueños. Precios de referencia en COP.
          </p>
          <p>Copyright © {anio} MoviGo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
