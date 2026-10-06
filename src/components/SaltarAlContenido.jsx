import './SaltarAlContenido.css'

/**
 * Enlace "Saltar al contenido": es el primer elemento que recibe foco con Tab
 * y solo se ve mientras lo tiene. Lleva el foco a <main id="contenido">.
 */
function SaltarAlContenido() {
  const alActivar = (evento) => {
    evento.preventDefault()

    const contenido = document.getElementById('contenido')
    contenido?.focus()
    contenido?.scrollIntoView({ block: 'start' })
  }

  return (
    <a href="#contenido" className="saltar" onClick={alActivar}>
      Saltar al contenido
    </a>
  )
}

export default SaltarAlContenido
