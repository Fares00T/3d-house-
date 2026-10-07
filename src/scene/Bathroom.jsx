import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Lathe, Rod, Sph } from '../lib/geo.jsx'
import { Vase, Frame, TowelRoll, Plant } from './Decor.jsx'
import * as THREE from 'three'

// Bathroom interior faces (inside the tile cladding)
const W0 = 6.878
const E0 = 9.162
const N0 = 5.238
const S0 = 8.002

// Bath along the east wall; its Mondrian-tiled front faces the door.
function Bath() {
  const x0 = 8.45
  const z0 = N0
  const z1 = 6.93
  const L = z1 - z0
  const cz = (z0 + z1) / 2
  const rimTop = 0.58
  return (
    <group>
      <group userData={{ collider: true }}>
        <B s={[E0 - x0, 0.4, L]} p={[(x0 + E0) / 2, 0.2, cz]} m={M.ceramic} />
        {/* front tile panel */}
        <B s={[0.012, 0.55, L]} p={[x0 - 0.006, 0.275, cz]} m={M.mondrian} />
        {/* south end tiled white */}
        <B s={[E0 - x0 + 0.012, 0.55, 0.012]} p={[(x0 + E0) / 2 - 0.006, 0.275, z1 + 0.006]} m={M.tileWall} tile={0.6} world />
        {/* rim + inner walls */}
        <B s={[0.1, 0.03, L + 0.012]} p={[x0 + 0.04, rimTop - 0.015, cz + 0.006]} m={M.ceramic} />
        <B s={[0.07, 0.15, L]} p={[x0 + 0.06, 0.475, cz]} m={M.ceramic} />
        <B s={[0.06, rimTop - 0.4, L]} p={[E0 - 0.03, (0.4 + rimTop) / 2, cz]} m={M.ceramic} />
        <B s={[E0 - x0, rimTop - 0.4, 0.06]} p={[(x0 + E0) / 2, (0.4 + rimTop) / 2, z0 + 0.03]} m={M.ceramic} />
        <B s={[E0 - x0, rimTop - 0.4, 0.07]} p={[(x0 + E0) / 2, (0.4 + rimTop) / 2, z1 - 0.035]} m={M.ceramic} />
      </group>
      <Cyl r={0.025} h={0.004} p={[8.8, 0.402, z0 + 0.25]} m={M.chrome} />
      {/* bottles on the rim */}
      <Vase kind="bottle" p={[9.08, rimTop, 6.78]} m={M.mustardFabric} s={0.75} />
      <Vase kind="bottle" p={[9.0, rimTop, 6.84]} m={M.ceramic} s={0.6} />
      {/* shower mixer, rail and hand shower on the east wall */}
      <group position={[E0, 0, 5.62]}>
        <Cyl r={0.028} h={0.24} p={[-0.05, 0.82, 0]} rot={[Math.PI / 2, 0, 0]} m={M.chrome} />
        <Cyl r={0.03} h={0.04} p={[-0.05, 0.82, -0.14]} rot={[Math.PI / 2, 0, 0]} m={M.chrome} />
        <Cyl r={0.03} h={0.04} p={[-0.05, 0.82, 0.14]} rot={[Math.PI / 2, 0, 0]} m={M.chrome} />
        <Cyl r={0.012} h={0.08} p={[-0.07, 0.78, 0]} m={M.chrome} />
        <Cyl r={0.012} h={0.95} p={[-0.04, 1.42, 0.22]} m={M.chrome} />
        <Cyl r={0.018} h={0.04} p={[-0.04, 0.93, 0.22]} m={M.chrome} />
        <Cyl r={0.018} h={0.04} p={[-0.04, 1.9, 0.22]} m={M.chrome} />
        <group position={[-0.08, 1.72, 0.22]} rotation={[0, 0, -0.5]}>
          <Cyl r={0.014} h={0.2} p={[0, -0.08, 0]} m={M.chrome} />
          <Cyl r={0.045} rb={0.03} h={0.05} p={[0, 0.03, 0]} m={M.chrome} />
        </group>
        <mesh position={[-0.06, 0.72, 0.1]} rotation={[0, Math.PI / 2, 0]} material={M.chrome}>
          <torusGeometry args={[0.13, 0.008, 8, 24, Math.PI * 1.3]} />
        </mesh>
      </group>
      {/* fixed glass screen */}
      <group userData={{ collider: true }}>
        <mesh position={[x0 + 0.03, rimTop + 0.72, z0 + 0.4]} material={M.glass}>
          <boxGeometry args={[0.008, 1.44, 0.8]} />
        </mesh>
      </group>
      <B s={[0.02, 1.44, 0.02]} p={[x0 + 0.03, rimTop + 0.72, z0 + 0.01]} m={M.chrome} />
      <Rod a={[x0 + 0.03, rimTop + 1.44, z0 + 0.8]} b={[E0, rimTop + 1.44, z0 + 0.8]} r={0.008} m={M.chrome} />
      {/* towel bar above the bath */}
      <Rod a={[E0 - 0.06, 1.45, 6.2]} b={[E0 - 0.06, 1.45, 6.8]} r={0.009} m={M.chrome} />
      <B s={[0.02, 0.62, 0.36]} p={[E0 - 0.06, 1.15, 6.5]} m={M.towelWhite} />
    </group>
  )
}

