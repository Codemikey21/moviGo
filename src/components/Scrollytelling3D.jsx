import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { CAPITULOS, ESTADO_INICIAL } from '../lib/capitulos'
import {
  estadoPorProgreso,
  estadoTexto,
  indiceCapitulo,
} from '../lib/interpolar'
import { useMediaQuery } from '../lib/useMediaQuery'
import './Scrollytelling3D.css'

// La escena 3D (three.js + react-three-fiber) pesa bastante. Se carga en un
// archivo aparte para que el hero aparezca sin esperarla.
const Escena3D = lazy(() => import('./Escena3D'))

/**
 * Sección de scrollytelling: un contenedor alto (600vh) con un escenario
 * `position: sticky` de 100vh. ScrollTrigger solo calcula el progreso (0 a 1);
 * no usa `pin`, porque sticky funciona mejor junto con Lenis.
 *
 * El progreso se escribe en refs y en estilos directos (sin estado de React),
 * así que el scroll no provoca re-renders.
 */
function Scrollytelling3D() {
  const seccionRef = useRef(null)
  const resplandorRef = useRef(null)
  const rellenoRef = useRef(null)
  const textosRef = useRef([])
  const progresoRef = useRef(0)

  const [capituloActivo, setCapituloActivo] = useState(0)
  const [visible, setVisible] = useState(false)

  const reducido = useMediaQuery('(prefers-reduced-motion: reduce)')
  const esMovil = useMediaQuery('(max-width: 768px)')

  // Solo se dibuja la escena mientras la sección está en pantalla.
  useEffect(() => {
    const seccion = seccionRef.current

    const observador = new IntersectionObserver(
      ([entrada]) => setVisible(entrada.intersectionRatio > 0),
      { threshold: [0, 0.01] },
    )
    observador.observe(seccion)

    return () => observador.disconnect()
  }, [])

  // Progreso del scroll → textos, resplandor, indicador y escena 3D.
  useEffect(() => {
    const total = CAPITULOS.length
    let ultimoActivo = -1

    // React suelta los refs ANTES de ejecutar la limpieza del efecto, y
    // ctx.revert() dispara un último onUpdate. Esta bandera evita tocar
    // elementos que ya no existen (StrictMode en desarrollo o al cambiar de ruta).
    let activo = true

    const aplicarProgreso = (progreso) => {
      if (!activo) return

      progresoRef.current = progreso

      // Textos: fundido + desplazamiento sincronizados con el scroll.
      textosRef.current.forEach((texto, indice) => {
        if (!texto) return
        const { opacidad, y } = estadoTexto(progreso, indice, total, reducido)
        texto.style.opacity = opacidad
        texto.style.transform = `translate3d(0, ${y}px, 0)`
      })

      // Resplandor de fondo: tono, intensidad y posición por capítulo.
      const { resplandor } = estadoPorProgreso(
        progreso,
        CAPITULOS,
        ESTADO_INICIAL,
        reducido,
      )
      const fondo = resplandorRef.current
      fondo.style.setProperty(
        '--resplandor-rgb',
        `${Math.round(resplandor.r)}, ${Math.round(resplandor.g)}, ${Math.round(resplandor.b)}`,
      )
      fondo.style.setProperty('--resplandor-alfa', resplandor.intensidad.toFixed(3))
      fondo.style.setProperty(
        '--resplandor-x',
        `${esMovil ? 50 : resplandor.posX.toFixed(1)}%`,
      )

      // Línea de progreso lateral.
      rellenoRef.current.style.transform = `scaleY(${progreso})`

      // El capítulo activo sí es estado, pero solo cambia 3 veces en todo el recorrido.
      const capitulo = indiceCapitulo(progreso, total)
      if (capitulo !== ultimoActivo) {
        ultimoActivo = capitulo
        setCapituloActivo(capitulo)
      }
    }

    const ctx = gsap.context(() => {
      // Objeto auxiliar: el scrub lo lleva de 0 a 1 siguiendo el scroll.
      const proxy = { progreso: 0 }

      gsap.to(proxy, {
        progreso: 1,
        ease: 'none',
        onUpdate: () => aplicarProgreso(proxy.progreso),
        scrollTrigger: {
          trigger: seccionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
    }, seccionRef)

    aplicarProgreso(0)

    return () => {
      activo = false
      ctx.revert()
    }
  }, [reducido, esMovil])

  return (
    <section
      ref={seccionRef}
      className="scrolly"
      aria-label="La flota de MoviGo"
    >
      <div className="scrolly__escenario">
        {/* Resplandor detrás del modelo */}
        <div
          ref={resplandorRef}
          className="scrolly__resplandor"
          aria-hidden="true"
        />

        {/* Escena 3D */}
        <Suspense fallback={null}>
          <Escena3D
            progresoRef={progresoRef}
            estatico={reducido}
            esMovil={esMovil}
            visible={visible}
          />
        </Suspense>

        {/* Textos de cada capítulo */}
        {CAPITULOS.map((capitulo, indice) => (
          <article
            key={capitulo.id}
            ref={(elemento) => {
              textosRef.current[indice] = elemento
            }}
            className={`scrolly__texto scrolly__texto--${capitulo.lado}`}
          >
            <div className="scrolly__contenido">
              <p className="scrolly__eyebrow">{capitulo.eyebrow}</p>
              <h2 className="scrolly__titulo">{capitulo.titulo}</h2>
              <p className="scrolly__parrafo">{capitulo.texto}</p>
            </div>
          </article>
        ))}

        {/* Indicador de progreso lateral */}
        <ol className="scrolly__progreso" aria-hidden="true">
          <li className="scrolly__pista">
            <span ref={rellenoRef} className="scrolly__relleno" />
          </li>
          {CAPITULOS.map((capitulo, indice) => {
            const estado =
              indice === capituloActivo
                ? 'scrolly__punto--activo'
                : indice < capituloActivo
                  ? 'scrolly__punto--visto'
                  : ''

            return (
              <li
                key={capitulo.id}
                className={`scrolly__punto ${estado}`}
                style={{ top: `${((indice + 0.5) / CAPITULOS.length) * 100}%` }}
              />
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default Scrollytelling3D
