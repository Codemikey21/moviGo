import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import Revelar from './Revelar'
import SelectorColor from './SelectorColor'
import { TONO_NEUTRO, esColorClaro } from '../lib/color'
import { useRevelarImagen } from '../lib/efectosImagen'
import {
  ETIQUETA_PRECIO,
  ETIQUETA_TARIFA,
  MOTIVO_SIN_ALQUILER,
  TEXTO_POR_CONFIRMAR,
  formatearEspecificacion,
  formatearPrecio,
  formatearPrecioReferencia,
  rutaProducto,
} from '../lib/formato'
import { ajusteDeImagen, aspectRatioCss, proporcionDe } from '../lib/imagen'
import './TarjetaProducto.css'

// Inclinación máxima de la tarjeta al seguir el mouse (grados).
const INCLINACION_MAXIMA = 6

// Proporción fija del contenedor de la foto (4:3): todas las tarjetas de una fila
// quedan alineadas y la página no se mueve mientras cargan las fotos. La foto
// conserva su proporción real: si difiere menos del 10 % del contenedor lo llena
// y, si no, se ve completa sobre un fondo neutro.
const PROPORCION_VISUAL = 4 / 3

// Ancho aproximado que ocupa la foto: una tarjeta (260–320 px) o toda la pantalla.
const TAMANOS = '(min-width: 40em) 320px, 100vw'

/**
 * Tarjeta de producto para las cuadrículas de la tienda.
 * - Con el modo "comprar" muestra el precio de referencia; con "alquilar", la
 *   tarifa de ejemplo (o, si el producto no se alquila, lo explica con texto).
 *   El modo viene de la página (?modo=...) y el enlace de la tarjeta lo conserva.
 * - Muestra las tres especificaciones clave y avisa de lo que está por confirmar
 *   (precio, tarifa, datos de la ficha o una cifra concreta).
 * - Si hay foto, se ve la primera vista (copia pequeña), se acerca suavemente al
 *   pasar el cursor o el foco y se revela al entrar en pantalla; sin foto se ve
 *   el ícono de la categoría.
 * - Al pasar el mouse la tarjeta se eleva y se inclina siguiendo el cursor.
 * Toda la tarjeta es clicable (enlace extendido sobre el nombre).
 */
function TarjetaProducto({ producto, categoria, indice = 0, modo = 'comprar' }) {
  const tarjetaRef = useRef(null)
  const imagenRef = useRef(null)
  const [elegido, setElegido] = useState(0)
  const [vista, setVista] = useState(null)

  const imagen = producto.vistas[0] ?? null
  const ajuste = imagen ? ajusteDeImagen(proporcionDe(imagen), PROPORCION_VISUAL) : null
  const tono = producto.colores[vista ?? elegido]?.hex ?? TONO_NEUTRO
  const alquiler = producto.tarifasAlquiler

  // El precio puede no tener una fuente colombiana verificada ("por confirmar").
  const precioPendiente = producto.precioCompra === null
  const precioSinVerificar = !precioPendiente && !producto.precioVerificado
  const marcaPrecio = precioSinVerificar && (
    <span className="tarjeta__confirmar"> · por confirmar</span>
  )

  useRevelarImagen(imagenRef, { activo: Boolean(imagen) })

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
        style={{ '--acento': categoria.colorAcento, '--tono': tono }}
        onPointerMove={alMoverPuntero}
        onPointerLeave={alSalirPuntero}
      >
        <div
          className={`tarjeta__visual ${imagen ? 'tarjeta__visual--foto' : ''} ${
            !imagen && esColorClaro(tono) ? 'tarjeta__visual--claro' : ''
          }`}
          style={{ aspectRatio: aspectRatioCss(PROPORCION_VISUAL) }}
        >
          {imagen ? (
            <img
              ref={imagenRef}
              className={`tarjeta__imagen tarjeta__imagen--${ajuste}`}
              src={imagen.imagenPequena}
              srcSet={
                imagen.imagenPequena === imagen.imagen
                  ? undefined
                  : `${imagen.imagenPequena} ${imagen.anchoPequeno}w, ${imagen.imagen} ${imagen.ancho}w`
              }
              sizes={TAMANOS}
              alt={imagen.alt}
              width={imagen.anchoPequeno}
              height={imagen.altoPequeno}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <IconoCategoria
              categoria={categoria}
              grosor={1.4}
              className="tarjeta__icono"
            />
          )}
        </div>

        <div className="tarjeta__cuerpo">
          {/* Con foto el color no tiñe nada: el selector solo tiene sentido sin ella */}
          {!imagen && producto.colores.length > 1 && (
            <SelectorColor
              colores={producto.colores}
              activo={elegido}
              onElegir={setElegido}
              onVista={setVista}
              etiqueta={`Color de ${producto.nombre}`}
            />
          )}

          <h3 className="tarjeta__nombre">
            <Link to={rutaProducto(producto, modo)} className="tarjeta__enlace">
              {producto.nombre}
            </Link>
          </h3>

          <dl className="tarjeta__datos">
            {producto.especificacionesClave.map((especificacion) => (
              <div key={especificacion.etiqueta} className="tarjeta__dato">
                <dt>{especificacion.etiqueta}</dt>
                <dd>
                  {formatearEspecificacion(especificacion)}
                  {especificacion.porConfirmar && (
                    <span className="tarjeta__confirmar tarjeta__confirmar--dato">
                      {TEXTO_POR_CONFIRMAR}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {!producto.verificado && (
            <p className="tarjeta__confirmar tarjeta__aviso">Datos por confirmar</p>
          )}

          <div className="tarjeta__precios">
            {modo === 'alquilar' && alquiler && (
              <>
                <p className="tarjeta__precio-etiqueta">
                  {ETIQUETA_TARIFA}
                  {marcaPrecio}
                </p>
                <p className="tarjeta__precio">
                  {formatearPrecio(alquiler.dia)}{' '}
                  <span className="tarjeta__unidad">/ día</span>
                </p>
                <p className="tarjeta__alquiler">
                  Hora {formatearPrecio(alquiler.hora)} · Semana{' '}
                  {formatearPrecio(alquiler.semana)}
                </p>
              </>
            )}

            {modo === 'alquilar' && !alquiler && producto.disponibleAlquiler && (
              <>
                <p className="tarjeta__precio-etiqueta">{ETIQUETA_TARIFA}</p>
                <p className="tarjeta__precio tarjeta__precio--pendiente">
                  {TEXTO_POR_CONFIRMAR}
                </p>
                <p className="tarjeta__alquiler">
                  Depende del precio de referencia, que falta confirmar.
                </p>
              </>
            )}

            {modo === 'alquilar' && !producto.disponibleAlquiler && (
              <>
                <p className="tarjeta__precio-etiqueta">Alquiler</p>
                <p className="tarjeta__precio tarjeta__precio--pendiente">No se alquila</p>
                <p className="tarjeta__alquiler">{MOTIVO_SIN_ALQUILER}</p>
              </>
            )}

            {modo !== 'alquilar' && (
              <>
                <p className="tarjeta__precio-etiqueta">
                  {ETIQUETA_PRECIO}
                  {marcaPrecio}
                </p>
                <p
                  className={`tarjeta__precio ${
                    precioPendiente ? 'tarjeta__precio--pendiente' : ''
                  }`}
                >
                  {formatearPrecioReferencia(producto.precioCompra)}
                </p>
              </>
            )}
          </div>
        </div>
      </article>
    </Revelar>
  )
}

export default TarjetaProducto
