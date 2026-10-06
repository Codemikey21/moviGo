import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Galeria from '../components/Galeria'
import Migas from '../components/Migas'
import Seccion from '../components/Seccion'
import SelectorColor from '../components/SelectorColor'
import SelectorModo from '../components/SelectorModo'
import TarjetaProducto from '../components/TarjetaProducto'
import VideoProducto from '../components/VideoProducto'
import { FECHA_CONSULTA } from '../data/catalogo'
import { TONO_NEUTRO } from '../lib/color'
import {
  ETIQUETA_PRECIO,
  ETIQUETA_TARIFA,
  buscarCategoria,
  buscarProducto,
  formatearEspecificacion,
  formatearPrecio,
  productosDeCategoria,
  rutaCategoria,
} from '../lib/formato'
import { useEntradaHero } from '../lib/useEntradaHero'
import { useModo } from '../lib/useModo'
import { useTitulo } from '../lib/useTitulo'
import NoEncontrado from './NoEncontrado'
import './Producto.css'

// "2026-10-06" → "6 de octubre de 2026"
const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'long',
  timeZone: 'UTC',
}).format(new Date(FECHA_CONSULTA))

/**
 * Ruta /tienda/:categoria/:producto. Si la categoría o el producto no existen
 * muestra el 404. La vista interna lleva `key` para reiniciar el color elegido.
 */
function Producto() {
  const { categoria: slugCategoria, producto: slugProducto } = useParams()
  const categoria = buscarCategoria(slugCategoria)
  const producto = buscarProducto(slugCategoria, slugProducto)

  if (!categoria || !producto) {
    return (
      <NoEncontrado mensaje="No encontramos ese producto. Puede que haya cambiado de nombre o que ya no esté disponible." />
    )
  }

  return <VistaProducto key={producto.id} categoria={categoria} producto={producto} />
}

