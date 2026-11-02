/* =========================================================
   stardust.js — آلاف الجزيئات كتشكّل الاسم وكترقص معاك
   - 4 أشكال: أمال / Amal / قلب / غالية  (كيتبدلو بوحدهم ولا بالأزرار)
   - الفأرة / الصباع كتبعدهم، clic = انفجار
   ========================================================= */
const cv = document.getElementById('dust');
const ctx = cv.getContext('2d');
let W, H, dpr, N;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();

const TARGETS = [
  { type: 'text', text: 'أمال', font: '700 {s}px "Aref Ruqaa", Cairo, serif', scale: 0.62 },
  { type: 'text', text: 'Amal', font: '400 {s}px "Great Vibes", cursive', scale: 0.66 },
  { type: 'heart' },
  { type: 'text', text: 'غالية', font: '700 {s}px "Aref Ruqaa", Cairo, serif', scale: 0.62 }
];

function samplePoints(target) {
  const c = document.createElement('canvas');
  c.width = Math.floor(W); c.height = Math.floor(H);
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (target.type === 'text') {
    let s = H * 0.5;
    g.font = target.font.replace('{s}', s);
    const m = g.measureText(target.text).width;
    s = Math.min(s, s * (W * target.scale) / m, H * 0.46);
    g.font = target.font.replace('{s}', s);
    g.fillText(target.text, W / 2, H * 0.47);
  } else {
    const s = Math.min(W, H * 1.05) * 0.027;
    g.translate(W / 2, H * 0.47);
    g.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.02) {
      const x = 16 * Math.pow(Math.sin(t), 3) * s;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s;
      t ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath(); g.fill();
  }
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const pts = [];
  const step = 3;
  for (let y = 0; y < c.height; y += step)
    for (let x = 0; x < c.width; x += step)
      if (d[(y * c.width + x) * 4 + 3] > 140) pts.push(x, y);
  return pts;
}

N = innerWidth < 640 ? 1500 : 3200;
const px = new Float32Array(N), py = new Float32Array(N), vx = new Float32Array(N), vy = new Float32Array(N);
const tx = new Float32Array(N), ty = new Float32Array(N);
const bucket = new Uint8Array(N);
const COLORS = ['#ff8eb3', '#ff477e', '#ffd27a', '#c9a6ff', '#8ff0ff', '#ffffff'];
for (let i = 0; i < N; i++) {
  px[i] = Math.random() * W; py[i] = Math.random() * H;
  bucket[i] = i % COLORS.length;
}

let current = 0;
function setTarget(idx, burst) {
  current = idx;
  const pts = samplePoints(TARGETS[idx]);
  const count = pts.length / 2;
  const order = Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < N; i++) {
    const k = order[i % count];
    tx[i] = pts[k * 2] + (Math.random() - 0.5) * 2;
    ty[i] = pts[k * 2 + 1] + (Math.random() - 0.5) * 2;
    if (burst) { const a = Math.random() * 6.283, s = 4 + Math.random() * 14; vx[i] += Math.cos(a) * s; vy[i] += Math.sin(a) * s; }
  }
  document.querySelectorAll('#modes button').forEach(b => b.classList.toggle('on', +b.dataset.i === idx));
}

const mouse = { x: -9999, y: -9999, down: false };
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
cv.addEventListener('pointerdown', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  for (let i = 0; i < N; i++) {
    const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d = Math.hypot(dx, dy) || 1;
    if (d < 220) { const f = (220 - d) / 220 * 22; vx[i] += dx / d * f; vy[i] += dy / d * f; }
  }
});
cv.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

let auto = true, autoTimer;
function schedule() {
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => { if (auto) { setTarget((current + 1) % TARGETS.length, true); schedule(); } }, 7000);
}
document.getElementById('modes').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  auto = false; setTarget(+b.dataset.i, true);
});
addEventListener('resize', () => { resize(); setTarget(current, false); });

let t = 0;
function frame() {
  t += 0.016;
  ctx.fillStyle = 'rgba(8,3,20,.28)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < N; i++) {
    const wob = 1.4;
    let ax = (tx[i] + Math.sin(t * 1.3 + i) * wob - px[i]) * 0.055;
    let ay = (ty[i] + Math.cos(t * 1.1 + i * 0.7) * wob - py[i]) * 0.055;
    const dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
    if (d2 < 11000) {
      const d = Math.sqrt(d2) || 1, f = (105 - d) / 105 * 2.4;
      ax += dx / d * f; ay += dy / d * f;
    }
    vx[i] = (vx[i] + ax) * 0.86; vy[i] = (vy[i] + ay) * 0.86;
    px[i] += vx[i]; py[i] += vy[i];
  }
  for (let b = 0; b < COLORS.length; b++) {
    ctx.fillStyle = COLORS[b];
    ctx.globalAlpha = 0.88;
    for (let i = b; i < N; i += COLORS.length) {
      ctx.fillRect(px[i], py[i], 2.2, 2.2);
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(frame);
}

(window.AMAL_FONTS || Promise.resolve()).then(() => {
  setTarget(0, false);
  // start scattered then gather
  for (let i = 0; i < N; i++) { px[i] = Math.random() * W; py[i] = Math.random() * H; }
  schedule();
  frame();
});
