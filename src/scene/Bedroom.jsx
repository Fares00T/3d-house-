import { RoundedBox } from '@react-three/drei'
import { M } from '../lib/materials.js'
import { B, Cyl, Rod, Sph } from '../lib/geo.jsx'
import { Books, Vase, Plant, TableLamp, Frame } from './Decor.jsx'
import { useMemo } from 'react'
import * as THREE from 'three'

// Bedroom: x 0–3.85, z 5.23–8.01
const N = 5.23

function Bed() {
  const x0 = 1.15
  const x1 = 2.75
  const cx = (x0 + x1) / 2
  const len = 2.05
  const z1 = N + 0.1 + len
  const channels = 8
  const hw = 1.76
  return (
    <group>
      <group userData={{ collider: true }}>
        {/* channel-tufted headboard */}
        {Array.from({ length: channels }, (_, i) => (
          <RoundedBox
            key={i}
            args={[hw / channels - 0.004, 1.12, 0.1]}
            radius={0.035}
            smoothness={3}
            position={[cx - hw / 2 + (hw / channels) * (i + 0.5), 0.28 + 0.56, N + 0.05]}
            material={M.navyFabric}
            castShadow
            receiveShadow
          />
        ))}
        {/* base + legs */}
        <RoundedBox args={[1.68, 0.26, len]} radius={0.03} smoothness={3} position={[cx, 0.08 + 0.13, N + 0.1 + len / 2]} material={M.linenGrey} castShadow receiveShadow />
        {[[x0 + 0.06, N + 0.2], [x1 - 0.06, N + 0.2], [x0 + 0.06, z1 - 0.06], [x1 - 0.06, z1 - 0.06]].map(([x, z], i) => (
          <Cyl key={i} r={0.025} h={0.08} p={[x, 0.04, z]} m={M.walnut} />
        ))}
        {/* mattress */}
        <RoundedBox args={[1.6, 0.2, len - 0.04]} radius={0.04} smoothness={3} position={[cx, 0.44, N + 0.12 + (len - 0.04) / 2]} material={M.linen} castShadow receiveShadow />
      </group>
      {/* duvet, folded back at the top */}
      <RoundedBox args={[1.72, 0.08, 1.5]} radius={0.035} smoothness={3} position={[cx, 0.575, z1 - 0.76]} material={M.linen} castShadow receiveShadow />
      <RoundedBox args={[1.72, 0.1, 0.22]} radius={0.045} smoothness={3} position={[cx, 0.6, z1 - 1.5]} material={M.linen} castShadow receiveShadow />
      <B s={[0.03, 0.3, 1.5]} p={[x0 - 0.045, 0.43, z1 - 0.76]} m={M.linen} />
      <B s={[0.03, 0.3, 1.5]} p={[x1 + 0.045, 0.43, z1 - 0.76]} m={M.linen} />
      {/* navy throw at the foot */}
      <RoundedBox args={[1.76, 0.03, 0.46]} radius={0.012} smoothness={2} position={[cx, 0.63, z1 - 0.28]} material={M.navyFabric} castShadow receiveShadow />
      <B s={[1.76, 0.34, 0.025]} p={[cx, 0.47, z1 + 0.02]} m={M.navyFabric} />
      {/* pillows */}
      {[-0.4, 0.4].map((dx) => (
        <RoundedBox key={dx} args={[0.68, 0.42, 0.14]} radius={0.06} smoothness={3} position={[cx + dx, 0.74, N + 0.24]} rotation={[-0.32, 0, 0]} material={M.linenGrey} castShadow receiveShadow />
      ))}
      {[-0.34, 0.34].map((dx) => (
        <RoundedBox key={'w' + dx} args={[0.6, 0.36, 0.13]} radius={0.06} smoothness={3} position={[cx + dx, 0.7, N + 0.38]} rotation={[-0.42, 0, 0]} material={M.linen} castShadow receiveShadow />
      ))}
      <RoundedBox args={[0.42, 0.28, 0.12]} radius={0.05} smoothness={3} position={[cx, 0.68, N + 0.5]} rotation={[-0.5, 0, 0]} material={M.mustardFabric} castShadow receiveShadow />
    </group>
  )
}

