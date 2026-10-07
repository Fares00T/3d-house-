import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Lathe, Rod, Sph, deg } from '../lib/geo.jsx'
import { Books, Vase, Plant, DomePendant, TableLamp, FloorLamp, Frame, Throw } from './Decor.jsx'

// ------------------------------------------------------------------ navy storage wall
// Full-height navy cabinet block with an open walnut niche, backing the sofa.
// World footprint x 3.45–3.85, z 0–2.20; faces west (−x).
function NavyWall() {
  const x0 = 3.45
  const d = 0.4
  const w = 2.2
  const nb = 0.86
  const nt = 1.74
  const H = 2.7
  const cz = w / 2
  const cx = x0 + d / 2
  const nd = 0.3 // niche depth
  const bays = [0, w / 3, (2 * w) / 3, w]
  return (
    <group>
      <group userData={{ collider: true }}>
        <B s={[d, nb, w]} p={[cx, nb / 2, cz]} m={M.navy} />
      </group>
      <B s={[d, H - nt, w]} p={[cx, (nt + H) / 2, cz]} m={M.navy} />
      <B s={[d, nt - nb, 0.04]} p={[cx, (nb + nt) / 2, 0.02]} m={M.navy} />
      <B s={[d, nt - nb, 0.04]} p={[cx, (nb + nt) / 2, w - 0.02]} m={M.navy} />
      {/* niche lining in walnut */}
      <B s={[d - nd, nt - nb, w]} p={[x0 + nd + (d - nd) / 2, (nb + nt) / 2, cz]} m={M.navy} />
      <B s={[0.006, nt - nb, w - 0.08]} p={[x0 + nd - 0.003, (nb + nt) / 2, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - 0.08]} p={[x0 + nd / 2, nb + 0.0125, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - 0.08]} p={[x0 + nd / 2, nt - 0.0125, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - 0.08]} p={[x0 + nd / 2, (nb + nt) / 2, cz]} m={M.walnut} tile={0.8} />
      {bays.slice(1, -1).map((z, i) => (
        <B key={i} s={[nd, nt - nb, 0.025]} p={[x0 + nd / 2, (nb + nt) / 2, z]} m={M.walnut} tile={0.8} />
      ))}
      {/* door reveals on the navy faces */}
      {bays.slice(1, -1).map((z, i) => (
        <group key={'s' + i}>
          <B s={[0.004, H - nt - 0.01, 0.004]} p={[x0 - 0.001, (nt + H) / 2, z]} m={M.seam} shadow={false} />
          <B s={[0.004, nb - 0.02, 0.004]} p={[x0 - 0.001, nb / 2, z]} m={M.seam} shadow={false} />
        </group>
      ))}
      {/* shelf contents, spines facing west */}
      <group position={[x0 + 0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Books p={[0.06, nb + 0.025, 0.12]} length={0.6} seed={1} maxH={0.4} depth={0.2} />
        <Books p={[0.8, (nb + nt) / 2 + 0.0125, 0.12]} length={0.6} seed={2} maxH={0.4} depth={0.2} fill={0.55} />
        <Books p={[1.52, nb + 0.025, 0.12]} length={0.6} seed={3} maxH={0.4} depth={0.2} fill={0.5} />
        <Books p={[1.55, (nb + nt) / 2 + 0.0125, 0.12]} length={0.6} seed={4} maxH={0.4} depth={0.2} fill={0.75} />
      </group>
      <Vase kind="jar" p={[x0 + 0.15, (nb + nt) / 2 + 0.0125, 0.25]} m={M.ceramic} />
      <Vase kind="bottle" p={[x0 + 0.15, nb + 0.025, 1.12]} m={M.ceramicMatte} />
      <Vase kind="cup" p={[x0 + 0.15, nb + 0.025, 1.3]} m={M.ceramic} s={1.3} />
      <Vase kind="bowl" p={[x0 + 0.15, (nb + nt) / 2 + 0.0125, 1.25]} m={M.ceramicMatte} s={0.8} />
      {/* kitchen side: a slim walnut shelf with jars */}
      <B s={[0.18, 0.025, 1.4]} p={[3.85 + 0.09, 1.42, 1.25]} m={M.walnut} tile={0.8} />
      {[0.7, 0.86, 1.02, 1.5, 1.66].map((z, i) => (
        <Vase key={i} kind={i % 2 ? 'jar' : 'cup'} p={[3.94, 1.4325, z]} m={i % 2 ? M.ceramicMatte : M.ceramic} s={i % 2 ? 0.8 : 1.4} />
      ))}
    </group>
  )
}

// ------------------------------------------------------------------ sofa
function Sofa({ p, rotY }) {
  const L = 1.96
  const D = 0.88
  const legs = [
    [-L / 2 + 0.09, D / 2 - 0.09],
    [L / 2 - 0.09, D / 2 - 0.09],
    [-L / 2 + 0.09, -D / 2 + 0.09],
    [L / 2 - 0.09, -D / 2 + 0.09],
  ]
  return (
    <group position={p} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      {legs.map(([x, z], i) => (
        <Rod key={i} a={[x * 1.02, 0, z * 1.04]} b={[x, 0.19, z]} r={0.024} rb={0.014} m={M.walnut} />
      ))}
      <RoundedBox args={[L, 0.2, D]} radius={0.04} smoothness={3} position={[0, 0.29, 0]} material={M.sofa} castShadow receiveShadow />
      {[-0.42, 0.42].map((x) => (
        <RoundedBox key={x} args={[0.83, 0.13, D - 0.24]} radius={0.05} smoothness={3} position={[x, 0.45, 0.09]} material={M.sofa} castShadow receiveShadow />
      ))}
      <RoundedBox args={[L - 0.04, 0.42, 0.2]} radius={0.06} smoothness={3} position={[0, 0.58, -D / 2 + 0.1]} material={M.sofa} castShadow receiveShadow />
      {[-0.42, 0.42].map((x) => (
        <group key={'b' + x} position={[x, 0.67, -D / 2 + 0.25]} rotation={[-0.16, 0, 0]}>
          <RoundedBox args={[0.82, 0.36, 0.13]} radius={0.055} smoothness={3} material={M.sofa} castShadow receiveShadow />
          {[-0.27, -0.09, 0.09, 0.27].map((bx) =>
            [0.07, -0.07].map((by, j) => (
              <Sph key={bx + '' + j} r={0.011} p={[bx, by, 0.066]} m={M.sofaButton} />
            ))
          )}
        </group>
      ))}
      {[-L / 2 + 0.07, L / 2 - 0.07].map((x) => (
        <RoundedBox key={'a' + x} args={[0.14, 0.24, D]} radius={0.05} smoothness={3} position={[x, 0.5, 0]} material={M.sofa} castShadow receiveShadow />
      ))}
      {/* seat tufting */}
      {[-0.42, 0.42].map((x) =>
        [-0.25, 0, 0.25].map((bx) => <Sph key={x + 's' + bx} r={0.01} p={[x + bx, 0.517, 0.12]} m={M.sofaButton} />)
      )}
      <Throw p={[L / 2 - 0.28, 0.53, 0.06]} r={[0, 0.06, 0]} />
    </group>
  )
}

// ------------------------------------------------------------------ coffee table
function CoffeeTable({ p, rotY = 0 }) {
  const { top, legs } = useMemo(() => {
    const R = 0.36
    const sh = new THREE.Shape()
    const N = 96
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2
      const r = R * (1 + 0.14 * Math.cos(3 * t))
      const x = r * Math.cos(t) * 1.28
      const y = r * Math.sin(t)
      i === 0 ? sh.moveTo(x, y) : sh.lineTo(x, y)
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.028, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 3, curveSegments: 8 })
    g.rotateX(-Math.PI / 2)
    const lg = [0, 2.094, 4.189].map((t) => {
      const r = R * 0.72
      return [Math.cos(t) * r * 1.28, -Math.sin(t) * r]
    })
    return { top: g, legs: lg }
  }, [])
  return (
    <group position={p} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      <mesh geometry={top} material={M.walnut} position={[0, 0.4, 0]} castShadow receiveShadow />
      {legs.map(([x, z], i) => (
        <Rod key={i} a={[x * 1.18, 0, z * 1.18]} b={[x, 0.405, z]} r={0.02} rb={0.012} m={M.walnut} />
      ))}
      <Vase kind="jar" p={[0.12, 0.434, 0.04]} m={M.ceramic} s={1.1} />
      <Vase kind="cup" p={[-0.06, 0.434, 0.1]} m={M.ceramicMatte} s={1.2} />
    </group>
  )
}