function VistaProducto({ categoria, producto }) {
  useTitulo(`${producto.nombre} · ${categoria.nombre}`)

  const cabeceraRef = useRef(null)
  useEntradaHero(cabeceraRef)

  const [modo, cambiarModo] = useModo()
  const [animarOferta, setAnimarOferta] = useState(false)
  const [colorElegido, setColorElegido] = useState(0)

  const tono = producto.colores[colorElegido]?.hex ?? TONO_NEUTRO
  const alquiler = producto.tarifasAlquiler

  // Si el producto no se alquila, la página siempre muestra el modo "comprar"
  // aunque la URL traiga ?modo=alquilar.
  const modoMostrado = modo === 'alquilar' && alquiler ? 'alquilar' : 'comprar'

  const claves = producto.especificacionesClave
  const resto = producto.especificaciones.filter((especificacion) => !especificacion.clave)

  const relacionados = productosDeCategoria(categoria.slug)
    .filter((otro) => otro.id !== producto.id)
    .slice(0, 3)

  const migas = [
    { nombre: 'Tienda', ruta: '/tienda' },
    { nombre: categoria.nombre, ruta: rutaCategoria(categoria) },
    { nombre: producto.nombre },
  ]

  return (
    <div style={{ '--acento': categoria.colorAcento }}>
      {/* ---- Cabecera oscura ---- */}
      <Seccion tono="oscuro" className="producto__cabecera">
        <div ref={cabeceraRef}>
          <div data-entrada>
            <Migas elementos={migas} />
          </div>

          <div className="producto__grid">
            <Galeria
              producto={producto}
              categoria={categoria}
              tono={tono}
              disparadorRef={cabeceraRef}
            />

            <div className="producto__info">
              <h1 className="producto__nombre" data-entrada>
                {producto.nombre}
              </h1>
              <p className="producto__descripcion" data-entrada>
                {producto.descripcion}
              </p>

              {/* Comprar / Alquilar: el modo está en la URL (?modo=alquilar) */}
              <div className="producto__modo" data-entrada>
                <SelectorModo
                  modo={modoMostrado}
                  onCambiar={(nuevo) => {
                    setAnimarOferta(true)
                    cambiarModo(nuevo)
                  }}
                  alquilerDisponible={producto.disponibleAlquiler}
                />
              </div>

              {/* Precio de referencia o tarifas de ejemplo, según el modo */}
              <div className="producto__precios" data-entrada>
                <div
                  key={modoMostrado}
                  className={`producto__oferta ${
                    animarOferta ? 'producto__oferta--cambio' : ''
                  }`}
                >
                  {modoMostrado === 'alquilar' ? (
                    <>
                      <p className="producto__etiqueta">{ETIQUETA_TARIFA}</p>
                      <dl className="producto__tarifas">
                        <div>
                          <dt>Por hora</dt>
                          <dd>{formatearPrecio(alquiler.hora)}</dd>
                        </div>
                        <div>
                          <dt>Por día</dt>
                          <dd>{formatearPrecio(alquiler.dia)}</dd>
                        </div>
                        <div>
                          <dt>Por semana</dt>
                          <dd>{formatearPrecio(alquiler.semana)}</dd>
                        </div>
                      </dl>
                    </>
                  ) : (
                    <>
                      <p className="producto__etiqueta">{ETIQUETA_PRECIO}</p>
                      <p className="producto__precio">
                        {formatearPrecio(producto.precioCompra)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Lo que falta por confirmar, siempre a la vista */}
              <div className="producto__confirmar" data-entrada>
                {!producto.precioVerificado && <p>Precio por confirmar.</p>}
                {modoMostrado === 'alquilar' && (
                  <p>Las tarifas son valores de ejemplo: no son tarifas reales de MoviGo.</p>
                )}
                <p>Disponibilidad: {producto.disponibilidad.toLowerCase()}.</p>
                <p>La compra y la reserva en línea todavía no están disponibles.</p>
              </div>

              {/* Color: sin foto tiñe el marcador; con foto solo informa */}
              {producto.colores.length > 0 && (
                <div className="producto__color" data-entrada>
                  <p className="producto__etiqueta">
                    {producto.vistas.length > 0 ? 'Colores' : 'Color'}
                  </p>
                  {producto.vistas.length > 0 ? (
                    <p className="producto__colores">
                      {producto.colores.map((color) => color.nombre).join(', ')}
                    </p>
                  ) : (
                    <SelectorColor
                      colores={producto.colores}
                      activo={colorElegido}
                      onElegir={setColorElegido}
                      mostrarNombre
                      tamano="grande"
                      etiqueta={`Color de ${producto.nombre}`}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Video opcional: sin video no se dibuja nada ni queda un hueco */}
          {producto.video && (
            <div className="producto__video">
              <VideoProducto video={producto.video} nombre={producto.nombre} />
            </div>
          )}
        </div>
      </Seccion>

      {/* ---- Especificaciones (claro) ---- */}
      <Seccion
        tono="claro"
        eyebrow="Especificaciones"
        titulo="Todos los detalles."
        descripcion={`Lo que publica el fabricante sobre el ${producto.nombre}.`}
      >
        {/* Las tres especificaciones clave, destacadas */}
        <ul className="producto__clave" aria-label="Especificaciones clave">
          {claves.map((especificacion) => (
            <li key={especificacion.etiqueta} className="producto__clave-item">
              <span className="producto__clave-valor">
                {formatearEspecificacion(especificacion)}
              </span>
              <span className="producto__clave-etiqueta">{especificacion.etiqueta}</span>
              {especificacion.nota && (
                <small className="producto__nota">{especificacion.nota}</small>
              )}
            </li>
          ))}
        </ul>

        {/* El resto, en una tabla */}
        {resto.length > 0 && (
          <table className="producto__tabla">
            <caption className="solo-lectores">
              Resto de las especificaciones de {producto.nombre}
            </caption>
            <tbody>
              {resto.map((especificacion) => (
                <tr key={especificacion.etiqueta}>
                  <th scope="row">{especificacion.etiqueta}</th>
                  <td>
                    {formatearEspecificacion(especificacion)}
                    {especificacion.nota && (
                      <small className="producto__nota">{especificacion.nota}</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="producto__fuente">
          Fuente de las especificaciones:{' '}
          <a href={producto.fuente} target="_blank" rel="noopener noreferrer">
            ficha oficial
            <span className="solo-lectores"> (se abre en una pestaña nueva)</span>
          </a>
          . Consultada el {FECHA_LARGA}.
        </p>

        {!producto.verificado && (
          <p className="producto__fuente">
            Algunos datos de este producto están pendientes de confirmar.
          </p>
        )}

        <p className="producto__fuente">
          Los precios son de referencia y las tarifas de alquiler son valores de
          ejemplo: no son ofertas de MoviGo.
        </p>
      </Seccion>

      {/* ---- Otros productos de la categoría (oscuro) ---- */}
      {relacionados.length > 0 && (
        <Seccion
          tono="oscuro"
          eyebrow={categoria.nombre}
          titulo="Más de esta categoría."
        >
          <div className="grilla-productos">
            {relacionados.map((otro, indice) => (
              <TarjetaProducto
                key={otro.id}
                producto={otro}
                categoria={categoria}
                indice={indice}
                modo={modoMostrado}
              />
            ))}
          </div>
        </Seccion>
      )}
    </div>
  )
}

export default Producto