function Nightstand({ x }) {
  return (
    <group position={[x, 0, N + 0.22]} userData={{ collider: true }}>
      <B s={[0.44, 0.34, 0.38]} p={[0, 0.34, 0]} m={M.walnut} tile={0.8} />
      <B s={[0.4, 0.004, 0.004]} p={[0, 0.39, 0.191]} m={M.seam} shadow={false} />
      <B s={[0.1, 0.012, 0.02]} p={[0, 0.44, 0.2]} m={M.brass} />
      {[[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].map(([lx, lz], i) => (
        <Rod key={i} a={[lx * 1.05, 0, lz * 1.05]} b={[lx, 0.17, lz]} r={0.014} rb={0.01} m={M.walnut} />
      ))}
      <TableLamp p={[0.06, 0.51, -0.03]} base={M.ceramic} h={0.4} />
    </group>
  )
}

function Wardrobe() {
  // against the west wall, doors facing east
  const z0 = N
  const z1 = 6.1
  const d = 0.6
  const cz = (z0 + z1) / 2
  const w = z1 - z0
  return (
    <group userData={{ collider: true }}>
      <B s={[d - 0.02, 2.7, w]} p={[(d - 0.02) / 2, 1.35, cz]} m={M.carcass} />
      {[0, 1].map((i) => (
        <group key={i}>
          <B s={[0.02, 2.2, w / 2 - 0.006]} p={[d - 0.01, 1.12, z0 + (w / 2) * (i + 0.5)]} m={M.walnut} tile={0.8} />
          <B s={[0.02, 0.46, w / 2 - 0.006]} p={[d - 0.01, 2.465, z0 + (w / 2) * (i + 0.5)]} m={M.walnut} tile={0.8} />
          <B s={[0.02, 0.3, 0.014]} p={[d + 0.02, 1.15, z0 + w / 2 + (i ? 0.04 : -0.04)]} m={M.blackMetal} />
        </group>
      ))}
    </group>
  )
}

function PaperLantern({ p }) {
  const ribs = useMemo(() => {
    const g = new THREE.SphereGeometry(0.24, 32, 18)
    return g
  }, [])
  return (
    <group position={p}>
      <Cyl r={0.004} h={0.2} p={[0, -0.1, 0]} m={M.black} shadow={false} />
      <mesh geometry={ribs} position={[0, -0.45, 0]} material={M.shade} />
      <Sph r={0.04} p={[0, -0.45, 0]} m={M.bulb} castShadow={false} />
    </group>
  )
}

function Curtain({ z, w = 0.3 }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, 2.6, 36, 1)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) / w) * Math.PI * 8) * 0.03)
    g.computeVertexNormals()
    return g
  }, [w])
  return (
    <group position={[0.09, 0, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={geo} material={M.sheer} position={[0, 1.32, 0]} castShadow />
      <B s={[w + 0.1, 0.02, 0.03]} p={[0, 2.68, 0]} m={M.satin} shadow={false} />
    </group>
  )
}

export default function Bedroom() {
  return (
    <group>
      <Bed />
      <Nightstand x={0.9} />
      <Nightstand x={3.0} />
      <Wardrobe />
      <mesh position={[1.95, 0.006, 6.95]} rotation={[-Math.PI / 2, 0, 0]} material={M.rugBed} receiveShadow userData={{ floor: true }}>
        <planeGeometry args={[2.3, 1.7]} />
      </mesh>
      <Frame w={1.2} h={0.75} p={[1.95, 1.82, N]} m={M.artBed} border={0.02} />
      <PaperLantern p={[1.95, 2.7, 6.5]} />
      <Plant kind="fig" p={[0.34, 0, 7.66]} scale={0.85} pot="grey" seed={21} />
      <Curtain z={6.02} w={0.26} />
      <Curtain z={7.3} w={0.28} />
      {/* floating shelf on the south wall */}
      <B s={[1.0, 0.03, 0.22]} p={[1.95, 1.2, 8.01 - 0.11]} m={M.walnut} tile={0.8} />
      <group position={[1.55, 1.215, 7.9]}>
        <Books p={[0, 0, 0]} length={0.4} seed={31} maxH={0.25} depth={0.17} fill={0.9} stacks={false} />
      </group>
      <Vase kind="tall" p={[2.15, 1.215, 7.9]} m={M.terracotta} s={0.6} />
      <Vase kind="jar" p={[2.32, 1.215, 7.9]} m={M.ceramic} s={0.7} />
    </group>
  )
}
