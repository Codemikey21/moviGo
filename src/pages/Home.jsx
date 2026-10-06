import BentoCategorias from '../components/BentoCategorias'
import Hero from '../components/Hero'
import Scrollytelling3D from '../components/Scrollytelling3D'
import { useTitulo } from '../lib/useTitulo'

function Home() {
  useTitulo('Inicio')

  return (
    <div>
      <Hero />
      <Scrollytelling3D />
      <BentoCategorias />
    </div>
  )
}

export default Home
