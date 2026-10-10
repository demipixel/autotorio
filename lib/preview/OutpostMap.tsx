import { useCallback, useEffect, useRef, useState } from 'react';

import { OutpostMap as MapData } from './decode';
import { Assets, ATLAS_PPT, loadAssets, renderWorld, World } from './render';

// The outpost drawn with the game's sprites on a patch of terrain. The view
// keeps the whole outpost in frame and glides to the new framing when a
// setting changes its size; it can also be zoomed and dragged for a closer
// look.

type Props = {
  map: MapData | null;
  // which ore to show under the drills: iron, copper, coal, stone, uranium
  ore?: string;
  className?: string;
  // px of terrain kept around the outpost when fitted
  padding?: number;
  // largest size of one tile in px when fitted
  maxScale?: number;
  // zoom with the plain mouse wheel; otherwise only with ctrl/cmd or a pinch,
  // so the wheel keeps scrolling pages that scroll
  wheelZoom?: boolean;
  // class names for the zoom buttons; leave out to show no buttons
  toolsClassName?: string;
  toolClassName?: string;
};

// The camera looks at a point given relative to the map's anchor (the ore
// patch), so it stays on the same spot of ground when the generator shifts
// everything around it. Scale is px per tile.
type Camera = { x: number; y: number; scale: number };

