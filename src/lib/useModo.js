import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Modo de la tienda: "comprar" (precio de referencia) o "alquilar" (tarifas de
 * ejemplo). Vive en la URL (?modo=alquilar) para que se pueda compartir y para
 * que la tarjeta, la categoría y la ficha del producto muestren lo mismo.
 * Sin parámetro, o con cualquier otro valor, el modo es "comprar".
 *
 * Devuelve [modo, cambiarModo]. Cambiar el modo reemplaza la entrada del
 * historial (no la agrega) y conserva los demás parámetros de la URL.
 */
export function useModo() {
  const [parametros, setParametros] = useSearchParams()
  const modo = parametros.get('modo') === 'alquilar' ? 'alquilar' : 'comprar'

  const cambiarModo = useCallback(
    (nuevo) => {
      setParametros(
        (previos) => {
          const siguiente = new URLSearchParams(previos)
          if (nuevo === 'alquilar') siguiente.set('modo', 'alquilar')
          else siguiente.delete('modo')
          return siguiente
        },
        { replace: true },
      )
    },
    [setParametros],
  )

  return [modo, cambiarModo]
}
