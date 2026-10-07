import * as THREE from 'three'
import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Lathe, Rod, Sph } from '../lib/geo.jsx'
import { Books, Vase, Plant, DomePendant, Frame, Throw } from './Decor.jsx'

// The living room is laid out after the reference photo (mirrored, because the
// flat's windows sit on the opposite side): a freestanding navy block screens the
// galley kitchen, with the sofa, table, pouf and two red chairs in front of it.

// ------------------------------------------------------------------ navy storage wall
const BLOCK = { x0: 3.45, d: 0.4, z0: 1.25, z1: 3.35 }

function NavyWall() {
  const { x0, d, z0, z1 } = BLOCK
  const w = z1 - z0
  const cz = (z0 + z1) / 2
  const cx = x0 + d / 2
  const nb = 0.8 // niche bottom
  const nt = 1.5 // niche top
  const mid = (nb + nt) / 2
  const H = 2.7
  const nd = 0.3 // niche depth
  const post = 0.035
  const doors = [z0 + w / 3, z0 + (2 * w) / 3]
  const onShelf = (y) => y + 0.0125
  const stackMats = [M.ceramicMatte, M.linenGrey, M.oxbloodFabric, M.navyFabric]
  return (
    <group>
      <group userData={{ collider: true }}>
        <B s={[d, nb, w]} p={[cx, nb / 2, cz]} m={M.navy} />
      </group>
      <B s={[d, H - nt, w]} p={[cx, (nt + H) / 2, cz]} m={M.navy} />
      <B s={[d, nt - nb, post]} p={[cx, mid, z0 + post / 2]} m={M.navy} />
      <B s={[d, nt - nb, post]} p={[cx, mid, z1 - post / 2]} m={M.navy} />
      <B s={[d - nd, nt - nb, w]} p={[x0 + nd + (d - nd) / 2, mid, cz]} m={M.navy} />
      {/* walnut lining: back, floor, ceiling, middle shelf, centre divider */}
      <B s={[0.006, nt - nb, w - post * 2]} p={[x0 + nd - 0.003, mid, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - post * 2]} p={[x0 + nd / 2, nb + 0.0125, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - post * 2]} p={[x0 + nd / 2, nt - 0.0125, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, 0.025, w - post * 2]} p={[x0 + nd / 2, mid, cz]} m={M.walnut} tile={0.8} />
      <B s={[nd, nt - nb, 0.025]} p={[x0 + nd / 2, mid, cz]} m={M.walnut} tile={0.8} />
      {/* reveals between the push-to-open doors */}
      {doors.map((z) => (
        <group key={z}>
          <B s={[0.004, H - nt - 0.01, 0.004]} p={[x0 - 0.001, (nt + H) / 2, z]} m={M.seam} shadow={false} />
          <B s={[0.004, nb - 0.02, 0.004]} p={[x0 - 0.001, nb / 2, z]} m={M.seam} shadow={false} />
        </group>
      ))}
      {/* shelf styling; book rows run along +z with spines facing the room */}
      <group position={[x0 + 0.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Books p={[z0 + 0.05, onShelf(nb), 0]} length={0.32} seed={3} maxH={0.3} depth={0.2} fill={0.95} stacks={false} />
        <Books p={[cz + 0.5, onShelf(nb), 0]} length={0.44} seed={4} maxH={0.3} depth={0.2} fill={0.95} stacks={false} />
        <Books p={[cz + 0.52, onShelf(mid), 0]} length={0.44} seed={6} maxH={0.3} depth={0.2} fill={0.95} stacks={false} />
      </group>
      {[
        [z0 + 0.62, 4],
        [cz + 0.24, 3],
      ].map(([z, n], i) =>
        Array.from({ length: n }, (_, k) => (
          <B
            key={i + '-' + k}
            s={[0.2, 0.03, 0.24]}
            p={[x0 + 0.15, nb + 0.04 + k * 0.031, z]}
            r={[0, k % 2 ? 0.06 : -0.04, 0]}
            m={stackMats[(k + i) % 4]}
          />
        ))
      )}
      <Vase kind="bottle" p={[x0 + 0.15, onShelf(mid), z0 + 0.22]} m={M.ceramicMatte} s={0.95} />
      <Vase kind="jar" p={[x0 + 0.15, onShelf(mid), cz + 0.24]} m={M.ceramic} s={0.8} />
      <Vase kind="cup" p={[x0 + 0.15, onShelf(mid), cz + 0.4]} m={M.ceramicMatte} s={1.2} />
      {/* kitchen side: a slim walnut shelf with jars */}
      <B s={[0.18, 0.025, 1.4]} p={[x0 + d + 0.09, 1.42, cz]} m={M.walnut} tile={0.8} />
      {[-0.55, -0.39, -0.23, 0.25, 0.41].map((dz, i) => (
        <Vase key={i} kind={i % 2 ? 'jar' : 'cup'} p={[x0 + d + 0.09, 1.4325, cz + dz]} m={i % 2 ? M.ceramicMatte : M.ceramic} s={i % 2 ? 0.8 : 1.4} />
      ))}
    </group>
  )
}

// ------------------------------------------------------------------ sofa
// Grey two-seater with button tufting and light oak tapered legs (faces local +z).
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
        <Rod key={i} a={[x * 1.03, 0, z * 1.06]} b={[x, 0.19, z]} r={0.024} rb={0.013} m={M.lightWood} />
      ))}
      <RoundedBox args={[L, 0.2, D]} radius={0.04} smoothness={3} position={[0, 0.29, 0]} material={M.sofa} castShadow receiveShadow />
      {[-0.42, 0.42].map((x) => (
        <RoundedBox key={x} args={[0.83, 0.13, D - 0.24]} radius={0.05} smoothness={3} position={[x, 0.45, 0.09]} material={M.sofa} castShadow receiveShadow />
      ))}
      <RoundedBox args={[L - 0.04, 0.42, 0.2]} radius={0.06} smoothness={3} position={[0, 0.58, -D / 2 + 0.1]} material={M.sofa} castShadow receiveShadow />
      {[-0.42, 0.42].map((x) => (
        <group key={'b' + x} position={[x, 0.67, -D / 2 + 0.25]} rotation={[-0.16, 0, 0]}>
          <RoundedBox args={[0.82, 0.36, 0.13]} radius={0.055} smoothness={3} material={M.sofa} castShadow receiveShadow />
          {[-0.24, 0, 0.24].map((bx) =>
            [0.07, -0.07].map((by, j) => <Sph key={bx + '' + j} r={0.011} p={[bx, by, 0.066]} m={M.sofaButton} />)
          )}
        </group>
      ))}
      {[-L / 2 + 0.07, L / 2 - 0.07].map((x) => (
        <RoundedBox key={'a' + x} args={[0.14, 0.24, D]} radius={0.05} smoothness={3} position={[x, 0.5, 0]} material={M.sofa} castShadow receiveShadow />
      ))}
      {[-0.42, 0.42].map((x) => [-0.22, 0.22].map((bx) => <Sph key={x + 's' + bx} r={0.01} p={[x + bx, 0.517, 0.12]} m={M.sofaButton} />))}
      {/* plaid throw over the window-side arm */}
      <Throw p={[-L / 2 + 0.28, 0.53, 0.06]} r={[0, Math.PI + 0.06, 0]} />
    </group>
  )
}