// Basin on a cast-iron sewing machine base, mirror above.
function Vanity() {
  const x0 = 7.62
  const x1 = 8.28
  const cx = (x0 + x1) / 2
  const zf = 5.7
  const zc = (N0 + zf) / 2
  const sideFrame = (x, wheel) => (
    <group key={x}>
      <Rod a={[x, 0.02, N0 + 0.05]} b={[x, 0.02, zf - 0.02]} r={0.014} m={M.iron} />
      <Rod a={[x, 0.02, N0 + 0.07]} b={[x, 0.8, N0 + 0.12]} r={0.013} m={M.iron} />
      <Rod a={[x, 0.02, zf - 0.04]} b={[x, 0.8, zf - 0.09]} r={0.013} m={M.iron} />
      <Rod a={[x, 0.8, N0 + 0.05]} b={[x, 0.8, zf - 0.02]} r={0.012} m={M.iron} />
      <mesh position={[x, 0.42, zc]} rotation={[0, Math.PI / 2, 0]} material={M.iron} castShadow>
        <torusGeometry args={[0.12, 0.011, 8, 32]} />
      </mesh>
      <mesh position={[x, 0.42, zc]} rotation={[0, Math.PI / 2, 0]} material={M.iron} castShadow>
        <torusGeometry args={[0.06, 0.008, 8, 24]} />
      </mesh>
      {[0.2, 0.62].map((y) => (
        <mesh key={y} position={[x, y, zc]} rotation={[0, Math.PI / 2, Math.PI / 4]} material={M.iron}>
          <torusGeometry args={[0.07, 0.007, 6, 4]} />
        </mesh>
      ))}
      {wheel && (
        <group position={[x + 0.05, 0.45, zc]} rotation={[0, Math.PI / 2, 0]}>
          <mesh material={M.iron} castShadow>
            <torusGeometry args={[0.16, 0.012, 8, 40]} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <Rod key={i} a={[0, 0, 0]} b={[Math.cos((i / 5) * 6.283) * 0.16, Math.sin((i / 5) * 6.283) * 0.16, 0]} r={0.006} m={M.iron} />
          ))}
          <Cyl r={0.025} h={0.04} rot={[Math.PI / 2, 0, 0]} m={M.iron} />
        </group>
      )}
    </group>
  )
  const bt = 0.84
  const top = 0.95
  return (
    <group>
      <group userData={{ collider: true }}>
        {sideFrame(x0 + 0.04, false)}
        {sideFrame(x1 - 0.04, true)}
        <Rod a={[x0 + 0.04, 0.22, zc]} b={[x1 - 0.04, 0.22, zc]} r={0.012} m={M.iron} />
        {/* treadle */}
        <mesh position={[cx, 0.13, zc + 0.03]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
          <planeGeometry args={[0.5, 0.26]} />
          <meshStandardMaterial color="#191919" metalness={0.6} roughness={0.5} alphaMap={M.wire.alphaMap} alphaTest={0.5} side={THREE.DoubleSide} />
        </mesh>
        {/* basin with real rims so the bowl reads */}
        <RoundedBox args={[0.64, 0.05, 0.46]} radius={0.02} smoothness={3} position={[cx, bt + 0.025, zc + 0.01]} material={M.ceramic} castShadow receiveShadow />
        <B s={[0.64, top - bt, 0.09]} p={[cx, (bt + top) / 2, N0 + 0.045]} m={M.ceramic} />
        <B s={[0.64, top - bt, 0.035]} p={[cx, (bt + top) / 2, zf + 0.01]} m={M.ceramic} />
        <B s={[0.035, top - bt, 0.46]} p={[x0 + 0.0175 + 0.01, (bt + top) / 2, zc + 0.01]} m={M.ceramic} />
        <B s={[0.035, top - bt, 0.46]} p={[x1 - 0.0175 - 0.01, (bt + top) / 2, zc + 0.01]} m={M.ceramic} />
      </group>
      <Cyl r={0.02} h={0.003} p={[cx, bt + 0.052, zc + 0.04]} m={M.chrome} />
      {/* mixer */}
      <group position={[cx, top, N0 + 0.05]}>
        <Cyl r={0.022} h={0.14} p={[0, 0.07, 0]} m={M.chrome} />
        <Cyl r={0.011} h={0.13} p={[0, 0.13, 0.06]} rot={[Math.PI / 2 - 0.25, 0, 0]} m={M.chrome} />
        <B s={[0.012, 0.012, 0.08]} p={[0, 0.16, -0.03]} r={[0.5, 0, 0]} m={M.chrome} />
      </group>
      <Vase kind="cup" p={[x1 - 0.08, top, N0 + 0.05]} m={M.ceramic} s={1.1} />
      {/* framed mirror */}
      <group position={[cx, 1.6, N0]}>
        <B s={[0.56, 0.76, 0.02]} p={[0, 0, 0.01]} m={M.chrome} />
        <B s={[0.53, 0.73, 0.004]} p={[0, 0, 0.022]} m={M.mirror} />
      </group>
    </group>
  )
}

