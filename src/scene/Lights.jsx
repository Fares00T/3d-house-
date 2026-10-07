import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useStore } from '../store.js'
import { M, applyTimeOfDay } from '../lib/materials.js'
import { Downlight } from './Decor.jsx'

// Sun from the south-west (left/top of the sheet), late afternoon.
const SUN_DIR = new THREE.Vector3(-0.66, 0.5, -0.56).normalize()
const TARGET = new THREE.Vector3(3.8, 0, 3.2)

const DOWNLIGHTS = [
  [1.0, 0.75], [2.3, 0.75], [1.0, 1.95], [2.3, 1.95], [1.6, 3.3], [1.6, 4.4], [0.6, 3.2], [4.4, 4.6],
  [4.3, 0.55], [4.3, 1.5], [4.3, 2.55],
  [4.72, 5.9], [5.9, 6.6], [6.2, 7.55], [5.0, 7.3],
  [8.81, 6.0], [0.5, 7.4], [3.3, 7.4],
]

// Warm interior fill: [x, y, z, dayIntensity, nightIntensity, distance]
const POINTS = [
  [1.8, 2.35, 1.2, 0.6, 7, 7],
  [3.0, 1.6, 3.95, 0.4, 6, 6],
  [4.3, 2.35, 1.5, 0.6, 5, 5],
  [4.6, 2.35, 4.2, 0.6, 4.5, 5],
  [5.9, 2.35, 6.9, 0.8, 5.5, 6],
  [8.0, 1.98, 6.62, 1.0, 6, 5],
  [1.95, 2.05, 6.6, 0.6, 5, 6],
  [0.9, 0.95, 5.45, 0, 1.6, 3],
  [3.0, 0.95, 5.45, 0, 1.6, 3],
  [3.1, 0.95, 2.42, 0, 1.4, 3],
  [-0.6, 2.0, 2.65, 0, 2.5, 6],
]

export default function Lights() {
  const time = useStore((s) => s.time)
  const quality = useStore((s) => s.quality)
  const mode = useStore((s) => s.mode)
  const { gl, scene } = useThree()
  const night = time === 'night'

  // Image-based fill from a neutral studio room
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    // reflective surfaces get their own env map so they stay bright
    for (const m of [M.mirror, M.chrome, M.glass, M.blackGlass, M.steel]) {
      m.envMap = env
      m.needsUpdate = true
    }
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  useEffect(() => {
    applyTimeOfDay(time)
    M.mirror.envMapIntensity = 1.0 * (night ? 0.35 : 1)
    M.chrome.envMapIntensity = 0.9 * (night ? 0.4 : 1)
    M.glass.envMapIntensity = night ? 0.12 : 0.32
    M.glass.opacity = night ? 0.3 : 0.1
    M.glass.color.set(night ? '#0d1424' : '#dce9e8')
    M.blackGlass.envMapIntensity = 0.8 * (night ? 0.3 : 1)
    M.steel.envMapIntensity = 0.7 * (night ? 0.4 : 1)
    scene.environmentIntensity = night ? 0.06 : 0.42
    scene.fog = new THREE.Fog(night ? '#0b1222' : '#d4dde6', 40, 170)
    scene.background = night ? new THREE.Color('#0b1222') : null
  }, [time, night, scene])

  // The flat is static, so the sun's shadow map only re-renders when something changes
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    const id = setTimeout(() => (gl.shadowMap.needsUpdate = true), 400)
    return () => clearTimeout(id)
  }, [gl, time, quality, mode])

  const sunPos = useMemo(() => TARGET.clone().add(SUN_DIR.clone().multiplyScalar(30)), [])
  const target = useMemo(() => {
    const o = new THREE.Object3D()
    o.position.copy(TARGET)
    return o
  }, [])
  const mapSize = quality === 'high' ? 4096 : 2048

  return (
    <>
      <primitive object={target} />
      {!night && (
        <Sky distance={4500} sunPosition={SUN_DIR.toArray()} turbidity={5} rayleigh={1.4} mieCoefficient={0.004} mieDirectionalG={0.8} />
      )}
      {night && <Stars radius={180} depth={40} count={2500} factor={5} fade speed={0} />}
      <directionalLight
        key={mapSize}
        position={sunPos}
        target={target}
        color={night ? '#9fb4ff' : '#fff0d9'}
        intensity={night ? 0.12 : 3.4}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-8.5}
        shadow-camera-right={8.5}
        shadow-camera-top={8.5}
        shadow-camera-bottom={-8.5}
        shadow-camera-near={10}
        shadow-camera-far={55}
        shadow-radius={quality === 'high' ? 3 : 2}
        shadow-bias={-0.00025}
        shadow-normalBias={0.025}
      />
      <hemisphereLight args={[night ? '#1c2747' : '#dfe8f4', night ? '#0d0b09' : '#a18a70', night ? 0.08 : 0.75]} />
      {POINTS.map(([x, y, z, d, n, dist], i) => (
        <pointLight key={i} position={[x, y, z]} color="#ffd6a3" intensity={night ? n : d} distance={dist} decay={2} />
      ))}
      <group visible={mode !== 'overview'}>
        {DOWNLIGHTS.map(([x, z], i) => (
          <Downlight key={i} p={[x, 2.7, z]} />
        ))}
      </group>
    </>
  )
}
