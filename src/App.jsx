import * as THREE from 'three'
import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene.jsx'
import { Hud, Intro } from './ui/Hud.jsx'
import RoomPins from './ui/RoomPins.jsx'
import { useStore, setState, isMobile } from './store.js'

// three.js needs WebGL 2. 'none' usually means the browser has switched 3D off
// (Chrome does this after the graphics chip crashes a few times), 'webgl1'
// means the phone's graphics chip is too old. The test context is released
// straight away so it doesn't count against the phone's context limit.
const detected = (() => {
  const grab = (type) => {
    try {
      return document.createElement('canvas').getContext(type)
    } catch {
      return null
    }
  }
  const release = (gl) => gl?.getExtension('WEBGL_lose_context')?.loseContext()
  const gl2 = grab('webgl2')
  if (gl2) {
    release(gl2)
    return 'webgl2'
  }
  const gl1 = grab('webgl') || grab('experimental-webgl')
  release(gl1)
  return gl1 ? 'webgl1' : 'none'
})()
// dev only: preview the notices with ?gl=none or ?gl=webgl1
const webgl = (import.meta.env.DEV && new URLSearchParams(location.search).get('gl')) || detected

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

  if (webgl === 'none')
    return (
      <Notice title="3D is switched off in this browser">
        <p>
          Chrome turns 3D off after a page overloads the phone&rsquo;s graphics chip. Reloading won&rsquo;t bring it back, but
          restarting Chrome will.
        </p>
        <ol className="notice__steps">
          <li>Open your recent apps and swipe Chrome away to close it completely.</li>
          <li>Turn off Battery saver if it&rsquo;s on.</li>
          <li>Open Chrome again and reopen this link. The tour now starts in a lighter mode made for phones.</li>
        </ol>
        <p className="notice__small">
          Still stuck? Type <code>chrome://gpu</code> in the address bar and check the line that says WebGL2.
        </p>
        <button className="btn btn--primary" onClick={() => location.reload()}>
          Try again
        </button>
      </Notice>
    )

  if (webgl === 'webgl1')
    return (
      <Notice title="This phone's graphics chip is too old for the 3D tour">
        <p>The walkthrough needs WebGL 2, which this device doesn&rsquo;t support. Try opening the link on a newer phone or a computer.</p>
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
          dpr={quality === 'high' ? [1, isMobile ? 1.25 : 1.5] : [1, 1]}
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
