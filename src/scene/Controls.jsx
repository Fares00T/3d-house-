import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore, setState, getState, pose, requests, teleport } from '../store.js'
import { TOUR, TOUR_CAPTIONS, ROOMS, START, roomAt } from '../plan.js'

export const worldRef = { current: null }
export const camRef = { current: null }

const EYE = 1.62
const RADIUS = 0.22
const WALK = 1.5
const RUN = 3.0
const TOUR_SPEED = 1.05

const yawTo = (x, z, tx, tz) => Math.atan2(-(tx - x), -(tz - z))
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const lerpAngle = (a, b, t) => a + wrap(b - a) * t
const smooth = (t) => t * t * (3 - 2 * t)

// ------------------------------------------------------------------ collisions
function buildColliders(root) {
  const out = []
  if (!root) return out
  root.updateMatrixWorld(true)
  const box = new THREE.Box3()
  root.traverse((o) => {
    if (!o.userData?.collider) return
    box.setFromObject(o)
    if (box.isEmpty()) return
    if (box.min.y > 1.2 || box.max.y < 0.15) return
    out.push({ x0: box.min.x, z0: box.min.z, x1: box.max.x, z1: box.max.z })
  })
  return out
}

function hits(cols, x, z, r = RADIUS) {
  for (const c of cols) {
    const cx = Math.max(c.x0, Math.min(x, c.x1))
    const cz = Math.max(c.z0, Math.min(z, c.z1))
    const dx = x - cx
    const dz = z - cz
    if (dx * dx + dz * dz < r * r) return true
  }
  return false
}

const WALKABLE = ROOMS.flatMap((r) => r.rects.map(([a, b, c, d]) => [a / 100, b / 100, c / 100, d / 100]))
const inside = (x, z) => WALKABLE.some(([a, b, c, d]) => x > a && x < c && z > b && z < d)

export function freeSpot(cols, x, z) {
  if (!hits(cols, x, z) && inside(x, z)) return [x, z]
  for (let r = 0.1; r < 2; r += 0.1) {
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      const nx = x + Math.cos(a) * r
      const nz = z + Math.sin(a) * r
      if (!hits(cols, nx, nz) && inside(nx, nz)) return [nx, nz]
    }
  }
  return [x, z]
}

// ------------------------------------------------------------------ guided tour
function buildTour() {
  const nodes = TOUR.map((n) => ({
    p: new THREE.Vector3(n.p[0] / 100, 0, n.p[1] / 100),
    look: n.look ? [n.look[0] / 100, n.look[1] / 100] : null,
    dwell: n.dwell || 0,
    room: n.room,
    pan: n.pan || 0,
  }))
  nodes.forEach((n, i) => {
    if (n.look) n.yaw = yawTo(n.p.x, n.p.z, n.look[0], n.look[1])
    else if (i < nodes.length - 1) n.yaw = yawTo(n.p.x, n.p.z, nodes[i + 1].p.x, nodes[i + 1].p.z)
    else n.yaw = nodes[i - 1].yaw
  })
  nodes.forEach((n) => (n.yawOut = n.yaw + n.pan))
  const segs = []
  let t = 0
  let room = null
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    if (a.room) room = a.room
    if (a.dwell) {
      segs.push({ type: 'dwell', a, t0: t, t1: t + a.dwell, room })
      t += a.dwell
    }
    if (i === nodes.length - 1) break
    const b = nodes[i + 1]
    const p0 = i > 0 ? nodes[i - 1].p : a.p.clone().multiplyScalar(2).sub(b.p)
    const p3 = i + 2 < nodes.length ? nodes[i + 2].p : b.p.clone().multiplyScalar(2).sub(a.p)
    const curve = new THREE.CatmullRomCurve3([p0, a.p, b.p, p3], false, 'centripetal')
    let len = 0
    let prev = curve.getPoint(1 / 3)
    for (let k = 1; k <= 12; k++) {
      const q = curve.getPoint(1 / 3 + (k / 12) / 3)
      len += q.distanceTo(prev)
      prev = q
    }
    const dur = Math.max(0.9, len / TOUR_SPEED)
    // the caption switches when we head towards the next captioned stop
    let nextRoom = room
    for (let j = i + 1; j < nodes.length; j++)
      if (nodes[j].room) {
        nextRoom = nodes[j].room
        break
      }
    segs.push({ type: 'move', a, b, curve, t0: t, t1: t + dur, easeIn: a.dwell > 0 || i === 0, easeOut: b.dwell > 0, room: len > 1.5 ? room : nextRoom, nextRoom })
    t += dur
  }
  return { segs, total: t, start: nodes[0] }
}

