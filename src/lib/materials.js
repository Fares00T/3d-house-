import * as THREE from 'three'
import * as T from './textures.js'

const std = (color, roughness = 0.6, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })
const phys = (opts) => new THREE.MeshPhysicalMaterial(opts)

function build() {
  const fabric = T.fabricTexture()
  const fabricMat = (color, roughness = 0.95) => std(color, roughness, 0, { map: fabric, bumpMap: fabric, bumpScale: 0.6 })
  const tileBump = T.wallTileTexture(true)

  return {
    // shell
    paint: std('#e7e5e1', 0.92),
    ceiling: std('#f4f3f0', 0.95),
    render: std('#e6e4df', 0.95),
    facade: std('#ffffff', 0.95, 0, { map: T.facadeTexture() }),
    satin: std('#f3f2ee', 0.45),
    oak: std('#ffffff', 0.52, 0, { map: T.oakTexture(), bumpMap: T.oakTexture(), bumpScale: 0.35 }),
    tileWall: std('#ffffff', 0.16, 0, { map: T.wallTileTexture(), bumpMap: tileBump, bumpScale: 1.4 }),
    tileFloor: std('#ffffff', 0.1, 0, { map: T.floorTileTexture() }),
    stone: std('#ffffff', 0.85, 0, { map: T.stoneTexture() }),
    grass: std('#ffffff', 1, 0, { map: T.grassTexture() }),
    concrete: std('#b9b7b2', 0.9),
    paving: std('#a9a59d', 0.9),

    // joinery
    walnut: std('#ffffff', 0.42, 0, { map: T.walnutTexture() }),
    walnutMatte: std('#d9cfc6', 0.6, 0, { map: T.walnutTexture() }),
    walnutGloss: phys({ color: '#ffffff', map: T.walnutTexture(), roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
    lightWood: std('#c29a6e', 0.55),
    navy: std('#1c2a4a', 0.5),
    navyDeep: std('#141f38', 0.6),
    graphite: std('#45494d', 0.45),
    carcass: std('#262829', 0.8),
    seam: std('#0d0f14', 0.9),

    // metals & glass
    chrome: std('#eaeaea', 0.08, 1),
    steel: std('#c3c6c9', 0.28, 1),
    brushed: std('#8c8f92', 0.35, 1),
    brass: std('#c6a15b', 0.28, 1),
    blackMetal: std('#1c1c1d', 0.4, 0.55),
    iron: std('#191919', 0.55, 0.6),
    frame: std('#33363a', 0.38, 0.45),
    glass: phys({
      color: '#dce9e8', transparent: true, opacity: 0.14, roughness: 0.03, metalness: 0,
      envMapIntensity: 2.2, depthWrite: false, side: THREE.DoubleSide,
    }),
    frosted: phys({
      color: '#f2f6f6', transparent: true, opacity: 0.55, roughness: 0.6, depthWrite: false, side: THREE.DoubleSide,
    }),
    mirror: std('#eef2f2', 0.03, 1),
    roof: std('#9c9a95', 0.95),
    blackGlass: phys({ color: '#0b0b0c', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05 }),
    hob: phys({ color: '#ffffff', map: T.hobTexture(), roughness: 0.08, clearcoat: 1 }),

    // ceramics & lacquers
    ceramic: phys({ color: '#fbfbf9', roughness: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
    ceramicMatte: std('#efece6', 0.55),
    terracotta: std('#b4673f', 0.8),
    potGrey: std('#8e8b86', 0.7),
    fridge: phys({ color: '#76111f', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }),
    mondrian: phys({ color: '#ffffff', map: T.mondrianTexture(), roughness: 0.15, clearcoat: 0.6 }),
    whiteLacquer: phys({ color: '#f4f4f1', roughness: 0.25, clearcoat: 0.4 }),
    plastic: std('#f2f2f0', 0.35),
    black: std('#141414', 0.6),
    rubber: std('#2a2a2a', 0.85),

    // textiles
    sofa: fabricMat('#8e9095'),
    sofaButton: std('#5a5c60', 0.8),
    navyFabric: fabricMat('#2c3f69'),
    denimFabric: fabricMat('#4d6593'),
    redFabric: fabricMat('#c4271f'),
    redShell: std('#c4271f', 0.95, 0, { map: fabric, bumpMap: fabric, bumpScale: 0.6, side: THREE.DoubleSide }),
    sheer: std('#f6f3ee', 1, 0, { transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }),
    redPowder: std('#d0361f', 0.38, 0.25),
    charcoalFabric: fabricMat('#4a4d52'),
    linen: fabricMat('#f1eee8'),
    linenGrey: fabricMat('#c8c8c6'),
    oxbloodFabric: fabricMat('#6f1d27'),
    mustardFabric: fabricMat('#c8962e'),
    plaid: std('#ffffff', 0.95, 0, { map: T.plaidTexture() }),
    towelWhite: fabricMat('#f4f2ee'),
    towelBlue: fabricMat('#3b5998'),
    rugLiving: std('#ffffff', 1, 0, { map: T.rugTexture('living') }),
    rugBed: std('#ffffff', 1, 0, { map: T.rugTexture('bed') }),
    rugHall: std('#ffffff', 1, 0, { map: T.rugTexture('hall') }),
    shade: std('#f3ecdf', 0.9, 0, { side: THREE.DoubleSide, emissive: '#ffe2b8', emissiveIntensity: 0.15 }),
    wire: std('#cf3a22', 0.4, 0.3, { alphaMap: T.wireTexture(), alphaTest: 0.5, side: THREE.DoubleSide }),

    // art
    poster: std('#ffffff', 0.7, 0, { map: T.posterTexture() }),
    artLiving: std('#ffffff', 0.85, 0, { map: T.artTexture('living') }),
    artBed: std('#ffffff', 0.85, 0, { map: T.artTexture('bed') }),

    // plants
    leaf: std('#3f6b35', 0.6, 0, { side: THREE.DoubleSide }),
    leafDark: std('#2f5229', 0.65, 0, { side: THREE.DoubleSide }),
    leafLight: std('#6b8f3c', 0.65, 0, { side: THREE.DoubleSide }),
    bark: std('#5b4634', 0.95),
    foliage: std('#4d6b33', 0.95, 0, { flatShading: true }),
    foliage2: std('#5f7f3a', 0.95, 0, { flatShading: true }),
    soil: std('#3a2c22', 1),

    // light emitters (intensity is driven by day/night)
    bulb: std('#fff8ec', 0.4, 0, { emissive: '#ffd59a', emissiveIntensity: 1 }),
    spotGlow: std('#ffffff', 0.4, 0, { emissive: '#fff1da', emissiveIntensity: 1 }),
    led: std('#ffffff', 0.4, 0, { emissive: '#ffe1b0', emissiveIntensity: 1 }),
    globe: phys({ color: '#ffffff', roughness: 0.5, transmission: 0, emissive: '#fff0d8', emissiveIntensity: 1 }),
    bookVC: std('#ffffff', 0.75, 0, { vertexColors: true }),
    vc: std('#ffffff', 0.55, 0, { vertexColors: true }),
  }
}

export const M = build()

// Emissive levels per time of day.
export function applyTimeOfDay(time) {
  const night = time === 'night'
  M.bulb.emissiveIntensity = night ? 6 : 1.4
  M.spotGlow.emissiveIntensity = night ? 5 : 0.8
  M.led.emissiveIntensity = night ? 4 : 0.6
  M.globe.emissiveIntensity = night ? 2.6 : 0.5
  M.shade.emissiveIntensity = night ? 1.1 : 0.12
}
