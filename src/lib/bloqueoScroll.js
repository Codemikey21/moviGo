import { obtenerLenis } from './lenisInstancia'

// Cuenta cuántos diálogos piden bloquear el scroll; solo se libera al cerrar el último.
let usos = 0

/**
 * Impide que la página de fondo se desplace: detiene el scroll suave y marca
 * <html> con la clase "scroll-bloqueado" (ver index.css), que oculta el
 * desbordamiento sin que la página salte por la barra de scroll.
 */
export function bloquearScroll() {
  usos += 1
  if (usos > 1) return

  document.documentElement.classList.add('scroll-bloqueado')
  obtenerLenis()?.stop()
}

// Restaura el scroll de la página al cerrar el diálogo.
export function liberarScroll() {
  usos = Math.max(0, usos - 1)
  if (usos > 0) return

  document.documentElement.classList.remove('scroll-bloqueado')
  obtenerLenis()?.start()
}
