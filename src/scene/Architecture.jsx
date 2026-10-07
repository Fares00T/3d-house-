import { useStore } from '../store.js'
import { M } from '../lib/materials.js'
import { B, Cyl } from '../lib/geo.jsx'
import { WALLS, wallPieces, SKIRTING, CEIL, toM } from '../plan.js'

const H = toM(CEIL)

function Walls() {
  const pieces = WALLS.flatMap(wallPieces)
  return pieces.map((w, i) => {
    const sx = toM(w.x1 - w.x0)
    const sy = toM(w.top - w.bottom)
    const sz = toM(w.y1 - w.y0)
    return (
      <B
        key={i}
        s={[sx, sy, sz]}
        p={[toM(w.x0 + w.x1) / 2, toM(w.bottom + w.top) / 2, toM(w.y0 + w.y1) / 2]}
        m={M.paint}
        userData={{ collider: w.bottom < 100 }}
      />
    )
  })
}

// Floor slabs (top at y = 0). Oak runs continuously thanks to world UVs.
const FLOORS = [
  { r: [0, 0, 535, 523], m: 'oak' },
  { r: [385, 523, 687, 826], m: 'oak' },
  { r: [0, 523, 385, 801], m: 'oak' },
  { r: [687, 523, 917, 801], m: 'tile' },
]

function Floors() {
  return FLOORS.map(({ r: [x0, y0, x1, y1], m }, i) => {
    const p = [toM(x0 + x1) / 2, -0.01, toM(y0 + y1) / 2]
    return (
      <B
        key={i}
        s={[toM(x1 - x0), 0.02, toM(y1 - y0)]}
        p={p}
        m={m === 'oak' ? M.oak : M.tileFloor}
        tile={m === 'oak' ? 1.6 : 0.6}
        world
        shadow={false}
        userData={{ floor: true }}
      />
    )
  })
}

const CEILINGS = [
  [-25, -25, 560, 523],
  [-25, 523, 535, 826],
  [535, 498, 942, 826],
]

function Ceilings() {
  const mode = useStore((s) => s.mode)
  return (
    <group visible={mode !== 'overview'}>
      {CEILINGS.map(([x0, y0, x1, y1], i) => (
        <B key={i} s={[toM(x1 - x0), 0.24, toM(y1 - y0)]} p={[toM(x0 + x1) / 2, H + 0.12, toM(y0 + y1) / 2]} m={M.ceiling} />
      ))}
    </group>
  )
}

function Skirting() {
  return SKIRTING.map(([x0, y0, x1, y1, nx, ny], i) => {
    const len = toM(Math.hypot(x1 - x0, y1 - y0))
    const t = 0.014
    const h = 0.08
    const cx = toM(x0 + x1) / 2 + toM(nx) * 0 + nx * (t / 2)
    const cz = toM(y0 + y1) / 2 + ny * (t / 2)
    const along = y0 === y1
    return <B key={i} s={along ? [len, h, t] : [t, h, len]} p={[cx, h / 2, cz]} m={M.satin} shadow={false} />
  })
}

// ---------------------------------------------------------------- bathroom tiling
const BATH = { x0: 687, x1: 917, y0: 523, y1: 801 }
function BathTiles() {
  const t = 0.008
  const panels = []
  const add = (s, p) => panels.push({ s, p })
  const W = toM(BATH.x1 - BATH.x0)
  const D = toM(BATH.y1 - BATH.y0)
  const cx = toM(BATH.x0 + BATH.x1) / 2
  const cz = toM(BATH.y0 + BATH.y1) / 2
  add([W, H, t], [cx, H / 2, toM(BATH.y0) + t / 2]) // north
  add([W, H, t], [cx, H / 2, toM(BATH.y1) - t / 2]) // south
  add([t, H, D - 2 * t], [toM(BATH.x1) - t / 2, H / 2, cz]) // east
  // west wall, around the door (625–695, 205 high)
  const xw = toM(BATH.x0) + t / 2
  const seg = (a, b) => add([t, H, toM(b - a)], [xw, H / 2, toM(a + b) / 2])
  seg(BATH.y0 + 0.8, 625)
  seg(695, BATH.y1 - 0.8)
  add([t, H - 2.05, toM(70)], [xw, (H + 2.05) / 2, toM(660)])
  return panels.map((pl, i) => <B key={i} s={pl.s} p={pl.p} m={M.tileWall} tile={0.6} world shadow={false} />)
}

