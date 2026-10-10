#!/usr/bin/env python3
"""Builds the sprite atlas for the outpost preview from a local Factorio install.

Reads the game's own graphics (Factorio 2.0 layout), flattens each entity's
layers into one sprite per direction or variant, and writes:

  public/img/outpost/sprites.webp   entity sprites and their shadows
  public/img/outpost/ground.webp    terrain and floor tile textures
  lib/preview/sprites.json          where everything is in those two images

Usage:
  python3 scripts/build-sprites.py [path/to/factorio/data]

Sizes and shifts below are copied from the prototype definitions in
data/base/prototypes/entity/*.lua. Shifts are in the game's "pixels"
(32 per tile); high-res sprites use scale 0.5 (64 source pixels per tile).
"""

import hashlib
import json
import os
import sys

from PIL import Image

PPT = 48  # atlas pixels per tile

DEFAULT_DATA = os.path.expanduser(
    '~/Library/Application Support/Steam/steamapps/common/Factorio/'
    'factorio.app/Contents/data'
)
DATA = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DATA
GFX = os.path.join(DATA, 'base', 'graphics')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'img', 'outpost')
MANIFEST = os.path.join(ROOT, 'lib', 'preview', 'sprites.json')

_cache = {}


def load(path):
    if path not in _cache:
        _cache[path] = Image.open(os.path.join(GFX, path)).convert('RGBA')
    return _cache[path]


def layer(path, w=None, h=None, x=0, y=0, shift=(0, 0), scale=0.5):
    """One sprite layer: a crop of a sheet, placed relative to the entity centre."""
    img = load(path)
    w = w or img.width
    h = h or img.height
    crop = img.crop((x, y, x + w, y + h))
    factor = scale * PPT / 32
    size = (max(1, round(w * factor)), max(1, round(h * factor)))
    crop = crop.resize(size, Image.LANCZOS)
    left = shift[0] / 32 * PPT - size[0] / 2
    top = shift[1] / 32 * PPT - size[1] / 2
    return crop, left, top


def placed(img, left, top):
    """An already prepared image with its top-left offset from the centre, in atlas px."""
    return img, left, top


def compose(layers, shadow=False):
    """Flattens layers into one trimmed image plus its offset in tiles."""
    left = min(round(l) for _, l, _ in layers)
    top = min(round(t) for _, _, t in layers)
    right = max(round(l) + im.width for im, l, _ in layers)
    bottom = max(round(t) + im.height for im, _, t in layers)
    canvas = Image.new('RGBA', (right - left, bottom - top), (0, 0, 0, 0))
    for im, l, t in layers:
        canvas.alpha_composite(im, (round(l) - left, round(t) - top))
    if shadow:
        # shadows are stored as dark shapes; keep only their coverage
        alpha = canvas.getchannel('A')
        canvas = Image.new('RGBA', canvas.size, (0, 0, 0, 255))
        canvas.putalpha(alpha)
    box = canvas.getbbox()
    if not box:
        return None
    canvas = canvas.crop(box)
    return canvas, (left + box[0]) / PPT, (top + box[1]) / PPT


sprites = {}  # name -> (image, offset x, offset y) with offsets in tiles


def add(name, layers, shadow=False):
    result = compose(layers, shadow)
    if result:
        sprites[name] = result


DIRS = [(0, 'N'), (2, 'E'), (4, 'S'), (6, 'W')]

# ---------- electric mining drill ----------

E = 'entity/electric-mining-drill/electric-mining-drill'
drill_anim = lambda: layer(E + '.png', 162, 156, shift=(1, -11))
drill_h_anim = lambda: layer(E + '-horizontal.png', 80, 160, shift=(2, -12))
drill_h_front = lambda: layer(E + '-horizontal-front.png', 66, 154, shift=(-3, 3))

