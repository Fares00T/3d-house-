import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Lathe, Sph, mergeBoxes, mergeTransformed, deg } from '../lib/geo.jsx'
import { rng } from '../lib/textures.js'

const BOOK_COLS = ['#efe9dc', '#1f2e52', '#a33a2a', '#c8962e', '#5f6a6e', '#f6f3ec', '#2a2a2a', '#6b7d5c', '#d9b8a6', '#7a1a28', '#e7dcc4', '#3e5a8a']

// A row of books along local +x, spines facing local +z. Origin = left end, shelf top.
export function Books({ length = 0.6, maxH = 0.28, depth = 0.2, seed = 1, p, r, fill = 0.85, stacks = true }) {
  const geo = useMemo(() => {
    const rnd = rng(seed * 97 + 13)
    const items = []
    let x = 0
    const end = length * fill
    while (x < end) {
      if (stacks && rnd() < 0.08 && end - x > 0.22) {
        // horizontal stack
        let y = 0
        const n = 2 + ((rnd() * 3) | 0)
        const w = 0.16 + rnd() * 0.05
        for (let i = 0; i < n; i++) {
          const h = 0.025 + rnd() * 0.02
          items.push({ s: [w, h, depth * (0.8 + rnd() * 0.2)], p: [x + w / 2 + (rnd() - 0.5) * 0.01, y + h / 2, 0], r: [0, (rnd() - 0.5) * 0.15, 0], c: BOOK_COLS[(rnd() * BOOK_COLS.length) | 0] })
          y += h
        }
        x += w + 0.02
        continue
      }
      const w = 0.018 + rnd() * 0.03
      const h = Math.min(maxH, 0.15 + rnd() * 0.13)
      const d = depth * (0.75 + rnd() * 0.25)
      const lean = rnd() < 0.05 && x > 0.05 ? -0.22 : 0
      items.push({ s: [w, h, d], p: [x + w / 2 + (lean ? h * 0.1 : 0), h / 2, 0], r: [0, 0, lean], c: BOOK_COLS[(rnd() * BOOK_COLS.length) | 0] })
      x += w + 0.002
      if (rnd() < 0.06) x += 0.05 + rnd() * 0.08
    }
    return mergeBoxes(items)
  }, [length, maxH, depth, seed, fill, stacks])
  return <mesh geometry={geo} material={M.bookVC} position={p} rotation={r} castShadow receiveShadow />
}

// Vases and small ceramics
export function Vase({ kind = 'bottle', p, m = M.ceramicMatte, s = 1 }) {
  const profiles = {
    bottle: [[0, 0], [0.05, 0], [0.065, 0.04], [0.07, 0.11], [0.05, 0.16], [0.018, 0.2], [0.02, 0.24], [0.0, 0.24]],
    jar: [[0, 0], [0.06, 0], [0.075, 0.03], [0.078, 0.09], [0.06, 0.12], [0.045, 0.125], [0, 0.125]],
    bowl: [[0, 0], [0.04, 0], [0.09, 0.03], [0.12, 0.07], [0.115, 0.072], [0.085, 0.035], [0, 0.02]],
    tall: [[0, 0], [0.045, 0], [0.06, 0.08], [0.05, 0.25], [0.035, 0.34], [0.04, 0.36], [0, 0.36]],
    cup: [[0, 0], [0.035, 0], [0.04, 0.07], [0.036, 0.072], [0.03, 0.01], [0, 0.01]],
  }
  return <Lathe pts={profiles[kind]} m={m} p={p} scale={[s, s, s]} seg={28} />
}

// Leaves fanned out by golden angle, merged into one mesh per plant.
function leafGeometry(len, wid) {
  const sh = new THREE.Shape()
  sh.moveTo(0, 0)
  sh.bezierCurveTo(wid, len * 0.25, wid * 0.9, len * 0.75, 0, len)
  sh.bezierCurveTo(-wid * 0.9, len * 0.75, -wid, len * 0.25, 0, 0)
  const g = new THREE.ShapeGeometry(sh, 6)
  // cup the leaf a little
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, (x * x) / (wid * 2.5) - Math.sin((y / len) * Math.PI) * len * 0.08)
  }
  g.computeVertexNormals()
  return g
}

