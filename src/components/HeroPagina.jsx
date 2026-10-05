import { useRef } from 'react'
import IconoCategoria from './IconoCategoria'
import { useEntradaHero } from '../lib/useEntradaHero'
import './HeroPagina.css'

/**
 * Cabecera grande y oscura para las páginas de tienda, categoría y servicios.
 * Lleva un degradado con el color de acento, un ícono decorativo y una
 * animación de entrada escalonada.
 *
 * @param categoria / trazos  de dónde sale el ícono decorativo (opcional)
 * @param acento              color de acento (hex)
 * @param children            contenido extra bajo la descripción (chips, botones…)
 */
function HeroPagina({
  eyebrow,
  titulo,
  descripcion,
  acento = '#2997ff',
  categoria,
  trazos,
  children,
}) {
  const heroRef = useRef(null)
  useEntradaHero(heroRef)

  const tieneIcono = categoria || trazos

  return (
    <section
      ref={heroRef}
      className="hero-pagina"
      style={{ '--acento': acento }}
    >
      <div className="hero-pagina__fondo" aria-hidden="true" />

      {tieneIcono && (
        <IconoCategoria
          categoria={categoria}
          trazos={trazos}
          grosor={0.6}
          className="hero-pagina__icono"
        />
      )}

      <div className="hero-pagina__interior">
        {eyebrow && (
          <p className="hero-pagina__eyebrow" data-entrada>
            {eyebrow}
          </p>
        )}

        <h1 className="hero-pagina__titulo" data-entrada>
          {titulo}
        </h1>

        {descripcion && (
          <p className="hero-pagina__descripcion" data-entrada>
            {descripcion}
          </p>
        )}

        {children && (
          <div className="hero-pagina__extra" data-entrada>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroPagina
