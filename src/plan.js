// Floor plan of apartment A9 (1st floor, segment A, 50.00 m²).
// Plan coordinates are centimetres measured from the inner top-left corner of
// the living room as drawn on the developer sheet: x → right, y → down.
// In the 3D world one unit is a metre: X = x / 100, Z = y / 100, Y is up.

export const toM = (v) => v / 100
export const CEIL = 270
export const DOOR_TOP = 205

// Axis-aligned wall boxes. `axis` is the direction the wall runs in.
// Openings are measured along that axis; bottom/top are heights in cm.
export const WALLS = [
  {
    id: 'west', x0: -25, x1: 0, y0: -25, y1: 826, axis: 'y',
    openings: [
      { from: 140, to: 390, bottom: 0, top: 235 }, // terrace sliding door
      { from: 615, to: 715, bottom: 0, top: 210 }, // bedroom french window
    ],
  },
  {
    id: 'north', x0: -25, x1: 560, y0: -25, y1: 0, axis: 'x',
    openings: [{ from: 15, to: 285, bottom: 0, top: 235 }], // terrace glazing
  },
  { id: 'kitchenEast', x0: 535, x1: 560, y0: 0, y1: 523, axis: 'y' },
  { id: 'hallNorth', x0: 535, x1: 942, y0: 498, y1: 523, axis: 'x' },
  { id: 'bathEast', x0: 917, x1: 942, y0: 498, y1: 826, axis: 'y' },
  {
    id: 'south', x0: -25, x1: 942, y0: 801, y1: 826, axis: 'x',
    openings: [{ from: 580, to: 670, bottom: 0, top: DOOR_TOP }], // entrance
  },
  {
    id: 'core', x0: 385, x1: 410, y0: 523, y1: 801, axis: 'y',
    openings: [{ from: 650, to: 730, bottom: 0, top: DOOR_TOP }], // bedroom door
  },
  // wall between the living room and the bedroom; the hall opens straight into the living room
  { id: 'livSouth', x0: 0, x1: 410, y0: 511, y1: 523, axis: 'x' },
  {
    id: 'hallBath', x0: 675, x1: 687, y0: 523, y1: 801, axis: 'y',
    openings: [{ from: 625, to: 695, bottom: 0, top: DOOR_TOP }], // bathroom door
  },
]

// Split a wall into solid boxes around its openings.
export function wallPieces(w) {
  const pieces = []
  const [a0, a1] = w.axis === 'y' ? [w.y0, w.y1] : [w.x0, w.x1]
  const mk = (a, b, bottom, top) =>
    w.axis === 'y'
      ? { x0: w.x0, x1: w.x1, y0: a, y1: b, bottom, top }
      : { x0: a, x1: b, y0: w.y0, y1: w.y1, bottom, top }
  let cur = a0
  for (const o of [...(w.openings || [])].sort((p, q) => p.from - q.from)) {
    if (o.from > cur) pieces.push(mk(cur, o.from, 0, CEIL))
    if (o.top < CEIL) pieces.push(mk(o.from, o.to, o.top, CEIL))
    if (o.bottom > 0) pieces.push(mk(o.from, o.to, 0, o.bottom))
    cur = o.to
  }
  if (cur < a1) pieces.push(mk(cur, a1, 0, CEIL))
  return pieces
}

// Rooms as on the sheet. Rects are [x0, y0, x1, y1] in cm.
export const ROOMS = [
  {
    id: 'hall', code: 'A9/1', name: 'Entrance hall', area: '9.49',
    rects: [[410, 523, 675, 801]],
    tag: [540, 700],
    blurb: 'A mirrored wardrobe and a walnut shoe bench, open straight onto the living room.',
    view: { p: [625, 745], look: [470, 520] },
  },
  {
    id: 'bath', code: 'A9/2', name: 'Bathroom', area: '6.04',
    rects: [[687, 523, 917, 801]],
    tag: [800, 760],
    blurb: 'White square tiles, a Mondrian-panelled bath and a basin on an old cast-iron sewing table.',
    view: { p: [720, 680], look: [900, 600] },
  },
  {
    id: 'living', code: 'A9/3', name: 'Living room + kitchenette', area: '24.44',
    rects: [[0, 0, 535, 511]],
    tag: [190, 300],
    blurb: 'A freestanding navy storage wall with open walnut shelving screens the galley kitchen from the sofa.',
    view: { p: [30, 230], look: [360, 230] },
  },
  {
    id: 'bedroom', code: 'A9/4', name: 'Bedroom', area: '10.03',
    rects: [[0, 523, 385, 801]],
    tag: [190, 770],
    blurb: 'A quiet room with a navy channel-tufted headboard and a french window to the garden.',
    view: { p: [345, 770], look: [150, 600] },
  },
  {
    id: 'terrace', code: 'T', name: 'Terrace', area: '11.6',
    rects: [[-172, -172, 300, -25], [-172, -25, -25, 525]],
    tag: [-100, 300],
    blurb: 'An L-shaped terrace wrapping the living room, reached through the sliding door.',
    view: { p: [-95, 330], look: [-95, -60] },
  },
]

