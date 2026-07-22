// Small dependency-free confetti burst drawn on a full-screen canvas. No
// library needed — a couple dozen lines of canvas + requestAnimationFrame.

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  color: string;
  size: number;
};

const CONFETTI_COLORS = ["#3f8ecf", "#52b788", "#f4a259", "#e0574c", "#9b5de5"];

export function fireConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particles: Particle[] = Array.from({ length: 130 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 160,
    y: height * 0.28,
    vx: (Math.random() - 0.5) * 9,
    vy: -Math.random() * 11 - 4,
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: Math.random() * 6 + 4,
  }));

  let frame = 0;
  const maxFrames = 150;

  function tick() {
    frame++;
    ctx!.clearRect(0, 0, width, height);
    const life = Math.max(1 - frame / maxFrames, 0);

    for (const p of particles) {
      p.vy += 0.32; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = life;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }

    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      ctx!.clearRect(0, 0, width, height);
    }
  }

  requestAnimationFrame(tick);
}
