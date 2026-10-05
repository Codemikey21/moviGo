/**
 * Dibuja el ícono SVG de una categoría o de un servicio.
 * Recibe la categoría completa o directamente la lista de trazos.
 * El color se hereda del texto (currentColor) y el tamaño lo define el CSS
 * del componente que lo usa, por eso no tiene archivo de estilos propio.
 */
function IconoCategoria({ categoria, trazos, className = '', grosor = 2 }) {
  const lista = trazos ?? categoria.icono

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {lista.map((trazo) => (
        <path key={trazo} d={trazo} />
      ))}
    </svg>
  )
}

export default IconoCategoria
