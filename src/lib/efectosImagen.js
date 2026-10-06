import { useLayoutEffect } from 'react'
import { gsap } from './gsap'
import { CURVA, DURACION, aSegundos, easeDe } from './movimiento'
import { useMediaQuery } from './useMediaQuery'

const MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

// Recorte rectangular con esquinas redondeadas: `margen` en % de cada lado.
const recorte = (margen, radio) =>
  `inset(${margen}% ${margen}% ${margen}% ${margen}% round ${radio}px)`

/**
 * Revela una imagen (o su marco) cuando entra en pantalla: el recorte se abre,
 * la imagen se asienta desde una escala mayor y aparece con un fundido. Usa
 * ScrollTrigger una sola vez por elemento y los tokens de movimiento.js.
 *
 * Solo anima propiedades que no cambian el tamaño ni la posición (recorte,
 * transformación, opacidad), así que no provoca saltos de diseño. Al terminar
 * se quitan los estilos en línea para que el CSS (por ejemplo el zoom al pasar
 * el cursor) vuelva a mandar.
 *
 * Con "reducir movimiento" no hace nada: la imagen se ve de inmediato y sin
 * desplazamiento. gsap.context limpia todo al desmontar (React StrictMode).
 *
 * @param ref     ref del elemento que se revela
 * @param activo  false para no hacer nada (por ejemplo, si no hay imagen)
 * @param escala  escala inicial de la imagen; null para no escalar (útil en marcos)
 * @param radio   radio de las esquinas del recorte, en px
 */
export function useRevelarImagen(ref, { activo = true, escala = 1.12, radio = 0 } = {}) {
  const reducido = useMediaQuery(MOVIMIENTO_REDUCIDO)

  useLayoutEffect(() => {
    const elemento = ref.current
    if (!elemento || !activo || reducido) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elemento,
        {
          opacity: 0,
          clipPath: recorte(10, radio),
          ...(escala ? { scale: escala } : {}),
        },
        {
          opacity: 1,
          clipPath: recorte(0, radio),
          ...(escala ? { scale: 1 } : {}),
          duration: aSegundos(DURACION.entrada) * 2,
          ease: easeDe(CURVA.entrada),
          clearProps: 'opacity,clipPath,transform,scale',
          scrollTrigger: { trigger: elemento, start: 'top 90%', once: true },
        },
      )
    }, ref)

    return () => ctx.revert()
  }, [ref, activo, reducido, escala, radio])
}

/**
 * Parallax sutil: mientras se hace scroll por la sección `disparadorRef`, la
 * imagen se desplaza un poco dentro de su marco (que recorta lo que sobra).
 * La escala inicial cubre el desplazamiento para que nunca se vea el borde.
 *
 * Con "reducir movimiento" no se aplica: la imagen queda quieta.
 *
 * @param ref           ref del elemento que se desplaza (dentro de un marco con overflow oculto)
 * @param disparadorRef ref de la sección cuyo scroll lo gobierna
 * @param amplitud      desplazamiento máximo hacia cada lado, en % de la altura del elemento
 */
export function useParallax(ref, disparadorRef, { activo = true, amplitud = 4 } = {}) {
  const reducido = useMediaQuery(MOVIMIENTO_REDUCIDO)

  useLayoutEffect(() => {
    const elemento = ref.current
    if (!elemento || !activo || reducido) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elemento,
        { yPercent: -amplitud, scale: 1 + (2 * amplitud) / 100 },
        {
          yPercent: amplitud,
          ease: 'none',
          scrollTrigger: {
            trigger: disparadorRef?.current ?? elemento,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    }, ref)

    return () => ctx.revert()
  }, [ref, disparadorRef, activo, reducido, amplitud])
}
