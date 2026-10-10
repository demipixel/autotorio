#!/usr/bin/env python3
"""Draws the site's icons (favicon, touch icon, manifest icon) from the logo.

    python3 scripts/build-icons.py

The mark is the one in lib/Logo.tsx and public/favicon.svg: keep the three in
step when the logo changes. Needs Pillow.
"""
import os

from PIL import Image, ImageDraw

PUBLIC = os.path.join(os.path.dirname(__file__), '..', 'public')

SHEET = '#2b77bd'
GRID = '#3889d1'
CORNERS = '#a9d4f5'
LETTER = '#eef7ff'
FRAME = '#313031'  # the site's window colour, behind the icons that need a background

TILT = 9      # degrees, counter-clockwise
SCALE = 0.86  # room for the tilted corners


def sheet(k):
    """The flat blueprint sheet on a 48-unit grid, k pixels per unit."""
    image = Image.new('RGBA', (48 * k, 48 * k), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    box = lambda x0, y0, x1, y1, fill: draw.rectangle([x0 * k, y0 * k, x1 * k - 1, y1 * k - 1], fill=fill)

    draw.rounded_rectangle([0, 0, 48 * k - 1, 48 * k - 1], radius=6 * k, fill=SHEET)
    for at in (12, 24, 36):
        box(at - 0.75, 3, at + 0.75, 45, GRID)
        box(3, at - 0.75, 45, at + 0.75, GRID)

    # corner marks: an L of 3 units wide in each corner
    for near, far in ((3, 15), (45, 33)):
        for edge in (3, 45):
            inner = edge + 3 if edge == 3 else edge - 3
            box(min(near, far), min(edge, inner), max(near, far), max(edge, inner), CORNERS)
            box(min(edge, inner), min(near, far), max(edge, inner), max(near, far), CORNERS)

    # the letter, with round ends
    width = 4.2 * k
    def stroke(points):
        points = [(x * k, y * k) for x, y in points]
        draw.line(points, fill=LETTER, width=round(width), joint='curve')
        for x, y in points:
            draw.ellipse([x - width / 2, y - width / 2, x + width / 2, y + width / 2], fill=LETTER)
    stroke([(15, 35.5), (24, 12.5), (33, 35.5)])
    stroke([(18.6, 28), (29.4, 28)])
    return image


def mark(size):
    """The tilted mark on a transparent square of `size` pixels."""
    k = max(4, -(-8 * size // 48))  # draw at 8 times the size or more
    flat = sheet(k)
    side = round(flat.width * SCALE)
    tilted = flat.resize((side, side), Image.LANCZOS).rotate(TILT, resample=Image.BICUBIC, expand=True)
    canvas = Image.new('RGBA', flat.size, (0, 0, 0, 0))
    canvas.alpha_composite(tilted, ((flat.width - tilted.width) // 2, (flat.height - tilted.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def on_frame(size, share=0.76):
    """The mark on the window colour, for icons that are shown without a background of their own."""
    image = Image.new('RGBA', (size, size), FRAME)
    inner = mark(round(size * share))
    image.alpha_composite(inner, ((size - inner.width) // 2, (size - inner.height) // 2))
    return image.convert('RGB')


def main():
    mark(32).save(os.path.join(PUBLIC, 'favicon-32.png'))
    mark(256).save(os.path.join(PUBLIC, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    on_frame(180).save(os.path.join(PUBLIC, 'apple-touch-icon.png'))
    on_frame(192).save(os.path.join(PUBLIC, 'icon-192.png'))
    print('wrote favicon-32.png, favicon.ico, apple-touch-icon.png, icon-192.png')


if __name__ == '__main__':
    main()
