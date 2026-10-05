import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { DoubleSide } from 'three'

/**
 * Patín eléctrico construido con primitivas de three.js.
 *
 * CÓMO REEMPLAZARLO POR UN MODELO .glb
 * ------------------------------------
 * 1. Copia el archivo a public/models/ (por ejemplo patin.glb).
 * 2. Carga el modelo con `const { nodes } = useGLTF('/models/patin.glb')`
 *    (import { useGLTF } from '@react-three/drei') y agrega
 *    `useGLTF.preload('/models/patin.glb')` al final del archivo.
 * 3. Conserva el componente <Pieza>: envuelve cada nodo del .glb con él
 *    (por ejemplo <Pieza ...><primitive object={nodes.Plataforma} /></Pieza>),
 *    con la misma posición de pivote y dirección de explosión.
 * 4. Mantén la misma interfaz de props (`estadoRef` y `estatico`): el resto
 *    de la escena no necesita cambios.
 *
 * Convención de ejes: el vehículo avanza hacia +X, el eje vertical es Y y el
 * ancho va en Z. Las ruedas tocan el suelo en y = 0.
 */

// ---------------------------------------------------------------------------
// Medidas
// ---------------------------------------------------------------------------

const ALTURA_EJE = 0.285
const EJE_DELANTERO = [1.05, ALTURA_EJE]
const EJE_TRASERO = [-1, ALTURA_EJE]

// La columna es una línea recta inclinada hacia atrás que pasa por el eje
// de la rueda delantera. Todas las piezas de la dirección se ubican sobre ella.
const INCLINACION_COLUMNA = Math.atan2(0.37, 1.095)
const LARGO_COLUMNA = Math.hypot(0.37, 1.095)
const DIRECCION_COLUMNA = [
  -Math.sin(INCLINACION_COLUMNA),
  Math.cos(INCLINACION_COLUMNA),
]
// Perpendicular a la columna, apuntando hacia adelante.
const FRENTE_COLUMNA = [
  Math.cos(INCLINACION_COLUMNA),
  Math.sin(INCLINACION_COLUMNA),
]

// Posición en el espacio de un punto a `distancia` del eje delantero, sobre la columna.
function puntoEnColumna(distancia) {
  return [
    EJE_DELANTERO[0] + DIRECCION_COLUMNA[0] * distancia,
    EJE_DELANTERO[1] + DIRECCION_COLUMNA[1] * distancia,
    0,
  ]
}

// Desplazamiento a lo largo de la columna, útil para ubicar piezas dentro de un grupo.
function sobreColumna(distancia) {
  return [DIRECCION_COLUMNA[0] * distancia, DIRECCION_COLUMNA[1] * distancia, 0]
}

const DISTANCIA_CABEZA = 0.46 // donde la horquilla se une con la columna
const DISTANCIA_MANUBRIO = LARGO_COLUMNA

// ---------------------------------------------------------------------------
// Materiales
// ---------------------------------------------------------------------------

const MATERIALES = {
  aluminio: { color: '#c3c8d0', metalness: 1, roughness: 0.25 },
  carcasa: { color: '#e6e9ee', metalness: 0.55, roughness: 0.32 },
  oscuro: { color: '#17191e', metalness: 0.6, roughness: 0.4 },
  goma: { color: '#0b0b0d', metalness: 0, roughness: 0.92 },
  neumatico: { color: '#0e0e10', metalness: 0, roughness: 0.85 },
  acento: { color: '#2997ff', metalness: 0.7, roughness: 0.3 },
  luzAzul: {
    color: '#0a1a2c',
    emissive: '#2997ff',
    emissiveIntensity: 4,
    toneMapped: false,
  },
  luzRoja: {
    color: '#2a0505',
    emissive: '#ff3b30',
    emissiveIntensity: 3.5,
    toneMapped: false,
  },
}

// ---------------------------------------------------------------------------
// Pieza: contenedor con pivote propio y dirección de explosión
// ---------------------------------------------------------------------------

const DISTANCIA_EXPLOSION = 1

