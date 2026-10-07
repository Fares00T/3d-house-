import * as THREE from 'three'

// Every surface texture in the apartment is painted procedurally on a canvas,
// so the page needs no image downloads.

const cache = new Map()

export function rng(seed = 1) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function make(key, w, h, draw, { srgb = true, aniso = 8 } = {}) {
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = aniso
  cache.set(key, t)
  return t
}

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

function speckle(g, w, h, n, colors, rnd, size = 1.2) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(rnd() * colors.length) | 0]
    const s = rnd() * size + 0.3
    g.fillRect(rnd() * w, rnd() * h, s, s)
  }
}

// ---------------------------------------------------------------- wood
function grainPlank(g, x, y, len, h, base, rnd, dark = '#5b3a1e') {
  g.save()
  g.beginPath()
  g.rect(x, y, len, h)
  g.clip()
  g.fillStyle = base
  g.fillRect(x, y, len, h)
  // long tonal variation along the plank
  const lg = g.createLinearGradient(x, 0, x + len, 0)
  for (let i = 0; i <= 4; i++) {
    const v = rnd()
    lg.addColorStop(i / 4, v > 0.5 ? `rgba(255,240,215,${(v - 0.5) * 0.18})` : `rgba(70,40,15,${(0.5 - v) * 0.16})`)
  }
  g.fillStyle = lg
  g.fillRect(x, y, len, h)
  // grain lines
  const lines = 26 + ((rnd() * 14) | 0)
  for (let i = 0; i < lines; i++) {
    const yy = y + rnd() * h
    const amp = rnd() * 2.2
    const f = 0.004 + rnd() * 0.012
    const ph = rnd() * 6.28
    g.strokeStyle = hexA(dark, 0.04 + rnd() * 0.12)
    g.lineWidth = 0.5 + rnd() * 1.6
    g.beginPath()
    for (let px = x; px <= x + len; px += 12) {
      const py = yy + Math.sin(px * f + ph) * amp + Math.sin(px * f * 3.1 + ph) * amp * 0.3
      px === x ? g.moveTo(px, py) : g.lineTo(px, py)
    }
    g.stroke()
  }
  // cathedral figure occasionally
  if (rnd() < 0.45) {
    const cx = x + len * (0.25 + rnd() * 0.5)
    const cy = y + h * (0.3 + rnd() * 0.4)
    for (let k = 0; k < 6; k++) {
      g.strokeStyle = hexA(dark, 0.07 + rnd() * 0.06)
      g.lineWidth = 0.8 + rnd()
      g.beginPath()
      g.ellipse(cx, cy, 30 + k * 18 + rnd() * 6, 2 + k * 2.2, 0, 0, Math.PI * 2)
      g.stroke()
    }
  }
  // knot
  if (rnd() < 0.12) {
    const kx = x + rnd() * len
    const ky = y + h * (0.3 + rnd() * 0.4)
    g.fillStyle = hexA(dark, 0.55)
    g.beginPath()
    g.ellipse(kx, ky, 4 + rnd() * 3, 2.5 + rnd() * 2, 0, 0, Math.PI * 2)
    g.fill()
  }
  // edges
  g.fillStyle = 'rgba(55,35,18,0.55)'
  g.fillRect(x, y, len, 1.6)
  g.fillRect(x, y, 1.6, h)
  g.fillStyle = 'rgba(255,245,225,0.18)'
  g.fillRect(x, y + 1.6, len, 1.2)
  g.restore()
}

// Light oak planks; the canvas covers 1.6 m × 1.6 m (8 rows of 20 cm planks).
export const oakTexture = () =>
  make('oak', 1024, 1024, (g, W, H) => {
    const rnd = rng(11)
    const tones = ['#cfae83', '#d7b88f', '#c8a578', '#dcc099', '#c6a173', '#d2b086', '#d9ba90']
    const rows = 8
    const rh = H / rows
    for (let r = 0; r < rows; r++) {
      const y = r * rh
      const x0 = -rnd() * W
      let x = x0
      const planks = []
      while (x < x0 + W) {
        let len = W * (0.38 + rnd() * 0.42)
        if (x + len > x0 + W - W * 0.2) len = x0 + W - x
        planks.push([x, len, tones[(rnd() * tones.length) | 0]])
        x += len
      }
      for (const [px, len, tone] of planks) {
        const seed = rnd() * 1e9
        for (const off of [-W, 0, W]) {
          if (px + off + len < 0 || px + off > W) continue
          grainPlank(g, px + off, y, len, rh, tone, rng(seed), '#6a4422')
        }
      }
    }
  })

