import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HeroPagina from '../components/HeroPagina'
import IconoCategoria from '../components/IconoCategoria'
import Revelar from '../components/Revelar'
import Seccion from '../components/Seccion'
import SelectorModo from '../components/SelectorModo'
import TarjetaProducto from '../components/TarjetaProducto'
import { SERVICIOS } from '../data/servicios'
import {
  alquilerDesdePorDia,
  buscarCategoria,
  formatearPrecio,
  productosDeCategoria,
} from '../lib/formato'
import { useModo } from '../lib/useModo'
import { useTitulo } from '../lib/useTitulo'
import NoEncontrado from './NoEncontrado'
import './Categoria.css'

const OPCIONES_ORDEN = [
  { valor: 'recomendado', texto: 'Recomendados' },
  { valor: 'precio-asc', texto: 'Precio: de menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: de mayor a menor' },
  { valor: 'nombre', texto: 'Nombre: de la A a la Z' },
]

// Servicios que se sugieren al final de cada categoría.
const SERVICIOS_SUGERIDOS = ['alquiler', 'domicilios', 'mantenimiento']

/**
 * Valor que se usa para filtrar y ordenar: con el modo "alquilar" es la tarifa
 * de ejemplo por día; con "comprar", el precio de referencia. Es null cuando el
 * producto no tiene valor en ese modo (un producto que no se alquila).
 */
function precioDe(producto, modo) {
  if (modo === 'alquilar') return producto.tarifasAlquiler?.dia ?? null
  return producto.precioCompra
}

// Paso del control de precio según el orden de magnitud de los valores.
function pasoDePrecio(maximo) {
  if (maximo > 10000000) return 1000000
  if (maximo > 1000000) return 50000
  return 10000
}

// Orden por precio: los productos sin valor en el modo (null) van al final.
function porPrecio(a, b, modo, sentido) {
  const precioA = precioDe(a, modo)
  const precioB = precioDe(b, modo)
  if (precioA === null && precioB === null) return 0
  if (precioA === null) return 1
  if (precioB === null) return -1
  return sentido * (precioA - precioB)
}

function ordenar(productos, orden, modo) {
  const copia = [...productos]

  if (orden === 'precio-asc') {
    copia.sort((a, b) => porPrecio(a, b, modo, 1))
  } else if (orden === 'precio-desc') {
    copia.sort((a, b) => porPrecio(a, b, modo, -1))
  } else if (orden === 'nombre') {
    copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
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

  // El modo (comprar / alquilar) vive en la URL: ?modo=alquilar. Se aplica a todas las tarjetas.
  const [modo, cambiarModo] = useModo()
  const [orden, setOrden] = useState('recomendado')
  const [limiteGuardado, setLimiteGuardado] = useState({ modo: 'comprar', valor: null })

  const productos = useMemo(() => productosDeCategoria(categoria.slug), [categoria.slug])
  const hayAlquiler = productos.some((producto) => producto.disponibleAlquiler)
  const alquilerDesde = alquilerDesdePorDia(productos)
  // El precio más bajo solo cuenta los productos que tienen precio de referencia.
  const preciosCompra = productos.map((p) => precioDe(p, 'comprar')).filter((valor) => valor !== null)
  const precioMinimo = preciosCompra.length ? Math.min(...preciosCompra) : null

  // Si ningún producto de la categoría se alquila, siempre se muestra "comprar".
  const modoMostrado = modo === 'alquilar' && hayAlquiler ? 'alquilar' : 'comprar'

  // Rango de precio: solo cuentan los productos que tienen valor en el modo.
  const precios = productos
    .map((producto) => precioDe(producto, modoMostrado))
    .filter((valor) => valor !== null)
  const maximoReal = precios.length ? Math.max(...precios) : 0
  const minimoReal = precios.length ? Math.min(...precios) : 0
  const paso = pasoDePrecio(maximoReal)
  const piso = Math.floor(minimoReal / paso) * paso
  const techo = Math.ceil(maximoReal / paso) * paso

  // El límite elegido solo vale para el modo en el que se eligió.
  const limite =
    limiteGuardado.modo === modoMostrado && limiteGuardado.valor !== null
      ? Math.min(limiteGuardado.valor, techo)
      : techo

  // Los productos sin valor en el modo (no se alquilan) no se filtran por precio.
  const visibles = ordenar(
    productos.filter((producto) => {
      const valor = precioDe(producto, modoMostrado)
      return valor === null || valor <= limite
    }),
    orden,
    modoMostrado,
  )
  const sinAlquiler = visibles.filter((producto) => !producto.disponibleAlquiler).length

  const restablecer = () => {
    setOrden('recomendado')
    setLimiteGuardado({ modo: modoMostrado, valor: null })
    cambiarModo('comprar')
  }

  const etiquetaPrecio =
    modoMostrado === 'alquilar'
      ? 'Tarifa de ejemplo máxima por día'
      : 'Precio de referencia máximo'

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
          {productos.length} {productos.length === 1 ? 'modelo' : 'modelos'}
          {precioMinimo !== null
            ? ` · Precio de referencia desde ${formatearPrecio(precioMinimo)}`
            : ' · Precio de referencia por confirmar'}
          {alquilerDesde &&
            ` · Tarifa de ejemplo de alquiler desde ${formatearPrecio(alquilerDesde)} / día`}
        </p>
      </HeroPagina>

      {/* Sección clara hecha a mano: la barra de filtros debe ocupar todo el ancho */}
      <section className="seccion seccion--claro categoria__catalogo">
        <div className="categoria__filtros">
          <div className="categoria__filtros-interior">
            <SelectorModo
              modo={modoMostrado}
              onCambiar={cambiarModo}
              alquilerDisponible={hayAlquiler}
              motivoSinAlquiler="Ningún producto de esta categoría se alquila."
            />

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
                    setLimiteGuardado({
                      modo: modoMostrado,
                      valor: Number(evento.target.value),
                    })
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
            {sinAlquiler > 0 &&
              modoMostrado === 'alquilar' &&
              ` · ${sinAlquiler} ${
                sinAlquiler === 1 ? 'se ofrece' : 'se ofrecen'
              } solo para compra`}
          </p>

          {visibles.length > 0 ? (
            <div className="grilla-productos">
              {visibles.map((producto, indice) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  categoria={categoria}
                  indice={indice}
                  modo={modoMostrado}
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