/**
 * Cada pieza del vehículo vive en su propio <group>.
 *  - `posicion`: pivote de la pieza cuando está ensamblada.
 *  - `direccion`: hacia dónde se desplaza al explosionar (vector, en unidades).
 *  - `fase`: desfase para que cada pieza flote y rote a destiempo.
 *
 * Lee `estadoRef.current.explode` (0 a 1) en cada frame, sin re-renders.
 * Mientras está explosionada flota y rota despacio; ensamblada queda quieta.
 */
function Pieza({ posicion, direccion, estadoRef, estatico, fase = 0, children }) {
  const grupoRef = useRef(null)

  useFrame((state) => {
    const grupo = grupoRef.current
    if (!grupo) return

    const explode = estadoRef.current.explode
    const tiempo = state.clock.elapsedTime
    const flotar = estatico ? 0 : Math.sin(tiempo * 0.8 + fase) * 0.05 * explode

    grupo.position.set(
      posicion[0] + direccion[0] * explode * DISTANCIA_EXPLOSION,
      posicion[1] + direccion[1] * explode * DISTANCIA_EXPLOSION + flotar,
      posicion[2] + direccion[2] * explode * DISTANCIA_EXPLOSION,
    )

    if (!estatico) {
      grupo.rotation.y = Math.sin(tiempo * 0.45 + fase) * 0.55 * explode
      grupo.rotation.x = Math.sin(tiempo * 0.35 + fase * 1.7) * 0.12 * explode
    }
  })

  return (
    <group ref={grupoRef} position={posicion}>
      {children}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Rueda: neumático (toro), aro, rayos y buje
// ---------------------------------------------------------------------------

const ANGULOS_RAYOS = [0, 1, 2, 3, 4].map((i) => (i * Math.PI * 2) / 5)

function Rueda({ estadoRef }) {
  const giroRef = useRef(null)

  useFrame(() => {
    if (giroRef.current) {
      // Girar en sentido negativo en Z hace rodar la rueda hacia +X.
      giroRef.current.rotation.z = -estadoRef.current.giroRuedas
    }
  })

  return (
    <group ref={giroRef}>
      {/* Neumático */}
      <mesh>
        <torusGeometry args={[0.215, 0.07, 20, 56]} />
        <meshStandardMaterial {...MATERIALES.neumatico} />
      </mesh>

      {/* Aro */}
      <mesh>
        <torusGeometry args={[0.165, 0.017, 12, 48]} />
        <meshStandardMaterial {...MATERIALES.aluminio} />
      </mesh>

      {/* Rayos */}
      {ANGULOS_RAYOS.map((angulo) => (
        <group key={angulo} rotation={[0, 0, angulo]}>
          <mesh position={[0.11, 0, 0]}>
            <boxGeometry args={[0.12, 0.026, 0.05]} />
            <meshStandardMaterial {...MATERIALES.aluminio} />
          </mesh>
        </group>
      ))}

      {/* Buje */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.12, 24]} />
        <meshStandardMaterial {...MATERIALES.acento} />
      </mesh>

      {/* Eje */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.17, 16]} />
        <meshStandardMaterial {...MATERIALES.aluminio} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Guardabarros: un arco de cilindro abierto, visible por ambos lados
// ---------------------------------------------------------------------------

function ArcoGuardabarros({ radio = 0.31, ancho = 0.15, mitadArco }) {
  // El cilindro se acuesta (eje a lo largo de Z) y se recorta a un arco
  // centrado en la parte superior de la rueda.
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry
        args={[
          radio,
          radio,
          ancho,
          32,
          1,
          true,
          Math.PI - mitadArco,
          mitadArco * 2,
        ]}
      />
      <meshStandardMaterial {...MATERIALES.carcasa} side={DoubleSide} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Vehículo
// ---------------------------------------------------------------------------

/**
 * @param estadoRef  ref con { explode, giroRuedas }, actualizado en cada frame
 * @param estatico   true con prefers-reduced-motion (sin flotar ni rotar)
 */
function Vehiculo3D({ estadoRef, estatico = false }) {
  const comun = { estadoRef, estatico }

  const centroColumna = (DISTANCIA_CABEZA + DISTANCIA_MANUBRIO) / 2
  const largoTuboColumna = DISTANCIA_MANUBRIO - DISTANCIA_CABEZA
  const faroBase = puntoEnColumna(0.95)

  return (
    <group>
      {/* ------------------------------------------------------------ */}
      {/* Plataforma: base, agarre, luces laterales, cuello y soportes  */}
      {/* ------------------------------------------------------------ */}
      <Pieza {...comun} posicion={[0, 0.2, 0]} direccion={[0, 0.15, 0]} fase={0}>
        <RoundedBox args={[1.3, 0.1, 0.42]} radius={0.045} smoothness={4}>
          <meshStandardMaterial {...MATERIALES.carcasa} />
        </RoundedBox>

        {/* Cinta antideslizante */}
        <RoundedBox
          args={[1.1, 0.012, 0.34]}
          radius={0.006}
          smoothness={2}
          position={[0, 0.056, 0]}
        >
          <meshStandardMaterial {...MATERIALES.goma} />
        </RoundedBox>

        {/* Luces laterales */}
        {[-1, 1].map((lado) => (
          <mesh key={lado} position={[0, -0.012, lado * 0.2105]}>
            <boxGeometry args={[1.18, 0.012, 0.004]} />
            <meshStandardMaterial {...MATERIALES.luzAzul} />
          </mesh>
        ))}

        {/* Cuello que sube hasta la cabeza de la dirección */}
        <mesh position={[0.7615, 0.2705, 0]} rotation={[0, 0, -0.514]}>
          <cylinderGeometry args={[0.038, 0.05, 0.575, 20]} />
          <meshStandardMaterial {...MATERIALES.carcasa} />
        </mesh>

        {/* Soportes de la rueda trasera */}
        {[-1, 1].map((lado) => (
          <mesh
            key={lado}
            position={[-0.825, 0.0425, lado * 0.1]}
            rotation={[0, 0, -0.238]}
          >
            <boxGeometry args={[0.36, 0.03, 0.03]} />
            <meshStandardMaterial {...MATERIALES.oscuro} />
          </mesh>
        ))}
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Batería bajo la plataforma                                    */}
      {/* ------------------------------------------------------------ */}
      <Pieza {...comun} posicion={[0, 0.105, 0]} direccion={[0, -0.45, 0]} fase={1.3}>
        <RoundedBox args={[0.8, 0.06, 0.3]} radius={0.02} smoothness={3}>
          <meshStandardMaterial {...MATERIALES.oscuro} />
        </RoundedBox>
        <mesh>
          <boxGeometry args={[0.5, 0.008, 0.304]} />
          <meshStandardMaterial {...MATERIALES.luzAzul} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Rueda delantera                                               */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={[EJE_DELANTERO[0], EJE_DELANTERO[1], 0]}
        direccion={[1.1, 0.1, 0.8]}
        fase={2.1}
      >
        <Rueda estadoRef={estadoRef} />
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Rueda trasera                                                 */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={[EJE_TRASERO[0], EJE_TRASERO[1], 0]}
        direccion={[-1.1, 0.1, -0.8]}
        fase={3.4}
      >
        <Rueda estadoRef={estadoRef} />
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Guardabarros delantero                                        */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={[EJE_DELANTERO[0], EJE_DELANTERO[1], 0]}
        direccion={[0.5, 0.6, 0.5]}
        fase={4.2}
      >
        <ArcoGuardabarros mitadArco={1} />
        {/* Puente que lo une a la horquilla */}
        <mesh position={[-0.0735, 0.373, 0]} rotation={[0, 0, 0.862]}>
          <cylinderGeometry args={[0.01, 0.01, 0.194, 12]} />
          <meshStandardMaterial {...MATERIALES.oscuro} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Guardabarros trasero con luz de freno                         */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={[EJE_TRASERO[0], EJE_TRASERO[1], 0]}
        direccion={[-0.6, 0.6, -0.5]}
        fase={5.1}
      >
        <ArcoGuardabarros mitadArco={1.2} />
        <mesh position={[-0.3007, 0.1153, 0]} rotation={[0, 0, 2.775]}>
          <boxGeometry args={[0.025, 0.045, 0.1]} />
          <meshStandardMaterial {...MATERIALES.luzRoja} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Horquilla: dos brazos y una corona                            */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={puntoEnColumna(DISTANCIA_CABEZA / 2)}
        direccion={[0.7, 0.3, -0.7]}
        fase={0.7}
      >
        {[-1, 1].map((lado) => (
          <mesh
            key={lado}
            position={[0, 0, lado * 0.1]}
            rotation={[0, 0, INCLINACION_COLUMNA]}
          >
            <cylinderGeometry args={[0.022, 0.022, DISTANCIA_CABEZA, 16]} />
            <meshStandardMaterial {...MATERIALES.aluminio} />
          </mesh>
        ))}

        {/* Corona que une los dos brazos */}
        <mesh
          position={sobreColumna(DISTANCIA_CABEZA / 2)}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.032, 0.032, 0.22, 20]} />
          <meshStandardMaterial {...MATERIALES.oscuro} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Columna                                                       */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={puntoEnColumna(centroColumna)}
        direccion={[0.2, 0.6, -0.2]}
        fase={2.8}
      >
        <mesh rotation={[0, 0, INCLINACION_COLUMNA]}>
          <cylinderGeometry args={[0.026, 0.03, largoTuboColumna, 20]} />
          <meshStandardMaterial {...MATERIALES.aluminio} />
        </mesh>

        {/* Seguro de plegado */}
        <mesh
          position={sobreColumna(DISTANCIA_CABEZA + 0.06 - centroColumna)}
          rotation={[0, 0, INCLINACION_COLUMNA]}
        >
          <cylinderGeometry args={[0.042, 0.042, 0.07, 24]} />
          <meshStandardMaterial {...MATERIALES.acento} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Manubrio con puños, frenos y pantalla                         */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={puntoEnColumna(DISTANCIA_MANUBRIO)}
        direccion={[-0.1, 0.95, 0]}
        fase={1.9}
      >
        {/* Barra */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.56, 16]} />
          <meshStandardMaterial {...MATERIALES.oscuro} />
        </mesh>

        {/* Abrazadera central */}
        <mesh rotation={[0, 0, INCLINACION_COLUMNA]}>
          <cylinderGeometry args={[0.036, 0.036, 0.08, 20]} />
          <meshStandardMaterial {...MATERIALES.aluminio} />
        </mesh>

        {/* Puños y palancas de freno */}
        {[-1, 1].map((lado) => (
          <group key={lado}>
            <mesh position={[0, 0, lado * 0.255]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.11, 16]} />
              <meshStandardMaterial {...MATERIALES.goma} />
            </mesh>
            <mesh position={[0.05, -0.02, lado * 0.19]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.1, 0.012, 0.02]} />
              <meshStandardMaterial {...MATERIALES.aluminio} />
            </mesh>
          </group>
        ))}

        {/* Pantalla */}
        <RoundedBox
          args={[0.07, 0.025, 0.1]}
          radius={0.01}
          smoothness={3}
          position={[-0.01, 0.03, 0]}
        >
          <meshStandardMaterial {...MATERIALES.oscuro} />
        </RoundedBox>
        <mesh position={[-0.01, 0.0435, 0]}>
          <boxGeometry args={[0.05, 0.004, 0.07]} />
          <meshStandardMaterial {...MATERIALES.luzAzul} />
        </mesh>
      </Pieza>

      {/* ------------------------------------------------------------ */}
      {/* Luz delantera azul                                            */}
      {/* ------------------------------------------------------------ */}
      <Pieza
        {...comun}
        posicion={[
          faroBase[0] + FRENTE_COLUMNA[0] * 0.055,
          faroBase[1] + FRENTE_COLUMNA[1] * 0.055,
          0,
        ]}
        direccion={[0.9, 0.55, 0.4]}
        fase={4.8}
      >
        <group rotation={[0, 0, INCLINACION_COLUMNA]}>
          <RoundedBox args={[0.07, 0.11, 0.14]} radius={0.025} smoothness={4}>
            <meshStandardMaterial {...MATERIALES.oscuro} />
          </RoundedBox>
          <mesh position={[0.036, 0, 0]}>
            <boxGeometry args={[0.012, 0.07, 0.11]} />
            <meshStandardMaterial {...MATERIALES.luzAzul} />
          </mesh>
        </group>
      </Pieza>
    </group>
  )
}

export default Vehiculo3D
