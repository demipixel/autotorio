
# Autotorio.com

Github for the [Autotorio.com](https://autotorio.com/outpost) website.

Please only post issues that relate to the site itself!
 If you believe the outposts need additional options or fixing, please post to the [factorio-generators](https://github.com/demipixel/factorio-generators)
 repo.

## How to run

Clone the repo, then inside the folder run:

```
npm install
npm run dev
```

and open http://localhost:3000.

## How to build

```
npm run build
```

writes the whole site to `out/` as static files (there is no server). `npm start` serves that folder locally.

## Where things are

- `pages/` has one file per page: the outpost generator, the oil outpost generator and the blueprint tool.
- `lib/kit/` has the controls the pages are built from, `lib/site/` the window around them.
- `lib/outpost/`, `lib/oil/` and `lib/blueprint/` hold each tool's settings and the call into [factorio-generators](https://github.com/demipixel/factorio-generators).
- `lib/preview/` draws the outpost preview with the game's own sprites.
- `lib/localisation.json` has all the text in every language. Fixes are welcome!

## Preview sprites

The preview is drawn from `public/img/outpost/sprites.webp`, which is cut from the game's graphics. To rebuild it you need Factorio installed and Python with Pillow:

```
npm run sprites
```

## Logo and icons

The logo is drawn in `lib/Logo.tsx` and `public/favicon.svg`. The PNG and ICO icons are made from the same shapes with:

```
npm run icons
```