function Pouf({ p }) {
  return (
    <group position={p} userData={{ collider: true }}>
      <Lathe
        pts={[[0, 0], [0.29, 0], [0.32, 0.02], [0.335, 0.08], [0.34, 0.19], [0.335, 0.3], [0.32, 0.355], [0.29, 0.375], [0, 0.38]]}
        m={M.navyFabric}
        seg={40}
      />
    </group>
  )
}

// Red upholstered shell lounge chair (faces local +z)
function LoungeChair({ p, rotY }) {
  return (
    <group position={p} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      <group position={[0, 0.66, 0]} rotation={[0.42, 0, 0]} scale={[1, 0.78, 0.95]}>
        <mesh material={M.redShell} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 48, 24, 0, Math.PI * 2, 1.15, Math.PI - 1.15]} />
        </mesh>
      </group>
      <mesh position={[0, 0.39, 0.04]} scale={[1, 0.3, 0.9]} material={M.redFabric} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 16]} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <Rod key={i} a={[sx * 0.27, 0, sz * 0.27]} b={[sx * 0.1, 0.36, sz * 0.1]} r={0.009} m={M.blackMetal} />
      ))}
    </group>
  )
}

// Red wire-mesh chair on a sled base (faces local +z)
function WireChair({ p, rotY }) {
  const w = 0.5
  const seatY = 0.42
  const sd = 0.44
  const rods = [
    // seat outline
    [[-w / 2, seatY, sd / 2], [w / 2, seatY, sd / 2]],
    [[-w / 2, seatY, sd / 2], [-w / 2, seatY - 0.02, -sd / 2]],
    [[w / 2, seatY, sd / 2], [w / 2, seatY - 0.02, -sd / 2]],
    // back
    [[-w / 2, seatY - 0.02, -sd / 2], [-w / 2 - 0.02, seatY + 0.42, -sd / 2 - 0.13]],
    [[w / 2, seatY - 0.02, -sd / 2], [w / 2 + 0.02, seatY + 0.42, -sd / 2 - 0.13]],
    [[-w / 2 - 0.02, seatY + 0.42, -sd / 2 - 0.13], [w / 2 + 0.02, seatY + 0.42, -sd / 2 - 0.13]],
    // sled base
    [[-w / 2 + 0.03, 0.01, sd / 2], [-w / 2 + 0.03, 0.01, -sd / 2 + 0.02]],
    [[w / 2 - 0.03, 0.01, sd / 2], [w / 2 - 0.03, 0.01, -sd / 2 + 0.02]],
    [[-w / 2 + 0.03, 0.01, sd / 2], [-w / 2 + 0.02, seatY, sd / 2 - 0.04]],
    [[w / 2 - 0.03, 0.01, sd / 2], [w / 2 - 0.02, seatY, sd / 2 - 0.04]],
    [[-w / 2 + 0.03, 0.01, -sd / 2 + 0.02], [-w / 2 + 0.02, seatY - 0.02, -sd / 2 + 0.02]],
    [[w / 2 - 0.03, 0.01, -sd / 2 + 0.02], [w / 2 - 0.02, seatY - 0.02, -sd / 2 + 0.02]],
  ]
  const backTilt = Math.atan2(0.13, 0.44)
  return (
    <group position={p} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      {rods.map(([a, b], i) => (
        <Rod key={i} a={a} b={b} r={0.009} m={M.redPowder} />
      ))}
      <mesh position={[0, seatY - 0.01, 0]} rotation={[-Math.PI / 2 - 0.045, 0, 0]} material={M.wire} castShadow>
        <planeGeometry args={[w, sd]} />
      </mesh>
      <mesh position={[0, seatY + 0.2, -sd / 2 - 0.065]} rotation={[-backTilt, 0, 0]} material={M.wire} castShadow>
        <planeGeometry args={[w + 0.02, 0.45]} />
      </mesh>
    </group>
  )
}

