/* =========================================================
   roses.js — roses dessinées par code, qui montent et fleurissent
   - sprites de roses pré-rendus (performance)
   - effet de profondeur + parallaxe souris
   - pétales qui tombent
   - clic / tap = bouquet qui explose
   ========================================================= */
const cv = document.getElementById('roses');
const ctx = cv.getContext('2d');
let W, H, dpr;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
addEventListener('resize', resize);

/* ---------- Rose sprite ---------- */
function makeRose(hue, sat) {
  const S = 180, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  const cx = S / 2, cy = S / 2, layers = 8;

  for (let l = 0; l < layers; l++) {
    const f = l / layers;
    const r = 78 * (1 - f * 0.86);
    const n = l < 2 ? 7 : l < 5 ? 6 : 5;
    for (let k = 0; k < n; k++) {
      const a = k * Math.PI * 2 / n + l * 0.9;
      g.save();
      g.translate(cx, cy);
      g.rotate(a);
      g.translate(r * 0.42, 0);
      const light = 30 + f * 28;
      const gr = g.createRadialGradient(-r * 0.2, 0, r * 0.05, 0, 0, r * 0.75);
      gr.addColorStop(0, `hsl(${hue},${sat}%,${light + 14}%)`);
      gr.addColorStop(1, `hsl(${hue},${sat}%,${light - 14}%)`);
      g.fillStyle = gr;
      g.strokeStyle = `hsla(${hue},${sat}%,${Math.max(8, light - 24)}%,.55)`;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(0, 0, r * 0.62, r * 0.5, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.restore();
    }
  }
  // spirale du cœur de la rose
  g.strokeStyle = `hsla(${hue},${sat}%,16%,.65)`;
  g.lineWidth = 1.3;
  g.beginPath();
  for (let t = 0; t < 14; t += 0.15) {
    const rr = 1 + t * 1.1;
    const x = cx + Math.cos(t) * rr, y = cy + Math.sin(t) * rr;
    t ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  return c;
}

const sprites = [
  makeRose(350, 82), makeRose(342, 78), makeRose(358, 85),
  makeRose(330, 70), makeRose(8, 80), makeRose(345, 90)
];

/* ---------- Entities ---------- */
const roses = [];
const petals = [];
const mouse = { x: W / 2, y: H / 2 };
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

const easeOutBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function addRose(x, y, opts = {}) {
  const size = opts.size || (28 + Math.random() * 80);
  roses.push({
    x, y, size,
    vx: opts.vx || 0,
    vy: opts.vy !== undefined ? opts.vy : -(0.5 + (size / 108) * 1.3 + Math.random() * 0.5),
    rot: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.012,
    sway: 0.3 + Math.random() * 0.7,
    phase: Math.random() * 6.28,
    img: sprites[Math.floor(Math.random() * sprites.length)],
    age: 0,
    burst: !!opts.burst
  });
}

function addPetal(x, y) {
  petals.push({
    x: x !== undefined ? x : Math.random() * W,
    y: y !== undefined ? y : -20,
    s: 5 + Math.random() * 9,
    vy: 0.6 + Math.random() * 1.1,
    ph: Math.random() * 6.28,
    rot: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 0.05,
    h: 335 + Math.random() * 25
  });
}

// scène de départ
const COUNT = innerWidth < 600 ? 14 : 26;
for (let i = 0; i < COUNT; i++) addRose(Math.random() * W, Math.random() * H);
for (let i = 0; i < 30; i++) addPetal(Math.random() * W, Math.random() * H);

function burstAt(x, y) {
  for (let i = 0; i < 9; i++) {
    const a = Math.random() * 6.28, sp = 2 + Math.random() * 3.5;
    addRose(x, y, { size: 26 + Math.random() * 46, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, burst: true });
  }
  for (let i = 0; i < 14; i++) addPetal(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
}
cv.addEventListener('pointerdown', e => burstAt(e.clientX, e.clientY));

/* ---------- Loop ---------- */
let last = performance.now(), spawnT = 0, t = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now; t += dt; spawnT += dt;

  ctx.clearRect(0, 0, W, H);

  // lueur du bas
  const g = ctx.createLinearGradient(0, H, 0, H * 0.55);
  g.addColorStop(0, 'rgba(255,46,99,.28)');
  g.addColorStop(1, 'rgba(255,46,99,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (spawnT > 0.28 && roses.length < 70) {
    spawnT = 0;
    addRose(Math.random() * W, H + 90);
    if (Math.random() < 0.6) addPetal();
  }

  roses.sort((a, b) => a.size - b.size);

  for (let i = roses.length - 1; i >= 0; i--) {
    const r = roses[i];
    r.age += dt;
    r.x += r.vx + Math.sin(t * 0.8 + r.phase) * r.sway;
    r.y += r.vy;
    r.rot += r.vr;
    if (r.burst) { r.vx *= 0.97; r.vy = r.vy * 0.97 - 0.02; }

    if (r.y < -r.size || r.x < -r.size * 2 || r.x > W + r.size * 2) { roses.splice(i, 1); continue; }

    const bloom = Math.min(1, r.age / 1.1);
    const sc = easeOutBack(bloom) * (r.size / 180);
    const fade = Math.min(1, Math.max(0, r.y / (H * 0.22)));
    const par = (mouse.x - W / 2) * r.size * 0.0004;

    ctx.save();
    ctx.globalAlpha = Math.min(1, r.age * 1.5) * (0.35 + 0.65 * fade);
    ctx.translate(r.x + par, r.y);
    ctx.rotate(r.rot);
    ctx.scale(sc, sc);
    ctx.drawImage(r.img, -90, -90);
    ctx.restore();
  }

  // pétales
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.y += p.vy; p.x += Math.sin(t + p.ph) * 0.7; p.rot += p.vr;
    if (p.y > H + 20) { petals.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = `hsl(${p.h},85%,55%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283);
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
