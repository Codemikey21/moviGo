import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import HeroPagina from '../components/HeroPagina'
import IconoCategoria from '../components/IconoCategoria'
import Revelar from '../components/Revelar'
import Seccion from '../components/Seccion'
import TarjetaProducto from '../components/TarjetaProducto'
import { SERVICIOS } from '../data/servicios'
import {
  alquilerDesdePorDia,
  buscarCategoria,
  formatearPrecio,
  productosDeCategoria,
} from '../lib/formato'
import { useTitulo } from '../lib/useTitulo'
import NoEncontrado from './NoEncontrado'
import './Categoria.css'

const MODOS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'comprar', texto: 'Comprar' },
  { valor: 'alquilar', texto: 'Alquilar' },
]

const OPCIONES_ORDEN = [
  { valor: 'recomendado', texto: 'Recomendados' },
  { valor: 'precio-asc', texto: 'Precio: de menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: de mayor a menor' },
  { valor: 'recientes', texto: 'Más recientes' },
]

// Servicios que se sugieren al final de cada categoría.
const SERVICIOS_SUGERIDOS = ['alquiler', 'domicilios', 'mantenimiento']

/**
 * Precio que se usa para filtrar y ordenar: en modo "alquilar" es la tarifa
 * por día; en los demás casos, el precio de venta.
 */
function precioDe(producto, modo) {
  if (modo === 'alquilar') return producto.precioAlquiler.dia
  return producto.precioVenta ?? producto.precioAlquiler?.dia ?? 0
}

// Paso del control de precio según el orden de magnitud de los valores.
function pasoDePrecio(maximo) {
  if (maximo > 10000000) return 1000000
  if (maximo > 1000000) return 50000
  return 10000
}

function ordenar(productos, orden, modo) {
  const copia = [...productos]

  if (orden === 'precio-asc') {
    copia.sort((a, b) => precioDe(a, modo) - precioDe(b, modo))
  } else if (orden === 'precio-desc') {
    copia.sort((a, b) => precioDe(b, modo) - precioDe(a, modo))
  } else if (orden === 'recientes') {
    copia.sort((a, b) => b.fechaLanzamiento.localeCompare(a.fechaLanzamiento))
  }

  return copia
}

/**
 * Ruta /tienda/:categoria. Si la categoría no existe muestra el 404.
 * La vista interna lleva `key`, así que cambiar de categoría reinicia filtros.
 */
function Categoria() {
  const { categoria: slug } = useParams()
  const categoria = buscarCategoria(slug)

  if (!categoria) {
    return <NoEncontrado mensaje="Esa categoría no existe en la tienda. Elige una de las líneas disponibles." />
  }

  return <VistaCategoria key={categoria.slug} categoria={categoria} />
}