// ---------------------------------------------------------------- windows
// Glazing built in a local frame: x along the wall, +z into the room,
// origin at the bottom centre of the opening on the wall centreline.
function Pane({ w, h, x, z, collider }) {
  const f = 0.055
  return (
    <group position={[x, 0, z]} userData={{ collider }}>
      <B s={[w, f, 0.05]} p={[0, f / 2, 0]} m={M.frame} />
      <B s={[w, f, 0.05]} p={[0, h - f / 2, 0]} m={M.frame} />
      <B s={[f, h, 0.05]} p={[-w / 2 + f / 2, h / 2, 0]} m={M.frame} />
      <B s={[f, h, 0.05]} p={[w / 2 - f / 2, h / 2, 0]} m={M.frame} />
      <mesh position={[0, h / 2, 0]} material={M.glass}>
        <boxGeometry args={[w - f * 2, h - f * 2, 0.012]} />
      </mesh>
    </group>
  )
}

function Glazing({ pos, rotY, width, height, panels = 2, open = 0, collider = true }) {
  const jamb = 0.06
  const inner = width - jamb * 2
  const pw = inner / panels + 0.03
  const items = []
  for (let i = 0; i < panels; i++) {
    let x = -inner / 2 + pw / 2 + i * (inner / panels) - (i === panels - 1 ? 0.03 : 0)
    const z = i % 2 === 0 ? -0.03 : 0.03
    if (open && i === panels - 1) x -= inner / panels - 0.08
    items.push(<Pane key={i} w={pw} h={height - jamb - 0.03} x={x} z={z} collider={collider} />)
  }
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <B s={[jamb, height, 0.14]} p={[-width / 2 + jamb / 2, height / 2, 0]} m={M.frame} />
      <B s={[jamb, height, 0.14]} p={[width / 2 - jamb / 2, height / 2, 0]} m={M.frame} />
      <B s={[width, jamb, 0.14]} p={[0, height - jamb / 2, 0]} m={M.frame} />
      <B s={[width, 0.02, 0.25]} p={[0, 0.01, 0]} m={M.brushed} />
      <group position={[0, 0.02, 0]}>{items}</group>
    </group>
  )
}

function Balustrade({ pos, rotY, width, height = 1.0, z = -0.2 }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]} userData={{ collider: true }}>
      <mesh position={[0, height / 2 + 0.05, z]} material={M.glass}>
        <boxGeometry args={[width, height - 0.1, 0.012]} />
      </mesh>
      <B s={[width + 0.04, 0.04, 0.05]} p={[0, height, z]} m={M.steel} />
      <B s={[width, 0.05, 0.05]} p={[0, 0.03, z]} m={M.frame} />
    </group>
  )
}

function Windows() {
  return (
    <>
      {/* west terrace slider: north leaf slid open */}
      <Glazing pos={[-0.125, 0, toM(265)]} rotY={Math.PI / 2} width={2.5} height={2.35} panels={2} open collider />
      {/* north terrace glazing */}
      <Glazing pos={[toM(150), 0, -0.125]} rotY={0} width={2.7} height={2.35} panels={3} />
      {/* bedroom french window + balustrade */}
      <Glazing pos={[-0.125, 0, toM(665)]} rotY={Math.PI / 2} width={1.0} height={2.1} panels={1} />
      <Balustrade pos={[-0.125, 0, toM(665)]} rotY={Math.PI / 2} width={1.0} z={-0.2} />
    </>
  )
}

