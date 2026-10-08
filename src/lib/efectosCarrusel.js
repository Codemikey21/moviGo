import { useEffect } from 'react'
import { gsap } from './gsap'

// Efectos del carrusel de categorías. Usan GSAP (que el proyecto ya trae) y respetan
// "reducir movimiento": quien llama decide con `activo` y `reducido` cuándo se aplican.

// ---------------------------------------------------------------------------
// Arrastre con el mouse e inercia
// ---------------------------------------------------------------------------

// Cuánto de la velocidad al soltar se proyecta hacia delante (ms): decide cuántas
// tarjetas avanza el gesto antes de detenerse.
const PROYECCION_MS = 320

// Movimiento mínimo (px) para que el gesto cuente como arrastre y no como clic.
const UMBRAL_ARRASTRE = 6

// Si el puntero estuvo quieto más de esto (ms) antes de soltar, no hay inercia.
const REPOSO_MS = 90

/**
 * Permite arrastrar con el mouse una fila con scroll horizontal. Al soltar, la fila
 * sigue con inercia y se detiene alineada a una tarjeta (el scroll-snap del CSS se
 * apaga solo mientras dura el gesto, con el atributo data-arrastrando). El dedo en
 * pantallas táctiles no pasa por aquí: lo resuelve el navegador.
 *
 * Un arrastre no dispara el clic de la tarjeta sobre la que empezó.
 * Con "reducir movimiento" la fila se arrastra igual, pero al soltar salta a la
 * tarjeta más cercana sin animación.
 *
 * @param pistaRef  ref de la fila con overflow-x
 * @param reducido  true si el usuario pidió reducir el movimiento
 * @param destinos  función que devuelve la posición de scroll (px) de cada tarjeta
 */
export function useArrastreConInercia(pistaRef, { reducido = false, destinos }) {
  useEffect(() => {
    const pista = pistaRef.current
    if (!pista) return

    let puntero = null
    let inicioX = 0
    let inicioScroll = 0
    let ultimaX = 0
    let ultimoT = 0
    let velocidad = 0 // px/ms; positiva si el puntero va hacia la derecha
    let arrastrando = false
    let interrumpido = false
    let animacion = null
    let bloquearClic = false

    const terminar = () => {
      animacion = null
      delete pista.dataset.arrastrando
    }

    // Lleva la fila a la tarjeta que alcanza la inercia, con frenado suave.
    const asentar = () => {
      const maximo = pista.scrollWidth - pista.clientWidth
      const posiciones = destinos().map((destino) => Math.min(Math.max(destino, 0), maximo))
      const proyectada = pista.scrollLeft - velocidad * PROYECCION_MS
      const meta = posiciones.reduce(
        (mejor, destino) =>
          Math.abs(destino - proyectada) < Math.abs(mejor - proyectada) ? destino : mejor,
        posiciones[0],
      )

      if (reducido) {
        pista.scrollLeft = meta
        terminar()
        return
      }

      const distancia = Math.abs(meta - pista.scrollLeft)
      animacion = gsap.to(pista, {
        scrollLeft: meta,
        duration: Math.min(0.9, 0.3 + distancia / 1500),
        ease: 'power3.out',
        onComplete: terminar,
      })
    }

    const alMover = (evento) => {
      if (evento.pointerId !== puntero) return

      const desplazamiento = evento.clientX - inicioX
      if (!arrastrando) {
        if (Math.abs(desplazamiento) < UMBRAL_ARRASTRE) return
        arrastrando = true
        pista.dataset.arrastrando = 'true'
      }

      const ahora = performance.now()
      const dt = ahora - ultimoT
      if (dt > 0) velocidad = 0.7 * ((evento.clientX - ultimaX) / dt) + 0.3 * velocidad
      ultimaX = evento.clientX
      ultimoT = ahora

      pista.scrollLeft = inicioScroll - desplazamiento
    }

    const alSoltar = (evento) => {
      if (evento.pointerId !== puntero) return

      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerup', alSoltar)
      window.removeEventListener('pointercancel', alSoltar)
      puntero = null

      if (performance.now() - ultimoT > REPOSO_MS) velocidad = 0

      if (arrastrando || interrumpido) {
        // El clic que sigue a un arrastre se descarta; la marca se limpia enseguida
        bloquearClic = arrastrando
        setTimeout(() => {
          bloquearClic = false
        }, 0)
        arrastrando = false
        interrumpido = false
        asentar()
      }
    }

    const alBajar = (evento) => {
      if (evento.pointerType !== 'mouse' || evento.button !== 0 || puntero !== null) return

      // Un nuevo gesto detiene la inercia anterior
      if (animacion) {
        animacion.kill()
        animacion = null
        interrumpido = true
      }

      puntero = evento.pointerId
      inicioX = evento.clientX
      inicioScroll = pista.scrollLeft
      ultimaX = evento.clientX
      ultimoT = performance.now()
      velocidad = 0

      window.addEventListener('pointermove', alMover)
      window.addEventListener('pointerup', alSoltar)
      window.addEventListener('pointercancel', alSoltar)
    }

    const alHacerClic = (evento) => {
      if (!bloquearClic) return
      evento.preventDefault()
      evento.stopPropagation()
    }

    // Evita el arrastre nativo de imágenes y enlaces
    const alArrastrarNativo = (evento) => evento.preventDefault()

    pista.addEventListener('pointerdown', alBajar)
    pista.addEventListener('click', alHacerClic, true)
    pista.addEventListener('dragstart', alArrastrarNativo)

    return () => {
      pista.removeEventListener('pointerdown', alBajar)
      pista.removeEventListener('click', alHacerClic, true)
      pista.removeEventListener('dragstart', alArrastrarNativo)
      window.removeEventListener('pointermove', alMover)
      window.removeEventListener('pointerup', alSoltar)
      window.removeEventListener('pointercancel', alSoltar)
      animacion?.kill()
      delete pista.dataset.arrastrando
    }
  }, [pistaRef, reducido, destinos])
}

