import { Component } from 'react'

/**
 * Captura errores de render de sus hijos y muestra `fallback` en su lugar.
 * Se usa en la escena 3D para que, si algo externo falla (por ejemplo la
 * descarga del entorno HDR sin internet), el resto de la escena siga viva.
 */
class LimiteDeError extends Component {
  state = { huboError: false }

  static getDerivedStateFromError() {
    return { huboError: true }
  }

  componentDidCatch(error) {
    console.warn(this.props.mensaje ?? 'Se activó el contenido de respaldo.', error)
  }

  render() {
    return this.state.huboError ? this.props.fallback : this.props.children
  }
}

export default LimiteDeError
