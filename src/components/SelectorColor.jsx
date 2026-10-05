import './SelectorColor.css'

/**
 * Selector de color con puntos redondos.
 *
 * @param colores   lista de { nombre, hex }
 * @param activo    índice del color elegido
 * @param onElegir  se llama con el índice al hacer clic
 * @param onVista   (opcional) se llama con el índice al pasar el mouse o enfocar,
 *                  y con null al salir; sirve para previsualizar el color
 * @param mostrarNombre  muestra el nombre del color elegido al lado
 */
function SelectorColor({
  colores,
  activo,
  onElegir,
  onVista,
  mostrarNombre = false,
  tamano = 'normal',
}) {
  return (
    <div className={`selector-color selector-color--${tamano}`}>
      <div className="selector-color__puntos" role="radiogroup" aria-label="Color">
        {colores.map((color, indice) => (
          <button
            key={color.hex}
            type="button"
            role="radio"
            aria-checked={indice === activo}
            aria-label={color.nombre}
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