function Washer() {
  return (
    <group position={[7.115, 0, 5.56]} userData={{ collider: true }}>
      <RoundedBox args={[0.45, 0.86, 0.6]} radius={0.02} smoothness={3} position={[0, 0.43, 0]} material={M.plastic} castShadow receiveShadow />
      <B s={[0.43, 0.012, 0.42]} p={[0, 0.866, 0.07]} m={M.whiteLacquer} />
      <B s={[0.43, 0.06, 0.12]} p={[0, 0.88, -0.23]} m={M.carcass} />
      <Cyl r={0.022} h={0.02} p={[0.12, 0.91, -0.23]} m={M.steel} />
      <B s={[0.3, 0.004, 0.012]} p={[0, 0.25, 0.301]} m={M.potGrey} shadow={false} />
      {/* bathmat-coloured towels on top */}
      <B s={[0.3, 0.05, 0.22]} p={[-0.02, 0.9, 0.12]} m={M.towelBlue} />
    </group>
  )
}

// Black iron pipe shelving with wooden boards above the washer.
function PipeShelf() {
  const xs = [6.92, 7.52]
  const zf = 5.5
  const boards = [1.1, 1.38, 1.66, 1.94]
  const bottleCols = [M.terracotta, M.ceramic, M.mustardFabric, M.oxbloodFabric, M.linenGrey]
  return (
    <group>
      {xs.map((x) => (
        <group key={x}>
          <Rod a={[x, 1.0, zf]} b={[x, 2.06, zf]} r={0.014} m={M.iron} />
          {[1.0, 2.06].map((y) => (
            <group key={y}>
              <Rod a={[x, y, N0]} b={[x, y, zf]} r={0.014} m={M.iron} />
              <Cyl r={0.03} h={0.012} p={[x, y, N0 + 0.006]} rot={[Math.PI / 2, 0, 0]} m={M.iron} />
              <Sph r={0.02} p={[x, y, zf]} m={M.iron} />
            </group>
          ))}
        </group>
      ))}
      {boards.map((y, i) => (
        <B key={y} s={[0.66, 0.026, 0.27]} p={[7.22, y, N0 + 0.15]} m={M.oak} tile={1.6} />
      ))}
      {/* contents */}
      <TowelRoll p={[7.1, 1.163, 5.38]} m={M.towelBlue} />
      <TowelRoll p={[7.1, 1.163 + 0.085, 5.38]} m={M.towelWhite} />
      <TowelRoll p={[7.36, 1.163, 5.38]} m={M.mustardFabric} />
      {[0, 1, 2, 3].map((i) => (
        <Vase key={i} kind={i % 2 ? 'bottle' : 'jar'} p={[6.98 + i * 0.13, 1.393, 5.36]} m={bottleCols[i]} s={i % 2 ? 0.7 : 0.6} />
      ))}
      {[0, 1, 2].map((i) => (
        <Vase key={'b' + i} kind="bottle" p={[7.0 + i * 0.12, 1.673, 5.36]} m={bottleCols[(i + 2) % 5]} s={0.8} />
      ))}
      <Plant kind="trailing" p={[7.38, 1.673, 5.36]} scale={0.9} pot="white" seed={12} />
      <Vase kind="jar" p={[7.05, 1.953, 5.36]} m={M.ceramic} s={0.8} />
      <TowelRoll p={[7.3, 1.998, 5.38]} m={M.towelWhite} />
    </group>
  )
}

