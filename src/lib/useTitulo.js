import { useEffect } from 'react'

const TITULO_BASE = 'MoviGo — Portal Web'

// Cambia el título de la pestaña mientras la página está montada.
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} — MoviGo` : TITULO_BASE

    return () => {
      document.title = TITULO_BASE
    }
  }, [titulo])
}
