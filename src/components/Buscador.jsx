import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import IconoCategoria from './IconoCategoria'
import { CATEGORIAS } from '../data/catalogo'
import { buscarEnCatalogo } from '../lib/buscar'
import {
  buscarCategoria,
  formatearPrecio,
  rutaCategoria,
  rutaProducto,
} from '../lib/formato'
import './Buscador.css'

/**
 * Buscador a pantalla completa (se abre con Ctrl+K o Cmd+K desde la barra).
 * Muestra resultados en vivo de categorías y productos mientras se escribe.
 *
 * Teclado: ↑ ↓ para moverse, Enter para abrir, Esc para cerrar.
 */
function Buscador({ abierto, onCerrar }) {
  const navegar = useNavigate()
  const entradaRef = useRef(null)

  const [consulta, setConsulta] = useState('')
  const [indiceActivo, setIndiceActivo] = useState(0)
  const [abiertoAnterior, setAbiertoAnterior] = useState(abierto)

  // Cada vez que se abre, empieza con el campo vacío.
  if (abierto !== abiertoAnterior) {
    setAbiertoAnterior(abierto)
    if (abierto) {
      setConsulta('')
      setIndiceActivo(0)
    }
  }

  // Grupos de resultados; sin texto se sugieren todas las categorías.
  const grupos = useMemo(() => {
    const itemsDeCategoria = (categoria) => ({
      clave: `categoria-${categoria.slug}`,
      ruta: rutaCategoria(categoria),
      titulo: categoria.nombre,
      detalle: categoria.tagline,
      categoria,
    })

    if (!consulta.trim()) {
      return [
        { titulo: 'Explorar por categoría', items: CATEGORIAS.map(itemsDeCategoria) },
      ]
    }

    const { categorias, productos } = buscarEnCatalogo(consulta)
    const resultado = []

    if (categorias.length) {
      resultado.push({ titulo: 'Categorías', items: categorias.map(itemsDeCategoria) })
    }

    if (productos.length) {
      resultado.push({
        titulo: 'Productos',
        items: productos.map((producto) => {
          const categoria = buscarCategoria(producto.categoria)
          const precio = producto.disponibleVenta
            ? formatearPrecio(producto.precioVenta)
            : 'Solo alquiler'

          return {
            clave: producto.id,
            ruta: rutaProducto(producto),
            titulo: producto.nombre,
            detalle: `${categoria.nombreCorto} · ${precio}`,
            categoria,
          }
        }),
      })
    }

    return resultado
  }, [consulta])

  // Lista plana con todas las opciones, para recorrerlas con el teclado.
  const opciones = useMemo(() => grupos.flatMap((grupo) => grupo.items), [grupos])

  // Al abrir, el cursor va directo al campo de texto.
  useEffect(() => {
    if (abierto) entradaRef.current?.focus()
  }, [abierto])

  // Esc cierra el buscador desde cualquier punto.
  useEffect(() => {
    if (!abierto) return

    const alPresionar = (evento) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPresionar)

    return () => window.removeEventListener('keydown', alPresionar)
  }, [abierto, onCerrar])

  // Mantiene visible la opción activa al recorrer la lista con el teclado.
  useEffect(() => {
    if (!abierto) return
    document
      .getElementById(`buscador-opcion-${indiceActivo}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [abierto, indiceActivo])

  const alCambiarTexto = (evento) => {
    setConsulta(evento.target.value)
    setIndiceActivo(0)
  }

  const alPresionarTecla = (evento) => {
    if (opciones.length === 0) return

    if (evento.key === 'ArrowDown') {
      evento.preventDefault()
      setIndiceActivo((actual) => (actual + 1) % opciones.length)
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setIndiceActivo((actual) => (actual - 1 + opciones.length) % opciones.length)
    } else if (evento.key === 'Enter') {
      evento.preventDefault()
      navegar(opciones[indiceActivo].ruta)
      onCerrar()
    }
  }

  let posicion = -1

  return (
    <div
      className={`buscador ${abierto ? 'buscador--abierto' : ''}`}
      inert={!abierto}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar en la tienda"
      data-lenis-prevent
    >
      {/* Fondo: al hacer clic fuera del panel se cierra */}
      <div className="buscador__fondo" onClick={onCerrar} />

      <div className="buscador__panel">
        <div className="buscador__campo">
          <svg
            className="buscador__lupa"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>

          <input
            ref={entradaRef}
            type="text"
            className="buscador__entrada"
            placeholder="Busca bicicletas, drones, cascos…"
            value={consulta}
            onChange={alCambiarTexto}
            onKeyDown={alPresionarTecla}
            autoComplete="off"
            spellCheck="false"
            aria-label="Buscar"
          />

          <button type="button" className="buscador__cerrar" onClick={onCerrar}>
            Esc
          </button>
        </div>

        <div className="buscador__resultados">
          {grupos.length === 0 && (
            <p className="buscador__vacio">
              No encontramos resultados para “{consulta.trim()}”. Prueba con otra
              palabra, por ejemplo “patineta” o “casco”.
            </p>
          )}

          {grupos.map((grupo) => (
            <section key={grupo.titulo} className="buscador__grupo">
              <h2 className="buscador__titulo">{grupo.titulo}</h2>

              <ul role="listbox" className="buscador__lista">
                {grupo.items.map((item) => {
                  posicion += 1
                  const miPosicion = posicion
                  const activo = miPosicion === indiceActivo

                  return (
                    <li
                      key={item.clave}
                      id={`buscador-opcion-${miPosicion}`}
                      role="option"
                      aria-selected={activo}
                    >
                      <Link
                        to={item.ruta}
                        className={`buscador__resultado ${
                          activo ? 'buscador__resultado--activo' : ''
                        }`}
                        style={{ '--acento': item.categoria.colorAcento }}
                        onClick={onCerrar}
                        onMouseEnter={() => setIndiceActivo(miPosicion)}
                        tabIndex={-1}
                      >
                        <span className="buscador__icono">
                          <IconoCategoria categoria={item.categoria} />
                        </span>
                        <span className="buscador__textos">
                          <span className="buscador__nombre">{item.titulo}</span>
                          <span className="buscador__detalle">{item.detalle}</span>
                        </span>
                        <span className="buscador__flecha" aria-hidden="true">
                          ›
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>

        <p className="buscador__ayuda">
          <span>↑ ↓ para moverte</span>
          <span>Enter para abrir</span>
          <span>Esc para cerrar</span>
        </p>
      </div>
    </div>
  )
}

export default Buscador
