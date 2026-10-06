import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import IconoCategoria from '../components/IconoCategoria'
import Migas from '../components/Migas'
import Seccion from '../components/Seccion'
import SelectorColor from '../components/SelectorColor'
import TarjetaProducto from '../components/TarjetaProducto'
import { FECHA_CONSULTA } from '../data/catalogo'
import { TONO_NEUTRO, esColorClaro } from '../lib/color'
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

  const [colorElegido, setColorElegido] = useState(0)
  const tono = producto.colores[colorElegido]?.hex ?? TONO_NEUTRO
  const alquiler = producto.tarifasAlquiler

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
            {/* Aquí irá el visor 3D interactivo */}
            <div
              className={`producto__visor ${
                esColorClaro(tono) ? 'producto__visor--claro' : ''
              }`}
              style={{ '--tono': tono }}
              data-entrada
            >
              <IconoCategoria
                categoria={categoria}
                grosor={1.2}
                className="producto__visor-icono"
              />
              <p className="producto__visor-nota">
                Visor 3D interactivo · próximamente
              </p>
            </div>

            <div className="producto__info">
              <h1 className="producto__nombre" data-entrada>
                {producto.nombre}
              </h1>
              <p className="producto__descripcion" data-entrada>
                {producto.descripcion}
              </p>

              {/* Precios */}
              <div className="producto__precios" data-entrada>
                {producto.disponibleCompra && (
                  <div>
                    <p className="producto__etiqueta">{ETIQUETA_PRECIO}</p>
                    <p className="producto__precio">
                      {formatearPrecio(producto.precioCompra)}
                    </p>
                  </div>
                )}

                {alquiler && (
                  <div>
                    <p className="producto__etiqueta">
                      Alquiler · {ETIQUETA_TARIFA.toLowerCase()}
                    </p>
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
                  </div>
                )}
              </div>

              {/* Color: solo si la fuente publica colores */}
              {producto.colores.length > 0 && (
                <div className="producto__color" data-entrada>
                  <p className="producto__etiqueta">Color</p>
                  <SelectorColor
                    colores={producto.colores}
                    activo={colorElegido}
                    onElegir={setColorElegido}
                    mostrarNombre
                    tamano="grande"
                    etiqueta={`Color de ${producto.nombre}`}
                  />
                </div>
              )}

              {/* Acciones (todavía sin funcionalidad) */}
              <div className="producto__acciones" data-entrada>
                <button
                  type="button"
                  className="producto__boton producto__boton--lleno"
                  disabled={!producto.disponibleCompra}
                >
                  Comprar
                </button>
                <button
                  type="button"
                  className="producto__boton producto__boton--borde"
                  disabled={!producto.disponibleAlquiler}
                >
                  Alquilar
                </button>
              </div>

              {/* Las tres especificaciones clave */}
              <ul className="producto__destacados" data-entrada>
                {producto.especificacionesClave.map((especificacion) => (
                  <li key={especificacion.etiqueta}>
                    <strong>{especificacion.etiqueta}:</strong>{' '}
                    {formatearEspecificacion(especificacion)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Seccion>

      {/* ---- Especificaciones (claro) ---- */}
      <Seccion
        tono="claro"
        eyebrow="Especificaciones"
        titulo="Todos los detalles."
        descripcion={`Lo que publica el fabricante sobre el ${producto.nombre}.`}
      >
        <table className="producto__tabla">
          <tbody>
            {producto.especificaciones.map((especificacion) => (
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
              />
            ))}
          </div>
        </Seccion>
      )}
    </div>
  )
}

export default Producto
