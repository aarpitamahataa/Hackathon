// Minimal, dependency-free confetti burst rendered on a full-screen canvas overlay.
// Call fireConfetti() from a click handler; it creates its own canvas, animates, and
// cleans itself up afterwards.

const COLORS = ["#2f6f4f", "#f4a300", "#e5484d", "#3b82f6", "#a855f7", "#facc15"];

export function fireConfetti({ particleCount = 140, spread = 70, originY = 0.3 } = {}) {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const particles = Array.from({ length: particleCount }, () => {
    const angle = (Math.random() * spread - spread / 2 - 90) * (Math.PI / 180);
    const speed = 4 + Math.random() * 8;
    return {
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4,
      y: canvas.height * originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 20,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    };
  });

  const gravity = 0.28;
  const drag = 0.985;
  let frame = 0;
  const maxFrames = 130;
  let rafId;

  function tick() {
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (frame < maxFrames) {
      rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  }

  rafId = requestAnimationFrame(tick);
}