// ------------------------------------------------------------------ dining
function DiningChair({ p, rotY }) {
  const legs = [[-0.19, 0.17], [0.19, 0.17], [-0.19, -0.17], [0.19, -0.17]]
  const arc = [-0.16, -0.08, 0, 0.08, 0.16]
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      {legs.map(([x, z], i) => (
        <Rod key={i} a={[x * 1.08, 0, z * 1.1]} b={[x, 0.44, z]} r={0.018} rb={0.012} m={M.walnut} />
      ))}
      <RoundedBox args={[0.45, 0.06, 0.43]} radius={0.022} smoothness={3} position={[0, 0.47, 0.01]} material={M.charcoalFabric} castShadow receiveShadow />
      {[-0.19, 0.19].map((x) => (
        <Rod key={x} a={[x, 0.44, -0.17]} b={[x * 1.02, 0.8, -0.215]} r={0.014} m={M.walnut} />
      ))}
      {arc.map((x, i) => (
        <B key={i} s={[0.085, 0.12, 0.022]} p={[x, 0.76, -0.225 + Math.abs(x) * Math.abs(x) * 1.6]} r={[0, -x * 2.2, 0]} m={M.walnut} />
      ))}
    </group>
  )
}

function DiningSet({ p }) {
  const [x, , z] = p
  return (
    <group>
      <group position={p} userData={{ collider: true }}>
        <RoundedBox args={[1.4, 0.034, 0.82]} radius={0.012} smoothness={2} position={[0, 0.745, 0]} material={M.walnut} castShadow receiveShadow />
        <B s={[1.2, 0.06, 0.02]} p={[0, 0.7, 0.33]} m={M.walnut} />
        <B s={[1.2, 0.06, 0.02]} p={[0, 0.7, -0.33]} m={M.walnut} />
        {[[-0.6, 0.32], [0.6, 0.32], [-0.6, -0.32], [0.6, -0.32]].map(([lx, lz], i) => (
          <Rod key={i} a={[lx * 1.05, 0, lz * 1.08]} b={[lx, 0.73, lz]} r={0.026} rb={0.016} m={M.walnut} />
        ))}
        {/* table styling */}
        <Vase kind="tall" p={[-0.12, 0.762, -0.04]} m={M.ceramicMatte} />
        {[[-0.1, 0.02], [-0.14, -0.06], [-0.11, -0.03]].map(([bx, bz], i) => (
          <Rod key={'br' + i} a={[-0.12, 1.08, -0.04]} b={[-0.12 + bx * 2.5 + i * 0.07, 1.55 - i * 0.08, -0.04 + bz * 3]} r={0.004} m={M.bark} />
        ))}
        <Vase kind="bowl" p={[0.25, 0.762, 0.05]} m={M.ceramic} />
        <Sph r={0.035} p={[0.23, 0.8, 0.05]} m={M.redPowder} />
        <Sph r={0.033} p={[0.28, 0.8, 0.03]} m={M.mustardFabric} />
      </group>
      <group userData={{ collider: true }}>
        <DiningChair p={[x - 0.35, 0, z - 0.62]} rotY={0} />
        <DiningChair p={[x + 0.35, 0, z - 0.62]} rotY={0} />
        <DiningChair p={[x - 0.35, 0, z + 0.62]} rotY={Math.PI} />
        <DiningChair p={[x + 0.35, 0, z + 0.62]} rotY={Math.PI} />
      </group>
      <DomePendant p={[x, 2.7, z]} drop={1.0} r={0.21} />
    </group>
  )
}

