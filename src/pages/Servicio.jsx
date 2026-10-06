import { Link } from 'react-router-dom'
import HeroPagina from '../components/HeroPagina'
import Revelar from '../components/Revelar'
import Seccion from '../components/Seccion'
import { EMPRESAS, SERVICIOS } from '../data/servicios'
import { useTitulo } from '../lib/useTitulo'
import NoEncontrado from './NoEncontrado'
import './Servicio.css'

/**
 * Plantilla de las páginas de servicios, ayuda y empresas: domicilios,
 * alquiler, mantenimiento, puntos de servicio, soporte y las páginas
 * provisionales de Empresas. El contenido sale de src/data/servicios.js;
 * `clave` indica cuál se muestra.
 */
function Servicio({ clave }) {
  const servicio = [...SERVICIOS, ...EMPRESAS].find((s) => s.slug === clave)

  useTitulo(servicio?.nombre)

  if (!servicio) return <NoEncontrado />

  const grupo = servicio.ruta.startsWith('/servicios')
    ? 'Servicios'
    : servicio.ruta.startsWith('/empresas')
      ? 'Empresas'
      : 'Ayuda'

  return (
    <div style={{ '--acento': servicio.colorAcento }}>
      <HeroPagina
        eyebrow={grupo}
        titulo={servicio.nombre}
        descripcion={`${servicio.tagline} ${servicio.descripcion}`}
        acento={servicio.colorAcento}
        trazos={servicio.icono}
      />

      <Seccion
        tono="claro"
        eyebrow="Qué incluirá"
        titulo="Pensado para que todo sea fácil."
      >
        <div className="servicio__grilla">
          {servicio.ofrece.map((item, indice) => (
            <Revelar key={item.titulo} retraso={indice % 2} className="servicio__envoltorio">
              <article className="servicio__tarjeta">
                <span className="servicio__numero">{String(indice + 1).padStart(2, '0')}</span>
                <h3 className="servicio__titulo">{item.titulo}</h3>
                <p className="servicio__texto">{item.texto}</p>
              </article>
            </Revelar>
          ))}
        </div>
      </Seccion>

      <Seccion tono="oscuro">
        <Revelar className="servicio__proximamente">
          <span className="servicio__etiqueta">Próximamente</span>
          <h2 className="servicio__proximamente-titulo">
            {servicio.proximamente.titulo}
          </h2>
          <p className="servicio__proximamente-texto">{servicio.proximamente.texto}</p>

          <ul className="servicio__lista">
            {servicio.proximamente.lista.map((elemento) => (
              <li key={elemento} className="servicio__elemento">
                {elemento}
              </li>
            ))}
          </ul>

          <div className="servicio__acciones">
            <Link to="/tienda" className="servicio__boton servicio__boton--lleno">
              Explorar la tienda
            </Link>
            <Link to="/portal" className="servicio__boton servicio__boton--borde">
              Portal empresarial
            </Link>
          </div>
        </Revelar>
      </Seccion>
    </div>
  )
}

export default Servicio