export const roomAt = (x, y) =>
  ROOMS.find((r) => r.rects.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d))

// Skirting runs: [x0, y0, x1, y1, nx, ny] where n points into the room.
export const SKIRTING = [
  // living room + kitchen
  [0, 0, 15, 0, 0, 1], [285, 0, 345, 0, 0, 1], [385, 0, 475, 0, 0, 1],
  [0, 0, 0, 140, 1, 0], [0, 390, 0, 511, 1, 0],
  [0, 511, 410, 511, 0, -1],
  [535, 320, 535, 523, -1, 0],
  // hall
  [410, 523, 410, 650, 1, 0], [410, 730, 410, 801, 1, 0],
  [410, 801, 580, 801, 0, -1],
  [675, 583, 675, 625, -1, 0], [675, 695, 675, 801, -1, 0],
  // bedroom
  [60, 523, 385, 523, 0, 1],
  [0, 715, 0, 801, 1, 0],
  [385, 523, 385, 650, -1, 0], [385, 730, 385, 801, -1, 0],
  [0, 801, 385, 801, 0, -1],
]

// Guided tour. Positions/looks in cm; dwell in seconds. Nodes without a
// caption are pass-through points that keep the camera on a clean route.
export const TOUR = [
  { p: [625, 760], look: [560, 520], dwell: 3.5, room: 'hall', pan: -0.4 },
  { p: [560, 640] },
  { p: [470, 560] },
  { p: [430, 470] },
  { p: [300, 400] },
  { p: [180, 350] },
  { p: [60, 320] },
  { p: [30, 230], look: [360, 230], dwell: 5, room: 'living', pan: 0.4 },
  { p: [190, 330], look: [110, 480], dwell: 3, pan: -0.5 },
  { p: [300, 390] },
  { p: [430, 440], look: [430, 0], dwell: 4, room: 'kitchen', pan: 0.3 },
  { p: [300, 390] },
  { p: [160, 340] },
  { p: [60, 290] },
  { p: [-25, 210] },
  { p: [-95, 160], look: [-95, -120], dwell: 4, room: 'terrace', pan: 1.1 },
  { p: [-30, 220] },
  { p: [60, 295] },
  { p: [180, 355] },
  { p: [300, 400] },
  { p: [430, 470] },
  { p: [470, 560] },
  { p: [620, 660] },
  { p: [715, 660], look: [900, 600], dwell: 4.5, room: 'bath', pan: 0.6 },
  { p: [600, 690] },
  { p: [450, 690] },
  { p: [340, 760], look: [150, 600], dwell: 4.5, room: 'bedroom', pan: -0.6 },
]

export const TOUR_CAPTIONS = {
  hall: { code: 'A9/1', title: 'Entrance hall', text: 'A mirrored wardrobe and a walnut shoe bench by the front door.' },
  living: { code: 'A9/3', title: 'Living room', text: 'A freestanding navy storage wall with open walnut shelves hides the kitchen behind it.' },
  kitchen: { code: 'A9/3', title: 'Kitchenette', text: 'A handle-less graphite galley behind the navy wall, with a burgundy retro fridge.' },
  terrace: { code: 'T', title: 'Terrace', text: 'Sliding glass opens the living room onto an L-shaped terrace.' },
  bath: { code: 'A9/2', title: 'Bathroom', text: 'Primary-colour tiles on the bath, a basin on a vintage sewing table.' },
  bedroom: { code: 'A9/4', title: 'Bedroom', text: 'Navy headboard, walnut nightstands, light from a french window.' },
}

// Where the walk starts after the intro.
export const START = { p: [30, 230], look: [360, 230] }