// Walnut veneer with vertical grain; canvas covers 0.8 m square.
export const walnutTexture = () =>
  make('walnut', 512, 512, (g, W, H) => {
    const rnd = rng(5)
    g.fillStyle = '#6b4329'
    g.fillRect(0, 0, W, H)
    // broad flitch bands
    for (let i = 0; i < 18; i++) {
      const x = rnd() * W
      const w = 20 + rnd() * 70
      g.fillStyle = rnd() > 0.5 ? `rgba(140,92,55,${rnd() * 0.25})` : `rgba(40,22,10,${rnd() * 0.25})`
      g.fillRect(x, 0, w, H)
      g.fillRect(x - W, 0, w, H)
    }
    for (let i = 0; i < 140; i++) {
      const xx = rnd() * W
      const amp = 1 + rnd() * 5
      const f = 0.006 + rnd() * 0.02
      const ph = rnd() * 6.28
      g.strokeStyle = rnd() > 0.35 ? `rgba(38,20,8,${0.08 + rnd() * 0.22})` : `rgba(170,120,80,${0.05 + rnd() * 0.12})`
      g.lineWidth = 0.6 + rnd() * 1.8
      for (const off of [-W, 0, W]) {
        g.beginPath()
        for (let py = 0; py <= H; py += 8) {
          const px = xx + off + Math.sin(py * f + ph) * amp + Math.sin(py * 0.05 + ph) * 0.6
          py === 0 ? g.moveTo(px, py) : g.lineTo(px, py)
        }
        g.stroke()
      }
    }
  })

// ---------------------------------------------------------------- tiles
// 15 cm square white wall tiles, 4 × 4 per canvas (0.6 m).
export const wallTileTexture = (bump = false) =>
  make(bump ? 'tileBump' : 'tile', 512, 512, (g, W) => {
    const rnd = rng(3)
    const n = 4
    const s = W / n
    const gr = 3
    g.fillStyle = bump ? '#000' : '#d3d3cf'
    g.fillRect(0, 0, W, W)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * s + gr
        const y = j * s + gr
        const w = s - gr * 2
        if (bump) {
          const rg = g.createLinearGradient(x, y, x + w, y + w)
          rg.addColorStop(0, '#f0f0f0')
          rg.addColorStop(0.08, '#ffffff')
          rg.addColorStop(0.92, '#ffffff')
          rg.addColorStop(1, '#c8c8c8')
          g.fillStyle = rg
          g.fillRect(x, y, w, w)
          continue
        }
        const v = 244 + ((rnd() * 8) | 0)
        g.fillStyle = `rgb(${v},${v},${v - 2})`
        g.fillRect(x, y, w, w)
        const hl = g.createLinearGradient(x, y, x + w, y + w)
        hl.addColorStop(0, 'rgba(255,255,255,0.7)')
        hl.addColorStop(0.5, 'rgba(255,255,255,0)')
        hl.addColorStop(1, 'rgba(0,0,0,0.05)')
        g.fillStyle = hl
        g.fillRect(x, y, w, w)
        g.strokeStyle = 'rgba(0,0,0,0.07)'
        g.strokeRect(x + 0.5, y + 0.5, w - 1, w - 1)
      }
  }, { srgb: !bump })

// Large glossy floor tile, one 60 cm tile per canvas.
export const floorTileTexture = () =>
  make('floorTile', 512, 512, (g, W) => {
    const rnd = rng(9)
    g.fillStyle = '#f1f1ee'
    g.fillRect(0, 0, W, W)
    speckle(g, W, W, 2600, ['rgba(0,0,0,0.035)', 'rgba(255,255,255,0.5)'], rnd, 2)
    g.fillStyle = '#cfcfca'
    g.fillRect(0, 0, W, 3)
    g.fillRect(0, 0, 3, W)
  })

