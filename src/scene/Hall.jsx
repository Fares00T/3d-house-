import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Rod } from '../lib/geo.jsx'
import { Plant, Vase, Frame } from './Decor.jsx'

// Floor-to-ceiling wardrobe facing +z (south).
function Wardrobe({ x0, x1, z0, depth = 0.57, doors = 2, finish = 'walnut', mirrorDoor = -1 }) {
  const w = x1 - x0
  const dw = w / doors
  const doorMat = finish === 'walnut' ? M.walnut : M.satin
  return (
    <group userData={{ collider: true }}>
      <B s={[w, 2.7, depth - 0.02]} p={[(x0 + x1) / 2, 1.35, z0 + (depth - 0.02) / 2]} m={M.carcass} />
      {Array.from({ length: doors }, (_, i) => {
        const cx = x0 + dw * (i + 0.5)
        const handleX = i % 2 === 0 ? cx + dw / 2 - 0.05 : cx - dw / 2 + 0.05
        return (
          <group key={i}>
            <B s={[dw - 0.005, 2.69, 0.02]} p={[cx, 1.35, z0 + depth - 0.01]} m={doorMat} tile={finish === 'walnut' ? 0.8 : 0} />
            {i === mirrorDoor && <B s={[dw - 0.14, 1.9, 0.006]} p={[cx, 1.15, z0 + depth + 0.003]} m={M.mirror} />}
            <B s={[0.014, 0.6, 0.022]} p={[handleX, 1.05, z0 + depth + 0.025]} m={M.blackMetal} />
          </group>
        )
      })}
    </group>
  )
}

export default function Hall() {
  return (
    <group>
      {/* white wardrobe with a full-length mirror door */}
      <Wardrobe x0={5.37} x1={6.75} z0={5.23} depth={0.6} finish="white" mirrorDoor={1} />

      {/* shoe bench under a round mirror and a coat rail, by the front door */}
      <group userData={{ collider: true }}>
        <B s={[1.36, 0.42, 0.34]} p={[4.95, 0.25, 8.01 - 0.17]} m={M.navy} />
        <B s={[1.4, 0.03, 0.36]} p={[4.95, 0.475, 8.01 - 0.18]} m={M.walnut} tile={0.8} />
        <B s={[0.004, 0.36, 0.004]} p={[4.95, 0.25, 8.01 - 0.341]} m={M.seam} shadow={false} />
        {[4.36, 5.54].map((x) => (
          <Cyl key={x} r={0.02} h={0.04} p={[x, 0.02, 7.84]} m={M.blackMetal} />
        ))}
      </group>
      <Vase kind="bowl" p={[4.55, 0.49, 7.85]} m={M.ceramic} s={0.8} />
      <Plant kind="snake" p={[5.45, 0.49, 7.86]} scale={0.6} pot="white" seed={14} />
      <group position={[4.7, 1.35, 8.01]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.012]} material={M.brass} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.024, 64]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.026]} material={M.mirror}>
          <cylinderGeometry args={[0.285, 0.285, 0.004, 64]} />
        </mesh>
      </group>
      <B s={[0.58, 0.05, 0.025]} p={[5.32, 1.72, 8.01 - 0.0125]} m={M.walnut} tile={0.8} />
      {[5.1, 5.25, 5.4, 5.55].map((x) => (
        <Rod key={x} a={[x, 1.72, 7.985]} b={[x, 1.75, 7.92]} r={0.009} m={M.blackMetal} />
      ))}
      {/* coat + scarf */}
      <RoundedBox args={[0.42, 0.95, 0.12]} radius={0.05} smoothness={3} position={[5.25, 1.2, 7.92]} material={M.mustardFabric} castShadow receiveShadow />
      <RoundedBox args={[0.12, 0.7, 0.05]} radius={0.02} smoothness={2} position={[5.48, 1.38, 7.89]} material={M.oxbloodFabric} castShadow receiveShadow />

      {/* runner + doormat */}
      <mesh position={[4.72, 0.006, 6.42]} rotation={[-Math.PI / 2, 0, 0]} material={M.rugHall} receiveShadow userData={{ floor: true }}>
        <planeGeometry args={[0.78, 2.1]} />
      </mesh>
      <B s={[0.8, 0.012, 0.5]} p={[6.25, 0.006, 7.68]} m={M.charcoalFabric} shadow={false} userData={{ floor: true }} />

      {/* art beside the bedroom door */}
      <Frame w={0.5} h={0.7} p={[4.101, 1.5, 5.88]} r={[0, Math.PI / 2, 0]} m={M.artBed} />
    </group>
  )
}