function ease(t, a, b) {
  if (a && b) return smooth(t)
  if (a) return 2 * t * t - t * t * t
  if (b) return t + t * t - t * t * t
  return t
}

// ------------------------------------------------------------------ player (walk + tour)
export function Player() {
  const { camera, gl } = useThree()
  const mode = useStore((s) => s.mode)
  const started = useStore((s) => s.started)
  const cursor = useRef()
  const st = useRef({
    keys: new Set(),
    vel: new THREE.Vector2(),
    glide: null,
    drag: null,
    hover: null,
    hoverDirty: false,
    cols: [],
    bob: 0,
    tourT: 0,
    lastProgress: 0,
    lastRoom: null,
  }).current
  const tour = useMemo(buildTour, [])
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    camRef.current = camera
    if (import.meta.env.DEV) {
      window.__cam = camera
      window.__gl = gl
    }
  }, [camera, gl])

  // initial pose
  useEffect(() => {
    pose.x = START.p[0] / 100
    pose.z = START.p[1] / 100
    pose.yaw = yawTo(pose.x, pose.z, START.look[0] / 100, START.look[1] / 100)
    pose.pitch = -0.05
    const id = setTimeout(() => (st.cols = buildColliders(worldRef.current)), 300)
    return () => clearTimeout(id)
  }, [st])

  useEffect(() => {
    if (mode === 'tour') {
      st.tourT = 0
      st.glide = null
    }
    if (mode === 'walk') {
      camera.fov = 68
      camera.updateProjectionMatrix()
    }
  }, [mode, st, camera])

  // input
  useEffect(() => {
    const el = gl.domElement
    const cancelTour = () => {
      if (getState().mode === 'tour') setState({ mode: 'walk', caption: null })
    }
    const onDown = (e) => {
      if (getState().mode === 'overview' || !getState().started) return
      st.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, touch: e.pointerType === 'touch' }
      el.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      st.hoverDirty = e.pointerType !== 'touch'
      const d = st.drag
      if (!d || d.id !== e.pointerId) return
      const dx = e.clientX - d.lx
      const dy = e.clientY - d.ly
      d.lx = e.clientX
      d.ly = e.clientY
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
        d.moved = true
        cancelTour()
      }
      if (d.moved && getState().mode === 'walk') {
        const k = (d.touch ? 0.005 : 0.0034) * (camera.fov / 68)
        pose.yaw += dx * k
        pose.pitch = Math.max(-1.2, Math.min(1.2, pose.pitch + dy * k))
      }
    }
    const onUp = (e) => {
      const d = st.drag
      st.drag = null
      if (!d || d.moved || getState().mode === 'overview' || !getState().started) return
      // click / tap: walk to the floor point under the pointer
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      const hit = pickFloor()
      if (hit) {
        cancelTour()
        const [fx, fz] = freeSpot(st.cols, hit.x, hit.z)
        st.glide = { x: fx, z: fz, stuck: 0 }
      }
    }
    const onWheel = (e) => {
      if (getState().mode === 'overview') return
      e.preventDefault()
      camera.fov = Math.max(32, Math.min(80, camera.fov + e.deltaY * 0.03))
      camera.updateProjectionMatrix()
    }
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return
      const k = e.code
      const move = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyQ', 'KeyE']
      if (!move.includes(k)) return
      if (e.type === 'keydown') {
        if (!getState().started || getState().mode === 'overview') return
        if (k.startsWith('Arrow')) e.preventDefault()
        st.keys.add(k)
        if (!k.startsWith('Shift')) {
          cancelTour()
          st.glide = null
        }
      } else st.keys.delete(k)
    }
    const onBlur = () => st.keys.clear()
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', () => (st.hover = null))
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('blur', onBlur)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('blur', onBlur)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera])

  function pickFloor() {
    if (!worldRef.current) return null
    ray.setFromCamera(ndc, camera)
    ray.far = 14
    const res = ray.intersectObject(worldRef.current, true)
    for (const h of res) {
      const m = h.object
      if (!m.visible || m.material?.transparent) continue
      if (m.userData?.floor && h.point.y < 0.05) return h.point
      return null
    }
    return null
  }

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const mode = getState().mode
    if (!getState().started) {
      // slow idle drift behind the intro card
      pose.yaw += dt * 0.03
    }

    if (requests.teleport) {
      const t = requests.teleport
      requests.teleport = null
      if (!st.cols.length) st.cols = buildColliders(worldRef.current)
      const [fx, fz] = freeSpot(st.cols, t.x, t.z)
      pose.x = fx
      pose.z = fz
      pose.yaw = t.yaw
      pose.pitch = t.pitch
      st.glide = null
      st.vel.set(0, 0)
    }

    if (mode === 'overview') {
      if (cursor.current) cursor.current.visible = false
      return
    }

    if (mode === 'tour') {
      st.tourT += dt
      const T = st.tourT
      const seg = tour.segs.find((s) => T >= s.t0 && T < s.t1)
      if (!seg) {
        setState({ mode: 'walk', caption: null, tourProgress: 1 })
      } else {
        const u = (T - seg.t0) / (seg.t1 - seg.t0)
        if (seg.type === 'dwell') {
          pose.x = seg.a.p.x
          pose.z = seg.a.p.z
          pose.yaw = lerpAngle(seg.a.yaw, seg.a.yawOut, smooth(u))
        } else {
          const e = ease(u, seg.easeIn, seg.easeOut)
          const p = seg.curve.getPoint(1 / 3 + e / 3)
          pose.x = p.x
          pose.z = p.z
          pose.yaw = lerpAngle(seg.a.yawOut, seg.b.yaw, smooth(u))
        }
        pose.pitch += (-0.06 - pose.pitch) * Math.min(1, dt * 3)
        const room = seg.type === 'move' && u > 0.35 ? seg.nextRoom : seg.room
        const cap = room ? TOUR_CAPTIONS[room] : null
        if (getState().caption !== cap) setState({ caption: cap })
        if (T - st.lastProgress > 0.2) {
          st.lastProgress = T
          setState({ tourProgress: T / tour.total })
        }
      }
    } else if (getState().started) {
      // keyboard walking
      const k = st.keys
      let f = 0
      let s = 0
      if (k.has('KeyW') || k.has('ArrowUp')) f += 1
      if (k.has('KeyS') || k.has('ArrowDown')) f -= 1
      if (k.has('KeyD')) s += 1
      if (k.has('KeyA')) s -= 1
      if (k.has('ArrowLeft') || k.has('KeyQ')) pose.yaw += dt * 1.8
      if (k.has('ArrowRight') || k.has('KeyE')) pose.yaw -= dt * 1.8
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? RUN : WALK
      const sinY = Math.sin(pose.yaw)
      const cosY = Math.cos(pose.yaw)
      let tx = (-sinY * f + cosY * s) * speed
      let tz = (-cosY * f - sinY * s) * speed
      if (f && s) {
        tx *= 0.7071
        tz *= 0.7071
      }
      if (st.glide && !f && !s) {
        const dx = st.glide.x - pose.x
        const dz = st.glide.z - pose.z
        const d = Math.hypot(dx, dz)
        if (d < 0.04) st.glide = null
        else {
          const sp = Math.min(1.9, d * 2.2 + 0.25)
          tx = (dx / d) * sp
          tz = (dz / d) * sp
          // turn gently towards where we're heading on long glides
          if (d > 1.2) pose.yaw = lerpAngle(pose.yaw, yawTo(pose.x, pose.z, st.glide.x, st.glide.z), dt * 0.6)
        }
      }
      const a = 1 - Math.exp(-dt * 10)
      st.vel.x += (tx - st.vel.x) * a
      st.vel.y += (tz - st.vel.y) * a
      const ox = pose.x
      const oz = pose.z
      const nx = pose.x + st.vel.x * dt
      if (!hits(st.cols, nx, pose.z)) pose.x = nx
      else st.vel.x = 0
      const nz = pose.z + st.vel.y * dt
      if (!hits(st.cols, pose.x, nz)) pose.z = nz
      else st.vel.y = 0
      const moved = Math.hypot(pose.x - ox, pose.z - oz)
      if (st.glide) {
        if (moved < 0.0015) st.glide.stuck += dt
        if (st.glide.stuck > 0.25) st.glide = null
      }
      st.bob += moved * 7
    }

    // room tracking
    const room = roomAt(pose.x * 100, pose.z * 100)
    if (room && room.id !== st.lastRoom) {
      st.lastRoom = room.id
      setState({ room: room.id })
    }

    camera.position.set(pose.x, EYE + Math.sin(st.bob) * 0.012, pose.z)
    camera.rotation.set(pose.pitch, pose.yaw, 0, 'YXZ')

    // floor cursor
    if (cursor.current) {
      let show = false
      if (mode === 'walk' && getState().started && !st.drag && st.hoverDirty) {
        const p = pickFloor()
        if (p) {
          cursor.current.position.set(p.x, p.y + 0.012, p.z)
          show = true
        }
      }
      cursor.current.visible = show
    }
  })

  return (
    <group ref={cursor} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
        <ringGeometry args={[0.17, 0.2, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={9}>
        <circleGeometry args={[0.17, 48]} />
        <meshBasicMaterial color="#ffe500" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

// ------------------------------------------------------------------ dollhouse overview
const OV_TARGET = new THREE.Vector3(3.9, 0, 3.4)
const OV_OFFSET = new THREE.Vector3(-5.5, 12.5, 8.8)

export function Overview() {
  const { camera, size } = useThree()
  // pull back on portrait screens so the whole flat fits
  const OV_POS = useMemo(() => {
    const aspect = size.width / size.height
    const k = Math.max(1, 1.35 / aspect)
    return OV_TARGET.clone().add(OV_OFFSET.clone().multiplyScalar(k))
  }, [size.width, size.height])
  const ctrl = useRef()
  const anim = useRef({ t: 0, from: new THREE.Vector3(), look: new THREE.Vector3() })
  useEffect(() => {
    anim.current.t = 0
    anim.current.from.copy(camera.position)
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    anim.current.look.copy(camera.position).add(dir.multiplyScalar(2))
    camera.fov = 45
    camera.updateProjectionMatrix()
  }, [camera])
  useFrame((_, dt) => {
    const a = anim.current
    if (a.t < 1) {
      a.t = Math.min(1, a.t + dt / 1.4)
      const e = smooth(a.t)
      camera.position.lerpVectors(a.from, OV_POS, e)
      const look = new THREE.Vector3().lerpVectors(a.look, OV_TARGET, e)
      camera.lookAt(look)
      if (ctrl.current) ctrl.current.enabled = a.t >= 1
    }
  })
  return (
    <>
      <OrbitControls
        ref={ctrl}
        target={OV_TARGET}
        enabled={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={1.32}
        minPolarAngle={0.15}
      />
      <YouAreHere />
    </>
  )
}

function YouAreHere() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.set(pose.x, 0.05, pose.z)
    ref.current.rotation.y = pose.yaw
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.08
    ref.current.children[0].scale.setScalar(s)
  })
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 40]} />
        <meshBasicMaterial color="#ffe500" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.12]}>
        <circleGeometry args={[0.12, 3, Math.PI / 2]} />
        <meshBasicMaterial color="#1f2e52" toneMapped={false} />
      </mesh>
    </group>
  )
}

export { yawTo }
