import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import IconoCategoria from './IconoCategoria'
import { IMAGEN } from '../data/vistas'
import { esColorClaro } from '../lib/color'
import { useParallax, useRevelarImagen } from '../lib/efectosImagen'
import { useDialogoModal } from '../lib/useDialogoModal'
import './Galeria.css'

/**
 * Galería de la ficha del producto. Se adapta a las vistas que el producto tiene:
 *  - 0 vistas → marcador honesto "Foto pendiente" (sin texto inventado);
 *  - 1 vista  → la foto, que se puede ampliar;
 *  - 2 o más  → la foto principal y un selector de vistas (botones con
 *               aria-current) para cambiar de una a otra.
 *
 * La foto se amplía en un diálogo accesible: el foco queda atrapado dentro, Esc
 * lo cierra y el foco vuelve al botón que lo abrió. Dentro del diálogo, las
 * flechas ← → cambian de vista.
 *
 * Efectos (todos desactivados con "reducir movimiento"): la foto se revela al
 * entrar en pantalla, se desplaza un poco con el scroll (parallax) y al cambiar
 * de vista entra con un fundido y un desplazamiento corto.
 *
 * @param producto       producto del catálogo (usa producto.vistas y producto.nombre)
 * @param categoria      categoría del producto (para el ícono del marcador)
 * @param tono           color de fondo del marco mientras carga la foto o falta
 * @param disparadorRef  ref de la sección cuyo scroll gobierna el parallax
 */
function Galeria({ producto, categoria, tono, disparadorRef }) {
  const { vistas } = producto
  const hayVistas = vistas.length > 0
  const variasVistas = vistas.length > 1

  const [indice, setIndice] = useState(0)
  const [cambioDeVista, setCambioDeVista] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [ampliada, setAmpliada] = useState(false)

  const imagenRef = useRef(null)
  const paralajeRef = useRef(null)
  const ampliarRef = useRef(null)
  const dialogoRef = useRef(null)
  const cerrarRef = useRef(null)

  useRevelarImagen(imagenRef, { activo: hayVistas })
  useParallax(paralajeRef, disparadorRef, { activo: hayVistas })

  useDialogoModal({
    abierto: ampliada,
    obtenerZonas: () => [dialogoRef.current],
    // El diálogo vive fuera de #root (en <body>), así que todo #root queda inerte.
    selectoresFondo: ['#root'],
    alCerrar: () => setAmpliada(false),
    obtenerFocoInicial: () => cerrarRef.current,
    disparadorRef: ampliarRef,
  })

  if (!hayVistas) {
    return (
      <div className="galeria" style={{ '--tono': tono }}>
        <div
          className={`galeria__marco galeria__marco--pendiente ${
            esColorClaro(tono) ? 'galeria__marco--claro' : ''
          }`}
        >
          <IconoCategoria categoria={categoria} grosor={1.2} className="galeria__icono" />
          <p className="galeria__pendiente">Foto pendiente</p>
        </div>
      </div>
    )
  }

  const vista = vistas[indice]

  const irAVista = (nuevo) => {
    const destino = (nuevo + vistas.length) % vistas.length
    if (destino === indice) return

    setIndice(destino)
    setCambioDeVista(true)
    setAnuncio(`Vista ${vistas[destino].etiqueta}, ${destino + 1} de ${vistas.length}.`)
  }

  const alPresionarTeclaEnDialogo = (evento) => {
    if (!variasVistas) return

    if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      irAVista(indice + 1)
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      irAVista(indice - 1)
    }
  }

  return (
    <div className="galeria" style={{ '--tono': tono }}>
      <div className="galeria__marco">
        <div ref={paralajeRef} className="galeria__paralaje">
          <button
            ref={ampliarRef}
            type="button"
            className="galeria__ampliar"
            aria-haspopup="dialog"
            aria-label={`Ampliar la imagen: ${vista.etiqueta}`}
            onClick={() => setAmpliada(true)}
          >
            {/* key: al cambiar de vista se monta una imagen nueva y entra con su animación */}
            <img
              key={vista.id}
              ref={imagenRef}
              className={`galeria__imagen ${
                cambioDeVista ? 'galeria__imagen--cambio' : ''
              }`}
              src={vista.imagen}
              alt={vista.alt}
              width={IMAGEN.ancho}
              height={IMAGEN.alto}
              loading={indice === 0 ? 'eager' : 'lazy'}
              fetchPriority={indice === 0 ? 'high' : undefined}
              decoding="async"
            />
          </button>
        </div>

        {/* Ícono decorativo que avisa de que la imagen se puede ampliar */}
        <svg
          className="galeria__lupa"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
        </svg>
      </div>

      {vista.descripcion && <p className="galeria__descripcion">{vista.descripcion}</p>}

      {variasVistas && (
        <ul className="galeria__vistas" aria-label="Vistas del producto">
          {vistas.map((otra, posicion) => (
            <li key={otra.id}>
              <button
                type="button"
                className="galeria__vista"
                aria-current={posicion === indice ? 'true' : undefined}
                onClick={() => irAVista(posicion)}
              >
                {otra.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Anuncia el cambio de vista a los lectores de pantalla, sin interrumpir */}
      <p className="solo-lectores" role="status" aria-live="polite" aria-atomic="true">
        {anuncio}
      </p>

      {ampliada &&
        createPortal(
          <div
            className="galeria-dialogo"
            role="presentation"
            onClick={(evento) => {
              if (evento.target === evento.currentTarget) setAmpliada(false)
            }}
          >
            <div
              ref={dialogoRef}
              className="galeria-dialogo__contenido"
              role="dialog"
              aria-modal="true"
              aria-label={`${producto.nombre}: ${vista.etiqueta}, imagen ampliada`}
              onKeyDown={alPresionarTeclaEnDialogo}
            >
              <figure className="galeria-dialogo__figura">
                <img
                  className="galeria-dialogo__imagen"
                  src={vista.imagen}
                  alt={vista.alt}
                  width={IMAGEN.ancho}
                  height={IMAGEN.alto}
                  decoding="async"
                />
                <figcaption className="galeria-dialogo__pie">
                  {vista.etiqueta}
                  {variasVistas && ` · ${indice + 1} de ${vistas.length}`}
                </figcaption>
              </figure>

              {variasVistas && (
                <>
                  <button
                    type="button"
                    className="galeria-dialogo__nav galeria-dialogo__nav--anterior"
                    aria-label="Vista anterior"
                    onClick={() => irAVista(indice - 1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="galeria-dialogo__nav galeria-dialogo__nav--siguiente"
                    aria-label="Vista siguiente"
                    onClick={() => irAVista(indice + 1)}
                  >
                    ›
                  </button>
                </>
              )}

              <button
                ref={cerrarRef}
                type="button"
                className="galeria-dialogo__cerrar"
                aria-label="Cerrar la imagen ampliada (Esc)"
                onClick={() => setAmpliada(false)}
              >
                ×
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default Galeria