add('drill-0', [
    layer(E + '-N.png', shift=(0, -4)),
    layer(E + '-N-output.png', 60, 66, shift=(-3, -44)),
    drill_anim(),
])
add('drill-2', [
    layer(E + '-E.png', shift=(0, -4)),
    layer(E + '-E-output.png', 50, 74, shift=(30, -8)),
    drill_h_anim(),
    drill_h_front(),
    layer(E + '-E-front.png', shift=(21, 10)),
])
add('drill-4', [
    layer(E + '-S.png', shift=(0, -1)),
    drill_anim(),
    layer(E + '-S-output.png', 84, 56, shift=(-1, 34)),
    layer(E + '-S-front.png', shift=(0, 27)),
])
add('drill-6', [
    layer(E + '-W.png', shift=(0, -4)),
    layer(E + '-W-output.png', 50, 60, shift=(-31, -13)),
    drill_h_anim(),
    drill_h_front(),
    layer(E + '-W-front.png', shift=(-22, 12)),
])
for d, letter, shift in [(0, 'N', (6, -3)), (2, 'E', (10, 2)), (4, 'S', (6, 2)), (6, 'W', (-5, 2))]:
    add(f'drill-{d}-s', [layer(f'{E}-{letter}-shadow.png', shift=shift)], shadow=True)

# ---------- belts ----------

# rows of the belt sheets; "x_y" is a curve fed from side x that runs towards y
BELT_ROWS = ['e', 'w', 'n', 's', 'e_n', 'n_e', 'w_n', 'n_w', 's_e', 'e_s', 's_w', 'w_s']
TIERS = ['', 'fast-', 'express-']

for tier, prefix in enumerate(TIERS):
    belt = f'entity/{prefix}transport-belt/{prefix}transport-belt.png'
    for row, key in enumerate(BELT_ROWS):
        add(f'belt{tier}-{key}', [layer(belt, 128, 128, 0, row * 128)])

    under = f'entity/{prefix}underground-belt/{prefix}underground-belt-structure.png'
    for d, _ in DIRS:
        col = d // 2
        # entrances are stored N, E, S, W; exits start from the opposite side (S, W, N, E)
        add(f'under{tier}-out-{d}', [layer(under, 192, 192, ((col + 2) % 4) * 192, 0)])
        add(f'under{tier}-in-{d}', [layer(under, 192, 192, col * 192, 192)])

    split = f'entity/{prefix}splitter/{prefix}splitter'
    west_w = 94 if prefix == 'express-' else 90
    west_x = 5 if prefix == 'express-' else 6
    add(f'split{tier}-0', [layer(split + '-north.png', 160, 70, shift=(7, 0))])
    add(f'split{tier}-2', [
        layer(split + '-east.png', 90, 84, shift=(4, 13)),
        layer(split + '-east-top_patch.png', 90, 104, shift=(4, -20)),
    ])
    add(f'split{tier}-4', [layer(split + '-south.png', 164, 64, shift=(4, 0))])
    add(f'split{tier}-6', [
        layer(split + '-west.png', west_w, 86, shift=(west_x, 12)),
        layer(split + '-west-top_patch.png', west_w, 96, shift=(west_x, -18)),
    ])

# ---------- walls ----------

W = 'entity/wall/wall-'
# name: (file, height, shift, variations kept, shadow width, shadow height, shadow shift)
WALLS = {
    'single': ('single', 86, (0, -5), 1, 98, 60, (10, 17)),
    'v': ('vertical', 134, (0, 8), 3, 98, 110, (10, 29)),
    'h': ('horizontal', 92, (0, -2), 3, 124, 68, (14, 15)),
    'cr': ('corner-right', 128, (0, 7), 1, 124, 120, (17, 28)),
    'cl': ('corner-left', 134, (0, 7), 1, 102, 120, (9, 28)),
    't': ('t', 134, (0, 7), 1, 124, 120, (14, 28)),
    'er': ('ending-right', 92, (0, -3), 1, 124, 68, (17, 15)),
    'el': ('ending-left', 92, (0, -3), 1, 102, 68, (9, 15)),
}
for key, (name, height, shift, variations, sw, sh, sshift) in WALLS.items():
    for v in range(variations):
        add(f'wall-{key}-{v}', [layer(f'{W}{name}.png', 64, height, v * 64, 0, shift=shift)])
    add(f'wall-{key}-s', [layer(f'{W}{name}-shadow.png', sw, sh, shift=sshift)], shadow=True)