function Toilet() {
  const cx = 8.74
  return (
    <group userData={{ collider: true }}>
      <RoundedBox args={[0.38, 0.4, 0.16]} radius={0.03} smoothness={3} position={[cx, 0.6, S0 - 0.09]} material={M.ceramic} castShadow receiveShadow />
      <Cyl r={0.025} h={0.01} p={[cx, 0.805, S0 - 0.09]} m={M.chrome} />
      <group position={[cx, 0, S0 - 0.36]} scale={[1, 1, 1.38]}>
        <Lathe pts={[[0, 0], [0.12, 0], [0.11, 0.08], [0.12, 0.22], [0.17, 0.34], [0.185, 0.39], [0.18, 0.4], [0, 0.4]]} m={M.ceramic} seg={40} />
        <Cyl r={0.19} h={0.03} p={[0, 0.415, 0]} m={M.ceramic} seg={40} />
        <Cyl r={0.185} h={0.02} p={[0, 0.44, 0.005]} m={M.whiteLacquer} seg={40} />
      </group>
      {/* paper holder */}
      <Rod a={[E0, 0.72, 7.55]} b={[E0 - 0.12, 0.72, 7.55]} r={0.008} m={M.chrome} />
      <Cyl r={0.055} h={0.1} p={[E0 - 0.08, 0.72, 7.55]} rot={[Math.PI / 2, 0, 0]} m={M.towelWhite} />
    </group>
  )
}

function TowelLadder() {
  const z0 = S0 - 0.32
  return (
    <group position={[7.85, 0, 0]} userData={{ collider: true }}>
      {[-0.2, 0.2].map((x) => (
        <Rod key={x} a={[x, 0, z0]} b={[x, 1.62, S0 - 0.02]} r={0.014} m={M.walnutMatte} />
      ))}
      {[0.4, 0.75, 1.1, 1.45].map((y) => {
        const z = z0 + ((S0 - 0.02 - z0) * y) / 1.62
        return <Rod key={y} a={[-0.2, y, z]} b={[0.2, y, z]} r={0.01} m={M.walnutMatte} />
      })}
      <B s={[0.34, 0.5, 0.02]} p={[0, 0.88, z0 + (S0 - 0.02 - z0) * 0.45]} r={[-0.18, 0, 0]} m={M.towelBlue} />
    </group>
  )
}

export default function Bathroom() {
  return (
    <group>
      <Bath />
      <Vanity />
      <Washer />
      <PipeShelf />
      <Toilet />
      <TowelLadder />
      {/* laundry basket */}
      <group position={[7.15, 0, 7.8]} userData={{ collider: true }}>
        <Cyl r={0.17} rb={0.15} h={0.48} p={[0, 0.24, 0]} m={M.linenGrey} seg={32} />
        <Cyl r={0.175} h={0.03} p={[0, 0.48, 0]} m={M.walnutMatte} seg={32} />
      </group>
      <Frame w={0.56} h={0.8} p={[8.74, 1.62, S0]} r={[0, Math.PI, 0]} m={M.poster} border={0.018} mat={false} />
      {/* globe pendant */}
      <group position={[8.0, 2.7, 6.62]}>
        <Cyl r={0.004} h={0.32} p={[0, -0.16, 0]} m={M.black} shadow={false} />
        <Cyl r={0.04} h={0.015} p={[0, -0.008, 0]} m={M.chrome} shadow={false} />
        <Cyl r={0.03} h={0.04} p={[0, -0.33, 0]} m={M.chrome} shadow={false} />
        <Sph r={0.15} p={[0, -0.49, 0]} m={M.globe} castShadow={false} />
      </group>
      {/* bath mat */}
      <B s={[0.5, 0.012, 0.8]} p={[8.12, 0.006, 6.1]} m={M.towelWhite} shadow={false} userData={{ floor: true }} />
    </group>
  )
}
