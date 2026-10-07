import * as THREE from 'three'
import { useMemo } from 'react'
import { useStore } from '../store.js'
import { M } from '../lib/materials.js'
import { B, Cyl, Rod } from '../lib/geo.jsx'
import { Plant } from './Decor.jsx'
import { rng } from '../lib/textures.js'

const TERRACE_TOP = -0.03
const GROUND = -3.3

export function Terrace() {
  const slab = 0.25
  const y = TERRACE_TOP - slab / 2
  const glass = (a, b, key, h = 1.05) => {
    const dx = b[0] - a[0]
    const dz = b[1] - a[1]
    const len = Math.hypot(dx, dz)
    const rot = Math.atan2(-dz, dx)
    return (
      <group key={key} position={[(a[0] + b[0]) / 2, TERRACE_TOP, (a[1] + b[1]) / 2]} rotation={[0, rot, 0]} userData={{ collider: true }}>
        <mesh position={[0, h / 2 + 0.04, 0]} material={M.glass}>
          <boxGeometry args={[len, h - 0.06, 0.014]} />
        </mesh>
        <B s={[len + 0.03, 0.035, 0.05]} p={[0, h + 0.02, 0]} m={M.steel} />
        <B s={[len, 0.06, 0.07]} p={[0, 0.03, 0]} m={M.frame} />
      </group>
    )
  }
  return (
    <group>
      <B s={[4.72, slab, 1.47]} p={[(-1.72 + 3.0) / 2, y, (-1.72 - 0.25) / 2]} m={M.stone} tile={1.2} world userData={{ floor: true }} />
      <B s={[1.47, slab, 5.5]} p={[(-1.72 - 0.25) / 2, y, (-0.25 + 5.25) / 2]} m={M.stone} tile={1.2} world userData={{ floor: true }} />
      {/* slab edge band */}
      <B s={[4.76, 0.3, 0.02]} p={[0.64, TERRACE_TOP - 0.15, -1.73]} m={M.render} />
      <B s={[0.02, 0.3, 7.0]} p={[-1.73, TERRACE_TOP - 0.15, 1.75]} m={M.render} />
      {glass([-1.68, -1.68], [3.0, -1.68], 'n')}
      {glass([-1.68, -1.68], [-1.68, 5.23], 'w')}
      {glass([-1.68, 5.23], [-0.25, 5.23], 's')}
      {/* frosted privacy screen to the neighbour's terrace */}
      <group position={[2.98, TERRACE_TOP, -0.98]} userData={{ collider: true }}>
        <mesh position={[0, 0.95, 0]} material={M.frosted}>
          <boxGeometry args={[0.02, 1.8, 1.46]} />
        </mesh>
        <B s={[0.05, 1.86, 0.05]} p={[0, 0.93, 0.71]} m={M.frame} />
        <B s={[0.05, 1.86, 0.05]} p={[0, 0.93, -0.71]} m={M.frame} />
        <B s={[0.05, 0.05, 1.48]} p={[0, 1.86, 0]} m={M.frame} />
      </group>
      {/* planters with grasses along the glass */}
      {[[-1.42, 0.4], [-1.42, 3.8], [1.9, -1.42]].map(([x, z], i) => (
        <group key={i} position={[x, TERRACE_TOP, z]} userData={{ collider: true }}>
          <B s={i === 2 ? [1.1, 0.42, 0.38] : [0.38, 0.42, 1.1]} p={[0, 0.21, 0]} m={M.frame} />
          <B s={i === 2 ? [1.04, 0.02, 0.32] : [0.32, 0.02, 1.04]} p={[0, 0.4, 0]} m={M.soil} />
          {[-0.33, 0, 0.33].map((o, j) => (
            <Plant key={j} kind="grass" p={i === 2 ? [o, 0.3, 0] : [0, 0.3, o]} scale={1.15} pot="black" seed={40 + i * 3 + j} />
          ))}
        </group>
      ))}
      <TerraceLounge />
    </group>
  )
}

// Two teak loungers and a side table on the west terrace.
function TerraceLounge() {
  const teak = M.walnutMatte
  const chair = (z, key) => (
    <group key={key} position={[-0.95, TERRACE_TOP, z]} rotation={[0, Math.PI / 2, 0]} userData={{ collider: true }}>
      {[-0.27, 0.27].map((x) => (
        <group key={x}>
          <Rod a={[x, 0, 0.3]} b={[x, 0.4, 0.28]} r={0.022} m={teak} />
          <Rod a={[x, 0, -0.3]} b={[x, 0.75, -0.42]} r={0.022} m={teak} />
          <Rod a={[x, 0.55, 0.28]} b={[x, 0.55, -0.32]} r={0.02} m={teak} />
        </group>
      ))}
      <B s={[0.58, 0.1, 0.56]} p={[0, 0.4, 0]} m={M.linen} />
      <B s={[0.58, 0.52, 0.1]} p={[0, 0.66, -0.3]} r={[-0.3, 0, 0]} m={M.linen} />
      <B s={[0.36, 0.3, 0.1]} p={[0, 0.62, -0.18]} r={[-0.3, 0, 0]} m={M.mustardFabric} />
    </group>
  )
  return (
    <group>
      {chair(2.75, 'a')}
      {chair(4.25, 'b')}
      <group position={[-0.95, TERRACE_TOP, 3.5]} userData={{ collider: true }}>
        <Cyl r={0.24} h={0.03} p={[0, 0.48, 0]} m={teak} seg={32} />
        <Cyl r={0.025} h={0.47} p={[0, 0.24, 0]} m={M.frame} />
        <Cyl r={0.18} h={0.02} p={[0, 0.01, 0]} m={M.frame} />
      </group>
    </group>
  )
}

