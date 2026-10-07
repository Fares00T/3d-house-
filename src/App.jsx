import * as THREE from 'three'
import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene.jsx'
import { Hud, Intro } from './ui/Hud.jsx'
import RoomPins from './ui/RoomPins.jsx'
import { useStore, setState } from './store.js'

// three.js needs WebGL 2, which a few old phones and locked-down browsers lack.
const hasWebGL2 = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
})()

function Notice({ title, children }) {
  return (
    <div className="notice" role="alert">
      <div className="notice__card">
        <span className="tag tag--lg">A9</span>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const quality = useStore((s) => s.quality)
  const mode = useStore((s) => s.mode)
  const [lost, setLost] = useState(false)

  if (!hasWebGL2)
    return (
      <Notice title="This browser can't show the 3D tour">
        <p>The walkthrough needs WebGL 2. Open the link in an up-to-date Chrome, Safari or Firefox, or try a computer.</p>
      </Notice>
    )

  if (lost)
    return (
      <Notice title="The 3D view stopped">
        <p>This device ran out of graphics memory. Reload to try again in fast mode, which uses much less.</p>
        <button
          className="btn btn--primary"
          onClick={() => {
            try {
              sessionStorage.setItem('a9-fast', '1')
            } catch {
              /* private mode: reload still helps */
            }
            location.reload()
          }}
        >
          Reload in fast mode
        </button>
      </Notice>
    )

  return (
    <>
      <div className={'stage mode-' + mode}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={quality === 'high' ? [1, 1.5] : [1, 1]}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
          camera={{ fov: 68, near: 0.05, far: 5000, position: [0.45, 1.62, 1.4] }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              setState({ quality: 'low' })
              setLost(true)
            })
          }}
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
