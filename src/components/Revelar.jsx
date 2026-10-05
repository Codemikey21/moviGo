import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../lib/useMediaQuery'
import './Revelar.css'

/**
 * Envuelve contenido que aparece (fundido + deslizamiento) cuando entra en
 * pantalla al hacer scroll. Usa IntersectionObserver, así que no depende de
 * ScrollTrigger y se limpia solo al desmontarse.
 *
 * `retraso` escalona la entrada: cada unidad suma una pequeña pausa.
 * Con "reducir movimiento" el contenido se muestra directamente.
 */
function Revelar({
  as: Etiqueta = 'div',
  retraso = 0,
  className = '',
  style,
  children,
  ...resto
}) {
  const elementoRef = useRef(null)
  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    const elemento = elementoRef.current
    if (!elemento) return

    if (reducido || typeof IntersectionObserver === 'undefined') {
      elemento.dataset.revelado = 'true'
      return
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        elemento.dataset.revelado = 'true'
        observador.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    observador.observe(elemento)

    return () => observador.disconnect()
  }, [reducido])

  return (
    <Etiqueta
      ref={elementoRef}
      className={`revelar ${className}`}
      style={{ '--retraso': retraso, ...style }}
      {...resto}
    >
      {children}
    </Etiqueta>
  )
}

export default Revelar