// ------------------------------------------------------------------ bookshelf
// Walnut cabinets flanking navy open shelving, on the bedroom partition wall.
function Bookshelf({ p }) {
  const D = 0.38
  const H = 2.7
  const shelves = [0.08, 0.44, 0.8, 1.16, 1.52, 1.88, 2.24]
  const cab = (cx, key) => (
    <group key={key}>
      <B s={[0.6, H, D]} p={[cx, H / 2, D / 2]} m={M.walnut} tile={0.8} />
      {[0.68, 1.36, 2.04].map((y) => (
        <B key={y} s={[0.6, 0.004, 0.004]} p={[cx, y, D + 0.001]} m={M.seam} shadow={false} />
      ))}
    </group>
  )
  return (
    <group position={p} rotation={[0, Math.PI, 0]} userData={{ collider: true }}>
      {cab(-0.75, 'a')}
      {cab(0.75, 'b')}
      <B s={[0.9, H, 0.02]} p={[0, H / 2, 0.01]} m={M.navy} />
      {shelves.map((y) => (
        <B key={y} s={[0.9, 0.025, D - 0.02]} p={[0, y, D / 2 + 0.01]} m={M.navy} />
      ))}
      <B s={[0.9, 0.08, D - 0.03]} p={[0, 0.04, D / 2]} m={M.navyDeep} />
      <B s={[0.9, H - 2.6, D]} p={[0, (2.6 + H) / 2, D / 2]} m={M.navy} />
      {/* contents */}
      <Books p={[-0.44, 0.0925, 0.2]} length={0.88} seed={11} maxH={0.33} depth={0.24} fill={0.92} />
      <Books p={[-0.44, 0.4525, 0.2]} length={0.88} seed={12} maxH={0.33} depth={0.24} fill={0.6} />
      <Vase kind="bottle" p={[0.32, 0.4525, 0.2]} m={M.ceramic} />
      <Books p={[-0.44, 0.8125, 0.2]} length={0.88} seed={13} maxH={0.33} depth={0.24} fill={0.45} />
      <Vase kind="jar" p={[0.24, 0.8125, 0.2]} m={M.terracotta} />
      <Books p={[0.0, 1.1725, 0.2]} length={0.44} seed={14} maxH={0.33} depth={0.24} fill={0.9} />
      <Plant kind="trailing" p={[-0.25, 1.1725, 0.19]} scale={1.1} pot="white" seed={8} />
      <Books p={[-0.44, 1.5325, 0.2]} length={0.88} seed={15} maxH={0.33} depth={0.24} fill={0.8} />
      <Vase kind="tall" p={[-0.22, 1.8925, 0.2]} m={M.ceramicMatte} s={0.8} />
      <Books p={[-0.05, 1.8925, 0.2]} length={0.5} seed={16} maxH={0.33} depth={0.24} fill={0.8} />
      <B s={[0.36, 0.22, 0.28]} p={[-0.2, 2.255 + 0.11, 0.2]} m={M.linenGrey} />
      <B s={[0.36, 0.22, 0.28]} p={[0.2, 2.255 + 0.11, 0.2]} m={M.linenGrey} />
    </group>
  )
}