# ---------- gates ----------

GT = 'entity/gate/gate-'
# "h" is a gate in a horizontal wall (rails cross it vertically), "v" the other way
add('gate-h', [layer(GT + 'horizontal.png', 66, 90, shift=(0, -3))])
add('gate-v', [layer(GT + 'vertical.png', 78, 120, shift=(-1, -13))])
add('gate-h-s', [layer(GT + 'horizontal-shadow.png', 122, 60, shift=(12, 10))], shadow=True)
add('gate-v-s', [layer(GT + 'vertical-shadow.png', 82, 104, shift=(9, 9))], shadow=True)
# a gate across a track is two halves on a shared base
add('gate-rail-h-0', [layer(GT + 'rail-horizontal-left.png', 66, 74, shift=(0, -7))])
add('gate-rail-h-1', [layer(GT + 'rail-horizontal-right.png', 66, 74, shift=(0, -7))])
add('gate-rail-v-0', [layer(GT + 'rail-vertical-left.png', 42, 118, shift=(0, -13))])
add('gate-rail-v-1', [layer(GT + 'rail-vertical-right.png', 42, 118, shift=(0, -13))])
add('gate-base-h', [layer(GT + 'rail-base-horizontal.png', 130, 104, shift=(0, 3))])
add('gate-base-v', [layer(GT + 'rail-base-vertical.png', 138, 130, shift=(-1, 0))])

# ---------- rails (blueprints from the generator use the 2x2 straight rail) ----------

R = 'entity/legacy-straight-rail/legacy-straight-rail-'
RAIL_LAYERS = ['stone-path-background', 'stone-path', 'ties', 'backplates', 'metals']
add('rail-v', [layer(f'{R}vertical-{part}.png', 256, 128) for part in RAIL_LAYERS])
add('rail-h', [layer(f'{R}horizontal-{part}.png', 128, 256) for part in RAIL_LAYERS])

# ---------- train stop and signal ----------

T = 'entity/train-stop/train-stop-'
for d, _ in DIRS:
    i = d // 2
    add(f'stop-{d}-ground', [layer(T + 'ground.png', 386, 377, i * 386, 0, shift=(0, -0.75))])
    add(f'stop-{d}', [
        layer(T + 'bottom.png', 140, 291, i * 140, 0, shift=(-0.5, -26.75)),
        layer(T + 'top.png', 312, 306, i * 312, 0, shift=(0.5, -50.5)),
    ])
    add(f'stop-{d}-s', [layer(T + 'shadow.png', 526, 370, i * 526, 0, shift=(41.5, 11))], shadow=True)
    # 16 signal directions per sheet, one row each; the first column is green
    add(f'signal-{d}', [layer('entity/rail-signal/rail-signal.png', 128, 128, 0, d * 2 * 128)])

# ---------- turrets ----------

L = 'entity/laser-turret/laser-turret-'
G = 'entity/gun-turret/gun-turret-'
for d, _ in DIRS:
    # 64 facings, 8 per row for the laser turret; four files of 16 rows for the gun turret
    add(f'laser-{d}', [
        layer(L + 'base.png', shift=(-0.5, 2)),
        layer(L + 'shooting.png', 126, 120, 0, d * 120, shift=(0, -35)),
    ])
    add(f'laser-{d}-s', [
        layer(L + 'base-shadow.png', shift=(6, 3)),
        layer(L + 'shooting-shadow.png', 170, 92, 0, d * 92, shift=(50.5, 2.5)),
    ], shadow=True)
    add(f'gun-{d}', [
        layer(G + 'base.png', shift=(0.5, -1)),
        layer(f'{G}shooting-{d // 2 + 1}.png', 132, 130, 0, 0, shift=(0, -27.5)),
    ])

# ---------- small things ----------

