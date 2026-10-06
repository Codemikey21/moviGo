import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import Insignia from './Insignia'
import Revelar from './Revelar'
import SelectorColor from './SelectorColor'
import { esColorClaro } from '../lib/color'
import { formatearPrecio, rutaProducto } from '../lib/formato'
import './TarjetaProducto.css'

// Inclinación máxima de la tarjeta al seguir el mouse (grados).
const INCLINACION_MAXIMA = 6

/**
 * Tarjeta de producto para las cuadrículas de la tienda.
 * - Al pasar el mouse se eleva y se inclina siguiendo el cursor.
 * - Al pasar por un color, la parte superior de la tarjeta cambia de tono.
 * Toda la tarjeta es clicable (enlace extendido sobre el nombre).
 */
function TarjetaProducto({ producto, categoria, indice = 0 }) {
  const tarjetaRef = useRef(null)
  const [elegido, setElegido] = useState(0)
  const [vista, setVista] = useState(null)

  const color = producto.colores[vista ?? elegido]
  const alquiler = producto.disponibleAlquiler ? producto.precioAlquiler : null

  const alMoverPuntero = (evento) => {
    // En pantallas táctiles no se inclina.
    if (evento.pointerType !== 'mouse') return

    const tarjeta = tarjetaRef.current
    const caja = tarjeta.getBoundingClientRect()
    const x = (evento.clientX - caja.left) / caja.width - 0.5
    const y = (evento.clientY - caja.top) / caja.height - 0.5

    tarjeta.style.setProperty('--giro-x', `${(-y * INCLINACION_MAXIMA * 2).toFixed(2)}deg`)
    tarjeta.style.setProperty('--giro-y', `${(x * INCLINACION_MAXIMA * 2).toFixed(2)}deg`)
  }

  const alSalirPuntero = () => {
    const tarjeta = tarjetaRef.current
    tarjeta.style.setProperty('--giro-x', '0deg')
    tarjeta.style.setProperty('--giro-y', '0deg')
  }

  return (
    <Revelar retraso={indice % 3} className="tarjeta-envoltorio">
      <article
        ref={tarjetaRef}
        className="tarjeta"
        style={{ '--acento': categoria.colorAcento, '--tono': color.hex }}
        onPointerMove={alMoverPuntero}
        onPointerLeave={alSalirPuntero}
      >
        <div
          className={`tarjeta__visual ${
            esColorClaro(color.hex) ? 'tarjeta__visual--claro' : ''
          }`}
        >
          <IconoCategoria
            categoria={categoria}
            grosor={1.4}
            className="tarjeta__icono"
          />

          <div className="tarjeta__insignia">
            <Insignia texto={producto.insignia} />
          </div>

          {producto.usoDomicilio && (
            <span className="tarjeta__etiqueta">Apto para domicilios</span>
          )}
        </div>

        <div className="tarjeta__cuerpo">
          <SelectorColor
            colores={producto.colores}
            activo={elegido}
            onElegir={setElegido}
            onVista={setVista}
            etiqueta={`Color de ${producto.nombre}`}
          />

          <h3 className="tarjeta__nombre">
            <Link to={rutaProducto(producto)} className="tarjeta__enlace">
              {producto.nombre}
            </Link>
          </h3>
          <p className="tarjeta__tagline">{producto.tagline}</p>

          <div className="tarjeta__precios">
            <p className="tarjeta__precio">
              {producto.disponibleVenta
                ? formatearPrecio(producto.precioVenta)
                : 'Solo alquiler'}
            </p>

            {alquiler && (
              <p className="tarjeta__alquiler">
                Alquiler desde {formatearPrecio(alquiler.dia)} / día
              </p>
            )}
          </div>
        </div>
      </article>
    </Revelar>
  )
}

export default TarjetaProducto