// Mondrian tiles for the bath panel: 12 × 4 tiles over 1.70 m × 0.55 m.
export const mondrianTexture = () =>
  make('mondrian', 1200, 388, (g, W, H) => {
    const cols = 12
    const rows = 4
    const tw = W / cols
    const th = H / rows
    const col = (c) => (c < 4 ? '#8a1b2a' : c < 8 ? '#213f93' : c < 9 ? '#151517' : '#e1b21f')
    g.fillStyle = '#e9e8e3'
    g.fillRect(0, 0, W, H)
    const rnd = rng(4)
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        const x = c * tw + 2.5
        const y = r * th + 2.5
        g.fillStyle = col(c)
        g.fillRect(x, y, tw - 5, th - 5)
        const hl = g.createLinearGradient(x, y, x + tw, y + th)
        hl.addColorStop(0, `rgba(255,255,255,${0.16 + rnd() * 0.06})`)
        hl.addColorStop(0.45, 'rgba(255,255,255,0)')
        hl.addColorStop(1, 'rgba(0,0,0,0.12)')
        g.fillStyle = hl
        g.fillRect(x, y, tw - 5, th - 5)
      }
  })

// Outdoor porcelain stone, 2 × 2 tiles of 60 cm.
export const stoneTexture = () =>
  make('stone', 512, 512, (g, W) => {
    const rnd = rng(21)
    const s = W / 2
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const v = 160 + ((rnd() * 14) | 0)
        g.fillStyle = `rgb(${v},${v - 1},${v - 5})`
        g.fillRect(i * s, j * s, s, s)
      }
    speckle(g, W, W, 9000, ['rgba(60,60,55,0.12)', 'rgba(255,255,250,0.12)', 'rgba(120,110,95,0.12)'], rnd, 1.8)
    g.fillStyle = '#77756f'
    for (let i = 0; i < 2; i++) {
      g.fillRect(i * s, 0, 3, W)
      g.fillRect(0, i * s, W, 3)
    }
  })

export const grassTexture = () =>
  make('grass', 512, 512, (g, W) => {
    const rnd = rng(8)
    g.fillStyle = '#5d7a3a'
    g.fillRect(0, 0, W, W)
    for (let i = 0; i < 16000; i++) {
      const x = rnd() * W
      const y = rnd() * W
      const l = 2 + rnd() * 5
      const t = rnd()
      g.strokeStyle = t > 0.6 ? `rgba(140,170,80,${0.25 + rnd() * 0.3})` : t > 0.25 ? `rgba(40,70,25,${0.25 + rnd() * 0.3})` : `rgba(110,120,60,0.3)`
      g.lineWidth = 1
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + (rnd() - 0.5) * 2, y - l)
      g.stroke()
    }
  })

// Facade module: 3.2 m wide × 2.9 m tall with one window.
export const facadeTexture = () =>
  make('facade', 512, 464, (g, W, H) => {
    const rnd = rng(31)
    g.fillStyle = '#e7e5e0'
    g.fillRect(0, 0, W, H)
    speckle(g, W, H, 5000, ['rgba(0,0,0,0.025)', 'rgba(255,255,255,0.3)'], rnd, 2)
    const px = W / 3.2
    const wx = 0.85 * px
    const wy = 0.55 * px
    const ww = 1.5 * px
    const wh = 1.5 * px
    g.fillStyle = '#35393d'
    g.fillRect(wx - 4, H - wy - wh - 4, ww + 8, wh + 8)
    const gl = g.createLinearGradient(wx, H - wy - wh, wx + ww, H - wy)
    gl.addColorStop(0, '#5d6b78')
    gl.addColorStop(0.5, '#2f3a45')
    gl.addColorStop(1, '#46525e')
    g.fillStyle = gl
    g.fillRect(wx, H - wy - wh, ww, wh)
    g.fillStyle = '#35393d'
    g.fillRect(wx + ww / 2 - 3, H - wy - wh, 6, wh)
    g.fillStyle = '#c9c7c2'
    g.fillRect(wx - 10, H - wy, ww + 20, 6)
    g.fillStyle = 'rgba(0,0,0,0.06)'
    g.fillRect(0, 0, W, 5)
  })

