import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/gsap'
import { useMediaQuery } from '../lib/useMediaQuery'
import './Hero.css'

/**
 * Portada: titular gigante, subtítulo, botón y un resplandor azul que
 * sigue al cursor. Al hacer scroll el contenido se desvanece y se desplaza.
 */
function Hero() {
  const heroRef = useRef(null)
  const resplandorRef = useRef(null)

  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const tactil = useMediaQuery('(hover: none)')

  // Entrada: cada línea del titular sube desde su máscara, escalonadas.
  // useLayoutEffect evita que se vea un parpadeo antes de empezar.
  useLayoutEffect(() => {
    if (reducido) return

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero__linea-texto', {
          yPercent: 115,
          duration: 1.2,
          stagger: 0.14,
        })
        .from('.hero__subtitulo', { opacity: 0, y: 28, duration: 0.9 }, '-=0.6')
        .from('.hero__boton', { opacity: 0, y: 28, duration: 0.9 }, '-=0.7')
        .from('.hero__indicador', { opacity: 0, duration: 1.2 }, '-=0.4')
    }, heroRef)

    return () => ctx.revert()
  }, [reducido])

  // Al hacer scroll: el hero se desvanece y se desplaza (parallax).
  useLayoutEffect(() => {
    if (reducido) return

    const ctx = gsap.context(() => {
      const scrollTrigger = {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom 25%',
        scrub: true,
      }

      gsap.to('.hero__contenido, .hero__indicador', {
        y: 140,
        opacity: 0,
        ease: 'none',
        scrollTrigger,
      })

      gsap.to('.hero__fondo', {
        y: 60,
        opacity: 0,
        ease: 'none',
        scrollTrigger,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [reducido])

  // Resplandor: sigue al cursor con suavizado; en pantallas táctiles queda
  // fijo con una animación lenta.
  useEffect(() => {
    if (reducido) return

    const hero = heroRef.current
    const resplandor = resplandorRef.current
    let quitarEscuchas = () => {}

    const ctx = gsap.context(() => {
      if (tactil) {
        gsap.to(resplandor, {
          x: 110,
          y: -60,
          scale: 1.12,
          duration: 9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
        return
      }

      // quickTo reutiliza una sola animación: ideal para eventos de puntero.
      const moverX = gsap.quickTo(resplandor, 'x', {
        duration: 1.1,
        ease: 'power3.out',
      })
      const moverY = gsap.quickTo(resplandor, 'y', {
        duration: 1.1,
        ease: 'power3.out',
      })

      // El resplandor nace en el centro del hero; x e y son desplazamientos.
      const alMoverPuntero = (evento) => {
        const caja = hero.getBoundingClientRect()
        moverX(evento.clientX - caja.left - caja.width / 2)
        moverY(evento.clientY - caja.top - caja.height * 0.42)
      }
      const alSalirPuntero = () => {
        moverX(0)
        moverY(0)
      }

      hero.addEventListener('pointermove', alMoverPuntero)
      hero.addEventListener('pointerleave', alSalirPuntero)

      quitarEscuchas = () => {
        hero.removeEventListener('pointermove', alMoverPuntero)
        hero.removeEventListener('pointerleave', alSalirPuntero)
      }
    }, heroRef)

    return () => {
      quitarEscuchas()
      ctx.revert()
    }
  }, [reducido, tactil])

  return (
    <section ref={heroRef} className="hero" aria-labelledby="hero-titulo">
      <div className="hero__fondo" aria-hidden="true">
        <div ref={resplandorRef} className="hero__resplandor" />
      </div>

      <div className="hero__contenido">
        <h1 id="hero-titulo" className="hero__titulo">
          <span className="hero__linea">
            <span className="hero__linea-texto">Muévete.</span>
          </span>
          <span className="hero__linea">
            <span className="hero__linea-texto">Entrega.</span>
          </span>
          <span className="hero__linea">
            <span className="hero__linea-texto">Repite.</span>
          </span>
        </h1>

        <p className="hero__subtitulo">
          Alquila, compra y entrega con una sola flota de movilidad ligera.
          MoviGo conecta la ciudad con tus pedidos.
        </p>

        <Link to="/portal" className="hero__boton">
          Portal empresarial
        </Link>
      </div>

      <div className="hero__indicador" aria-hidden="true">
        <span className="hero__indicador-texto">Desliza para descubrir</span>
        <span className="hero__indicador-linea" />
      </div>
    </section>
  )
}

export default Hero
