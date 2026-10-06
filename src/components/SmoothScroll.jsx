import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { registrarLenis } from '../lib/lenisInstancia'

/**
 * Activa el scroll suave de Lenis y lo sincroniza con GSAP ScrollTrigger.
 * No renderiza nada: solo configura el comportamiento global del scroll.
 * Debe usarse dentro del <BrowserRouter>.
 */
function SmoothScroll() {
  const lenisRef = useRef(null)
  const { pathname } = useLocation()

  // Crea la instancia de Lenis y la conecta con GSAP.
  useEffect(() => {
    // Con "reducir movimiento" se usa el scroll nativo, sin inercia.
    // ScrollTrigger funciona igual con el scroll del navegador.
    const reducirMovimiento = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducirMovimiento) return

    const lenis = new Lenis({
      // Lo controla el ticker de GSAP, no el requestAnimationFrame propio.
      autoRaf: false,
    })
    lenisRef.current = lenis
    registrarLenis(lenis)

    // Cada vez que Lenis hace scroll, ScrollTrigger se actualiza.
    lenis.on('scroll', ScrollTrigger.update)

    // GSAP entrega el tiempo en segundos; Lenis lo espera en milisegundos.
    const actualizar = (tiempo) => {
      lenis.raf(tiempo * 1000)
    }
    gsap.ticker.add(actualizar)

    // Evita saltos de animación cuando la pestaña pierde el foco.
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(actualizar)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      lenisRef.current = null
      registrarLenis(null)
    }
  }, [])

  // Al cambiar de ruta, vuelve al inicio de la página sin animación.
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}

export default SmoothScroll