// ------------------------------------------------------------------ coffee table
// Glossy walnut rounded triangle, wide at the back, one point towards the room.
function CoffeeTable({ p, rotY = 0 }) {
  const { top, legs } = useMemo(() => {
    const R = 0.42
    const ax = 0.92 // depth
    const az = 1.25 // width
    const sh = new THREE.Shape()
    const N = 120
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2
      const r = R * (1 + 0.13 * Math.cos(3 * t))
      const x = r * Math.cos(t) * ax
      const y = r * Math.sin(t) * az
      i === 0 ? sh.moveTo(x, y) : sh.lineTo(x, y)
    }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.01, bevelSegments: 4, curveSegments: 8 })
    g.rotateX(-Math.PI / 2)
    const lg = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((t) => {
      const r = R * 0.74
      return [Math.cos(t) * r * ax, -Math.sin(t) * r * az]
    })
    return { top: g, legs: lg }
  }, [])
  return (
    <group position={p} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      <mesh geometry={top} material={M.walnutGloss} position={[0, 0.4, 0]} castShadow receiveShadow />
      {legs.map(([x, z], i) => (
        <Rod key={i} a={[x * 1.22, 0, z * 1.22]} b={[x, 0.405, z]} r={0.021} rb={0.012} m={M.walnut} />
      ))}
      <Vase kind="jar" p={[0.02, 0.438, -0.06]} m={M.ceramic} s={1.15} />
      <Lathe pts={[[0, 0], [0.04, 0], [0.05, 0.05], [0.048, 0.1], [0.034, 0.12], [0.036, 0.13], [0, 0.13]]} m={M.ceramic} p={[-0.02, 0.438, 0.1]} />
    </group>
  )
}

