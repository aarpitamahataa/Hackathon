/**
 * Original, hand-authored silhouette of a cloaked wanderer — not a likeness of any
 * existing character. Pure SVG shapes + gradients so it stays crisp, tiny, and themeable
 * (no image assets, nothing traced or copied). Rim-light intensity scales gently with
 * `glow` (0–1, driven by the day's completion progress) so the figure brightens a touch
 * as the user completes quests, without any dramatic scene change.
 */
export default function HeroFigure({ glow = 0 }) {
  const rimOpacity = 0.45 + glow * 0.4;

  return (
    <svg
      className="hero-figure"
      viewBox="0 0 320 520"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A cloaked wanderer, facing toward your quests"
    >
      <defs>
        <radialGradient id="hf-ground" cx="50%" cy="100%" r="70%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.16" />
          <stop offset="100%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hf-cloak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-panel-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--fantasy-void)" }} />
        </linearGradient>
        <linearGradient id="hf-rim" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity={rimOpacity} />
          <stop offset="35%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ground contact shadow / glow */}
      <ellipse cx="165" cy="486" rx="120" ry="22" fill="url(#hf-ground)" />

      {/* cloak body */}
      <path
        d="M165 96
           C 128 96 108 128 100 168
           C 90 214 70 260 62 320
           C 52 388 58 440 74 480
           L 256 480
           C 270 438 274 386 262 322
           C 252 262 234 214 224 168
           C 216 128 202 96 165 96 Z"
        fill="url(#hf-cloak)"
        stroke="var(--fantasy-hairline)"
        strokeWidth="1.5"
      />

      {/* rim light along the dashboard-facing edge */}
      <path
        d="M165 96
           C 202 96 216 128 224 168
           C 234 214 252 262 262 322
           C 274 386 270 438 256 480
           L 236 480
           C 248 438 250 388 240 324
           C 230 264 214 216 204 170
           C 197 134 186 106 165 100 Z"
        fill="url(#hf-rim)"
      />

      {/* hood */}
      <path
        d="M165 40
           C 132 40 108 66 108 100
           C 108 118 116 128 128 134
           C 118 108 132 74 165 74
           C 198 74 212 108 202 134
           C 214 128 222 118 222 100
           C 222 66 198 40 165 40 Z"
        fill="url(#hf-cloak)"
        stroke="var(--fantasy-hairline)"
        strokeWidth="1.5"
      />
      <path
        d="M202 134 C 198 108 186 90 165 90 C 144 90 132 108 128 134"
        fill="none"
        stroke="url(#hf-rim)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* faint face shadow within the hood */}
      <ellipse cx="165" cy="112" rx="20" ry="24" fill="var(--fantasy-void)" opacity="0.9" />

      {/* a simple staff, resting beside the figure — quiet, not a weapon flourish */}
      <line x1="248" y1="150" x2="248" y2="470" stroke="var(--fantasy-hairline)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="248" cy="140" r="7" fill="none" stroke="url(#hf-rim)" strokeWidth="2.5" />
    </svg>
  );
}