// ------------------------------------------------------------------ kitchen
// Built in a local frame running north→south along the east wall:
// local x = world z, local z = distance out from the wall (front faces −x).
function Front({ x0, x1, y0, y1, z, m = M.graphite, handle }) {
  const g = 0.0035
  const w = x1 - x0 - g * 2
  const h = y1 - y0 - g * 2
  return (
    <group>
      <B s={[w, h, 0.019]} p={[(x0 + x1) / 2, (y0 + y1) / 2, z + 0.0095]} m={m} />
      {handle === 'h' && <B s={[Math.min(0.32, w * 0.6), 0.012, 0.02]} p={[(x0 + x1) / 2, y1 - 0.05, z + 0.03]} m={M.blackMetal} />}
      {handle === 'vl' && <B s={[0.012, 0.22, 0.02]} p={[x0 + 0.04, y1 - 0.16, z + 0.03]} m={M.blackMetal} />}
      {handle === 'vr' && <B s={[0.012, 0.22, 0.02]} p={[x1 - 0.04, y1 - 0.16, z + 0.03]} m={M.blackMetal} />}
      {handle === 'vlb' && <B s={[0.012, 0.22, 0.02]} p={[x0 + 0.04, y0 + 0.16, z + 0.03]} m={M.blackMetal} />}
      {handle === 'vrb' && <B s={[0.012, 0.22, 0.02]} p={[x1 - 0.04, y0 + 0.16, z + 0.03]} m={M.blackMetal} />}
    </group>
  )
}

function Faucet({ p }) {
  return (
    <group position={p}>
      <Cyl r={0.025} h={0.04} p={[0, 0.02, 0]} m={M.blackMetal} />
      <Cyl r={0.013} h={0.3} p={[0, 0.18, 0]} m={M.blackMetal} />
      <mesh position={[0, 0.33, 0.09]} rotation={[0, Math.PI / 2, 0]} material={M.blackMetal} castShadow>
        <torusGeometry args={[0.09, 0.013, 10, 24, Math.PI]} />
      </mesh>
      <Cyl r={0.014} h={0.06} p={[0, 0.3, 0.18]} m={M.blackMetal} />
      <B s={[0.012, 0.012, 0.07]} p={[0.03, 0.08, 0]} r={[0.4, 0, 0]} m={M.blackMetal} />
    </group>
  )
}

