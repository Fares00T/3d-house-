import * as THREE from 'three'
import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene.jsx'
import { Hud, Intro } from './ui/Hud.jsx'
import RoomPins from './ui/RoomPins.jsx'
import { useStore, setState, isMobile } from './store.js'

// three.js needs WebGL 2. 'none' usually means the browser has switched 3D off
// or blocks this graphics chip; 'webgl1' means the chip or its driver can't do
// WebGL 2. Test contexts are released straight away so they don't count
// against the phone's context limit.
const probe = (() => {
  const info = { webgl2: false, webgl1: false, gpu: 'unknown' }
  const grab = (type) => {
    try {
      return document.createElement('canvas').getContext(type)
    } catch {
      return null
    }
  }
  const describe = (gl) => {
    try {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      return (ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER)
    } catch {
      return 'unknown'
    }
  }
  const release = (gl) => gl?.getExtension('WEBGL_lose_context')?.loseContext()
  const gl2 = grab('webgl2')
  if (gl2) {
    Object.assign(info, { webgl2: true, webgl1: true, gpu: describe(gl2) })
    release(gl2)
    return info
  }
  const gl1 = grab('webgl') || grab('experimental-webgl')
  if (gl1) {
    Object.assign(info, { webgl1: true, gpu: describe(gl1) })
    release(gl1)
  }
  return info
})()
const detected = probe.webgl2 ? 'webgl2' : probe.webgl1 ? 'webgl1' : 'none'
// dev only: preview the notices with ?gl=none or ?gl=webgl1
const webgl = (import.meta.env.DEV && new URLSearchParams(location.search).get('gl')) || detected

// What the device reports, so a screenshot of the notice is enough to diagnose it.
function DeviceDetails() {
  const [hints, setHints] = useState(null)
  useEffect(() => {
    navigator.userAgentData
      ?.getHighEntropyValues?.(['model', 'platformVersion'])
      .then(setHints)
      .catch(() => {})
  }, [])
  const ua = navigator.userAgent
  const chrome = ua.match(/(?:Chrome|CriOS)\/(\d+)/)?.[1]
  const androidUA = ua.match(/Android ([\d.]+)/)?.[1]
  const android = androidUA ? hints?.platformVersion || androidUA : null
  const ios = ua.match(/OS (\d+[_\d]*) like Mac/)?.[1]?.replace(/_/g, '.')
  const emulator = /sdk_gphone|Android SDK built for|Emulator/i.test((hints?.model || '') + ' ' + probe.gpu) || /SwiftShader/i.test(probe.gpu)
  const rows = [
    ['WebGL 2', probe.webgl2 ? 'available' : 'not available'],
    ['WebGL 1', probe.webgl1 ? 'available' : 'not available'],
    ['Graphics chip', probe.gpu],
    ['Browser', chrome ? 'Chrome ' + chrome : ua.split(' ').slice(-1)[0]],
    ['System', android ? 'Android ' + android : ios ? 'iOS ' + ios : navigator.platform || 'unknown'],
    ['Phone', hints?.model || 'unknown'],
    ...(emulator ? [['Note', 'This looks like an Android emulator. Turn on hardware graphics in its settings, or use a real phone.']] : []),
  ]
  return (
    <dl className="notice__details">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

const FlagSteps = () => (
  <ol className="notice__steps">
    <li>Close Chrome completely (swipe it away in recent apps) and turn off Battery saver.</li>
    <li>
      If that didn&rsquo;t help, type <code>chrome://flags</code> in the address bar, search for{' '}
      <strong>Override software rendering list</strong>, set it to <strong>Enabled</strong> and tap <strong>Relaunch</strong>.
    </li>
    <li>Open this link again.</li>
  </ol>
)

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
        <p>Chrome has turned off 3D graphics on this phone, either after a crash or because it blocks this graphics chip.</p>
        <FlagSteps />
        <p className="notice__small">Still seeing this page? Send a screenshot of the details below.</p>
        <DeviceDetails />
        <button className="btn btn--primary" onClick={() => location.reload()}>
          Try again
        </button>
      </Notice>
    )

  if (webgl === 'webgl1')
    return (
      <Notice title="This phone can't run the 3D tour yet">
        <p>
          The tour needs WebGL 2. This phone only offers the older WebGL 1, either because its graphics chip is too old or because
          Chrome blocks WebGL 2 on it.
        </p>
        <FlagSteps />
        <p className="notice__small">If it still shows this page, the chip can&rsquo;t do it: try a newer phone or a computer. A screenshot of the details below helps.</p>
        <DeviceDetails />
        <button className="btn btn--primary" onClick={() => location.reload()}>
          Try again
        </button>
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
