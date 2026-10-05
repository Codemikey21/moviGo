import Revelar from './Revelar'
import './Seccion.css'

/**
 * Sección de página con tono oscuro o claro.
 * Define las variables de color (--s-*) que usan las tarjetas y textos que
 * van dentro, de modo que el mismo componente se ve bien en ambos fondos.
 * Si recibe eyebrow, título o descripción, dibuja una cabecera animada.
 */
function Seccion({
  tono = 'oscuro',
  eyebrow,
  titulo,
  descripcion,
  alineacion = 'izquierda',
  className = '',
  id,
  children,
}) {
  const tieneCabecera = eyebrow || titulo || descripcion

  return (
    <section id={id} className={`seccion seccion--${tono} ${className}`}>
      <div className="seccion__interior">
        {tieneCabecera && (
          <Revelar
            as="header"
            className={`seccion__cabecera seccion__cabecera--${alineacion}`}
          >
            {eyebrow && <p className="seccion__eyebrow">{eyebrow}</p>}
            {titulo && <h2 className="seccion__titulo">{titulo}</h2>}
            {descripcion && <p className="seccion__descripcion">{descripcion}</p>}
          </Revelar>
        )}

        {children}
      </div>
    </section>
  )
}

export default Seccion