// ---------------------------------------------------------------- fabric
export const fabricTexture = () =>
  make('fabric', 256, 256, (g, W) => {
    const rnd = rng(2)
    g.fillStyle = '#d8d8d8'
    g.fillRect(0, 0, W, W)
    for (let y = 0; y < W; y += 2) {
      g.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.05})`
      g.fillRect(0, y, W, 1)
    }
    for (let x = 0; x < W; x += 2) {
      g.fillStyle = `rgba(255,255,255,${0.04 + rnd() * 0.06})`
      g.fillRect(x, 0, 1, W)
    }
    speckle(g, W, W, 3000, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)'], rnd, 1.5)
  }, { srgb: true })

export const plaidTexture = () =>
  make('plaid', 256, 256, (g, W) => {
    g.fillStyle = '#d9cbb3'
    g.fillRect(0, 0, W, W)
    const bands = [
      [0, 40, 'rgba(120,84,60,0.55)'], [60, 8, 'rgba(255,250,240,0.6)'], [100, 22, 'rgba(90,60,40,0.4)'],
      [150, 40, 'rgba(120,84,60,0.5)'], [210, 8, 'rgba(40,30,25,0.5)'],
    ]
    for (const [p, w, c] of bands) {
      g.fillStyle = c
      g.fillRect(p, 0, w, W)
      g.fillRect(0, p, W, w)
    }
    const rnd = rng(6)
    speckle(g, W, W, 2500, ['rgba(0,0,0,0.1)', 'rgba(255,255,255,0.15)'], rnd, 1.5)
  })

export const wireTexture = () =>
  make('wire', 256, 256, (g, W) => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, W, W)
    g.strokeStyle = '#fff'
    g.lineWidth = 5
    const step = W / 6
    for (let i = -6; i <= 12; i++) {
      g.beginPath()
      g.moveTo(i * step, 0)
      g.lineTo(i * step + W, W)
      g.stroke()
      g.beginPath()
      g.moveTo(i * step, W)
      g.lineTo(i * step + W, 0)
      g.stroke()
    }
  }, { srgb: false })

// ---------------------------------------------------------------- rugs
export const rugTexture = (kind) =>
  make('rug-' + kind, 1024, 800, (g, W, H) => {
    const rnd = rng(kind.length * 7)
    if (kind === 'living') {
      g.fillStyle = '#d9d2c4'
      g.fillRect(0, 0, W, H)
      speckle(g, W, H, 40000, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.12)', 'rgba(120,100,80,0.06)'], rnd, 2.2)
      g.strokeStyle = 'rgba(31,46,82,0.75)'
      g.lineWidth = 6
      g.strokeRect(40, 40, W - 80, H - 80)
      g.lineWidth = 2
      g.strokeRect(60, 60, W - 120, H - 120)
      g.fillStyle = 'rgba(31,46,82,0.12)'
      for (let i = 0; i < 9; i++) g.fillRect(120 + i * 95, 120, 30, H - 240)
    } else if (kind === 'bed') {
      g.fillStyle = '#5d6676'
      g.fillRect(0, 0, W, H)
      speckle(g, W, H, 40000, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.08)'], rnd, 2.2)
      g.strokeStyle = 'rgba(225,220,205,0.45)'
      g.lineWidth = 3
      for (let x = -H; x < W + H; x += 70) {
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x + H, H)
        g.moveTo(x + H, 0)
        g.lineTo(x, H)
        g.stroke()
      }
    } else {
      g.fillStyle = '#2b3550'
      g.fillRect(0, 0, W, H)
      const cols = ['#c7362b', '#e2d9c6', '#2b3550', '#b28a3d', '#e2d9c6']
      for (let x = 0; x < W; x += 64) {
        g.fillStyle = cols[(x / 64) % cols.length]
        g.fillRect(x, 0, 30, H)
      }
      speckle(g, W, H, 40000, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.08)'], rnd, 2.2)
    }
  })

// ---------------------------------------------------------------- art
export const posterTexture = () =>
  make('poster', 560, 800, (g, W, H) => {
    g.fillStyle = '#f0ece3'
    g.fillRect(0, 0, W, H)
    g.fillStyle = '#151515'
    g.font = '600 46px Jost, Futura, sans-serif'
    g.fillText('BAUHAUS', 54, 92)
    g.font = '400 15px Jost, Futura, sans-serif'
    g.fillText('AUSSTELLUNG  ·  WEIMAR  1923', 56, 118)
    const L = 40
    const T = 150
    const R = W - 40
    const B = H - 90
    const blocks = [
      [L, T, 120, 80, '#f0ece3'], [L + 132, T, R - L - 132, 400, '#c7271f'],
      [L, T + 92, 52, 150, '#1d3f8e'], [L + 64, T + 92, 56, 150, '#f0ece3'],
      [L, T + 254, 120, 146, '#f0ece3'], [L, T + 412, 70, B - T - 412, '#f0ece3'],
      [L + 82, T + 412, 160, B - T - 412, '#f0ece3'], [L + 254, T + 412, R - L - 254, 110, '#f0ece3'],
      [L + 254, T + 534, R - L - 254, B - T - 534, '#e3b322'], [L, T + 254 + 160, 0, 0, '#000'],
    ]
    g.fillStyle = '#151515'
    g.fillRect(L - 10, T - 10, R - L + 20, B - T + 20)
    for (const [x, y, w, h, c] of blocks) {
      g.fillStyle = c
      g.fillRect(x, y, w, h)
    }
    g.font = '400 13px Jost, Futura, sans-serif'
    g.fillStyle = '#333'
    g.fillText('STAATLICHES BAUHAUS  —  KUNST UND TECHNIK', 54, H - 52)
  })

export const artTexture = (kind) =>
  make('art-' + kind, 800, 1000, (g, W, H) => {
    if (kind === 'living') {
      g.fillStyle = '#e8e1d3'
      g.fillRect(0, 0, W, H)
      g.fillStyle = '#1f2e52'
      g.beginPath()
      g.arc(W * 0.42, H * 0.36, W * 0.26, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#c7362b'
      g.beginPath()
      g.arc(W * 0.6, H * 0.66, W * 0.22, Math.PI, 0)
      g.fill()
      g.fillStyle = '#b28a3d'
      g.fillRect(W * 0.18, H * 0.66, W * 0.64, H * 0.05)
      g.strokeStyle = '#151515'
      g.lineWidth = 6
      g.beginPath()
      g.moveTo(W * 0.2, H * 0.85)
      g.lineTo(W * 0.8, H * 0.85)
      g.stroke()
    } else {
      g.fillStyle = '#ece7dc'
      g.fillRect(0, 0, W, H)
      const rnd = rng(77)
      const cols = ['#1f2e52', '#7a1a28', '#b28a3d', '#5d6676']
      for (let i = 0; i < 7; i++) {
        g.strokeStyle = cols[i % cols.length]
        g.lineWidth = 10 + rnd() * 26
        g.beginPath()
        const y = H * (0.2 + i * 0.1)
        g.moveTo(-20, y)
        for (let x = 0; x <= W + 40; x += 40) g.lineTo(x, y + Math.sin(x * 0.008 + i) * 40 * rnd())
        g.stroke()
      }
    }
  })

export const hobTexture = () =>
  make('hob', 512, 448, (g, W, H) => {
    g.fillStyle = '#0d0d0e'
    g.fillRect(0, 0, W, H)
    g.strokeStyle = 'rgba(200,200,200,0.35)'
    g.lineWidth = 3
    for (const [x, y, r] of [[140, 130, 90], [380, 120, 70], [140, 330, 70], [380, 320, 92]]) {
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.stroke()
    }
    g.fillStyle = 'rgba(220,220,220,0.5)'
    for (let i = 0; i < 6; i++) g.fillRect(170 + i * 30, H - 30, 14, 4)
  })
