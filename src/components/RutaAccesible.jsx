import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hace accesible el cambio de página en una aplicación de una sola página.
 * Cuando cambia la ruta:
 *  - mueve el foco al título (<h1>) de la nueva página, o al contenido si no hay;
 *  - anuncia el cambio en una región aria-live visualmente oculta.
 * No hace nada en la primera carga, para no quitarle el foco al usuario.
 */
function RutaAccesible() {
  const { pathname } = useLocation()
  const rutaPrevia = useRef(pathname)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (rutaPrevia.current === pathname) return
    rutaPrevia.current = pathname

    // Se espera al siguiente cuadro: así la página nueva ya montó y fijó su título.
    const cuadro = requestAnimationFrame(() => {
      const contenido = document.getElementById('contenido')
      const destino = contenido?.querySelector('h1') ?? contenido

      if (destino) {
        // Un título no recibe foco por defecto; con tabindex=-1 solo se enfoca por código.
        if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1')
        destino.focus({ preventScroll: true })
      }

      const seccion = document.title.split(' | ')[0]
      setAviso(`Página cargada: ${seccion}`)
    })

    return () => cancelAnimationFrame(cuadro)
  }, [pathname])

  return (
    <div className="solo-lectores" role="status" aria-live="polite" aria-atomic="true">
      {aviso}
    </div>
  )
}

export default RutaAccesible
