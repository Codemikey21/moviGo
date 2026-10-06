import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../lib/useMediaQuery'
import './VideoProducto.css'

// ¿El visitante pidió ahorrar datos? (Save-Data o la preferencia de datos reducidos)
function pideAhorrarDatos() {
  if (typeof navigator === 'undefined') return false
  return (
    Boolean(navigator.connection?.saveData) ||
    window.matchMedia('(prefers-reduced-data: reduce)').matches
  )
}

/**
 * Video opcional de un producto: silenciado, en bucle y sin descargarse hasta
 * que haga falta (preload="none"; antes de reproducirse se ve el póster).
 *  - Normalmente se reproduce solo al entrar en pantalla y se pausa al salir.
 *  - Con "reducir movimiento" o con ahorro de datos NO se reproduce solo: se ve
 *    el póster y el botón permite reproducirlo.
 *  - El botón de pausa está siempre disponible, y si la persona pausa el video
 *    no se vuelve a reproducir solo.
 * Si el producto no tiene video (`video` es null) no dibuja nada.
 *
 * @param video   { src, poster, descripcion } o null
 * @param nombre  nombre del producto (para el nombre accesible del video)
 */
function VideoProducto({ video, nombre }) {
  const videoRef = useRef(null)
  const pausadoPorUsuarioRef = useRef(false)

  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [ahorraDatos] = useState(pideAhorrarDatos)
  const [reproduciendo, setReproduciendo] = useState(false)

  const hayVideo = Boolean(video)
  const soloManual = reducido || ahorraDatos

  // Reproduce al entrar en pantalla y pausa al salir (solo en modo automático).
  useEffect(() => {
    const elemento = videoRef.current
    if (!hayVideo || soloManual || !elemento) return

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          if (!pausadoPorUsuarioRef.current) elemento.play().catch(() => {})
        } else {
          elemento.pause()
        }
      },
      { threshold: 0.5 },
    )
    observador.observe(elemento)

    return () => {
      observador.disconnect()
      elemento.pause()
    }
  }, [hayVideo, soloManual])

  if (!video) return null

  const alternar = () => {
    const elemento = videoRef.current

    if (elemento.paused) {
      pausadoPorUsuarioRef.current = false
      elemento.play().catch(() => {})
    } else {
      pausadoPorUsuarioRef.current = true
      elemento.pause()
    }
  }

  return (
    <figure className="video-producto">
      <div className="video-producto__marco">
        <video
          ref={videoRef}
          className="video-producto__video"
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`Video de ${nombre}`}
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
        >
          <source src={video.src} type="video/mp4" />
        </video>

        <button type="button" className="video-producto__boton" onClick={alternar}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">
            {reproduciendo ? (
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
          {reproduciendo ? 'Pausar video' : 'Reproducir video'}
        </button>
      </div>

      {video.descripcion && (
        <figcaption className="video-producto__pie">{video.descripcion}</figcaption>
      )}
    </figure>
  )
}

export default VideoProducto
