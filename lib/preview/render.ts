import { MapEntity, OutpostMap } from './decode';
import manifest from './sprites.json';

// Draws a generated outpost with the game's own sprites. The atlas and its
// manifest come from scripts/build-sprites.py.

// atlas x, y, width, height, then the offset of the sprite's top-left corner
// from the entity centre, in tiles
type Sprite = [number, number, number, number, number, number];

const SPRITES = manifest.sprites as unknown as { [name: string]: Sprite };
const GROUND = manifest.ground as unknown as {
  [name: string]: [number, number, number, number];
};
export const ATLAS_PPT: number = manifest.ppt;

export type Assets = {
  sprites: HTMLImageElement;
  // one canvas per ground texture so each can be used as a repeating pattern
  ground: { [name: string]: HTMLCanvasElement };
};

let assets: Promise<Assets> | null = null;

function image(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export function loadAssets(): Promise<Assets> {
  if (!assets) {
    assets = Promise.all([
      image(`/img/outpost/sprites.webp?v=${manifest.version}`),
      image(`/img/outpost/ground.webp?v=${manifest.version}`),
    ]).then(([sprites, groundSheet]) => {
      const ground: Assets['ground'] = {};
      Object.keys(GROUND).forEach((name) => {
        const [x, y, w, h] = GROUND[name];
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(groundSheet, x, y, w, h, 0, 0, w, h);
        ground[name] = canvas;
      });
      return { sprites, ground };
    });
    // a failed load should be retried on the next draw, not cached
    assets.catch(() => (assets = null));
  }
  return assets;
}

export type World = {
  canvas: HTMLCanvasElement;
  // bounds of the canvas in tiles
  x0: number;
  y0: number;
  w: number;
  h: number;
  // what is actually drawn, in tiles: the outpost's footprint grown by however
  // far its sprites reach beyond it (a pole stands three tiles tall). Shadows,
  // ore and the ground do not count.
  view: { x0: number; y0: number; x1: number; y1: number };
};

// extra tiles drawn around the outpost so tall sprites and shadows fit
const MARGIN = 4;
// see-through enough to show the track and the inserters beneath it
const TRAIN_ALPHA = 0.6;
// longest side of the pre-rendered outpost, which caps memory use
const MAX_WORLD_PX = 3072;

const VEC: { [dir: number]: [number, number] } = {
  0: [0, -1],
  2: [1, 0],
  4: [0, 1],
  6: [-1, 0],
};
const LETTER: { [dir: number]: string } = { 0: 'n', 2: 'e', 4: 's', 6: 'w' };
const SIDES: [string, number, number][] = [
  ['n', 0, -1],
  ['e', 1, 0],
  ['s', 0, 1],
  ['w', -1, 0],
];
const BEHIND: { [dir: number]: string } = { 0: 's', 2: 'w', 4: 'n', 6: 'e' };

// stable pseudo-random number in [0, 1) for a tile, so variations don't
// flicker between redraws
function hash(x: number, y: number) {
  let h = (Math.imul(Math.floor(x), 374761393) + Math.imul(Math.floor(y), 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const key = (x: number, y: number) => `${x},${y}`;

const ORE_NAMES: { [item: string]: string } = {
  'Iron Ore': 'iron',
  'Copper Ore': 'copper',
  Coal: 'coal',
  Stone: 'stone',
  'Uranium Ore': 'uranium',
};

export function oreKey(item: string) {
  return ORE_NAMES[item] ?? 'iron';
}

// Renders the whole outpost once into an offscreen canvas. The on-screen
// canvas then only has to scale and position that picture, which keeps
// panning and zooming cheap.
export function renderWorld(
  map: OutpostMap,
  { sprites, ground }: Assets,
  ore: string,
  // canvas of the previous render, reused so quick changes don't pile up memory
  reuse?: HTMLCanvasElement,
): World {
  const x0 = map.x0 - MARGIN;
  const y0 = map.y0 - MARGIN;
  const w = map.x1 - map.x0 + MARGIN * 2;
  const h = map.y1 - map.y0 + MARGIN * 2;
  const ppt = Math.max(4, Math.min(ATLAS_PPT, Math.floor(MAX_WORLD_PX / Math.max(w, h))));
  const k = ppt / ATLAS_PPT;

  const canvas = reuse ?? document.createElement('canvas');
  // setting the size also clears whatever was drawn before
  canvas.width = Math.ceil(w * ppt);
  canvas.height = Math.ceil(h * ppt);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingQuality = 'high';

  const view = { x0: map.x0, y0: map.y0, x1: map.x1, y1: map.y1 };
  // off while the ground, the ore and the shadows are drawn
  let measuring = false;

  const draw = (name: string, cx: number, cy: number, scale = 1) => {
    const s = SPRITES[name];
    if (!s) return false;
    if (measuring) {
      const left = cx + s[4] * scale;
      const top = cy + s[5] * scale;
      view.x0 = Math.min(view.x0, left);
      view.y0 = Math.min(view.y0, top);
      view.x1 = Math.max(view.x1, left + (s[2] / ATLAS_PPT) * scale);
      view.y1 = Math.max(view.y1, top + (s[3] / ATLAS_PPT) * scale);
    }
    ctx.drawImage(
      sprites,
      s[0],
      s[1],
      s[2],
      s[3],
      (cx - x0 + s[4] * scale) * ppt,
      (cy - y0 + s[5] * scale) * ppt,
      s[2] * k * scale,
      s[3] * k * scale,
    );
    return true;
  };

  const centre = (e: MapEntity): [number, number] => [e.x + e.w / 2, e.y + e.h / 2];

  // entity positions can sit on half tiles; find the grid the 1x1 entities use
  const unit = map.entities.find((e) => e.w === 1 && e.h === 1);
  const fx = unit ? unit.x - Math.floor(unit.x) : 0;
  const fy = unit ? unit.y - Math.floor(unit.y) : 0;

  /* ---- floor tiles ---- */
  if (map.tiles.length) {
    const groups: { [texture: string]: OutpostMap['tiles'] } = {};
    map.tiles.forEach((t) => {
      const texture = ground[t.name] ? t.name : 'concrete';
      (groups[texture] = groups[texture] || []).push(t);
    });
    ctx.save();
    // work in atlas pixels so the pattern lines up with the tile grid
    ctx.setTransform(k, 0, 0, k, -x0 * ppt, -y0 * ppt);
    Object.keys(groups).forEach((texture) => {
      ctx.fillStyle = ctx.createPattern(ground[texture], 'repeat');
      ctx.beginPath();
      groups[texture].forEach((t) => {
        ctx.rect(t.x * ATLAS_PPT, t.y * ATLAS_PPT, ATLAS_PPT, ATLAS_PPT);
      });
      ctx.fill();
    });
    ctx.restore();
  }

  /* ---- the ore patch: no further than its rectangle, with its rim thinned ---- */
  if (map.ore) {
    const left = Math.floor(map.ore.x - fx) + fx;
    const top = Math.floor(map.ore.y - fy) + fy;
    const right = map.ore.x + map.ore.w;
    const bottom = map.ore.y + map.ore.h;
    for (let ty = top; ty < bottom; ty++) {
      for (let tx = left; tx < right; tx++) {
        // tiles in from the nearest edge, along each axis
        const inX = Math.min(tx - left, right - 1 - tx);
        const inY = Math.min(ty - top, bottom - 1 - ty);
        const r = hash(tx - left, ty - top);
        // a real patch is not a rectangle: its corners are rounded off
        if (inX + inY < 2 && r > 0.35) continue;
        const variant = Math.floor(hash(ty - top, tx - left) * 8);
        const thin = Math.min(inX, inY) === 0 && r > 0.35;
        draw(`ore-${ore}-${thin ? 'thin-' : ''}${variant}`, tx + 0.5, ty + 0.5);
      }
    }
  }

  /* ---- lookups for sprites that depend on their neighbours ---- */
  const walls = new Set<string>();
  const railTiles = new Set<string>();
  // what a pipe can join up with, by tile
  const plumbing = new Map<string, MapEntity>();
  const belts = new Map<string, { dir: number; sinks: boolean }>();
  map.entities.forEach((e) => {
    if (e.kind === 'wall' || e.kind === 'gate') {
      walls.add(key(e.x, e.y));
    } else if (['pipe', 'pipeground', 'pump', 'tank', 'pumpjack'].includes(e.kind)) {
      for (let i = 0; i < e.w; i++) {
        for (let j = 0; j < e.h; j++) plumbing.set(key(e.x + i, e.y + j), e);
      }
    } else if (e.kind === 'rail') {
      for (let i = 0; i < e.w; i++) {
        for (let j = 0; j < e.h; j++) railTiles.add(key(e.x + i, e.y + j));
      }
    } else if (e.kind === 'belt' || e.kind === 'underground' || e.kind === 'splitter') {
      for (let i = 0; i < e.w; i++) {
        for (let j = 0; j < e.h; j++) {
          // an underground entrance carries items away below the surface
          belts.set(key(e.x + i, e.y + j), {
            dir: e.dir,
            sinks: e.kind === 'underground' && e.io === 'in',
          });
        }
      }
    }
  });

  const wallSprite = (e: MapEntity) => {
    const west = walls.has(key(e.x - 1, e.y));
    const east = walls.has(key(e.x + 1, e.y));
    const south = walls.has(key(e.x, e.y + 1));
    if (west && east) return south ? 't' : 'h';
    if (west) return south ? 'cl' : 'el';
    if (east) return south ? 'cr' : 'er';
    return south ? 'v' : 'single';
  };

  // straight, or curved when the only belt feeding it comes from the side
  const beltSprite = (e: MapEntity) => {
    const tier = e.tier === undefined || e.tier > 2 ? 0 : e.tier;
    const feeding = SIDES.filter(([, ox, oy]) => {
      const other = belts.get(key(e.x + ox, e.y + oy));
      if (!other || other.sinks) return false;
      const [vx, vy] = VEC[other.dir] ?? [0, 0];
      return vx === -ox && vy === -oy;
    }).map(([side]) => side);
    const straight = `belt${tier}-${LETTER[e.dir] ?? 'n'}`;
    if (e.kind !== 'belt' || feeding.includes(BEHIND[e.dir]) || feeding.length !== 1) {
      return straight;
    }
    return `belt${tier}-${feeding[0]}_${LETTER[e.dir]}`;
  };

  const beltTier = (e: MapEntity) => (e.tier === undefined || e.tier > 2 ? 0 : e.tier);

  // Which sides a pipe continues on, as letters in the order n, e, s, w.
  const pipeSides = (e: MapEntity) =>
    SIDES.filter(([, ox, oy]) => {
      const other = plumbing.get(key(e.x + ox, e.y + oy));
      if (!other) return false;
      const [vx, vy] = VEC[other.dir] ?? [0, 0];
      switch (other.kind) {
        case 'pipeground':
          // only the open end of an underground pipe connects
          return vx === -ox && vy === -oy;
        case 'pump':
          // pumps connect at their two ends, not along their sides
          return (vx !== 0) === (ox !== 0);
        case 'pumpjack': {
          // one outlet, on the tile the pumpjack faces
          const outlet = { 0: [2, -1], 2: [3, 0], 4: [0, 3], 6: [-1, 2] }[other.dir] ?? [0, 0];
          return other.x + outlet[0] === e.x && other.y + outlet[1] === e.y;
        }
        default:
          return true;
      }
    })
      .map(([side]) => side)
      .join('');

  // A gate in a horizontal wall is "h". Across a track it is drawn as two
  // halves; "half" says which one this tile is, or null away from rails.
  const gateShape = (e: MapEntity) => {
    const axis = e.dir % 4 === 2 ? 'h' : 'v';
    if (!railTiles.has(key(e.x, e.y))) return { axis, half: null as number | null };
    const before = axis === 'h' ? key(e.x - 1, e.y) : key(e.x, e.y - 1);
    const paired = walls.has(before) && railTiles.has(before);
    return { axis, half: paired ? 1 : 0 };
  };

  const shadowOf = (e: MapEntity): string | null => {
    switch (e.kind) {
      case 'drill':
        return `drill-${e.dir}-s`;
      case 'pumpjack':
        return `pumpjack-${e.dir}-s`;
      case 'tank':
        return `tank-${e.dir % 4 === 0 ? 0 : 1}-s`;
      case 'beacon':
        return 'beacon-s';
      case 'wall':
        return `wall-${wallSprite(e)}-s`;
      case 'gate':
        return `gate-${gateShape(e).axis}-s`;
      case 'laser':
        return `laser-${e.dir}-s`;
      case 'chest':
      case 'requester':
      case 'provider':
        return 'chest-s';
      case 'stop':
        return `stop-${e.dir}-s`;
      case 'pole':
      case 'lamp':
      case 'radar':
      case 'roboport':
        return `${e.kind}-s`;
      default:
        return null;
    }
  };

  /* ---- shadows ---- */
  ctx.globalAlpha = 0.45;
  map.entities.forEach((e) => {
    const name = shadowOf(e);
    if (!name) return;
    const [cx, cy] = centre(e);
    draw(name, cx, cy, e.kind === 'drill' ? e.w / 3 : 1);
  });
  ctx.globalAlpha = 1;
  measuring = true;

  /* ---- things that lie flat on the ground ---- */
  map.entities.forEach((e) => {
    if (e.kind !== 'rail') return;
    const [cx, cy] = centre(e);
    draw(e.dir % 4 === 0 ? 'rail-v' : 'rail-h', cx, cy);
  });
  map.entities.forEach((e) => {
    // the oil a pumpjack stands on
    if (e.kind === 'pumpjack') draw('oil', ...centre(e));
  });
  map.entities.forEach((e) => {
    if (e.kind !== 'gate') return;
    const { axis, half } = gateShape(e);
    // one base per pair of halves, centred between them
    if (half === 0) draw(`gate-base-${axis}`, e.x + (axis === 'h' ? 1 : 0.5), e.y + (axis === 'h' ? 0.5 : 1));
  });
  map.entities.forEach((e) => {
    if (e.kind !== 'stop') return;
    const [cx, cy] = centre(e);
    draw(`stop-${e.dir}-ground`, cx, cy);
  });
  map.entities.forEach((e) => {
    if (e.kind === 'belt' || e.kind === 'underground') {
      draw(beltSprite(e), e.x + 0.5, e.y + 0.5);
    } else if (e.kind === 'splitter') {
      const name = `belt${beltTier(e)}-${LETTER[e.dir] ?? 'n'}`;
      for (let i = 0; i < e.w; i++) {
        for (let j = 0; j < e.h; j++) draw(name, e.x + i + 0.5, e.y + j + 0.5);
      }
    }
  });

  /* ---- everything that stands up, back to front ---- */
  const standing = map.entities
    .filter((e) => e.kind !== 'rail' && e.kind !== 'belt')
    .sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2) || a.x - b.x);

  standing.forEach((e) => {
    const [cx, cy] = centre(e);
    let drawn = false;
    switch (e.kind) {
      case 'drill':
        drawn = draw(`drill-${e.dir}`, cx, cy, e.w / 3);
        break;
      case 'pumpjack':
        drawn = draw(`pumpjack-${e.dir}`, cx, cy, e.w / 3);
        break;
      case 'pipe':
        drawn = draw(`pipe-${pipeSides(e)}`, cx, cy);
        break;
      case 'pipeground':
      case 'pump':
        drawn = draw(`${e.kind}-${e.dir}`, cx, cy);
        break;
      case 'tank':
        drawn = draw(`tank-${e.dir % 4 === 0 ? 0 : 1}`, cx, cy);
        break;
      case 'beacon':
        drawn = draw('beacon', cx, cy);
        break;
      case 'wall': {
        const shape = wallSprite(e);
        const variant = shape === 'h' || shape === 'v' ? Math.floor(hash(e.x, e.y) * 3) : 0;
        drawn = draw(`wall-${shape}-${variant}`, cx, cy);
        break;
      }
      case 'gate': {
        const { axis, half } = gateShape(e);
        drawn = draw(half === null ? `gate-${axis}` : `gate-rail-${axis}-${half}`, cx, cy);
        break;
      }
      case 'underground':
        drawn = draw(`under${beltTier(e)}-${e.io === 'out' ? 'out' : 'in'}-${e.dir}`, cx, cy);
        break;
      case 'splitter':
        drawn = draw(`split${beltTier(e)}-${e.dir}`, cx, cy);
        break;
      case 'inserter':
        drawn = draw(`ins-${e.name.includes('stack') ? 'bulk' : 'fast'}-${e.dir}`, cx, cy);
        break;
      case 'chest':
        drawn = draw('chest-steel', cx, cy);
        break;
      case 'requester':
      case 'provider':
        drawn = draw(`chest-${e.kind}`, cx, cy);
        break;
      case 'laser':
      case 'gun':
      case 'stop':
      case 'signal':
        drawn = draw(`${e.kind}-${e.dir}`, cx, cy);
        break;
      case 'pole':
      case 'lamp':
      case 'radar':
      case 'roboport':
        drawn = draw(e.kind, cx, cy);
        break;
    }
    if (!drawn) {
      // modded or unknown entity: a plain plate of the right size
      ctx.fillStyle = 'rgba(210, 214, 220, 0.75)';
      ctx.strokeStyle = 'rgba(20, 20, 20, 0.6)';
      ctx.lineWidth = Math.max(1, ppt * 0.06);
      const inset = 0.1;
      const px = (e.x - x0 + inset) * ppt;
      const py = (e.y - y0 + inset) * ppt;
      ctx.fillRect(px, py, (e.w - inset * 2) * ppt, (e.h - inset * 2) * ppt);
      ctx.strokeRect(px, py, (e.w - inset * 2) * ppt, (e.h - inset * 2) * ppt);
    }
  });

  /* ---- the train the station is built for, as a ghost over everything ---- */
  ctx.globalAlpha = TRAIN_ALPHA;
  map.train.forEach((car) => draw(car.sprite, car.x, car.y));
  ctx.globalAlpha = 1;

  // nothing is drawn beyond the canvas, so there is nothing to show there
  view.x0 = Math.max(view.x0, x0);
  view.y0 = Math.max(view.y0, y0);
  view.x1 = Math.min(view.x1, x0 + w);
  view.y1 = Math.min(view.y1, y0 + h);

  return { canvas, x0, y0, w, h, view };
}
