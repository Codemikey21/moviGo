import { useLayoutEffect } from 'react'
import { gsap } from './gsap'
import { useMediaQuery } from './useMediaQuery'

/**
 * Animación de entrada para las cabeceras de página: todos los elementos
 * marcados con el atributo `data-entrada` suben y aparecen de forma escalonada.
 *
 * Con "reducir movimiento" no hace nada y el contenido se ve de inmediato.
 * Usa gsap.context para que React StrictMode y el cambio de ruta limpien bien.
 */
export function useEntradaHero(contenedorRef) {
  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')

  useLayoutEffect(() => {
    if (reducido) return

    const ctx = gsap.context(() => {
      gsap.from('[data-entrada]', {
        opacity: 0,
        y: 36,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
      })
    }, contenedorRef)

    return () => ctx.revert()
  }, [reducido, contenedorRef])
}
