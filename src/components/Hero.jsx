import ProgressRing from "./ProgressRing.jsx";
import HeroFigure from "./HeroFigure.jsx";
import HeroBackdrop from "./HeroBackdrop.jsx";

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 1.7) % 9}s`,
  duration: `${9 + (i % 5) * 2}s`,
  size: 2 + (i % 3),
}));

function greetingFor(rankTitle) {
  return `Welcome back, ${rankTitle.split(" ")[0] === "Ashbound" ? "Wanderer" : rankTitle}.`;
}

export default function Hero({ rankTitle, fulfilled, total, currentStreak, bestStreak }) {
  const progress = total > 0 ? fulfilled / total : 0;
  const glow = total > 0 ? fulfilled / total : 0;

  return (
    <section className="hero" aria-label="Your journey">
      <div className="hero-figure-panel ornate-frame" aria-hidden={false}>
        <HeroBackdrop />
        <div className="hero-fog hero-fog-1" />
        <div className="hero-fog hero-fog-2" />
        <HeroFigure glow={glow} />
        <div className="hero-particles">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="hero-ember"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">{rankTitle}</p>
        <h1 className="hero-greeting">{greetingFor(rankTitle)}</h1>
        <p className="hero-tagline">Your journey continues, one quest at a time.</p>

        {total > 0 && (
          <div className="hero-progress">
            <ProgressRing progress={progress} size={72} strokeWidth={6}>
              <span className="hero-progress-fraction">
                {fulfilled}/{total}
              </span>
            </ProgressRing>
            <div className="hero-progress-text">
              <span className="hero-progress-label">Today's Quests</span>
              <span className="hero-progress-sub">{fulfilled} of {total} fulfilled</span>
            </div>
          </div>
        )}

        <div className="hero-stat-row">
          <div className="hero-stat">
            <span className="hero-stat-value">🔥 {currentStreak}</span>
            <span className="hero-stat-label">Current Streak</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">🏆 {bestStreak}</span>
            <span className="hero-stat-label">Best Streak</span>
          </div>
        </div>
      </div>
    </section>
  );
}
