import { useId, useRef, useState } from 'react'
import { MOTIVO_SIN_ALQUILER } from '../lib/formato'
import './SelectorModo.css'

const OPCIONES = [
  {
    valor: 'comprar',
    texto: 'Comprar',
    anuncio: 'Mostrando el precio de referencia para comprar.',
  },
  {
    valor: 'alquilar',
    texto: 'Alquilar',
    anuncio: 'Mostrando las tarifas de ejemplo para alquilar.',
  },
]

/**
 * Control segmentado Comprar / Alquilar. Es un grupo de opciones (radiogroup):
 *  - solo la opción elegida está en la secuencia de Tab (tabindex dinámico);
 *  - las flechas (← → ↑ ↓) cambian la opción y mueven el foco; Inicio y Fin
 *    van a la primera y a la última opción disponible;
 *  - si el producto no se alquila, "Alquilar" queda deshabilitada (aria-disabled)
 *    y el motivo aparece escrito debajo y se asocia al grupo con aria-describedby;
 *  - cada cambio se anuncia en una región aria-live "polite".
 *
 * El modo vive en la URL (ver useModo): este componente solo lo muestra y lo cambia.
 *
 * @param modo               "comprar" o "alquilar"
 * @param onCambiar          se llama con el modo nuevo
 * @param alquilerDisponible false si lo que se muestra no se puede alquilar
 * @param motivoSinAlquiler  texto que explica por qué "Alquilar" está deshabilitada
 * @param etiqueta           nombre del grupo para lectores de pantalla
 */
function SelectorModo({
  modo,
  onCambiar,
  alquilerDisponible = true,
  motivoSinAlquiler = MOTIVO_SIN_ALQUILER,
  etiqueta = 'Tipo de oferta',
  className = '',
}) {
  const idMotivo = useId()
  const botonesRef = useRef([])
  const [anuncio, setAnuncio] = useState('')

  const estaHabilitada = (opcion) => opcion.valor !== 'alquilar' || alquilerDisponible

  const elegir = (opcion, indice) => {
    if (!estaHabilitada(opcion)) {
      setAnuncio(`Alquilar no está disponible. ${motivoSinAlquiler}`)
      return
    }

    if (opcion.valor === modo) return

    setAnuncio(opcion.anuncio)
    onCambiar(opcion.valor)
    botonesRef.current[indice]?.focus()
  }

  const alPresionarTecla = (evento) => {
    const habilitadas = OPCIONES.map((opcion, indice) => indice).filter((indice) =>
      estaHabilitada(OPCIONES[indice]),
    )
    const actual = OPCIONES.findIndex((opcion) => opcion.valor === modo)
    const posicion = habilitadas.indexOf(actual)
    let destino

    if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') {
      destino = habilitadas[(posicion + 1) % habilitadas.length]
    } else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') {
      destino = habilitadas[(posicion - 1 + habilitadas.length) % habilitadas.length]
    } else if (evento.key === 'Home') {
      destino = habilitadas[0]
    } else if (evento.key === 'End') {
      destino = habilitadas[habilitadas.length - 1]
    } else {
      return
    }

    evento.preventDefault()
    if (destino !== undefined) elegir(OPCIONES[destino], destino)
  }

  return (
    <div className={`selector-modo ${className}`}>
      <div
        className="selector-modo__grupo"
        role="radiogroup"
        aria-label={etiqueta}
        aria-describedby={alquilerDisponible ? undefined : idMotivo}
        onKeyDown={alPresionarTecla}
      >
        {OPCIONES.map((opcion, indice) => {
          const habilitada = estaHabilitada(opcion)
          const elegida = opcion.valor === modo

          return (
            <button
              key={opcion.valor}
              ref={(elemento) => {
                botonesRef.current[indice] = elemento
              }}
              type="button"
              role="radio"
              aria-checked={elegida}
              aria-disabled={habilitada ? undefined : true}
              aria-describedby={habilitada ? undefined : idMotivo}
              tabIndex={elegida ? 0 : -1}
              className="selector-modo__opcion"
              onClick={() => elegir(opcion, indice)}
            >
              {opcion.texto}
            </button>
          )
        })}
      </div>

      {!alquilerDisponible && (
        <p id={idMotivo} className="selector-modo__motivo">
          {motivoSinAlquiler}
        </p>
      )}

      {/* Anuncia el cambio de modo a los lectores de pantalla, sin interrumpir */}
      <p className="solo-lectores" role="status" aria-live="polite" aria-atomic="true">
        {anuncio}
      </p>
    </div>
  )
}

export default SelectorModo
