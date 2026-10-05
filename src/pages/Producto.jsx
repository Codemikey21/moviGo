import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import IconoCategoria from '../components/IconoCategoria'
import Insignia from '../components/Insignia'
import Migas from '../components/Migas'
import Seccion from '../components/Seccion'
import SelectorColor from '../components/SelectorColor'
import TarjetaProducto from '../components/TarjetaProducto'
import { esColorClaro } from '../lib/color'
import {
  buscarCategoria,
  buscarProducto,
  formatearPrecio,
  productosDeCategoria,
  rutaCategoria,
} from '../lib/formato'
import { useEntradaHero } from '../lib/useEntradaHero'
import { useTitulo } from '../lib/useTitulo'
import NoEncontrado from './NoEncontrado'
import './Producto.css'

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
  const color = producto.colores[colorElegido]
  const alquiler = producto.disponibleAlquiler ? producto.precioAlquiler : null

  const relacionados = productosDeCategoria(categoria.slug)
    .filter((otro) => otro.id !== producto.id)
    .slice(0, 3)

  const migas = [
    { nombre: 'Tienda', ruta: '/tienda' },
    { nombre: categoria.nombre, ruta: rutaCategoria(categoria) },
    { nombre: producto.nombre },
  ]

  return (
    <main style={{ '--acento': categoria.colorAcento }}>
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
                esColorClaro(color.hex) ? 'producto__visor--claro' : ''
              }`}
              style={{ '--tono': color.hex }}
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
              <div className="producto__insignia" data-entrada>
                <Insignia texto={producto.insignia} />
              </div>

              <h1 className="producto__nombre" data-entrada>
                {producto.nombre}
              </h1>
              <p className="producto__tagline" data-entrada>
                {producto.tagline}
              </p>
              <p className="producto__descripcion" data-entrada>
                {producto.descripcion}
              </p>

              {/* Precios */}
              <div className="producto__precios" data-entrada>
                {producto.disponibleVenta && (
                  <div>
                    <p className="producto__etiqueta">Compra</p>
                    <p className="producto__precio">
                      {formatearPrecio(producto.precioVenta)}
                    </p>
                  </div>
                )}

                {alquiler && (
                  <div>
                    <p className="producto__etiqueta">Alquiler</p>
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

              {/* Color */}
              <div className="producto__color" data-entrada>
                <p className="producto__etiqueta">Color</p>
                <SelectorColor
                  colores={producto.colores}
                  activo={colorElegido}
                  onElegir={setColorElegido}
                  mostrarNombre
                  tamano="grande"
                />
              </div>

              {/* Acciones (todavía sin funcionalidad) */}
              <div className="producto__acciones" data-entrada>
                <button
                  type="button"
                  className="producto__boton producto__boton--lleno"
                  disabled={!producto.disponibleVenta}
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

              {/* Destacados */}
              <ul className="producto__destacados" data-entrada>
                {producto.destacados.map((destacado) => (
                  <li key={destacado}>{destacado}</li>
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
        descripcion={`Lo que necesitas saber del ${producto.nombre} antes de elegirlo.`}
      >
        <table className="producto__tabla">
          <tbody>
            {producto.especificaciones.map((especificacion) => (
              <tr key={especificacion.nombre}>
                <th scope="row">{especificacion.nombre}</th>
                <td>{especificacion.valor}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Uso en domicilios</th>
              <td>{producto.usoDomicilio ? 'Sí, apto para repartos' : 'No recomendado'}</td>
            </tr>
          </tbody>
        </table>
      </Seccion>

      {/* ---- Otros productos de la categoría (oscuro) ---- */}
      {relacionados.length > 0 && (
        <Seccion
          tono="oscuro"
          eyebrow={categoria.nombre}
          titulo="También te puede interesar."
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
    </main>
  )
}

export default Producto
