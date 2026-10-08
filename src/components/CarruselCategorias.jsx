import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import Revelar from './Revelar'
import { useArrastreConInercia, useInclinacion } from '../lib/efectosCarrusel'
import { rutaCategoria } from '../lib/formato'
import { ajusteDeImagen, aspectRatioCss, proporcionDe } from '../lib/imagen'
import { useMediaQuery } from '../lib/useMediaQuery'
import './CarruselCategorias.css'

// Proporción fija del panel de la foto (4:3): todas las tarjetas quedan iguales y la
// página no se mueve mientras cargan las fotos. La foto conserva su proporción real:
// llena el panel solo si difiere menos del 10 % y, si no, se ve completa.
const PROPORCION_FOTO = 4 / 3

const textoCantidad = (cantidad) => `${cantidad} ${cantidad === 1 ? 'modelo' : 'modelos'}`

/**
 * Tarjeta de una categoría. Es un botón real (aria-pressed y aria-controls al panel de
 * productos) con la foto del producto principal sobre un panel claro; los enlaces
 * Comprar y Alquilar quedan fuera del botón porque un botón no puede contener enlaces.
 * Con mouse la tarjeta se inclina y la foto se desplaza dentro de su panel.
 */
function TarjetaCat({ grupo, indice, activa, panelId, efectos, onElegir }) {
  const tarjetaRef = useRef(null)
  const inclinarRef = useRef(null)
  const fotoRef = useRef(null)

  const { categoria, productos, foto, alquila } = grupo
  const ruta = rutaCategoria(categoria)
  const ajuste = foto ? ajusteDeImagen(proporcionDe(foto), PROPORCION_FOTO) : null

  useInclinacion(tarjetaRef, inclinarRef, fotoRef, { activo: efectos })

  return (
    <li className="carrusel__item">
      <article
        ref={tarjetaRef}
        className={`cat ${activa ? 'cat--activa' : ''}`}
        style={{ '--acento': categoria.colorAcento }}
      >
        <div ref={inclinarRef} className="cat__inclinar">
          <button
            type="button"
            className="cat__seleccion"
            aria-pressed={activa}
            aria-controls={panelId}
            onClick={() => onElegir(indice)}
          >
            {/* El nombre de la categoría ya está en el botón: la foto es decorativa */}
            <span
              className={`cat__foto ${foto ? '' : 'cat__foto--icono'}`}
              style={{ aspectRatio: aspectRatioCss(PROPORCION_FOTO) }}
            >
              {foto ? (
                <img
                  ref={fotoRef}
                  className={`cat__imagen cat__imagen--${ajuste}`}
                  src={foto.imagenPequena}
                  alt=""
                  width={foto.anchoPequeno}
                  height={foto.altoPequeno}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              ) : (
                <IconoCategoria categoria={categoria} grosor={1.2} className="cat__icono" />
              )}
            </span>

            <span className="cat__texto">
              <span className="cat__cantidad">{textoCantidad(productos.length)}</span>
              <span className="cat__nombre">{categoria.nombre}</span>
              <span className="cat__frase">{categoria.tagline}</span>
            </span>
          </button>

          <div className="cat__acciones">
            <Link
              to={ruta}
              className="cat__boton cat__boton--lleno"
              aria-label={`Comprar ${categoria.nombre.toLowerCase()}`}
            >
              Comprar
            </Link>
            {alquila && (
              <Link
                to={`${ruta}?modo=alquilar`}
                className="cat__boton cat__boton--borde"
                aria-label={`Alquilar ${categoria.nombre.toLowerCase()}`}
              >
                Alquilar
              </Link>
            )}
          </div>
        </div>
      </article>
    </li>
  )
}

/**
 * Carrusel de categorías: fila con scroll-snap donde la tarjeta elegida se ve más
 * grande y las demás se atenúan. La siguiente asoma a la derecha. Se recorre con el
 * dedo, arrastrando con el mouse (con inercia), con la rueda horizontal, con las
 * flechas de la pantalla y con las flechas del teclado; una barra de progreso y un
 * contador ("03 / 07") indican cuál está elegida.
 *
 * El estado vive en la sección: aquí solo se avisa con onElegir(indice).
 */
