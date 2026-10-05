import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import SmoothScroll from './components/SmoothScroll'
import Home from './pages/Home'
import Portal from './pages/Portal'

function App() {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portal" element={<Portal />} />
      </Routes>
    </>
  )
}

export default App
