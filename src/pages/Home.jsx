import ExplorarCategorias from '../components/ExplorarCategorias'
import Hero from '../components/Hero'
import Scrollytelling3D from '../components/Scrollytelling3D'
import { useTitulo } from '../lib/useTitulo'

function Home() {
  useTitulo('Inicio')

  return (
    <div>
      <Hero />
      <Scrollytelling3D />
      <ExplorarCategorias />
    </div>
  )
}

export default Home