function Pouf({ p }) {
  return (
    <group position={p} userData={{ collider: true }}>
      <Lathe
        pts={[[0, 0], [0.31, 0], [0.34, 0.02], [0.355, 0.09], [0.36, 0.2], [0.355, 0.31], [0.34, 0.37], [0.31, 0.395], [0, 0.4]]}
        m={M.denimFabric}
        seg={48}
      />
      <mesh position={[0, 0.372, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.denimFabric} castShadow>
        <torusGeometry args={[0.338, 0.009, 8, 64]} />
      </mesh>
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
    [[-w / 2, seatY, sd / 2], [w / 2, seatY, sd / 2]],
    [[-w / 2, seatY, sd / 2], [-w / 2, seatY - 0.02, -sd / 2]],
    [[w / 2, seatY, sd / 2], [w / 2, seatY - 0.02, -sd / 2]],
    [[-w / 2, seatY - 0.02, -sd / 2], [-w / 2 - 0.02, seatY + 0.42, -sd / 2 - 0.13]],
    [[w / 2, seatY - 0.02, -sd / 2], [w / 2 + 0.02, seatY + 0.42, -sd / 2 - 0.13]],
    [[-w / 2 - 0.02, seatY + 0.42, -sd / 2 - 0.13], [w / 2 + 0.02, seatY + 0.42, -sd / 2 - 0.13]],
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

// ------------------------------------------------------------------ dining for two
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
        <B key={i} s={[0.085, 0.12, 0.022]} p={[x, 0.76, -0.225 + x * x * 1.6]} r={[0, -x * 2.2, 0]} m={M.walnut} />
      ))}
    </group>
  )
}

function DiningCorner({ p }) {
  const [x, , z] = p
  return (
    <group>
      <group position={p} userData={{ collider: true }}>
        <Cyl r={0.42} h={0.03} p={[0, 0.745, 0]} m={M.walnut} seg={56} />
        <Cyl r={0.05} rb={0.07} h={0.72} p={[0, 0.37, 0]} m={M.walnut} seg={24} />
        <Cyl r={0.24} h={0.03} p={[0, 0.015, 0]} m={M.walnut} seg={40} />
        <Vase kind="tall" p={[0.02, 0.76, -0.06]} m={M.ceramicMatte} s={0.85} />
        {[[-0.08, 0.02], [-0.12, -0.06], [-0.1, -0.03]].map(([bx, bz], i) => (
          <Rod key={'br' + i} a={[0.02, 1.02, -0.06]} b={[0.02 + bx * 2.2 + i * 0.07, 1.42 - i * 0.07, -0.06 + bz * 3]} r={0.004} m={M.bark} />
        ))}
        <Vase kind="bowl" p={[0.1, 0.76, 0.14]} m={M.ceramic} s={0.8} />
      </group>
      <group userData={{ collider: true }}>
        <DiningChair p={[x, 0, z - 0.63]} rotY={0} />
        <DiningChair p={[x + 0.63, 0, z]} rotY={-Math.PI / 2} />
      </group>
      <DomePendant p={[x, 2.7, z]} drop={1.05} r={0.2} />
    </group>
  )
}

