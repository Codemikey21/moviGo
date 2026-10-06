import { useTitulo } from '../lib/useTitulo'
import './Pagina.css'

function Portal() {
  useTitulo('Portal empresarial')

  return (
    <div className="pagina">
      <h1 className="pagina__titulo">Portal empresarial, próximamente</h1>
    </div>
  )
}

export default Portal
