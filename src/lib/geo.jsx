import * as THREE from 'three'
import { useMemo } from 'react'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { M } from './materials.js'

const geoCache = new Map()
const k = (v) => (Array.isArray(v) ? v.map((n) => +n.toFixed(4)).join(',') : String(v))

// Box whose UVs are scaled to real-world size (1 UV unit = `tile` metres).
// With `off` (the box position) the UVs are in world space, so textures line
// up across neighbouring boxes such as floor slabs or tiled wall panels.
export function boxGeo(w, h, d, tile = 0, off = null) {
  const key = `b|${k([w, h, d])}|${tile}|${off ? k(off) : ''}`
  let g = geoCache.get(key)
  if (g) return g
  g = new THREE.BoxGeometry(w, h, d)
  if (tile) {
    const pos = g.attributes.position
    const nor = g.attributes.normal
    const uv = g.attributes.uv
    const [ox, oy, oz] = off || [0, 0, 0]
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + ox
      const y = pos.getY(i) + oy
      const z = pos.getZ(i) + oz
      const nx = nor.getX(i)
      const ny = nor.getY(i)
      let u
      let v
      if (Math.abs(nx) > 0.5) {
        u = nx > 0 ? -z : z
        v = y
      } else if (Math.abs(ny) > 0.5) {
        u = x
        v = -z
      } else {
        u = nor.getZ(i) > 0 ? x : -x
        v = y
      }
      uv.setXY(i, u / tile, v / tile)
    }
  }
  geoCache.set(key, g)
  return g
}

export function cylGeo(rt, rb, h, seg = 24, open = false, ts = 0, tl = Math.PI * 2) {
  const key = `c|${k([rt, rb, h, seg, ts, tl])}|${open}`
  let g = geoCache.get(key)
  if (!g) {
    g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open, ts, tl)
    geoCache.set(key, g)
  }
  return g
}

export function sphereGeo(r, ws = 24, hs = 16, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) {
  const key = `s|${k([r, ws, hs, ps, pl, ts, tl])}`
  let g = geoCache.get(key)
  if (!g) {
    g = new THREE.SphereGeometry(r, ws, hs, ps, pl, ts, tl)
    geoCache.set(key, g)
  }
  return g
}

// <B s={[w,h,d]} p={[x,y,z]} m={material} />  — the workhorse box.
export function B({ s, p = [0, 0, 0], r, m = M.paint, tile = 0, world = false, shadow = true, children, ...rest }) {
  const geo = boxGeo(s[0], s[1], s[2], tile, world ? p : null)
  return (
    <mesh geometry={geo} position={p} rotation={r} material={m} castShadow={shadow} receiveShadow {...rest}>
      {children}
    </mesh>
  )
}

export function Cyl({ r = 0.05, rb, h = 0.1, p = [0, 0, 0], rot, m = M.chrome, seg = 24, open = false, shadow = true, ...rest }) {
  return (
    <mesh
      geometry={cylGeo(r, rb ?? r, h, seg, open)}
      position={p}
      rotation={rot}
      material={m}
      castShadow={shadow}
      receiveShadow
      {...rest}
    />
  )
}

export function Sph({ r = 0.05, p = [0, 0, 0], m = M.chrome, scale, ...rest }) {
  return <mesh geometry={sphereGeo(r)} position={p} scale={scale} material={m} castShadow receiveShadow {...rest} />
}

// Lathe from a [[radius, height], ...] profile.
export function Lathe({ pts, seg = 32, m, p, rot, scale, shadow = true }) {
  const geo = useMemo(() => {
    const key = `l|${k(pts.flat())}|${seg}`
    let g = geoCache.get(key)
    if (!g) {
      g = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)
      geoCache.set(key, g)
    }
    return g
  }, [pts, seg])
  return <mesh geometry={geo} material={m} position={p} rotation={rot} scale={scale} castShadow={shadow} receiveShadow />
}

// Merge many coloured boxes into one geometry (books, slats, tiles…).
// items: { s:[w,h,d], p:[x,y,z], r?:[x,y,z], c:'#hex' }
export function mergeBoxes(items) {
  const geos = []
  const col = new THREE.Color()
  const mat = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  for (const it of items) {
    const g = new THREE.BoxGeometry(it.s[0], it.s[1], it.s[2])
    e.set(...(it.r || [0, 0, 0]))
    q.setFromEuler(e)
    mat.compose(new THREE.Vector3(...it.p), q, new THREE.Vector3(1, 1, 1))
    g.applyMatrix4(mat)
    col.set(it.c || '#ffffff')
    const n = g.attributes.position.count
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = col.r
      arr[i * 3 + 1] = col.g
      arr[i * 3 + 2] = col.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(arr, 3))
    geos.push(g)
  }
  const merged = mergeGeometries(geos)
  geos.forEach((g) => g.dispose())
  return merged
}

export function mergeTransformed(list) {
  // list: [geometry, matrix4]
  const geos = list.map(([g, m]) => {
    const c = g.clone()
    c.applyMatrix4(m)
    if (c.index) return c.toNonIndexed()
    return c
  })
  geos.forEach((g) => {
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name)
  })
  return mergeGeometries(geos)
}

export const deg = (d) => (d * Math.PI) / 180

// Cylinder between two points (legs, rails, wire frames).
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
export function Rod({ a, b, r = 0.01, rb, m = M.blackMetal, seg = 10, shadow = true }) {
  _a.set(...a)
  _b.set(...b)
  const len = _a.distanceTo(_b)
  const mid = _a.clone().add(_b).multiplyScalar(0.5)
  const q = new THREE.Quaternion().setFromUnitVectors(_up, _b.clone().sub(_a).normalize())
  return (
    <mesh geometry={cylGeo(rb ?? r, r, len, seg)} position={mid} quaternion={q} material={m} castShadow={shadow} receiveShadow />
  )
}
