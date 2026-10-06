import { useRef } from 'react'
import './SelectorColor.css'

/**
 * Selector de color con puntos redondos. Es un grupo de opciones (radiogroup):
 *  - solo el color elegido está en la secuencia de Tab (tabindex dinámico);
 *  - las flechas (← → ↑ ↓) cambian el color elegido y mueven el foco;
 *  - Inicio y Fin van al primer y al último color;
 *  - cada opción se llama como su color, no solo se ve como un punto.
 *
 * @param colores   lista de { nombre, hex }
 * @param activo    índice del color elegido
 * @param onElegir  se llama con el índice al elegir un color
 * @param onVista   (opcional) se llama con el índice al pasar el mouse o enfocar,
 *                  y con null al salir; sirve para previsualizar el color
 * @param mostrarNombre  muestra el nombre del color elegido al lado
 * @param etiqueta  nombre del grupo para lectores de pantalla (p. ej. "Color de Pulso S1")
 */
function SelectorColor({
  colores,
  activo,
  onElegir,
  onVista,
  mostrarNombre = false,
  tamano = 'normal',
  etiqueta = 'Color',
}) {
  const botonesRef = useRef([])

  // Elige el color en `indice` (con vuelta al otro extremo) y le pasa el foco.
  const irA = (indice) => {
    const destino = (indice + colores.length) % colores.length
    onElegir(destino)
    botonesRef.current[destino]?.focus()
  }

  const alPresionarTecla = (evento) => {
    if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') {
      evento.preventDefault()
      irA(activo + 1)
    } else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      irA(activo - 1)
    } else if (evento.key === 'Home') {
      evento.preventDefault()
      irA(0)
    } else if (evento.key === 'End') {
      evento.preventDefault()
      irA(colores.length - 1)
    }
  }

  return (
    <div className={`selector-color selector-color--${tamano}`}>
      <div
        className="selector-color__puntos"
        role="radiogroup"
        aria-label={etiqueta}
        onKeyDown={alPresionarTecla}
      >
        {colores.map((color, indice) => (
          <button
            key={color.hex}
            ref={(elemento) => {
              botonesRef.current[indice] = elemento
            }}
            type="button"
            role="radio"
            aria-checked={indice === activo}
            aria-label={color.nombre}
            tabIndex={indice === activo ? 0 : -1}
            title={color.nombre}
            className={`selector-color__punto ${
              indice === activo ? 'selector-color__punto--activo' : ''
            }`}
            style={{ '--punto': color.hex }}
            onClick={() => onElegir(indice)}
            onPointerEnter={() => onVista?.(indice)}
            onPointerLeave={() => onVista?.(null)}
            onFocus={() => onVista?.(indice)}
            onBlur={() => onVista?.(null)}
          />
        ))}
      </div>

      {mostrarNombre && (
        <span className="selector-color__nombre">{colores[activo].nombre}</span>
      )}
    </div>
  )
}

export default SelectorColor