function Kitchen() {
  const D = 0.6
  const top = 0.9
  return (
    <group position={[5.35, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <group userData={{ collider: true }}>
        {/* carcasses */}
        <B s={[0.6, 2.7, D - 0.02]} p={[0.3, 1.35, (D - 0.02) / 2]} m={M.carcass} />
        <B s={[1.93, 0.76, D - 0.02]} p={[0.6 + 1.93 / 2, 0.1 + 0.38, (D - 0.02) / 2]} m={M.carcass} />
        <B s={[1.93, 0.1, D - 0.07]} p={[0.6 + 1.93 / 2, 0.05, (D - 0.07) / 2]} m={M.black} />
      </group>
      {/* tall unit: drawers, oven, microwave, top door */}
      <Front x0={0} x1={0.6} y0={0.1} y1={0.48} z={D - 0.02} handle="h" />
      <Front x0={0} x1={0.6} y0={0.48} y1={0.8} z={D - 0.02} handle="h" />
      <B s={[0.594, 0.6, 0.02]} p={[0.3, 1.12, D]} m={M.blackGlass} />
      <B s={[0.5, 0.012, 0.025]} p={[0.3, 1.36, D + 0.025]} m={M.steel} />
      <B s={[0.46, 0.36, 0.006]} p={[0.3, 1.08, D + 0.011]} m={M.carcass} shadow={false} />
      <B s={[0.594, 0.38, 0.02]} p={[0.3, 1.63, D]} m={M.blackGlass} />
      <B s={[0.12, 0.03, 0.004]} p={[0.46, 1.78, D + 0.012]} m={M.led} shadow={false} />
      <Front x0={0} x1={0.6} y0={1.83} y1={2.7} z={D - 0.02} handle="vrb" />
      {/* base fronts */}
      <Front x0={0.6} x1={1.2} y0={0.1} y1={0.36} z={D - 0.02} handle="h" />
      <Front x0={0.6} x1={1.2} y0={0.36} y1={0.62} z={D - 0.02} handle="h" />
      <Front x0={0.6} x1={1.2} y0={0.62} y1={0.86} z={D - 0.02} handle="h" />
      <Front x0={1.2} x1={1.8} y0={0.1} y1={0.86} z={D - 0.02} handle="h" />
      <Front x0={1.8} x1={2.165} y0={0.1} y1={0.86} z={D - 0.02} handle="vr" />
      <Front x0={2.165} x1={2.53} y0={0.1} y1={0.86} z={D - 0.02} handle="vl" />
      {/* worktop */}
      <B s={[1.95, 0.04, D + 0.02]} p={[0.6 + 1.95 / 2 - 0.01, top - 0.02, (D + 0.02) / 2]} m={M.walnut} tile={0.8} />
      {/* hob */}
      <B s={[0.58, 0.006, 0.5]} p={[0.9, top + 0.003, 0.31]} m={M.hob} />
      {/* sink */}
      <group position={[2.17, top, 0.31]}>
        <B s={[0.5, 0.004, 0.42]} p={[0, 0.002, 0]} m={M.steel} />
        <B s={[0.44, 0.004, 0.36]} p={[0, 0.0045, 0]} m={M.brushed} />
        <B s={[0.4, 0.002, 0.32]} p={[0, 0.0065, 0]} m={M.carcass} />
        <Cyl r={0.03} h={0.003} p={[0, 0.008, 0]} m={M.steel} />
      </group>
      <Faucet p={[2.17, top, 0.07]} />
      {/* backsplash */}
      <B s={[1.93, 0.55, 0.014]} p={[0.6 + 1.93 / 2, top + 0.275, 0.007]} m={M.walnut} tile={0.8} />
      {/* upper cabinets */}
      <B s={[1.93, 0.85, 0.33]} p={[0.6 + 1.93 / 2, 1.45 + 0.425, 0.165]} m={M.carcass} />
      <Front x0={0.6} x1={1.2} y0={1.48} y1={2.3} z={0.33} handle="vlb" />
      <Front x0={1.2} x1={1.865} y0={1.45} y1={2.3} z={0.33} handle="vrb" />
      <Front x0={1.865} x1={2.53} y0={1.45} y1={2.3} z={0.33} handle="vlb" />
      <B s={[0.594, 0.03, 0.36]} p={[0.9, 1.465, 0.18]} m={M.steel} />
      <B s={[1.93, 0.4, 0.33]} p={[0.6 + 1.93 / 2, 2.5, 0.165]} m={M.graphite} />
      {[1.2, 1.865].map((x) => (
        <B key={x} s={[0.004, 0.39, 0.004]} p={[x, 2.5, 0.331]} m={M.seam} shadow={false} />
      ))}
      <B s={[1.88, 0.006, 0.02]} p={[0.6 + 1.93 / 2, 1.444, 0.3]} m={M.led} shadow={false} />
      {/* worktop styling */}
      <group position={[1.4, top, 0.34]}>
        <Lathe pts={[[0, 0], [0.08, 0], [0.09, 0.05], [0.085, 0.16], [0.05, 0.2], [0.02, 0.21], [0, 0.21]]} m={M.ceramicMatte} />
        <B s={[0.02, 0.1, 0.07]} p={[0, 0.12, -0.1]} m={M.black} />
        <Cyl r={0.025} h={0.02} p={[0, 0.215, 0]} m={M.black} />
      </group>
      <B s={[0.3, 0.42, 0.02]} p={[1.62, top + 0.21, 0.045]} r={[-0.12, 0, 0]} m={M.walnut} />
      <B s={[0.24, 0.34, 0.02]} p={[1.78, top + 0.17, 0.06]} r={[-0.14, 0, 0.05]} m={M.walnutMatte} />
      <Vase kind="bowl" p={[1.72, top, 0.42]} m={M.ceramicMatte} />
      <Sph r={0.035} p={[1.7, top + 0.05, 0.42]} m={M.redPowder} />
      <Sph r={0.035} p={[1.76, top + 0.05, 0.4]} m={M.leafLight} />
      <Sph r={0.033} p={[1.73, top + 0.05, 0.47]} m={M.mustardFabric} />
      <group position={[1.28, top, 0.12]}>
        <Lathe pts={[[0, 0], [0.05, 0], [0.055, 0.15], [0, 0.15]]} m={M.ceramic} />
        {[0, 1, 2].map((i) => (
          <Rod key={i} a={[0, 0.05, 0]} b={[0.02 * (i - 1), 0.3, 0.015 * i]} r={0.006} m={i === 1 ? M.walnut : M.blackMetal} />
        ))}
      </group>
      <Plant kind="trailing" p={[2.92, 1.58, 0.3]} scale={1.3} pot="white" seed={5} />
      <Vase kind="jar" p={[2.72, 1.58, 0.36]} m={M.terracotta} s={0.9} />
      {/* retro fridge */}
      <group position={[2.86, 0, 0.33]} userData={{ collider: true }}>
        <B s={[0.56, 0.06, 0.56]} p={[0, 0.03, 0]} m={M.black} />
        <RoundedBox args={[0.6, 1.52, 0.62]} radius={0.07} smoothness={4} position={[0, 0.82, 0]} material={M.fridge} castShadow receiveShadow />
        <B s={[0.56, 0.006, 0.01]} p={[0, 0.58, 0.311]} m={M.seam} shadow={false} />
        <B s={[0.016, 0.3, 0.03]} p={[-0.23, 1.06, 0.34]} m={M.chrome} />
        <B s={[0.016, 0.03, 0.03]} p={[-0.23, 0.92, 0.32]} m={M.chrome} />
        <B s={[0.016, 0.03, 0.03]} p={[-0.23, 1.2, 0.32]} m={M.chrome} />
        <B s={[0.016, 0.12, 0.03]} p={[-0.23, 0.46, 0.34]} m={M.chrome} />
        <B s={[0.1, 0.02, 0.004]} p={[0, 1.48, 0.311]} m={M.chrome} />
      </group>
    </group>
  )
}

// ------------------------------------------------------------------ sheer curtains
function Curtain({ p, rotY = 0, w = 0.4, h = 2.6, folds = 5 }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 48, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, Math.sin((x / w) * Math.PI * 2 * folds) * 0.035)
    }
    g.computeVertexNormals()
    return g
  }, [w, h, folds])
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh geometry={geo} material={M.sheer} position={[0, h / 2 + 0.02, 0]} castShadow />
      <B s={[w + 0.1, 0.02, 0.03]} p={[0, 2.68, 0]} m={M.satin} shadow={false} />
    </group>
  )
}