function VistaCategoria({ categoria }) {
  useTitulo(categoria.nombre)

  const [parametros, setParametros] = useSearchParams()
  const [orden, setOrden] = useState('recomendado')
  const [limiteGuardado, setLimiteGuardado] = useState({ modo: 'todos', valor: null })

  const productos = useMemo(() => productosDeCategoria(categoria.slug), [categoria.slug])
  const hayAlquiler = productos.some((producto) => producto.disponibleAlquiler)
  const alquilerDesde = alquilerDesdePorDia(productos)
  const precioMinimo = Math.min(...productos.map((p) => precioDe(p, 'comprar')))

  // El modo (Todos / Comprar / Alquilar) vive en la URL: ?modo=alquilar
  const modoUrl = parametros.get('modo')
  const modo =
    modoUrl === 'comprar' || (modoUrl === 'alquilar' && hayAlquiler) ? modoUrl : 'todos'

  const cambiarModo = (valor) => {
    const siguiente = new URLSearchParams(parametros)
    if (valor === 'todos') siguiente.delete('modo')
    else siguiente.set('modo', valor)
    setParametros(siguiente, { replace: true })
  }

  // Productos que cumplen el modo elegido.
  const porModo = productos.filter((producto) => {
    if (modo === 'comprar') return producto.disponibleVenta
    if (modo === 'alquilar') return producto.disponibleAlquiler
    return true
  })

  // Rango de precio: el control llega hasta el producto más caro del modo.
  const precios = porModo.map((producto) => precioDe(producto, modo))
  const maximoReal = precios.length ? Math.max(...precios) : 0
  const minimoReal = precios.length ? Math.min(...precios) : 0
  const paso = pasoDePrecio(maximoReal)
  const piso = Math.floor(minimoReal / paso) * paso
  const techo = Math.ceil(maximoReal / paso) * paso

  // El límite elegido solo vale para el modo en el que se eligió.
  const limite =
    limiteGuardado.modo === modo && limiteGuardado.valor !== null
      ? Math.min(limiteGuardado.valor, techo)
      : techo

  const visibles = ordenar(
    porModo.filter((producto) => precioDe(producto, modo) <= limite),
    orden,
    modo,
  )

  const restablecer = () => {
    setOrden('recomendado')
    setLimiteGuardado({ modo, valor: null })
    cambiarModo('todos')
  }

  const etiquetaPrecio = modo === 'alquilar' ? 'Precio máximo por día' : 'Precio máximo'

  return (
    <div style={{ '--acento': categoria.colorAcento }}>
      <HeroPagina
        eyebrow="Tienda"
        titulo={categoria.nombre}
        descripcion={`${categoria.tagline} ${categoria.descripcion}`}
        acento={categoria.colorAcento}
        categoria={categoria}
      >
        <p className="categoria__datos">
          {productos.length} {productos.length === 1 ? 'modelo' : 'modelos'} · Desde{' '}
          {formatearPrecio(precioMinimo)}
          {alquilerDesde && ` · Alquiler desde ${formatearPrecio(alquilerDesde)} / día`}
        </p>
      </HeroPagina>

      {/* Sección clara hecha a mano: la barra de filtros debe ocupar todo el ancho */}
      <section className="seccion seccion--claro categoria__catalogo">
        <div className="categoria__filtros">
          <div className="categoria__filtros-interior">
            <div className="categoria__modos" role="group" aria-label="Tipo de oferta">
              {MODOS.filter((m) => m.valor !== 'alquilar' || hayAlquiler).map((m) => (
                <button
                  key={m.valor}
                  type="button"
                  className={`categoria__modo ${
                    modo === m.valor ? 'categoria__modo--activo' : ''
                  }`}
                  aria-pressed={modo === m.valor}
                  onClick={() => cambiarModo(m.valor)}
                >
                  {m.texto}
                </button>
              ))}
            </div>

            {piso < techo && (
              <label className="categoria__precio">
                <span>
                  {etiquetaPrecio}: <strong>{formatearPrecio(limite)}</strong>
                </span>
                <input
                  type="range"
                  min={piso}
                  max={techo}
                  step={paso}
                  value={limite}
                  style={{ '--relleno': `${((limite - piso) / (techo - piso)) * 100}%` }}
                  onChange={(evento) =>
                    setLimiteGuardado({ modo, valor: Number(evento.target.value) })
                  }
                />
              </label>
            )}

            <label className="categoria__orden">
              <span>Ordenar por</span>
              <select value={orden} onChange={(evento) => setOrden(evento.target.value)}>
                {OPCIONES_ORDEN.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="seccion__interior">
          <p className="categoria__conteo" aria-live="polite">
            {visibles.length} {visibles.length === 1 ? 'producto' : 'productos'}
          </p>

          {visibles.length > 0 ? (
            <div className="grilla-productos">
              {visibles.map((producto, indice) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  categoria={categoria}
                  indice={indice}
                />
              ))}
            </div>
          ) : (
            <div className="categoria__vacio">
              <p>No hay productos con estos filtros.</p>
              <button type="button" onClick={restablecer}>
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <Seccion
        tono="oscuro"
        eyebrow="Servicios"
        titulo="Más que un producto."
        descripcion="Todo lo que necesitas para sacarle el máximo provecho a tu equipo."
      >
        <div className="categoria__servicios">
          {SERVICIOS_SUGERIDOS.map((slug, indice) => {
            const servicio = SERVICIOS.find((s) => s.slug === slug)

            return (
              <Revelar key={slug} retraso={indice} className="categoria__servicio-envoltorio">
                <Link
                  to={servicio.ruta}
                  className="categoria__servicio"
                  style={{ '--acento': servicio.colorAcento }}
                >
                  <IconoCategoria
                    trazos={servicio.icono}
                    className="categoria__servicio-icono"
                  />
                  <h3>{servicio.nombre}</h3>
                  <p>{servicio.resumen}</p>
                  <span aria-hidden="true">›</span>
                </Link>
              </Revelar>
            )
          })}
        </div>
      </Seccion>
    </div>
  )
}

export default Categoria
