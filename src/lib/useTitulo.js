import { useEffect } from 'react'

const TITULO_BASE = 'MoviGo'

// Cambia el título de la pestaña con el formato "Sección | MoviGo"
// mientras la página está montada.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | ${TITULO_BASE}` : TITULO_BASE

    return () => {
      document.title = TITULO_BASE
    }
  }, [titulo])
}