// ---------------------------------------------------------------- doors
// Door in a wall that runs along world Z (plan axis 'y') or world X.
// Built in a local frame: x along the wall, z across it, +z = the side the
// leaf swings into. Rotation φ about Y maps local +z to (sin φ, 0, cos φ).
function Door({ axis, wallA, wallB, from, to, swing, hinge, angle = 160, closed = false, entrance = false }) {
  const t = toM(wallB - wallA)
  const w = toM(to - from)
  const top = 2.05
  const arch = 0.07
  const trim = entrance ? M.frame : M.satin
  const rotY = axis === 'y' ? (swing > 0 ? Math.PI / 2 : -Math.PI / 2) : swing > 0 ? 0 : Math.PI
  // does local +x run against the world axis?
  const flip = (axis === 'y' && swing > 0) || (axis === 'x' && swing < 0)
  const hingeAtNeg = (hinge === 'from') !== flip
  const hingeX = hingeAtNeg ? -w / 2 + 0.01 : w / 2 - 0.01
  const dir = hingeAtNeg ? 1 : -1
  const a = closed ? 0 : (angle * Math.PI) / 180
  const ox = Math.cos(a) * dir
  const oz = Math.sin(a)
  const leafRot = Math.atan2(-oz, ox)
  const leafW = w - 0.02
  const leafT = 0.04
  const leafZ = closed ? 0 : leafT / 2
  const pos = axis === 'y' ? [toM(wallA + wallB) / 2, 0, toM(from + to) / 2] : [toM(from + to) / 2, 0, toM(wallA + wallB) / 2]
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <B s={[0.02, top, t]} p={[-w / 2 + 0.01, top / 2, 0]} m={trim} />
      <B s={[0.02, top, t]} p={[w / 2 - 0.01, top / 2, 0]} m={trim} />
      <B s={[w, 0.02, t]} p={[0, top - 0.01, 0]} m={trim} />
      {[-1, 1].map((sg) => (
        <group key={sg} position={[0, 0, sg * (t / 2 + 0.007)]}>
          <B s={[arch, top + arch, 0.014]} p={[-w / 2 - arch / 2 + 0.01, (top + arch) / 2, 0]} m={trim} />
          <B s={[arch, top + arch, 0.014]} p={[w / 2 + arch / 2 - 0.01, (top + arch) / 2, 0]} m={trim} />
          <B s={[w + arch * 2 - 0.02, arch, 0.014]} p={[0, top + arch / 2, 0]} m={trim} />
        </group>
      ))}
      <group position={[hingeX, 0, closed ? 0 : t / 2]} rotation={[0, leafRot, 0]}>
        <B s={[leafW, top - 0.02, leafT]} p={[leafW / 2, (top - 0.02) / 2 + 0.005, leafZ]} m={entrance ? M.frame : M.satin} />
        {entrance &&
          [-1, 1].map((sg) => (
            <B key={sg} s={[leafW - 0.18, top - 0.36, 0.006]} p={[leafW / 2, top / 2 + 0.02, sg * (leafT / 2 + 0.003)]} m={M.graphite} />
          ))}
        {[-1, 1].map((sg) => (
          <group key={sg} position={[leafW - 0.07, 1.02, leafZ + sg * (leafT / 2 + 0.008)]}>
            <Cyl r={0.026} h={0.01} rot={[Math.PI / 2, 0, 0]} m={M.blackMetal} />
            <B s={[0.018, 0.018, 0.045]} p={[0, 0, sg * 0.02]} m={M.blackMetal} />
            <B s={[0.14, 0.02, 0.018]} p={[-0.065, 0, sg * 0.042]} m={M.blackMetal} />
          </group>
        ))}
      </group>
    </group>
  )
}

function Doors() {
  return (
    <>
      {/* bedroom */}
      <Door axis="y" wallA={385} wallB={410} from={650} to={730} swing={-1} hinge="from" />
      {/* bathroom: swings east into the bathroom, hinge on the south jamb */}
      <Door axis="y" wallA={675} wallB={687} from={625} to={695} swing={1} hinge="to" />
      {/* entrance, closed */}
      <Door axis="x" wallA={801} wallB={826} from={580} to={670} swing={-1} hinge="to" closed entrance />
    </>
  )
}

export default function Architecture() {
  return (
    <group>
      <Walls />
      <Floors />
      <Ceilings />
      <Skirting />
      <BathTiles />
      <Windows />
      <Doors />
    </group>
  )
}
