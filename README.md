# Apartment A9 — 3D walkthrough

A React + Three.js walkthrough of flat A9 (1st floor, segment A, 50.00 m²), built
from the developer's plan, with the living room and bathroom styled after the
reference photos.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. `npm run build` makes a static site in `dist/`
that any web host can serve.

## Getting around

| | |
|---|---|
| **Walk** | Drag to look, click/tap the floor to walk there, `WASD`/arrows to move, `Shift` to hurry, scroll to zoom |
| **Guided tour** | Hall, living room, kitchen, terrace, bathroom, then bedroom, with captions. Drag or press a key to take over |
| **Dollhouse** | Roof off, orbit around, click a room label to step inside |
| **Plan** (bottom left) | Live floor plan; click any room to jump there |

The top right switches between day and evening and between high quality and fast mode
(fast mode turns off ambient occlusion and bloom and uses smaller shadows, which helps on laptops).

## Where things live

- `src/plan.js` holds the floor plan in centimetres, taken from the sheet: walls, openings, room
  areas, skirting runs and the guided-tour route. Change a number here and the
  walls, floors, minimap and collisions all follow.
- `src/scene/Living.jsx` covers the navy storage wall, sofa, dining, bookshelf, galley kitchen and fridge.
- `src/scene/Bathroom.jsx` covers the Mondrian bath, sewing-table basin, pipe shelving, washer and toilet.
- `src/scene/Bedroom.jsx`, `Hall.jsx` and `Exterior.jsx` cover the remaining rooms, the terrace, the building and the garden.
- `src/lib/textures.js` paints every texture procedurally (oak, walnut, tiles,
  fabric, Bauhaus poster), so there are no image assets to download.
- `src/lib/materials.js` defines the shared palette and materials.