// Wall lamps either side of the terrace door.
export function TerraceLights() {
  return [[-0.27, 2.05, 1.25], [-0.27, 2.05, 4.05]].map((p, i) => (
    <group key={i} position={p}>
      <B s={[0.05, 0.22, 0.1]} p={[0, 0, 0]} m={M.blackMetal} />
      <B s={[0.002, 0.16, 0.06]} p={[-0.026, 0, 0]} m={M.led} shadow={false} />
    </group>
  ))
}

// Rest of the building: neighbouring flats, the floor above and the floor below.
export function Building() {
  const mode = useStore((s) => s.mode)
  const mats = useMemo(() => [M.facade, M.facade, M.roof, M.roof, M.facade, M.facade], [])
  // [x0, z0, x1, z1, y0, y1]
  const base = [
    [-1.75, -1.75, 9.42, 8.26, GROUND, -0.28], // ground floor under this flat
    [-0.25, -0.25, 9.42, 8.26, -0.28, -0.005], // floor slab edge
  ]
  const context = [
    [9.42, -1.75, 16, 14, GROUND, -0.28],
    [-1.75, 8.26, 9.42, 14, GROUND, -0.28],
    [5.6, -0.25, 16, 4.98, -0.28, 2.94],
    [9.42, 4.98, 16, 8.26, -0.28, 2.94],
    [-0.25, 8.26, 16, 14, -0.28, 2.94],
    [-0.25, -0.25, 16, 14, 2.94, 8.9],
  ]
  const box = ([x0, z0, x1, z1, y0, y1], i) => (
    <B key={i} s={[x1 - x0, y1 - y0, z1 - z0]} p={[(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]} m={mats} tile={3.2} world shadow={false} />
  )
  return (
    <group>
      {base.map(box)}
      <group visible={mode !== 'overview'}>
        {context.map(box)}
        <B s={[16.3, 0.12, 14.3]} p={[7.85, 8.96, 6.88]} m={M.concrete} shadow={false} />
      </group>
    </group>
  )
}

function Tree({ p, s = 1, seed = 1 }) {
  const blobs = useMemo(() => {
    const rnd = rng(seed)
    const list = []
    const n = 4 + ((rnd() * 3) | 0)
    for (let i = 0; i < n; i++) {
      const g = new THREE.IcosahedronGeometry(1, 2)
      const pos = g.attributes.position
      for (let v = 0; v < pos.count; v++) {
        const k = 0.82 + rnd() * 0.3
        pos.setXYZ(v, pos.getX(v) * k, pos.getY(v) * k, pos.getZ(v) * k)
      }
      g.computeVertexNormals()
      const a = rnd() * Math.PI * 2
      const r = i === 0 ? 0 : 0.9 + rnd() * 0.7
      list.push({ g, p: [Math.cos(a) * r, 4.6 + rnd() * 1.8 - (i === 0 ? 0 : 0.6), Math.sin(a) * r], s: 1.3 + rnd() * 0.9, m: rnd() > 0.5 ? M.foliage : M.foliage2 })
    }
    return list
  }, [seed])
  return (
    <group position={p} scale={s}>
      <Cyl r={0.12} rb={0.2} h={4.6} p={[0, 2.3, 0]} m={M.bark} seg={10} />
      {blobs.map((b, i) => (
        <mesh key={i} geometry={b.g} position={b.p} scale={b.s} material={b.m} castShadow receiveShadow />
      ))}
    </group>
  )
}

const TREES = [
  [-8, -3, 1.1], [-12.5, 4, 1.3], [-9, 11, 1.0], [-15, -9, 1.4], [-4.5, -10.5, 1.0], [3, -9.5, 1.2],
  [9.5, -12, 1.3], [-21, 1, 1.5], [15, -8, 1.1], [-6.5, 17, 1.2], [-24, -14, 1.6], [-30, 8, 1.7],
  [6, -18, 1.4], [-16, 19, 1.3], [21, -15, 1.5], [-3, -20, 1.4],
]

export function Ground() {
  return (
    <group>
      <B s={[400, 0.02, 400]} p={[0, GROUND - 0.01, 0]} m={M.grass} tile={4} world shadow={false} />
      <B s={[22, 0.03, 20]} p={[7, GROUND + 0.005, 6]} m={M.paving} shadow={false} />
      <B s={[1.6, 0.03, 30]} p={[-5.5, GROUND + 0.005, 0]} m={M.paving} shadow={false} />
      {TREES.map(([x, z, s], i) => (
        <Tree key={i} p={[x, GROUND, z]} s={s} seed={i * 7 + 3} />
      ))}
      {/* hedge below the terrace */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-2.6, GROUND + 0.45, -1.5 + i * 0.9]} scale={[0.6, 0.55, 0.6]} material={M.foliage} castShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
      {/* distant blocks for context */}
      {[[-40, -30, 18, 14, 16], [-48, 15, 14, 20, 22], [25, -40, 22, 12, 12], [-20, -55, 30, 14, 18], [40, 10, 14, 30, 15]].map(
        ([x, z, w, d, h], i) => (
          <B key={i} s={[w, h, d]} p={[x, GROUND + h / 2, z]} m={M.facade} tile={3.2} world shadow={false} />
        )
      )}
    </group>
  )
}

