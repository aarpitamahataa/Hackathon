// Original layered environment behind the wanderer: sky + moon + stars, a distant
// mountain range, a midground of broken ruins, and a soft light beam. Pure SVG/CSS —
// no image assets — so it stays crisp, tiny, and fully original. Layers are separated
// so Hero.jsx can move them at slightly different speeds for a subtle parallax.

const STARS = Array.from({ length: 22 }, (_, i) => ({
  cx: (i * 47) % 320,
  cy: (i * 31) % 90,
  r: 0.6 + (i % 3) * 0.3,
  delay: `${(i * 0.7) % 6}s`,
}));

export default function HeroBackdrop() {
  return (
    <svg
      className="hero-backdrop"
      viewBox="0 0 320 480"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hb-sky" cx="30%" cy="10%" r="80%">
          <stop offset="0%" style={{ stopColor: "var(--panel-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--void)" }} />
        </radialGradient>
        <radialGradient id="hb-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.9" />
          <stop offset="60%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.35" />
          <stop offset="100%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hb-beam" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.16" />
          <stop offset="100%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hb-mountains" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--fantasy-gold)" }} stopOpacity="0.28" />
          <stop offset="100%" style={{ stopColor: "var(--void)" }} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="320" height="480" fill="url(#hb-sky)" />

      {/* moon, softly glowing */}
      <circle className="hero-moon" cx="240" cy="64" r="26" fill="url(#hb-moon)" />
      <circle cx="240" cy="64" r="9" fill="var(--fantasy-gold)" opacity="0.55" />

      {/* stars */}
      <g className="hero-stars">
        {STARS.map((s, i) => (
          <circle
            key={i}
            className="hero-star"
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="var(--text)"
            style={{ animationDelay: s.delay }}
          />
        ))}
      </g>

      {/* light beam, behind the figure, guiding the eye down toward the dashboard */}
      <polygon className="hero-beam" points="150,50 190,50 260,480 80,480" fill="url(#hb-beam)" />

      {/* distant mountain range */}
      <polygon
        fill="url(#hb-mountains)"
        opacity="0.7"
        points="0,300 30,255 55,275 90,225 120,265 150,235 180,270 210,240 245,275 275,250 320,290 320,340 0,340"
      />

      {/* nearer, darker ridge for depth */}
      <polygon
        fill="var(--text)"
        opacity="0.14"
        points="0,330 40,300 70,320 110,285 160,320 200,295 240,325 280,300 320,330 320,360 0,360"
      />

      {/* midground ruins — a couple of original broken towers and a collapsed arch */}
      <g className="hero-ruins-detail" opacity="0.85">
        <rect x="34" y="250" width="16" height="110" fill="var(--text)" opacity="0.22" />
        <polygon points="34,250 50,250 46,236 38,236" fill="var(--text)" opacity="0.22" />
        <rect x="60" y="285" width="12" height="75" fill="var(--text)" opacity="0.18" />

        <path
          d="M226 360 L226 300 Q226 270 256 270 Q286 270 286 300 L286 360"
          fill="none"
          stroke="var(--text)"
          strokeOpacity="0.22"
          strokeWidth="14"
        />
        <rect x="296" y="270" width="14" height="90" fill="var(--text)" opacity="0.2" />
      </g>
    </svg>
  );
}