// ------------------------------------------------------------------ bookshelf
// From the photo: a floor-to-ceiling walnut column of stacked doors beside navy
// open shelving with walnut boxes above it. Built facing local +z.
function Bookshelf({ p }) {
  const D = 0.38
  const H = 2.7
  const colX = [0.15, 0.75]
  const navX = [-0.75, 0.15]
  const navTop = 2.06
  const shelves = [0.4, 0.7, 1.0, 1.3, 1.6, 1.88]
  const nw = navX[1] - navX[0]
  const ncx = (navX[0] + navX[1]) / 2
  const colW = colX[1] - colX[0]
  const colCx = (colX[0] + colX[1]) / 2
  const row = (y) => y + 0.0125
  return (
    <group position={p} rotation={[0, Math.PI, 0]}>
      <group userData={{ collider: true }}>
        <B s={[colW, H, D]} p={[colCx, H / 2, D / 2]} m={M.walnut} tile={0.8} />
        <B s={[nw, navTop, 0.02]} p={[ncx, navTop / 2, 0.01]} m={M.navy} />
      </group>
      {[0.36, 0.72, 1.08, 1.44, 1.8, 2.16, 2.44].map((y) => (
        <B key={y} s={[colW - 0.01, 0.004, 0.004]} p={[colCx, y, D + 0.001]} m={M.seam} shadow={false} />
      ))}
      <B s={[0.004, H - 0.02, 0.004]} p={[colCx, H / 2, D + 0.001]} m={M.seam} shadow={false} />
      {/* walnut boxes over the shelving */}
      <B s={[nw, H - navTop, D]} p={[ncx, (navTop + H) / 2, D / 2]} m={M.walnut} tile={0.8} />
      {[ncx - nw / 6, ncx + nw / 6].map((x) => (
        <B key={x} s={[0.004, H - navTop - 0.01, 0.004]} p={[x, (navTop + H) / 2, D + 0.001]} m={M.seam} shadow={false} />
      ))}
      {/* navy carcass */}
      <B s={[0.025, navTop, D]} p={[navX[0] + 0.0125, navTop / 2, D / 2]} m={M.navy} />
      {shelves.map((y) => (
        <B key={y} s={[nw, 0.025, D - 0.02]} p={[ncx, y, D / 2 + 0.01]} m={M.navy} />
      ))}
      <B s={[nw, 0.1, D]} p={[ncx, 0.05, D / 2]} m={M.navy} />
      <B s={[nw, 0.03, D]} p={[ncx, navTop - 0.015, D / 2]} m={M.navy} />
      {/* contents: baskets, books, ceramics */}
      <B s={[0.36, 0.22, 0.3]} p={[ncx - 0.2, 0.21, 0.2]} m={M.linenGrey} />
      <B s={[0.36, 0.22, 0.3]} p={[ncx + 0.2, 0.21, 0.2]} m={M.linenGrey} />
      <Books p={[navX[0] + 0.04, row(0.4), 0.19]} length={0.8} seed={11} maxH={0.26} depth={0.24} fill={0.55} />
      <Vase kind="jar" p={[ncx + 0.26, row(0.4), 0.2]} m={M.ceramic} s={0.8} />
      <Books p={[navX[0] + 0.3, row(0.7), 0.19]} length={0.5} seed={12} maxH={0.26} depth={0.24} fill={0.7} />
      <Books p={[navX[0] + 0.04, row(1.0), 0.19]} length={0.8} seed={13} maxH={0.26} depth={0.24} fill={0.35} />
      <Vase kind="bottle" p={[ncx + 0.18, row(1.0), 0.2]} m={M.ceramicMatte} s={0.9} />
      <Books p={[navX[0] + 0.04, row(1.3), 0.19]} length={0.8} seed={14} maxH={0.26} depth={0.24} fill={0.75} />
      <Plant kind="trailing" p={[ncx + 0.24, row(1.6), 0.19]} scale={0.95} pot="white" seed={8} />
      <Books p={[navX[0] + 0.04, row(1.6), 0.19]} length={0.42} seed={15} maxH={0.26} depth={0.24} fill={0.9} stacks={false} />
      <Vase kind="cup" p={[ncx - 0.1, row(1.88), 0.2]} m={M.ceramic} s={1.3} />
    </group>
  )
}