function SideTable({ p }) {
  return (
    <group position={p} userData={{ collider: true }}>
      <Cyl r={0.22} h={0.025} p={[0, 0.52, 0]} m={M.walnut} seg={40} />
      <Cyl r={0.02} h={0.5} p={[0, 0.26, 0]} m={M.blackMetal} />
      <Cyl r={0.15} h={0.015} p={[0, 0.008, 0]} m={M.blackMetal} seg={32} />
      <TableLamp p={[0.03, 0.533, 0.02]} base={M.navy} h={0.38} />
    </group>
  )
}

// Slim walnut console on the east wall, where the corridor used to be.
function Console() {
  const x1 = 5.35
  const d = 0.3
  const z0 = 3.7
  const z1 = 4.75
  const cz = (z0 + z1) / 2
  return (
    <group>
      <group userData={{ collider: true }}>
        <B s={[d, 0.035, z1 - z0]} p={[x1 - d / 2, 0.8, cz]} m={M.walnut} tile={0.8} />
        <B s={[d - 0.04, 0.16, z1 - z0 - 0.04]} p={[x1 - d / 2, 0.7, cz]} m={M.navy} />
        {[z0 + 0.04, z1 - 0.04].map((z) =>
          [x1 - d + 0.03, x1 - 0.03].map((x) => <Rod key={x + '' + z} a={[x, 0, z]} b={[x, 0.62, z]} r={0.012} m={M.blackMetal} />)
        )}
      </group>
      <TableLamp p={[x1 - 0.15, 0.818, z1 - 0.22]} base={M.ceramic} h={0.42} />
      <group position={[x1 - 0.16, 0.818, z0 + 0.12]} rotation={[0, -Math.PI / 2, 0]}>
        <Books p={[0, 0, 0]} length={0.3} seed={41} maxH={0.26} depth={0.18} fill={0.9} stacks={false} />
      </group>
      <Vase kind="bowl" p={[x1 - 0.15, 0.818, cz - 0.05]} m={M.terracotta} s={0.7} />
      <Frame w={0.7} h={0.92} p={[x1 - 0.001, 1.62, cz]} r={[0, -Math.PI / 2, 0]} m={M.artLiving} />
    </group>
  )
}