export function Plant({ kind = 'fig', p, scale = 1, pot = 'terracotta', seed = 3 }) {
  const { leaves, stems } = useMemo(() => {
    const rnd = rng(seed)
    const list = []
    const stemList = []
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    if (kind === 'fig') {
      // fiddle-leaf fig: a trunk with big leaves up top
      const lg = leafGeometry(0.26, 0.11)
      for (let i = 0; i < 46; i++) {
        const t = i / 46
        const a = i * 2.39996
        const h = 0.55 + t * 1.05
        const rad = 0.05 + Math.sin(t * Math.PI) * 0.16 + rnd() * 0.05
        e.set(deg(-55 - rnd() * 40), a, deg((rnd() - 0.5) * 30), 'YXZ')
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(Math.cos(a) * rad * 0.4, h, Math.sin(a) * rad * 0.4), q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + rnd() * 0.5))
        list.push([lg, m.clone()])
      }
      stemList.push([0.012, 1.4])
    } else if (kind === 'snake') {
      for (let i = 0; i < 14; i++) {
        const a = rnd() * Math.PI * 2
        const len = 0.45 + rnd() * 0.45
        const lg = leafGeometry(len, 0.035)
        e.set(deg(-8 - rnd() * 14), a, 0, 'YXZ')
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(Math.cos(a) * 0.05, 0.02, Math.sin(a) * 0.05), q, new THREE.Vector3(1, 1, 1))
        list.push([lg, m.clone()])
      }
    } else if (kind === 'bush') {
      const lg = leafGeometry(0.14, 0.06)
      for (let i = 0; i < 90; i++) {
        const a = i * 2.39996
        const t = rnd()
        e.set(deg(-30 - rnd() * 60), a + rnd(), 0, 'YXZ')
        q.setFromEuler(e)
        const rad = 0.05 + t * 0.2
        m.compose(new THREE.Vector3(Math.cos(a) * rad, 0.05 + rnd() * 0.35, Math.sin(a) * rad), q, new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + rnd() * 0.6))
        list.push([lg, m.clone()])
      }
    } else if (kind === 'grass') {
      for (let i = 0; i < 40; i++) {
        const a = rnd() * Math.PI * 2
        const len = 0.4 + rnd() * 0.5
        const lg = leafGeometry(len, 0.012)
        e.set(deg(-10 - rnd() * 30), a, 0, 'YXZ')
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(Math.cos(a) * 0.08 * rnd(), 0, Math.sin(a) * 0.08 * rnd()), q, new THREE.Vector3(1, 1, 1))
        list.push([lg, m.clone()])
      }
    } else if (kind === 'trailing') {
      const lg = leafGeometry(0.06, 0.035)
      for (let s = 0; s < 7; s++) {
        const a = (s / 7) * Math.PI * 2 + rnd()
        const n = 8 + ((rnd() * 10) | 0)
        for (let i = 0; i < n; i++) {
          const t = i / n
          const out = 0.06 + t * 0.12
          e.set(deg(-60 + rnd() * 120), rnd() * 6.28, 0, 'YXZ')
          q.setFromEuler(e)
          m.compose(new THREE.Vector3(Math.cos(a) * out, 0.06 - t * t * 0.5, Math.sin(a) * out), q, new THREE.Vector3(1, 1, 1))
          list.push([lg, m.clone()])
        }
      }
    }
    return { leaves: mergeTransformed(list), stems: stemList }
  }, [kind, seed])

  const potMat = pot === 'terracotta' ? M.terracotta : pot === 'white' ? M.ceramicMatte : pot === 'grey' ? M.potGrey : M.black
  const potProfiles = {
    fig: [[0, 0], [0.13, 0], [0.17, 0.34], [0.175, 0.36], [0, 0.36]],
    snake: [[0, 0], [0.09, 0], [0.11, 0.24], [0.115, 0.25], [0, 0.25]],
    bush: [[0, 0], [0.12, 0], [0.15, 0.22], [0, 0.22]],
    grass: [[0, 0], [0.1, 0], [0.12, 0.18], [0, 0.18]],
    trailing: [[0, 0], [0.07, 0], [0.09, 0.14], [0, 0.14]],
  }
  const pp = potProfiles[kind]
  const potH = pp[pp.length - 1][1]
  const leafMat = kind === 'grass' ? M.leafLight : kind === 'snake' ? M.leafDark : M.leaf
  return (
    <group position={p} scale={scale}>
      <Lathe pts={pp} m={potMat} seg={28} />
      <Cyl r={pp[pp.length - 2][0] - 0.012} h={0.01} p={[0, potH - 0.025, 0]} m={M.soil} />
      {stems.map(([r, h], i) => (
        <Cyl key={i} r={r} rb={r * 1.4} h={h} p={[0, potH + h / 2 - 0.05, 0]} m={M.bark} />
      ))}
      <mesh geometry={leaves} material={leafMat} position={[0, potH - 0.03, 0]} castShadow receiveShadow />
    </group>
  )
}

