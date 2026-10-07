import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useStore, setState, teleport } from '../store.js'
import { ROOMS } from '../plan.js'
import { camRef } from '../scene/Controls.jsx'

const yawTo = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z))

// Room labels in the dollhouse, projected from 3D onto the page each frame.
export default function RoomPins() {
  const mode = useStore((s) => s.mode)
  const refs = useRef([])

  useEffect(() => {
    if (mode !== 'overview') return
    const v = new THREE.Vector3()
    let raf
    const tick = () => {
      const cam = camRef.current
      if (cam) {
        const w = window.innerWidth
        const h = window.innerHeight
        ROOMS.forEach((r, i) => {
          const el = refs.current[i]
          if (!el) return
          v.set(r.tag[0] / 100, 0.4, r.tag[1] / 100).project(cam)
          const hidden = v.z > 1
          el.style.visibility = hidden ? 'hidden' : 'visible'
          el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`
        })
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [mode])

  if (mode !== 'overview') return null
  return (
    <div className="pins">
      {ROOMS.map((r, i) => (
        <button
          key={r.id}
          ref={(el) => (refs.current[i] = el)}
          className="room-pin"
          style={{ visibility: 'hidden' }}
          onClick={() => {
            const [x, z] = [r.view.p[0] / 100, r.view.p[1] / 100]
            setState({ mode: 'walk' })
            teleport(x, z, yawTo(x, z, r.view.look[0] / 100, r.view.look[1] / 100))
          }}
        >
          {r.id !== 'terrace' && <span className="room-pin__code">{r.code}</span>}
          <span className="room-pin__name">{r.name}</span>
        </button>
      ))}
    </div>
  )
}
