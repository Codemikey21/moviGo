import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CarruselCategorias from './CarruselCategorias'
import Revelar from './Revelar'
import TarjetaProducto from './TarjetaProducto'
import { CATEGORIAS } from '../data/catalogo'
import { alquilerDesdePorDia, productosDeCategoria, rutaCategoria } from '../lib/formato'
import './Seccion.css'
import './ExplorarCategorias.css'

const PANEL_ID = 'panel-productos'

// Una entrada por categoría: sus productos, la foto del producto principal (el primero
// del catálogo que tiene foto) y si ofrece alquiler. Como en la versión anterior de la
// portada, "Alquilar" solo aparece si alguno de sus productos tiene una tarifa calculada.
const GRUPOS = CATEGORIAS.map((categoria) => {
  const productos = productosDeCategoria(categoria.slug)
  const principal = productos.find((producto) => producto.vistas.length > 0) ?? null

  return {
    categoria,
    productos,
    foto: principal ? principal.vistas[0] : null,
    alquila: Boolean(alquilerDesdePorDia(productos)),
  }
})

const textoCantidad = (cantidad) => `${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'}`

/**
 * Sección "Elige cómo moverte": un carrusel de categorías y, debajo, los modelos de la
 * categoría elegida (la primera viene elegida). Elegir otra cambia el panel con una
 * entrada escalonada. El fondo de la sección toma el color de la elegida.
 *
 * Altura del panel: en pantallas anchas (donde los modelos caben en una sola fila) la
 * zona del panel reserva la altura del panel más alto que se haya mostrado y no se
 * acorta nunca, así que al cambiar de categoría el resto de la página no se mueve. En
 * pantallas angostas los modelos van apilados y la altura sigue al contenido: reservar
 * la de cuatro tarjetas dejaría un hueco enorme bajo las categorías de dos modelos.
 */
function ExplorarCategorias() {
  const zonaRef = useRef(null)
  const contenidoRef = useRef(null)

  const [activa, setActiva] = useState(0)
  const [anuncio, setAnuncio] = useState('')

  const grupo = GRUPOS[activa]
  const { categoria, productos } = grupo

  const elegir = (indice) => {
    if (indice < 0 || indice >= GRUPOS.length || indice === activa) return

    const elegida = GRUPOS[indice]
    setActiva(indice)
    setAnuncio(
      `${elegida.categoria.nombre}: ${textoCantidad(elegida.productos.length)}. Categoría ${indice + 1} de ${GRUPOS.length}.`,
    )
  }

  // Reserva de altura: se guarda en la variable --reserva de la zona (el CSS la usa solo
  // en pantallas anchas). Crece si el panel mostrado es más alto y se reinicia si cambia
  // el ancho, porque entonces cambian las columnas y el alto de las tarjetas.
  useEffect(() => {
    const zona = zonaRef.current
    const contenido = contenidoRef.current
    if (!zona || !contenido) return

    let ancho = zona.clientWidth

    const reservar = () => {
      if (Math.abs(zona.clientWidth - ancho) > 1) {
        ancho = zona.clientWidth
        zona.style.removeProperty('--reserva')
      }

      const alto = Math.ceil(contenido.getBoundingClientRect().height)
      const actual = parseFloat(zona.style.getPropertyValue('--reserva')) || 0
      if (alto > actual) zona.style.setProperty('--reserva', `${alto}px`)
    }

    const observador = new ResizeObserver(reservar)
    observador.observe(contenido)
    observador.observe(zona)

    return () => observador.disconnect()
  }, [activa])

  return (
    <section
      className="seccion seccion--oscuro explora"
      aria-labelledby="explora-titulo"
      style={{ '--acento-fondo': categoria.colorAcento }}
    >
      <div className="seccion__interior">
        <Revelar as="header" className="seccion__cabecera seccion__cabecera--izquierda">
          <p className="seccion__eyebrow">Categorías</p>
          <h2 id="explora-titulo" className="seccion__titulo">
            Elige cómo moverte.
          </h2>
          <p className="seccion__descripcion">
            Toca una categoría para ver aquí mismo sus modelos, o entra a ella para compararlos
            todos.
          </p>
        </Revelar>
      </div>

      <CarruselCategorias
        grupos={GRUPOS}
        activa={activa}
        onElegir={elegir}
        panelId={PANEL_ID}
      />

      <div className="seccion__interior">
        <div id={PANEL_ID} className="panel" role="region" aria-labelledby="panel-titulo">
          <div ref={zonaRef} className="panel__zona">
            {/* key: al cambiar de categoría se monta un panel nuevo y sus tarjetas entran escalonadas */}
            <div
              key={categoria.slug}
              ref={contenidoRef}
              className="panel__contenido"
              style={{ '--acento': categoria.colorAcento }}
            >
              <div className="panel__cabecera">
                <h3 id="panel-titulo" className="panel__titulo">
                  {categoria.nombre}
                  <span className="panel__conteo"> · {textoCantidad(productos.length)}</span>
                </h3>
                <Link to={rutaCategoria(categoria)} className="panel__enlace">
                  Ver todo en {categoria.nombre} ›
                </Link>
              </div>

              <div className="panel__rejilla">
                {productos.map((producto, indice) => (
                  <TarjetaProducto
                    key={producto.id}
                    producto={producto}
                    categoria={categoria}
                    indice={indice}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anuncia el cambio de categoría a los lectores de pantalla */}
      <p className="solo-lectores" aria-live="polite">
        {anuncio}
      </p>
    </section>
  )
}

export default ExplorarCategorias
