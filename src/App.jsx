import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import RutaAccesible from './components/RutaAccesible'
import SaltarAlContenido from './components/SaltarAlContenido'
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
      {/* Primer elemento enfocable de la página */}
      <SaltarAlContenido />
      <SmoothScroll />
      <RutaAccesible />
      <Navbar />

      {/* Único <main> de la aplicación: lo reciben las páginas como contenido */}
      <main id="contenido" tabIndex={-1}>
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

          {/* Empresas */}
          <Route path="/portal" element={<Portal />} />
          <Route path="/empresas/domicilios" element={<Servicio clave="empresas-domicilios" />} />
          <Route path="/empresas/alquiler" element={<Servicio clave="empresas-alquiler" />} />

          {/* Cualquier otra ruta */}
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App