export default function Living() {
  return (
    <group>
      <NavyWall />
      <Sofa p={[3.0, 0, 1.12]} rotY={-Math.PI / 2} />
      <mesh position={[1.85, 0.006, 1.15]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} material={M.rugLiving} receiveShadow userData={{ floor: true }}>
        <planeGeometry args={[2.3, 2.1]} />
      </mesh>
      <CoffeeTable p={[1.95, 0.006, 1.12]} rotY={Math.PI / 2 + 0.1} />
      <Pouf p={[1.38, 0.006, 1.86]} />
      <WireChair p={[1.05, 0.006, 0.55]} rotY={1.0} />
      <SideTable p={[3.1, 0, 2.42]} />
      {/* reading corner by the terrace glass */}
      <LoungeChair p={[1.0, 0.006, 3.85]} rotY={2.18} />
      <FloorLamp p={[0.42, 0, 4.35]} />
      <Plant kind="fig" p={[0.32, 0, 3.25]} scale={1.05} pot="terracotta" seed={7} />
      <DiningSet p={[3.0, 0, 3.95]} />
      <Bookshelf p={[1.45, 0, 5.11]} />
      <Kitchen />
      <Console />
      <Plant kind="snake" p={[0.3, 0, 0.3]} scale={1.1} pot="white" seed={9} />
      <Frame w={0.4} h={0.55} p={[4.3, 1.6, 0]} m={M.poster} border={0.015} />
      <Curtain p={[0.1, 0, 1.2]} rotY={Math.PI / 2} w={0.38} />
      <Curtain p={[0.1, 0, 3.86]} rotY={Math.PI / 2} w={0.42} />
      <Curtain p={[0.24, 0, 0.09]} w={0.36} />
      <Curtain p={[2.68, 0, 0.07]} w={0.32} folds={4} />
    </group>
  )
}

export { deg }