function CarruselCategorias({ grupos, activa, onElegir, panelId }) {
  const pistaRef = useRef(null)
  const total = grupos.length

  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const punteroFino = useMediaQuery('(hover: hover) and (pointer: fine)')

  // Posición de scroll (px) en la que cada tarjeta queda alineada al inicio.
  const destinos = useCallback(() => {
    const pista = pistaRef.current
    const sangria = parseFloat(getComputedStyle(pista).paddingLeft) || 0
    return Array.from(pista.children, (tarjeta) => tarjeta.offsetLeft - sangria)
  }, [])

  // Hace scroll solo si la tarjeta no se ve completa: hacia el inicio si queda
  // oculta a la izquierda, o lo justo para mostrarla si queda cortada a la derecha.
  const mostrar = useCallback(
    (indice) => {
      const pista = pistaRef.current
      const tarjeta = pista.children[indice]
      const todos = destinos()
      const izquierda = pista.scrollLeft
      const ancho = pista.clientWidth
      const maximo = pista.scrollWidth - ancho
      const sangria = parseFloat(getComputedStyle(pista).paddingLeft) || 0

      let meta = null
      if (todos[indice] < izquierda - 2) {
        meta = todos[indice]
      } else {
        const borde = tarjeta.offsetLeft + tarjeta.offsetWidth
        if (borde > izquierda + ancho - sangria + 2) {
          const siguiente = todos.find(
            (destino) => destino > izquierda + 2 && borde <= destino + ancho - sangria,
          )
          meta = siguiente === undefined ? maximo : siguiente
        }
      }

      if (meta !== null) {
        pista.scrollTo({ left: Math.min(meta, maximo), behavior: reducido ? 'auto' : 'smooth' })
      }
    },
    [destinos, reducido],
  )

  useArrastreConInercia(pistaRef, { reducido, destinos })

  // Al elegir otra categoría (clic, flechas o teclado) se asegura que se vea completa.
  useEffect(() => {
    mostrar(activa)
  }, [activa, mostrar])

  // Teclado: con el foco dentro de una tarjeta, las flechas lo pasan a la vecina y
  // Inicio / Fin a la primera o la última. Elegir sigue siendo Enter o Espacio.
  const alPresionarTecla = (evento) => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return

    const tarjeta = evento.target.closest('.carrusel__item')
    if (!tarjeta) return

    const pista = pistaRef.current
    const actual = Array.prototype.indexOf.call(pista.children, tarjeta)
    let destino = null

    if (evento.key === 'ArrowRight') destino = Math.min(total - 1, actual + 1)
    else if (evento.key === 'ArrowLeft') destino = Math.max(0, actual - 1)
    else if (evento.key === 'Home') destino = 0
    else if (evento.key === 'End') destino = total - 1
    if (destino === null) return

    evento.preventDefault()
    pista.children[destino].querySelector('.cat__seleccion').focus({ preventScroll: true })
    mostrar(destino)
  }

  return (
    <div
      className="carrusel"
      role="group"
      aria-roledescription="carrusel"
      aria-label="Categorías de la tienda"
    >
      <Revelar className="carrusel__escenario">
        <ul ref={pistaRef} className="carrusel__pista" onKeyDown={alPresionarTecla}>
          {grupos.map((grupo, indice) => (
            <TarjetaCat
              key={grupo.categoria.slug}
              grupo={grupo}
              indice={indice}
              activa={indice === activa}
              panelId={panelId}
              efectos={punteroFino && !reducido}
              onElegir={onElegir}
            />
          ))}
        </ul>
      </Revelar>

      <div className="seccion__interior carrusel__controles">
        <p className="carrusel__contador" aria-hidden="true">
          <span className="carrusel__contador-actual">{String(activa + 1).padStart(2, '0')}</span>
          {' / '}
          {String(total).padStart(2, '0')}
        </p>

        <div className="carrusel__progreso" aria-hidden="true">
          <span
            className="carrusel__progreso-relleno"
            style={{ transform: `scaleX(${(activa + 1) / total})` }}
          />
        </div>

        <div className="carrusel__flechas">
          <button
            type="button"
            className="carrusel__flecha"
            aria-label="Categoría anterior"
            aria-disabled={activa === 0}
            onClick={() => onElegir(activa - 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="carrusel__flecha"
            aria-label="Categoría siguiente"
            aria-disabled={activa === total - 1}
            onClick={() => onElegir(activa + 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CarruselCategorias
