// Brand mark: a blueprint sheet, tilted the way it lies on a desk, with the
// corner marks of the game's blueprint item and an "A" drawn on its grid.
// public/favicon.svg and the icons made by scripts/build-icons.py use the
// same geometry.
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g transform="rotate(-9 24 24) translate(24 24) scale(0.86) translate(-24 -24)">
        <rect width="48" height="48" rx="6" fill="#2b77bd" />
        <path
          d="M12 3V45M24 3V45M36 3V45M3 12H45M3 24H45M3 36H45"
          stroke="#3889d1"
          strokeWidth="1.5"
        />
        <path
          d="M4.5 13.5V4.5H13.5M34.5 4.5H43.5V13.5M43.5 34.5V43.5H34.5M13.5 43.5H4.5V34.5"
          stroke="#a9d4f5"
          strokeWidth="3"
          strokeLinecap="square"
        />
        <path
          d="M15 35.5L24 12.5L33 35.5M18.6 28H29.4"
          stroke="#eef7ff"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