add('pole', [layer('entity/medium-electric-pole/medium-electric-pole.png', 84, 252, shift=(3.5, -44))])
add('pole-s', [layer('entity/medium-electric-pole/medium-electric-pole-shadow.png', 280, 64, shift=(56.5, -1))], shadow=True)
add('lamp', [layer('entity/small-lamp/lamp.png', shift=(0.25, 3))])
add('lamp-s', [layer('entity/small-lamp/lamp-shadow.png', shift=(4, 4.75))], shadow=True)
add('radar', [
    layer('entity/radar/radar-integration.png', shift=(1.5, 4)),
    layer('entity/radar/radar.png', 196, 254, shift=(1, -16)),
])
add('radar-s', [layer('entity/radar/radar-shadow.png', 336, 170, shift=(39, 6))], shadow=True)
add('roboport', [
    layer('entity/roboport/roboport-base.png', shift=(2, -2.25)),
    layer('entity/roboport/roboport-base-patch.png', shift=(1.5, -5)),
    layer('entity/roboport/roboport-door-up.png', 97, 38, shift=(-0.25, -39.5)),
    layer('entity/roboport/roboport-door-down.png', 97, 41, shift=(-0.25, -19.75)),
    layer('entity/roboport/roboport-base-animation.png', 83, 59, shift=(-17.75, -71.25)),
])
add('roboport-s', [layer('entity/roboport/roboport-shadow.png', shift=(28.5, 9.25))], shadow=True)
add('chest-steel', [layer('entity/steel-chest/steel-chest.png', shift=(-0.25, -0.5))])
add('chest-requester', [layer('entity/logistic-chest/requester-chest.png', 66, 74, shift=(0, -2))])
add('chest-provider', [layer('entity/logistic-chest/passive-provider-chest.png', 66, 74, shift=(0, -2))])
add('chest-s', [layer('entity/logistic-chest/logistic-chest-shadow.png', shift=(12, 4.5))], shadow=True)

# ---------- oil ----------

PJ = 'entity/pumpjack/pumpjack-'
for d, _ in DIRS:
    i = d // 2
    add(f'pumpjack-{d}', [
        layer(PJ + 'base.png', 261, 273, i * 261, 0, shift=(-2.25, -4.75)),
        layer(PJ + 'horsehead.png', 206, 202, shift=(-4, -24)),
    ])
    add(f'pumpjack-{d}-s', [
        layer(PJ + 'base-shadow.png', 220, 220, i * 220, 0, shift=(6, 0.5)),
        layer(PJ + 'horsehead-shadow.png', 309, 82, shift=(17.75, 14.5)),
    ], shadow=True)
add('oil', [layer('entity/crude-oil/crude-oil.png', 168, 124, shift=(0.5, -2))])

# pipes by the sides they connect to, in the order north, east, south, west
PIPES = {
    '': 'straight-vertical-single',
    'n': 'ending-up', 'e': 'ending-right', 's': 'ending-down', 'w': 'ending-left',
    'ns': 'straight-vertical', 'ew': 'straight-horizontal',
    'ne': 'corner-up-right', 'nw': 'corner-up-left', 'es': 'corner-down-right', 'sw': 'corner-down-left',
    'new': 't-up', 'esw': 't-down', 'nes': 't-right', 'nsw': 't-left',
    'nesw': 'cross',
}
for key, name in PIPES.items():
    add(f'pipe-{key}', [layer(f'entity/pipe/pipe-{name}.png')])
for d, name in [(0, 'up'), (2, 'right'), (4, 'down'), (6, 'left')]:
    add(f'pipeground-{d}', [layer(f'entity/pipe-to-ground/pipe-to-ground-{name}.png')])

PUMPS = {0: ('north', 103, 164, (8, -0.85)), 2: ('east', 130, 109, (-0.5, 1.75)),
         4: ('south', 114, 160, (12.5, -8)), 6: ('west', 131, 111, (-0.25, 1.25))}
for d, (name, w, h, shift) in PUMPS.items():
    add(f'pump-{d}', [layer(f'entity/pump/pump-{name}.png', w, h, shift=shift)])

# two orientations, which only differ in where the pipe connections sit
for i in range(2):
    add(f'tank-{i}', [layer('entity/storage-tank/storage-tank.png', 219, 235, i * 219, 0, shift=(-0.25, -1.25))])
    add(f'tank-{i}-s', [layer('entity/storage-tank/storage-tank-shadow.png', 291, 153, i * 291, 0, shift=(29.75, 22.25))], shadow=True)