// ------------------------------------------------------------------ kitchen
// Built in a local frame running north→south along the east wall:
// local x = world z, local z = distance out from the wall (front faces −x).
function Front({ x0, x1, y0, y1, z, m = M.graphite }) {
  const g = 0.0035
  return <B s={[x1 - x0 - g * 2, y1 - y0 - g * 2, 0.019]} p={[(x0 + x1) / 2, (y0 + y1) / 2, z + 0.0095]} m={m} />
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
  const b0 = 0.7 // base run (local x = world z)
  const b1 = 3.7
  const t0 = 3.7 // tall oven unit, visible beside the navy block
  const t1 = 4.3
  const tc = (t0 + t1) / 2
  const run = b1 - b0
  const bc = (b0 + b1) / 2
  const hob = 1.6
  const sink = 2.8
  const base = [
    [b0, 1.3, [[0.1, 0.86]]],
    [1.3, 1.9, [[0.1, 0.36], [0.36, 0.62], [0.62, 0.86]]],
    [1.9, 2.5, [[0.1, 0.86]]],
    [2.5, 2.8, [[0.1, 0.86]]],
    [2.8, 3.1, [[0.1, 0.86]]],
    [3.1, b1, [[0.1, 0.48], [0.48, 0.86]]],
  ]
  return (
    <group position={[5.35, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <group userData={{ collider: true }}>
        <B s={[t1 - t0, 2.7, D - 0.02]} p={[tc, 1.35, (D - 0.02) / 2]} m={M.carcass} />
        <B s={[run, 0.76, D - 0.02]} p={[bc, 0.48, (D - 0.02) / 2]} m={M.carcass} />
        <B s={[run, 0.1, D - 0.07]} p={[bc, 0.05, (D - 0.07) / 2]} m={M.black} />
      </group>
      {/* handle-less graphite fronts */}
      {base.map(([x0, x1, rows]) => rows.map(([y0, y1]) => <Front key={x0 + '-' + y0} x0={x0} x1={x1} y0={y0} y1={y1} z={D - 0.02} />))}
      <Front x0={t0} x1={t1} y0={0.1} y1={0.46} z={D - 0.02} />
      <Front x0={t0} x1={t1} y0={0.46} y1={0.8} z={D - 0.02} />
      <B s={[0.594, 0.6, 0.02]} p={[tc, 1.12, D]} m={M.blackGlass} />
      <B s={[0.5, 0.012, 0.025]} p={[tc, 1.36, D + 0.025]} m={M.steel} />
      <B s={[0.46, 0.36, 0.006]} p={[tc, 1.08, D + 0.011]} m={M.carcass} shadow={false} />
      <B s={[0.594, 0.38, 0.02]} p={[tc, 1.63, D]} m={M.blackGlass} />
      <B s={[0.12, 0.03, 0.004]} p={[tc + 0.16, 1.78, D + 0.012]} m={M.led} shadow={false} />
      <Front x0={t0} x1={t1} y0={1.83} y1={2.7} z={D - 0.02} />
      {/* worktop, hob, sink, splashback */}
      <B s={[run, 0.04, D + 0.02]} p={[bc, top - 0.02, (D + 0.02) / 2]} m={M.walnut} tile={0.8} />
      <B s={[0.58, 0.006, 0.5]} p={[hob, top + 0.003, 0.31]} m={M.hob} />
      <group position={[sink, top, 0.31]}>
        <B s={[0.5, 0.004, 0.42]} p={[0, 0.002, 0]} m={M.steel} />
        <B s={[0.44, 0.004, 0.36]} p={[0, 0.0045, 0]} m={M.brushed} />
        <B s={[0.4, 0.002, 0.32]} p={[0, 0.0065, 0]} m={M.carcass} />
        <Cyl r={0.03} h={0.003} p={[0, 0.008, 0]} m={M.steel} />
      </group>
      <Faucet p={[sink, top, 0.07]} />
      <B s={[run, 0.55, 0.014]} p={[bc, top + 0.275, 0.007]} m={M.walnut} tile={0.8} />
      {/* wall cabinets up to the ceiling */}
      <B s={[run, 0.85, 0.33]} p={[bc, 1.875, 0.165]} m={M.carcass} />
      {[b0, 1.3, 1.9, 2.5, 3.1].map((x0) => (
        <Front key={'u' + x0} x0={x0} x1={x0 + 0.6} y0={x0 === 1.3 ? 1.48 : 1.45} y1={2.3} z={0.33} />
      ))}
      <B s={[0.594, 0.03, 0.36]} p={[hob, 1.465, 0.18]} m={M.steel} />
      <B s={[run, 0.4, 0.33]} p={[bc, 2.5, 0.165]} m={M.graphite} />
      {[1.3, 1.9, 2.5, 3.1].map((x) => (
        <B key={'r' + x} s={[0.004, 0.39, 0.004]} p={[x, 2.5, 0.331]} m={M.seam} shadow={false} />
      ))}
      <B s={[run - 0.05, 0.006, 0.02]} p={[bc, 1.444, 0.3]} m={M.led} shadow={false} />
      {/* worktop styling */}
      <group position={[2.2, top, 0.34]}>
        <Lathe pts={[[0, 0], [0.08, 0], [0.09, 0.05], [0.085, 0.16], [0.05, 0.2], [0.02, 0.21], [0, 0.21]]} m={M.ceramicMatte} />
        <B s={[0.02, 0.1, 0.07]} p={[0, 0.12, -0.1]} m={M.black} />
        <Cyl r={0.025} h={0.02} p={[0, 0.215, 0]} m={M.black} />
      </group>
      <B s={[0.3, 0.42, 0.02]} p={[2.38, top + 0.21, 0.045]} r={[-0.12, 0, 0]} m={M.walnut} />
      <B s={[0.24, 0.34, 0.02]} p={[2.52, top + 0.17, 0.06]} r={[-0.14, 0, 0.05]} m={M.walnutMatte} />
      <Vase kind="bowl" p={[3.4, top, 0.38]} m={M.ceramicMatte} />
      <Sph r={0.035} p={[3.38, top + 0.05, 0.38]} m={M.redPowder} />
      <Sph r={0.035} p={[3.44, top + 0.05, 0.36]} m={M.leafLight} />
      <Sph r={0.033} p={[3.41, top + 0.05, 0.43]} m={M.mustardFabric} />
      <group position={[1.05, top, 0.12]}>
        <Lathe pts={[[0, 0], [0.05, 0], [0.055, 0.15], [0, 0.15]]} m={M.ceramic} />
        {[0, 1, 2].map((i) => (
          <Rod key={i} a={[0, 0.05, 0]} b={[0.02 * (i - 1), 0.3, 0.015 * i]} r={0.006} m={i === 1 ? M.walnut : M.blackMetal} />
        ))}
      </group>
      <Plant kind="bush" p={[0.92, top, 0.42]} scale={0.5} pot="terracotta" seed={5} />
      {/* burgundy retro fridge in the corner, beside the navy block */}
      <group position={[0.36, 0, 0.33]} userData={{ collider: true }}>
        <B s={[0.56, 0.05, 0.56]} p={[0, 0.025, 0]} m={M.black} />
        <RoundedBox args={[0.6, 1.68, 0.64]} radius={0.075} smoothness={5} position={[0, 0.89, 0]} material={M.fridge} castShadow receiveShadow />
        <B s={[0.57, 0.006, 0.01]} p={[0, 0.82, 0.32]} m={M.seam} shadow={false} />
        <B s={[0.016, 0.34, 0.03]} p={[0.235, 1.16, 0.35]} m={M.chrome} />
        <B s={[0.016, 0.03, 0.03]} p={[0.235, 1.01, 0.33]} m={M.chrome} />
        <B s={[0.016, 0.03, 0.03]} p={[0.235, 1.31, 0.33]} m={M.chrome} />
        <B s={[0.016, 0.16, 0.03]} p={[0.235, 0.68, 0.35]} m={M.chrome} />
        <B s={[0.016, 0.03, 0.03]} p={[0.235, 0.62, 0.33]} m={M.chrome} />
        <B s={[0.12, 0.022, 0.004]} p={[0.14, 1.62, 0.321]} m={M.chrome} />
      </group>
      <Plant kind="trailing" p={[0.3, 1.73, 0.3]} scale={1.2} pot="white" seed={21} />
    </group>
  )
}

// ------------------------------------------------------------------ sheer curtains
function Curtain({ p, rotY = 0, w = 0.4, h = 2.6, folds = 5 }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 48, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / w) * Math.PI * 2 * folds) * 0.035)
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

