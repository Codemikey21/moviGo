import { useCallback, useSyncExternalStore } from 'react'

/**
 * Devuelve si una media query se cumple y se actualiza cuando cambia.
 * Ejemplo: useMediaQuery('(prefers-reduced-motion: reduce)')
 */
export function useMediaQuery(consulta) {
  const suscribirse = useCallback(
    (avisar) => {
      const lista = window.matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    [consulta],
  )

  const obtenerValor = () => window.matchMedia(consulta).matches

  // En servidor no hay ventana: se asume que la consulta no se cumple.
  return useSyncExternalStore(suscribirse, obtenerValor, () => false)
}
