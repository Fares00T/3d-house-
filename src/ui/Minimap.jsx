import { useEffect, useMemo, useRef } from 'react'
import { WALLS, wallPieces, ROOMS } from '../plan.js'
import { pose, teleport, setState, getState, useStore } from '../store.js'

// The developer's plan, redrawn live: black walls, hatched terrace,
// yellow room tags, and you as a navy dot with a view cone.
const VB = [-190, -190, 1150, 1030]

export default function Minimap() {
  const marker = useRef()
  const svg = useRef()
  const room = useStore((s) => s.room)

  const walls = useMemo(() => WALLS.flatMap(wallPieces).filter((p) => p.bottom === 0 && p.top >= 270), [])
  const glazing = useMemo(
    () =>
      WALLS.flatMap((w) =>
        (w.openings || [])
          .filter((o) => o.top < 236 && o.top > 205)
          .map((o) => (w.axis === 'y' ? { x: w.x0, y: o.from, w: w.x1 - w.x0, h: o.to - o.from } : { x: o.from, y: w.y0, w: o.to - o.from, h: w.y1 - w.y0 }))
      ),
    []
  )

  useEffect(() => {
    let raf
    const tick = () => {
      if (marker.current) {
        const deg = (-pose.yaw * 180) / Math.PI
        marker.current.setAttribute('transform', `translate(${pose.x * 100} ${pose.z * 100}) rotate(${deg})`)
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  const onClick = (e) => {
    const r = svg.current.getBoundingClientRect()
    const x = VB[0] + ((e.clientX - r.left) / r.width) * VB[2]
    const y = VB[1] + ((e.clientY - r.top) / r.height) * VB[3]
    const target = ROOMS.find((rm) => rm.rects.some(([a, b, c, d]) => x > a && x < c && y > b && y < d))
    if (!target) return
    if (getState().mode !== 'walk') setState({ mode: 'walk', caption: null })
    teleport(x / 100, y / 100, pose.yaw, pose.pitch)
  }

  return (
    <svg ref={svg} className="minimap" viewBox={VB.join(' ')} onClick={onClick} role="img" aria-label="Floor plan. Click a room to jump there.">
      <defs>
        <pattern id="terraceGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#f2f1ec" />
          <path d="M30 0H0V30" fill="none" stroke="#b9b7b0" strokeWidth="2" />
        </pattern>
      </defs>
      {ROOMS.filter((r) => r.id === 'terrace').flatMap((r) =>
        r.rects.map(([a, b, c, d], i) => <rect key={'t' + i} x={a} y={b} width={c - a} height={d - b} fill="url(#terraceGrid)" />)
      )}
      {ROOMS.filter((r) => r.id !== 'terrace').flatMap((r) =>
        r.rects.map(([a, b, c, d], i) => (
          <rect key={r.id + i} x={a} y={b} width={c - a} height={d - b} className={'mm-room' + (r.id === room ? ' is-here' : '')} />
        ))
      )}
      <path d="M-172 -172H300M-172 -172V525" stroke="#1b2440" strokeWidth="4" fill="none" />
      {walls.map((p, i) => (
        <rect key={i} x={p.x0} y={p.y0} width={p.x1 - p.x0} height={p.y1 - p.y0} fill="#1b2440" />
      ))}
      {glazing.map((g, i) => (
        <rect key={'g' + i} x={g.x} y={g.y} width={g.w} height={g.h} fill="#fff" stroke="#1b2440" strokeWidth="4" />
      ))}
      {ROOMS.filter((r) => r.id !== 'terrace').map((r) => (
        <g key={r.id} transform={`translate(${r.tag[0]} ${r.tag[1]})`} className="mm-tag">
          <rect x="-58" y="-26" width="116" height="52" />
          <text textAnchor="middle" dy="13">
            {r.code}
          </text>
        </g>
      ))}
      <g ref={marker}>
        <path d="M0 0 L-70 -150 A165 165 0 0 1 70 -150 Z" fill="rgba(31,46,82,0.22)" />
        <circle r="26" fill="#1f2e52" stroke="#fff" strokeWidth="9" />
      </g>
    </svg>
  )
}