export default function Living() {
  const cz = (BLOCK.z0 + BLOCK.z1) / 2
  return (
    <group>
      <NavyWall />
      <Sofa p={[3.0, 0, cz]} rotY={-Math.PI / 2} />
      <CoffeeTable p={[1.86, 0, cz]} rotY={Math.PI} />
      <Pouf p={[1.0, 0, cz + 0.52]} />
      <LoungeChair p={[2.3, 0, 0.78]} rotY={-1.03} />
      <WireChair p={[1.08, 0, 1.28]} rotY={0.42} />
      <Bookshelf p={[1.9, 0, 5.11]} />
      <Kitchen />
      <DiningCorner p={[0.65, 0, 4.45]} />
      <Frame w={0.6} h={0.8} p={[0.001, 1.6, 4.52]} r={[0, Math.PI / 2, 0]} m={M.artLiving} />
      <Plant kind="fig" p={[0.3, 0, 3.3]} scale={1.0} pot="terracotta" seed={7} />
      <Plant kind="snake" p={[0.3, 0, 0.3]} scale={1.1} pot="white" seed={9} />
      <Frame w={0.4} h={0.55} p={[4.25, 1.6, 0]} m={M.poster} border={0.015} />
      <Curtain p={[0.1, 0, 1.2]} rotY={Math.PI / 2} w={0.38} />
      <Curtain p={[0.1, 0, 3.86]} rotY={Math.PI / 2} w={0.42} />
      <Curtain p={[0.24, 0, 0.09]} w={0.36} />
      <Curtain p={[2.68, 0, 0.07]} w={0.32} folds={4} />
    </group>
  )
}
