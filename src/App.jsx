import * as THREE from 'three'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene.jsx'
import { Hud, Intro } from './ui/Hud.jsx'
import RoomPins from './ui/RoomPins.jsx'
import { useStore } from './store.js'

export default function App() {
  const quality = useStore((s) => s.quality)
  const mode = useStore((s) => s.mode)
  return (
    <>
      <div className={'stage mode-' + mode}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={quality === 'high' ? [1, 1.5] : [1, 1]}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          camera={{ fov: 68, near: 0.05, far: 5000, position: [0.45, 1.62, 1.4] }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <RoomPins />
      <Intro />
      <Hud />
    </>
  )
}
