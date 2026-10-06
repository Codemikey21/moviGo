import { useEffect, useRef } from 'react'
import { bloquearScroll, liberarScroll } from './bloqueoScroll'

const SELECTOR_ENFOCABLE = 'a[href], button, input, select, textarea, summary, [tabindex]'

// Elementos que reciben foco con Tab dentro de las zonas indicadas, en orden de documento.
function obtenerEnfocables(zonas) {
  const lista = []

  for (const zona of zonas) {
    const candidatos = [...zona.querySelectorAll(SELECTOR_ENFOCABLE)]
    if (zona.matches(SELECTOR_ENFOCABLE)) candidatos.unshift(zona)

    for (const elemento of candidatos) {
      if (elemento.disabled || elemento.tabIndex < 0) continue
      if (elemento.closest('[inert]')) continue
      if (elemento.getClientRects().length === 0) continue
      lista.push(elemento)
    }
  }

  return lista
}

/**
 * Comportamiento de diálogo modal para el buscador y el menú móvil.
 * Mientras `abierto` es true:
 *  - el foco queda atrapado: Tab y Shift+Tab ciclan dentro de las zonas;
 *  - Escape llama a `alCerrar`;
 *  - el resto de la página queda inerte (sin foco, clics ni lectura);
 *  - el scroll de la página queda bloqueado.
 * Al cerrar se restauran el scroll y el fondo, y el foco vuelve al elemento
 * que lo tenía al abrir (o, si ya no existe, al disparador).
 *
 * @param abierto           si el diálogo está abierto
 * @param obtenerZonas      devuelve los elementos que forman el diálogo
 *                          (puede incluir el botón que lo abre, que debe seguir activo)
 * @param selectoresFondo   selectores CSS de lo que queda inerte detrás
 * @param alCerrar          se llama al pulsar Escape
 * @param obtenerFocoInicial devuelve el elemento que recibe el foco al abrir
 * @param disparadorRef     ref del botón que abre el diálogo (respaldo para devolver el foco)
 */
export function useDialogoModal({
  abierto,
  obtenerZonas,
  selectoresFondo,
  alCerrar,
  obtenerFocoInicial,
  disparadorRef,
}) {
  // Siempre se leen los valores más recientes sin reiniciar el efecto.
  const ultimo = useRef({})
  useEffect(() => {
    ultimo.current = {
      obtenerZonas,
      selectoresFondo,
      alCerrar,
      obtenerFocoInicial,
      disparadorRef,
    }
  })

  useEffect(() => {
    if (!abierto) return

    const previo = document.activeElement
    const zonas = () => ultimo.current.obtenerZonas().filter(Boolean)

    // Fondo inerte: todo lo que no forme parte del diálogo.
    const inertados = []
    const fondo = document.querySelectorAll(ultimo.current.selectoresFondo.join(','))
    for (const elemento of fondo) {
      const esDelDialogo = zonas().some(
        (zona) => zona === elemento || zona.contains(elemento) || elemento.contains(zona),
      )
      if (esDelDialogo || elemento.inert) continue
      elemento.inert = true
      inertados.push(elemento)
    }

    bloquearScroll()

    // Tab cicla dentro del diálogo; Escape lo cierra.
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        ultimo.current.alCerrar()
        return
      }

      if (evento.key !== 'Tab') return

      const enfocables = obtenerEnfocables(zonas())
      evento.preventDefault()
      if (enfocables.length === 0) return

      const posicion = enfocables.indexOf(document.activeElement)
      const paso = evento.shiftKey ? -1 : 1
      const siguiente =
        posicion === -1
          ? evento.shiftKey
            ? enfocables.length - 1
            : 0
          : (posicion + paso + enfocables.length) % enfocables.length

      enfocables[siguiente].focus()
    }
    document.addEventListener('keydown', alPresionarTecla, true)

    // Si el diálogo aún se está mostrando (fundido de entrada), el primer intento
    // puede no tomar el foco: se reintenta en el siguiente cuadro.
    const focoInicial = ultimo.current.obtenerFocoInicial?.()
    focoInicial?.focus()
    const reintento =
      focoInicial && document.activeElement !== focoInicial
        ? requestAnimationFrame(() => focoInicial.focus())
        : null

    return () => {
      if (reintento !== null) cancelAnimationFrame(reintento)
      document.removeEventListener('keydown', alPresionarTecla, true)

      // Primero se quita lo inerte: un elemento inerte no puede recibir foco.
      for (const elemento of inertados) elemento.inert = false
      liberarScroll()

      const respaldo = ultimo.current.disparadorRef?.current
      const destino =
        previo && previo !== document.body && document.contains(previo) ? previo : respaldo
      destino?.focus({ preventScroll: true })
    }
  }, [abierto])
}