// closest zoom, in px per tile
const MAX_TILE_PX = 36;
const GLIDE_MS = 420;
// tile size in pixels from which the map's labels are shown
const MIN_LABEL_SCALE = 5;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function OutpostMap({
  map,
  ore = 'iron',
  className,
  padding = 28,
  maxScale = 16,
  wheelZoom = false,
  toolsClassName,
  toolClassName,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomed, setZoomed] = useState(false);

  // everything the draw loop reads lives in refs so it never goes stale
  const props = useRef({ map, ore, padding, maxScale, wheelZoom });
  // the draw function calls itself for the next frame of a glide
  const drawRef = useRef<(now: number) => void>(() => {});
  const state = useRef({
    assets: null as Assets | null,
    world: null as World | null,
    worldOf: null as MapData | null,
    worldOre: '',
    terrain: null as CanvasPattern | null,
    anchor: { x: 0, y: 0 },
    camera: null as Camera | null,
    glide: null as { from: Camera; to: Camera; start: number } | null,
    // true while the view should keep the whole outpost in frame
    follow: true,
    frame: 0,
  });

  // The camera that shows the whole current outpost.
  const fitted = useCallback((): Camera => {
    const canvas = canvasRef.current;
    const { map, padding, maxScale } = props.current;
    const { anchor } = state.current;
    const W = canvas?.clientWidth ?? 0;
    const H = canvas?.clientHeight ?? 0;
    if (!map) return { x: 0, y: 0, scale: Math.max(Math.min(W, H) / 60, 0.5) };
    const pad = Math.min(padding, W / 5, H / 5);
    const scale = Math.min((W - pad * 2) / (map.x1 - map.x0), (H - pad * 2) / (map.y1 - map.y0), maxScale);
    return {
      x: (map.x0 + map.x1) / 2 - anchor.x,
      y: (map.y0 + map.y1) / 2 - anchor.y,
      scale: Math.max(scale, 0.5),
    };
  }, []);

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const st = state.current;
      if (!canvas) return;
      const { map, ore } = props.current;

      const dpr = window.devicePixelRatio || 1;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr)) canvas.width = Math.round(W * dpr);
      if (canvas.height !== Math.round(H * dpr)) canvas.height = Math.round(H * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!st.assets) return;

      // a different outpost than last time (the very first one just appears)
      let changed = false;
      if (map && (st.worldOf !== map || st.worldOre !== ore)) {
        st.world = renderWorld(map, st.assets, ore, st.world?.canvas);
        changed = !!st.worldOf && st.worldOf !== map;
        if (!st.worldOf) st.camera = null;
        st.worldOf = map;
        st.worldOre = ore;
        st.anchor = map.anchor;
      }

      const target = fitted();
      if (!st.camera) {
        st.camera = target;
      } else if (st.follow) {
        const still =
          Math.abs(target.x - st.camera.x) < 0.01 &&
          Math.abs(target.y - st.camera.y) < 0.01 &&
          Math.abs(target.scale / st.camera.scale - 1) < 0.001;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (changed && !still && !reduced && !document.hidden) {
          st.glide = { from: { ...st.camera }, to: target, start: now };
        } else if (st.glide) {
          // the canvas was resized on the way: same glide, new destination
          st.glide.to = target;
        } else {
          st.camera = target;
        }
      } else if (map) {
        if (st.camera.scale <= target.scale) {
          // the outpost shrank past the zoomed view: nothing left to zoom into
          st.follow = true;
          st.camera = target;
        } else {
          st.camera.x = Math.min(Math.max(st.camera.x, map.x0 - st.anchor.x), map.x1 - st.anchor.x);
          st.camera.y = Math.min(Math.max(st.camera.y, map.y0 - st.anchor.y), map.y1 - st.anchor.y);
        }
      }

      if (st.glide) {
        const { from, to, start } = st.glide;
        const t = Math.min(Math.max((now - start) / GLIDE_MS, 0), 1);
        const e = ease(t);
        st.camera = {
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          // zooming feels even when the scale changes by ratio, not by amount
          scale: from.scale * Math.pow(to.scale / from.scale, e),
        };
        if (t >= 1) {
          st.glide = null;
        } else {
          st.frame = requestAnimationFrame((time) => drawRef.current(time));
        }
      }

      const { x, y, scale } = st.camera;

      // terrain across the whole view, laid out from the anchor so it does
      // not slide under the outpost between regenerations
      const k = (scale * dpr) / ATLAS_PPT;
      ctx.setTransform(k, 0, 0, k, dpr * (W / 2 - x * scale), dpr * (H / 2 - y * scale));
      st.terrain = st.terrain || ctx.createPattern(st.assets.ground.terrain, 'repeat');
      ctx.fillStyle = st.terrain;
      ctx.fillRect(
        (x - W / 2 / scale) * ATLAS_PPT,
        (y - H / 2 / scale) * ATLAS_PPT,
        (W / scale) * ATLAS_PPT,
        (H / scale) * ATLAS_PPT,
      );

      if (map && st.world) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          st.world.canvas,
          W / 2 + (st.world.x0 - st.anchor.x - x) * scale,
          H / 2 + (st.world.y0 - st.anchor.y - y) * scale,
          st.world.w * scale,
          st.world.h * scale,
        );
      }

      // labels are written at screen size, so they stay sharp at any zoom;
      // below a few pixels per tile there is no room for them
      if (map && st.world && map.labels.length && scale >= MIN_LABEL_SCALE) {
        const size = Math.min(Math.max(scale * 0.95, 9), 15);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `700 ${size}px "Titillium Web", "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(size / 4, 2.5);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillStyle = '#ffffff';
        map.labels.forEach((label) => {
          const sx = W / 2 + (label.x - st.anchor.x - x) * scale;
          const sy = H / 2 + (label.y - st.anchor.y - y) * scale;
          ctx.strokeText(label.text, sx, sy);
          ctx.fillText(label.text, sx, sy);
        });
      }

      canvas.style.cursor = st.follow ? '' : 'grab';
      canvas.style.touchAction = st.follow ? '' : 'none';
      setZoomed(!st.follow);
    },
    [fitted],
  );

  const redraw = useCallback(() => {
    const st = state.current;
    cancelAnimationFrame(st.frame);
    st.frame = requestAnimationFrame(draw);
    // background tabs get no animation frames; draw right away so the map
    // is already there when the tab comes back
    if (document.hidden) draw(performance.now());
  }, [draw]);

  // Zooms by a factor while keeping the given point of the view in place.
  // A factor of 0 goes back to showing the whole outpost.
  const zoomBy = useCallback(
    (factor: number, px?: number, py?: number) => {
      const canvas = canvasRef.current;
      const st = state.current;
      if (!canvas || !props.current.map || !st.camera) return;
      const target = fitted();
      const next = Math.min(st.camera.scale * factor, Math.max(MAX_TILE_PX, target.scale));

      if (next <= target.scale * 1.001) {
        if (!st.follow) {
          st.follow = true;
          st.glide = { from: { ...st.camera }, to: target, start: performance.now() };
        }
      } else {
        const ox = (px ?? canvas.clientWidth / 2) - canvas.clientWidth / 2;
        const oy = (py ?? canvas.clientHeight / 2) - canvas.clientHeight / 2;
        st.follow = false;
        st.glide = null;
        st.camera = {
          x: st.camera.x + ox / st.camera.scale - ox / next,
          y: st.camera.y + oy / st.camera.scale - oy / next,
          scale: next,
        };
      }
      redraw();
    },
    [fitted, redraw],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const st = state.current;
    if (!canvas) return;
    let alive = true;

    loadAssets()
      .then((assets) => {
        if (!alive) return;
        st.assets = assets;
        redraw();
      })
      .catch(() => {
        // without the sprites there is nothing to draw; the page still works
      });

    const resize = new ResizeObserver(redraw);
    resize.observe(canvas);

    const onWheel = (e: WheelEvent) => {
      if (!props.current.wheelZoom && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomBy(Math.exp(-e.deltaY * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
    };

    let drag: { x: number; y: number; id: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (st.follow || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id || !st.camera) return;
      st.camera.x -= (e.clientX - drag.x) / st.camera.scale;
      st.camera.y -= (e.clientY - drag.y) / st.camera.scale;
      drag.x = e.clientX;
      drag.y = e.clientY;
      redraw();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      canvas.style.cursor = st.follow ? '' : 'grab';
    };
    const onDouble = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      zoomBy(2, e.clientX - rect.left, e.clientY - rect.top);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('dblclick', onDouble);

    redraw();

    return () => {
      alive = false;
      cancelAnimationFrame(st.frame);
      resize.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('dblclick', onDouble);
    };
  }, [redraw, zoomBy]);

  useEffect(() => {
    drawRef.current = draw;
    // While the settings cannot be built there is no new outpost; the last
    // one stays on screen (the page dims it) instead of the map going blank.
    props.current = { map: map ?? props.current.map, ore, padding, maxScale, wheelZoom };
    redraw();
  }, [map, ore, padding, maxScale, wheelZoom, draw, redraw]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        role="img"
        aria-label="Preview of the generated outpost"
      />
      {toolsClassName && (
        <div className={toolsClassName}>
          <button
            type="button"
            className={toolClassName}
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => zoomBy(1.6)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={toolClassName}
            aria-label="Zoom out"
            title="Zoom out"
            disabled={!zoomed}
            onClick={() => zoomBy(1 / 1.6)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2.5 7h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={toolClassName}
            aria-label="Fit the whole outpost"
            title="Fit the whole outpost"
            disabled={!zoomed}
            onClick={() => zoomBy(0)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2.5 5V2.5H5M9 2.5h2.5V5M11.5 9v2.5H9M5 11.5H2.5V9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