// Recessed ceiling downlight
export function Downlight({ p }) {
  return (
    <group position={p}>
      <Cyl r={0.045} h={0.006} p={[0, -0.003, 0]} m={M.satin} shadow={false} />
      <Cyl r={0.032} h={0.004} p={[0, -0.006, 0]} m={M.spotGlow} shadow={false} />
    </group>
  )
}

// Pendant with a black dome shade
export function DomePendant({ p, drop = 0.9, r = 0.2 }) {
  return (
    <group position={p}>
      <Cyl r={0.004} h={drop} p={[0, -drop / 2, 0]} m={M.black} shadow={false} />
      <Cyl r={0.045} h={0.02} p={[0, -0.01, 0]} m={M.black} shadow={false} />
      <mesh position={[0, -drop, 0]} material={M.blackMetal} castShadow>
        <sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, -drop - 0.001, 0]} rotation={[Math.PI, 0, 0]}>
        <circleGeometry args={[r * 0.97, 32]} />
        <meshStandardMaterial color="#f7e6c8" emissive="#ffd9a0" emissiveIntensity={1.4} side={THREE.DoubleSide} />
      </mesh>
      <Sph r={0.05} p={[0, -drop - 0.03, 0]} m={M.bulb} castShadow={false} />
    </group>
  )
}

// Table lamp: ceramic base + linen drum shade
export function TableLamp({ p, base = M.ceramicMatte, h = 0.42 }) {
  return (
    <group position={p}>
      <Lathe pts={[[0, 0], [0.07, 0], [0.085, 0.06], [0.08, 0.16], [0.03, 0.22], [0.015, 0.24], [0, 0.24]]} m={base} />
      <Cyl r={0.006} h={h - 0.24} p={[0, 0.24 + (h - 0.24) / 2, 0]} m={M.brass} />
      <Cyl r={0.15} rb={0.17} h={0.2} p={[0, h + 0.02, 0]} m={M.shade} open seg={40} />
      <Sph r={0.03} p={[0, h - 0.02, 0]} m={M.bulb} />
    </group>
  )
}

export function FloorLamp({ p }) {
  return (
    <group position={p}>
      <Cyl r={0.14} rb={0.15} h={0.025} p={[0, 0.0125, 0]} m={M.blackMetal} />
      <Cyl r={0.011} h={1.45} p={[0, 0.75, 0]} m={M.blackMetal} />
      <Cyl r={0.17} rb={0.22} h={0.28} p={[0, 1.5, 0]} m={M.shade} open seg={40} />
      <Sph r={0.035} p={[0, 1.45, 0]} m={M.bulb} />
    </group>
  )
}

// Framed print hung on a wall; faces local +z.
export function Frame({ w, h, p, r, m, border = 0.025, frameMat = M.black, mat = true }) {
  return (
    <group position={p} rotation={r}>
      <B s={[w, h, 0.025]} p={[0, 0, 0.0125]} m={frameMat} />
      {mat && <B s={[w - border * 2, h - border * 2, 0.004]} p={[0, 0, 0.026]} m={M.satin} shadow={false} />}
      <mesh position={[0, 0, 0.0285]}>
        <planeGeometry args={[w - border * 2 - (mat ? 0.06 : 0), h - border * 2 - (mat ? 0.06 : 0)]} />
        <primitive object={m} attach="material" />
      </mesh>
    </group>
  )
}

// Rolled towel, used on shelves
export function TowelRoll({ p, m = M.towelWhite, r = 0.045, l = 0.26 }) {
  return <Cyl r={r} h={l} p={p} rot={[0, 0, Math.PI / 2]} m={m} seg={16} />
}

export function Throw({ p, r }) {
  return (
    <group position={p} rotation={r}>
      <RoundedBox args={[0.55, 0.025, 0.62]} radius={0.01} smoothness={2} material={M.plaid} castShadow receiveShadow />
      <RoundedBox args={[0.025, 0.36, 0.6]} radius={0.01} smoothness={2} position={[0.28, -0.17, 0]} rotation={[0, 0, -0.08]} material={M.plaid} castShadow receiveShadow />
    </group>
  )
}
