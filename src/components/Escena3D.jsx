import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { MathUtils } from 'three'
import Vehiculo3D from './Vehiculo3D'
import { CAPITULOS, ESTADO_INICIAL } from '../lib/capitulos'
import { estadoPorProgreso } from '../lib/interpolar'
import './Escena3D.css'

// Qué tan rápido el modelo alcanza su objetivo (mayor = más rápido).
const SUAVIZADO = 4.5
const SUAVIZADO_PUNTERO = 3

// Máxima inclinación del modelo hacia el cursor (radianes).
const INCLINACION_MAXIMA_X = 0.12
const INCLINACION_MAXIMA_Y = 0.25

// Cuánto sube el modelo completo al explosionar, para que no se hunda en el suelo.
const ELEVACION_EXPLOSION = 0.5

const ALTURA_CAMARA = 1.1
const ALTURA_MIRADA = 0.55
const FOV = 35
const TANGENTE_FOV = Math.tan(MathUtils.degToRad(FOV / 2))

/**
 * Entorno de reflejos construido con luces de estudio (Lightformer).
 * Es procedural: no descarga nada, así que la escena es idéntica con o sin
 * internet y la página no depende de ningún servidor externo.
 * La intensidad (1,25) está calibrada para que el brillo medio del modelo sea
 * el mismo que tenía con el entorno HDR "city" que se usaba antes.
 */
function EntornoLocal() {
  return (
    <Environment resolution={256} environmentIntensity={1.25}>
      <Lightformer form="rect" intensity={2.4} position={[0, 6, 0]} scale={[12, 12, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={3} position={[-6, 2, 5]} scale={[6, 4, 1]} />
      <Lightformer form="rect" intensity={2} position={[6, 3, -4]} scale={[5, 5, 1]} />
      <Lightformer form="ring" color="#2997ff" intensity={6} position={[-5, 1, -6]} scale={5} />
    </Environment>
  )
}

/**
 * Aplica al vehículo el estado que corresponde al progreso del scroll.
 * Todo ocurre dentro de useFrame, sin re-renders de React.
 */
function ModeloAnimado({ progresoRef, estatico, esMovil }) {
  const grupoRef = useRef(null)

  // Estado suavizado actual; lo lee Vehiculo3D (explode y giroRuedas).
  const estadoRef = useRef({ ...ESTADO_INICIAL.modelo })
  const inclinacionRef = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const grupo = grupoRef.current
    if (!grupo) return

    const { modelo: objetivo } = estadoPorProgreso(
      progresoRef.current,
      CAPITULOS,
      ESTADO_INICIAL,
      estatico,
    )

    // Con movimiento reducido el estado salta directo al objetivo.
    const actual = estadoRef.current
    for (const clave in objetivo) {
      actual[clave] = estatico
        ? objetivo[clave]
        : MathUtils.damp(actual[clave], objetivo[clave], SUAVIZADO, delta)
    }

    // Inclinación hacia el cursor, sumada a la animación del scroll.
    const inclinacion = inclinacionRef.current
    const puntero = estatico ? { x: 0, y: 0 } : state.pointer
    inclinacion.x = MathUtils.damp(
      inclinacion.x,
      -puntero.y * INCLINACION_MAXIMA_X,
      SUAVIZADO_PUNTERO,
      delta,
    )
    inclinacion.y = MathUtils.damp(
      inclinacion.y,
      puntero.x * INCLINACION_MAXIMA_Y,
      SUAVIZADO_PUNTERO,
      delta,
    )

    // En móvil el texto va abajo, así que el modelo se centra.
    grupo.position.set(
      esMovil ? 0 : actual.x,
      actual.explode * ELEVACION_EXPLOSION,
      0,
    )
    grupo.rotation.set(inclinacion.x, actual.rotationY + inclinacion.y, 0)
    grupo.scale.setScalar(actual.escala)

    // Cámara: en pantallas estrechas se aleja para que el modelo quepa.
    const aspecto = state.size.width / state.size.height
    const z = actual.camaraZ * Math.max(1, 0.9 / aspecto)
    const alturaVisible = 2 * TANGENTE_FOV * z

    // En móvil se mira un poco más abajo para subir el modelo sobre el texto.
    const mirarY = ALTURA_MIRADA - (esMovil ? alturaVisible * 0.16 : 0)

    state.camera.position.set(0, ALTURA_CAMARA, z)
    state.camera.lookAt(0, mirarY, 0)
  })

  return (
    <group ref={grupoRef}>
      <Vehiculo3D estadoRef={estadoRef} estatico={estatico} />
    </group>
  )
}

/**
 * Escena 3D a pantalla completa.
 *
 * @param progresoRef  ref con el progreso del scroll (0 a 1)
 * @param estatico     true con prefers-reduced-motion
 * @param esMovil      true en pantallas estrechas
 * @param visible      false cuando la sección está fuera de pantalla: se
 *                     deja de dibujar para ahorrar batería y GPU
 */
function Escena3D({ progresoRef, estatico, esMovil, visible }) {
  return (
    <Canvas
      className="escena3d"
      frameloop={visible ? 'always' : 'demand'}
      dpr={[1, 2]}
      camera={{ fov: FOV, position: [0, ALTURA_CAMARA, 10], near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      {/* Luces directas: aportan volumen; el entorno aporta los reflejos */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <directionalLight position={[-5, 3, -4]} intensity={2.2} color="#2997ff" />

      <EntornoLocal />

      <ModeloAnimado
        progresoRef={progresoRef}
        estatico={estatico}
        esMovil={esMovil}
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.55}
        scale={16}
        blur={2.6}
        far={4}
        resolution={512}
        color="#000000"
      />
    </Canvas>
  )
}

export default Escena3D