add('beacon', [
    layer('entity/beacon/beacon-bottom.png', shift=(0.5, 1)),
    layer('entity/beacon/beacon-top.png', shift=(3, -19)),
])
add('beacon-s', [layer('entity/beacon/beacon-shadow.png', shift=(12.5, 0.5))], shadow=True)

# ---------- inserters ----------
# The game animates the arm in 3D. For a still picture the arm is drawn
# reaching over the tile it picks up from, foreshortened to one tile.


def inserter(kind, d):
    base = f'entity/{kind}-inserter/{kind}-inserter-'
    platform = layer(base + 'platform.png', 105, 79, (d // 2) * 105, 0, shift=(1.5, 6.5))

    def arm(path, length_tiles, start_tiles):
        img = load(path)
        width = round(img.width * 0.25 * PPT / 32 * 1.15)
        length = round(length_tiles * PPT)
        img = img.resize((width, length), Image.LANCZOS)
        # arm images point up; put the far end start+length tiles from the centre
        canvas = Image.new('RGBA', (4 * PPT, 4 * PPT), (0, 0, 0, 0))
        cx = canvas.width // 2
        cy = canvas.height // 2
        canvas.alpha_composite(img, (cx - width // 2, cy - round(start_tiles * PPT) - length))
        canvas = canvas.rotate(-45 * d, resample=Image.BICUBIC)
        return placed(canvas, -cx, -cy - 0.12 * PPT)

    return [
        platform,
        arm(base + 'hand-base.png', 0.5, 0.0),
        arm(base + 'hand-open.png', 0.62, 0.4),
    ]


for d, _ in DIRS:
    add(f'ins-fast-{d}', inserter('fast', d))
    add(f'ins-bulk-{d}', inserter('bulk', d))

# ---------- ore ----------

# 8 variations per row; rows go from the richest stage down to almost empty
ORES = {'iron': 'iron-ore', 'copper': 'copper-ore', 'coal': 'coal', 'stone': 'stone', 'uranium': 'uranium-ore'}
for key, name in ORES.items():
    sheet = f'entity/{name}/{name}.png'
    for v in range(8):
        add(f'ore-{key}-{v}', [layer(sheet, 128, 128, v * 128, 128 * 2)])
        add(f'ore-{key}-thin-{v}', [layer(sheet, 128, 128, v * 128, 128 * 5)])

# ---------- trains ----------

# Rolling stock is drawn in many directions, 4 frames to a row and 32 to a
# file: locomotives in 256 over the full turn, wagons in 128 over half of it
# (their two ends look the same). The preview needs the compass directions.


def stock(path, w, h, frame, shift):
    file, index = divmod(frame, 32)
    return layer(f'{path}-{file + 1}.png', w, h, (index % 4) * w, (index // 4) * h, shift=shift)


def painted(part, colour):
    """A mask layer in the colour of the train, as the game tints it."""
    img, left, top = part
    r, g, b, a = img.split()
    tint = lambda band, share: band.point(lambda v: round(v * share))
    return Image.merge('RGBA', (tint(r, colour[0]), tint(g, colour[1]), tint(b, colour[2]), a)), left, top


L = 'entity/locomotive/locomotive'
for direction, frame in [(0, 0), (2, 64), (4, 128), (6, 192)]:
    add(f'locomotive-{direction}', [
        stock(L, 474, 458, frame, (0, -16)),
        painted(stock(L + '-mask', 472, 454, frame, (0, -15)), (0.92, 0.07, 0)),
    ])

C = 'entity/cargo-wagon/cargo-wagon'
F = 'entity/fluid-wagon/fluid-wagon'
for direction, frame in [(0, 0), (2, 64)]:
    add(f'cargo-wagon-{direction}', [
        stock(C, 442, 408, frame, (0, -25)),
        painted(stock(C + '-mask', 400, 372, frame, (1, -30)), (0.43, 0.23, 0)),
    ])
    add(f'fluid-wagon-{direction}', [stock(F, 416, 420, frame, (0, -31.5))])

# ---------- pack the entity atlas ----------


def pack(items, max_width=2048, pad=2):
    """Shelf packing, tallest first. Returns the atlas and name -> (x, y)."""
    order = sorted(items, key=lambda name: -items[name][0].height)
    x = y = shelf = 0
    positions = {}
    for name in order:
        img = items[name][0]
        if x + img.width + pad > max_width:
            x = 0
            y += shelf + pad
            shelf = 0
        positions[name] = (x, y)
        x += img.width + pad
        shelf = max(shelf, img.height)
    atlas = Image.new('RGBA', (max_width, y + shelf), (0, 0, 0, 0))
    for name, (px, py) in positions.items():
        atlas.alpha_composite(items[name][0], (px, py))
    return atlas, positions


atlas, positions = pack(sprites)
manifest = {'ppt': PPT, 'sprites': {}, 'ground': {}}
for name, (img, ox, oy) in sprites.items():
    px, py = positions[name]
    manifest['sprites'][name] = [px, py, img.width, img.height, round(ox, 3), round(oy, 3)]

# ---------- ground textures ----------


def texture(path, size, x=0, y=0):
    img = Image.open(os.path.join(GFX, path)).convert('RGB').crop((x, y, x + size, y + size))
    return img.resize((size * PPT // 64, size * PPT // 64), Image.LANCZOS)


# The first four 4x4-tile variants are the common, even ones (the rest have
# rocks and bare patches that would visibly repeat). Sixteen of them in a
# shuffled order make one 16x16-tile texture.
terrain = Image.new('RGB', (16 * PPT, 16 * PPT))
order = [0, 2, 1, 3, 3, 1, 0, 2, 1, 0, 3, 1, 2, 3, 2, 0]
for i, variant in enumerate(order):
    tile = texture('terrain/grass-3.png', 256, variant * 256, 320)
    if (i * 7) % 3 == 1:
        tile = tile.transpose(Image.ROTATE_180)
    terrain.paste(tile, ((i % 4) * 4 * PPT, (i // 4) * 4 * PPT))

ground = {
    'terrain': terrain,
    'stone_path': texture('terrain/stone-path/stone-path-4.png', 256),
    'concrete': texture('terrain/concrete/concrete.png', 512),
    'refined_concrete': texture('terrain/concrete/refined-concrete.png', 512),
    'hazard_concrete_left': texture('terrain/hazard-concrete-left/hazard-concrete-left.png', 512),
    'hazard_concrete_right': texture('terrain/hazard-concrete-right/hazard-concrete-right.png', 512),
    'refined_hazard_concrete_left': texture('terrain/hazard-concrete-left/refined-hazard-concrete-left.png', 512),
    'refined_hazard_concrete_right': texture('terrain/hazard-concrete-right/refined-hazard-concrete-right.png', 512),
}
ground_items = {name: (img.convert('RGBA'), 0, 0) for name, img in ground.items()}
ground_atlas, ground_positions = pack(ground_items, max_width=1024, pad=0)
for name, (px, py) in ground_positions.items():
    img = ground[name]
    manifest['ground'][name] = [px, py, img.width, img.height]

os.makedirs(OUT_DIR, exist_ok=True)
atlas.save(os.path.join(OUT_DIR, 'sprites.webp'), 'WEBP', quality=88, method=6)
ground_atlas.convert('RGB').save(os.path.join(OUT_DIR, 'ground.webp'), 'WEBP', quality=82, method=6)
# lets the page ask for fresh images whenever the atlas changes
digest = hashlib.md5()
for name in ['sprites.webp', 'ground.webp']:
    with open(os.path.join(OUT_DIR, name), 'rb') as f:
        digest.update(f.read())
manifest['version'] = digest.hexdigest()[:8]

with open(MANIFEST, 'w') as f:
    json.dump(manifest, f, separators=(',', ':'))
    f.write('\n')

print(f'{len(sprites)} sprites, atlas {atlas.width}x{atlas.height}, ground {ground_atlas.width}x{ground_atlas.height}')
for name in ['sprites.webp', 'ground.webp']:
    print(f'  {name}: {os.path.getsize(os.path.join(OUT_DIR, name)) // 1024} KB')
