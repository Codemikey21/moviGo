import { Link } from 'react-router-dom'
import HeroPagina from '../components/HeroPagina'
import IconoCategoria from '../components/IconoCategoria'
import Seccion from '../components/Seccion'
import TarjetaCategoria from '../components/TarjetaCategoria'
import TarjetaProducto from '../components/TarjetaProducto'
import { CATEGORIAS } from '../data/catalogo'
import { buscarCategoria, productosMuestra, rutaCategoria } from '../lib/formato'
import { useTitulo } from '../lib/useTitulo'
import './Tienda.css'

/**
 * Página principal de la tienda: todas las categorías y una muestra del catálogo.
 * Alterna secciones oscuras y claras para dar contraste.
 */
function Tienda() {
  useTitulo('Tienda')

  const muestra = productosMuestra()

  return (
    <div>
      <HeroPagina
        eyebrow="Tienda"
        titulo="Todo para moverte."
        descripcion="Bicicletas, patinetas, patines, drones, motos y carros, más accesorios para completarlos. Compara especificaciones y precios de referencia de marcas con presencia en Colombia."
      >
        <ul className="tienda__chips">
          {CATEGORIAS.map((categoria) => (
            <li key={categoria.slug}>
              <Link
                to={rutaCategoria(categoria)}
                className="tienda__chip"
                style={{ '--acento': categoria.colorAcento }}
              >
                <IconoCategoria categoria={categoria} className="tienda__chip-icono" />
                {categoria.nombreCorto}
              </Link>
            </li>
          ))}
        </ul>
      </HeroPagina>

      <Seccion
        tono="claro"
        eyebrow="Categorías"
        titulo="Elige tu forma de moverte."
        descripcion="Siete líneas de producto. Entra a una para ver sus modelos, especificaciones y precios de referencia."
      >
        <div className="tienda__categorias">
          {CATEGORIAS.map((categoria, indice) => (
            <TarjetaCategoria key={categoria.slug} categoria={categoria} indice={indice} />
          ))}
        </div>
      </Seccion>

      <Seccion
        tono="oscuro"
        eyebrow="Catálogo"
        titulo="Un modelo de cada línea."
        descripcion="Una muestra del catálogo: el primer modelo de cada categoría."
      >
        <div className="grilla-productos">
          {muestra.map((producto, indice) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              categoria={buscarCategoria(producto.categoria)}
              indice={indice}
            />
          ))}
        </div>
      </Seccion>

      <Seccion
        tono="claro"
        eyebrow="Para tu negocio"
        titulo="Domicilios y portal empresarial."
        descripcion="MoviGo planea hacer domicilios con la misma flota que vende y alquila, y ofrecer a las empresas un portal propio. Los dos servicios están en construcción."
      >
        <p className="tienda__enlace-final">
          <Link to="/servicios/domicilios">Conoce el servicio de domicilios ›</Link>
          <Link to="/portal">Portal empresarial ›</Link>
        </p>
      </Seccion>

      <Seccion
        tono="oscuro"
        alineacion="centro"
        eyebrow="Alquiler"
        titulo="¿No quieres comprar? Alquila."
        descripcion="Cada producto muestra una tarifa de ejemplo por hora, por día y por semana. Todavía no son tarifas reales de MoviGo."
      >
        <div className="tienda__cta">
          <Link to="/servicios/alquiler" className="tienda__boton">
            Cómo funcionará el alquiler
          </Link>
        </div>
      </Seccion>
    </div>
  )
}

export default Tienda
