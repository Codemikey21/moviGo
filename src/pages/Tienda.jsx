import { Link } from 'react-router-dom'
import HeroPagina from '../components/HeroPagina'
import IconoCategoria from '../components/IconoCategoria'
import Seccion from '../components/Seccion'
import TarjetaCategoria from '../components/TarjetaCategoria'
import TarjetaProducto from '../components/TarjetaProducto'
import { CATEGORIAS } from '../data/catalogo'
import {
  buscarCategoria,
  productosConInsignia,
  productosParaDomicilio,
  rutaCategoria,
} from '../lib/formato'
import { useTitulo } from '../lib/useTitulo'
import './Tienda.css'

/**
 * Página principal de la tienda: todas las categorías y los destacados.
 * Alterna secciones oscuras y claras para dar contraste.
 */
function Tienda() {
  useTitulo('Tienda')

  const destacados = productosConInsignia(6)
  const paraDomicilios = productosParaDomicilio(4)

  return (
    <div>
      <HeroPagina
        eyebrow="Tienda"
        titulo="Todo para moverte."
        descripcion="Bicicletas, patinetas, patines, drones, motos y carros eléctricos, más los accesorios para completarlos. Cómpralos o alquílalos por horas, días o semanas."
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
        descripcion="Siete líneas de producto, todas eléctricas o pensadas para la ciudad. Entra a una para ver sus modelos, colores y tarifas."
      >
        <div className="tienda__categorias">
          {CATEGORIAS.map((categoria, indice) => (
            <TarjetaCategoria key={categoria.slug} categoria={categoria} indice={indice} />
          ))}
        </div>
      </Seccion>

      <Seccion
        tono="oscuro"
        eyebrow="Destacados"
        titulo="Lo más nuevo y lo más pedido."
        descripcion="Los lanzamientos recientes y los productos que más eligen nuestros clientes."
      >
        <div className="grilla-productos">
          {destacados.map((producto, indice) => (
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
        titulo="Listos para domicilios."
        descripcion="Vehículos y accesorios preparados para repartir: carga reforzada, baterías de larga duración y bolsas térmicas."
      >
        <div className="grilla-productos">
          {paraDomicilios.map((producto, indice) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              categoria={buscarCategoria(producto.categoria)}
              indice={indice}
            />
          ))}
        </div>

        <p className="tienda__enlace-final">
          <Link to="/servicios/domicilios">Conoce el servicio de domicilios ›</Link>
        </p>
      </Seccion>

      <Seccion
        tono="oscuro"
        alineacion="centro"
        eyebrow="Alquiler"
        titulo="¿No quieres comprar? Alquila."
        descripcion="Cada producto muestra su tarifa por hora, por día y por semana. Úsalo cuando lo necesites, sin pagar el costo de tenerlo."
      >
        <div className="tienda__cta">
          <Link to="/servicios/alquiler" className="tienda__boton">
            Cómo funciona el alquiler
          </Link>
        </div>
      </Seccion>
    </div>
  )
}

export default Tienda
