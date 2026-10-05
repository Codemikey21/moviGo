import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import SmoothScroll from './components/SmoothScroll'
import Categoria from './pages/Categoria'
import Home from './pages/Home'
import NoEncontrado from './pages/NoEncontrado'
import Portal from './pages/Portal'
import Producto from './pages/Producto'
import Servicio from './pages/Servicio'
import Tienda from './pages/Tienda'

function App() {
  return (
    <>
      <SmoothScroll />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Tienda */}
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/tienda/:categoria" element={<Categoria />} />
        <Route path="/tienda/:categoria/:producto" element={<Producto />} />

        {/* Servicios y ayuda */}
        <Route path="/servicios/domicilios" element={<Servicio clave="domicilios" />} />
        <Route path="/servicios/alquiler" element={<Servicio clave="alquiler" />} />
        <Route path="/servicios/mantenimiento" element={<Servicio clave="mantenimiento" />} />
        <Route path="/puntos-de-servicio" element={<Servicio clave="puntos-de-servicio" />} />
        <Route path="/soporte" element={<Servicio clave="soporte" />} />

        <Route path="/portal" element={<Portal />} />

        {/* Cualquier otra ruta */}
        <Route path="*" element={<NoEncontrado />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