// ---------------------------------------------------------------------------
// Inclinación 3D de la tarjeta y parallax interno de la foto
// ---------------------------------------------------------------------------

// Inclinación máxima de la tarjeta (grados) y desplazamiento máximo de la foto (px).
const INCLINACION_MAXIMA = 7
const DESPLAZAMIENTO_FOTO = 7

// La foto se agranda un poco para que al desplazarse no deje ver los bordes.
const ESCALA_FOTO = 1.05

/**
 * La tarjeta se inclina hacia donde apunta el mouse y la foto se mueve en sentido
 * contrario (parallax interno). El resplandor sigue al cursor mediante las variables
 * --mx y --my de la tarjeta. Todo termina suavemente al salir el puntero.
 *
 * Solo debe activarse con puntero fino y sin "reducir movimiento" (lo decide quien
 * llama con `activo`); el evento ignora lápiz y dedo.
 *
 * @param tarjetaRef  ref del elemento que recibe el puntero (y las variables --mx, --my)
 * @param inclinarRef ref del elemento que se inclina
 * @param fotoRef     ref de la foto (puede no existir si la tarjeta usa el ícono)
 */
export function useInclinacion(tarjetaRef, inclinarRef, fotoRef, { activo }) {
  useEffect(() => {
    const tarjeta = tarjetaRef.current
    const inclinar = inclinarRef.current
    const foto = fotoRef.current
    if (!tarjeta || !inclinar || !activo) return

    let girarX
    let girarY
    let moverX
    let moverY

    const ctx = gsap.context(() => {
      gsap.set(inclinar, { transformPerspective: 900 })
      if (foto) gsap.set(foto, { scale: ESCALA_FOTO })

      const opciones = { duration: 0.6, ease: 'power3.out' }
      girarX = gsap.quickTo(inclinar, 'rotationX', opciones)
      girarY = gsap.quickTo(inclinar, 'rotationY', opciones)
      if (foto) {
        moverX = gsap.quickTo(foto, 'x', opciones)
        moverY = gsap.quickTo(foto, 'y', opciones)
      }
    }, tarjetaRef)

    const alMover = (evento) => {
      if (evento.pointerType !== 'mouse') return

      const caja = tarjeta.getBoundingClientRect()
      const x = (evento.clientX - caja.left) / caja.width - 0.5
      const y = (evento.clientY - caja.top) / caja.height - 0.5

      girarX(-y * 2 * INCLINACION_MAXIMA)
      girarY(x * 2 * INCLINACION_MAXIMA)
      moverX?.(-x * 2 * DESPLAZAMIENTO_FOTO)
      moverY?.(-y * 2 * DESPLAZAMIENTO_FOTO)

      tarjeta.style.setProperty('--mx', `${evento.clientX - caja.left}px`)
      tarjeta.style.setProperty('--my', `${evento.clientY - caja.top}px`)
    }

    const alSalir = () => {
      girarX(0)
      girarY(0)
      moverX?.(0)
      moverY?.(0)
    }

    tarjeta.addEventListener('pointermove', alMover)
    tarjeta.addEventListener('pointerleave', alSalir)

    return () => {
      tarjeta.removeEventListener('pointermove', alMover)
      tarjeta.removeEventListener('pointerleave', alSalir)
      ctx.revert()
    }
  }, [tarjetaRef, inclinarRef, fotoRef, activo])
}
