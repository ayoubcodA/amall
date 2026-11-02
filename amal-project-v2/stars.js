/* =========================================================
   stars.js — galaxie en rotation, étoiles filantes, feux d'artifice
   - ✏️ modifie MESSAGES pour changer les phrases
   - clic / tap = feu d'artifice
   - bouton "Make a wish" = pluie d'étoiles filantes
   ========================================================= */
const MESSAGES = [
  'Among all the stars in the sky, you are the brightest one.',
  'نتي النجمة الأحلى فهاد السما، يا أمال ✨',
  'You make every ordinary day feel magical, أمال.',
  'كل نجمة كتطلع، كتفكرني فيك.',
  'If I could give you the galaxy, I would. Wrapped in a smile.',
  'الله يحقق ليك كلشي بغيتي، وأكثر.',
  'May every wish you make tonight come true. ✨'
];

const cv = document.getElementById('sky');
const ctx = cv.getContext('2d');
let W, H, dpr, CX, CY, RMAX;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  CX = W / 2; CY = H * 0.4;
  RMAX = Math.min(W * 0.5, 560);
}
resize();
addEventListener('resize', resize);

/* ---------- Background stars ---------- */
const bgStars = Array.from({ length: innerWidth < 600 ? 120 : 260 }, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random() * 1.3 + 0.2,
  p: Math.random() * 6.28,
  s: Math.random() * 2 + 0.5
}));

/* ---------- Galaxy ---------- */
const ARMS = 3;
const galaxy = [];
const GN = innerWidth < 600 ? 1400 : 2800;
for (let i = 0; i < GN; i++) {
  const r = Math.pow(Math.random(), 1.5);
  const arm = i % ARMS;
  const spread = (Math.random() - 0.5) * (0.25 + 0.9 * r);
  galaxy.push({
    r,
    a: arm * Math.PI * 2 / ARMS + r * 5.4 + spread,
    z: (Math.random() - 0.5) * 22 * (1 - r * 0.6),
    s: Math.random() * 1.8 + 0.5,
    hue: r < 0.25 ? 335 + Math.random() * 20 : r < 0.6 ? 290 + Math.random() * 30 : 215 + Math.random() * 40,
    l: r < 0.25 ? 82 : 68,
    p: Math.random() * 6.28
  });
}

/* ---------- Effects ---------- */
const mouse = { x: 0, y: 0 };
let px = 0, py = 0;
addEventListener('pointermove', e => {
  mouse.x = e.clientX / W - 0.5;
  mouse.y = e.clientY / H - 0.5;
});

const sparks = [];
const shooters = [];

function firework(x, y) {
  const hue = Math.random() < 0.5 ? 340 + Math.random() * 20 : 35 + Math.random() * 15;
  const n = 70;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n, sp = 1.5 + Math.random() * 3.2;
    sparks.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 1, hue: hue + Math.random() * 20, r: 1 + Math.random() * 1.6
    });
  }
}
function shooter() {
  const sx = Math.random() * W * 0.9 + W * 0.1;
  shooters.push({
    x: sx, y: -20 + Math.random() * H * 0.3,
    vx: -(7 + Math.random() * 6), vy: 4 + Math.random() * 4,
    life: 1
  });
}

cv.addEventListener('pointerdown', e => firework(e.clientX, e.clientY));
document.getElementById('wish').addEventListener('click', () => {
  for (let i = 0; i < 7; i++) setTimeout(shooter, i * 220);
  setTimeout(() => firework(CX, CY), 900);
  setTimeout(() => firework(CX - W * 0.2, CY - 40), 1250);
  setTimeout(() => firework(CX + W * 0.2, CY - 20), 1500);
});

/* ---------- Typewriter messages ---------- */
const msgEl = document.getElementById('msg');
(function typeLoop(idx = 0) {
  const text = MESSAGES[idx % MESSAGES.length];
  msgEl.dir = /[\u0600-\u06FF]/.test(text[0]) ? 'rtl' : 'ltr';
  let i = 0;
  (function type() {
    msgEl.textContent = text.slice(0, ++i);
    if (i < text.length) return setTimeout(type, 42);
    setTimeout(function erase() {
      msgEl.textContent = text.slice(0, --i);
      if (i > 0) return setTimeout(erase, 18);
      setTimeout(() => typeLoop(idx + 1), 350);
    }, 3200);
  })();
})();

/* ---------- Loop ---------- */
let t = 0, last = performance.now(), nextShooter = 2, nextFW = 5;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now; t += dt;

  px += (mouse.x - px) * 0.05;
  py += (mouse.y - py) * 0.05;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, H);

  // fond
  const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.8);
  bg.addColorStop(0, '#1d0a33');
  bg.addColorStop(0.5, '#0b0420');
  bg.addColorStop(1, '#030109');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // étoiles de fond
  for (const s of bgStars) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.s + s.p));
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x * W - px * 14 * s.r, s.y * H - py * 14 * s.r, s.r, 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // galaxie
  ctx.save();
  ctx.translate(CX + px * 40, CY + py * 26);
  ctx.rotate(-0.35 + px * 0.12);
  ctx.globalCompositeOperation = 'lighter';

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, RMAX * 0.38);
  core.addColorStop(0, 'rgba(255,220,240,.65)');
  core.addColorStop(0.35, 'rgba(255,71,126,.25)');
  core.addColorStop(1, 'rgba(120,60,255,0)');
  ctx.save();
  ctx.scale(1, 0.45);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, RMAX * 0.38, 0, 6.283);
  ctx.fill();
  ctx.restore();

  for (const g of galaxy) {
    const ang = g.a + t * (0.22 / (0.35 + g.r * 1.6));
    const R = g.r * RMAX;
    const x = Math.cos(ang) * R;
    const y = Math.sin(ang) * R * 0.45 + g.z;
    ctx.globalAlpha = 0.45 + 0.5 * Math.sin(t * 2 + g.p);
    ctx.fillStyle = `hsl(${g.hue},90%,${g.l}%)`;
    ctx.fillRect(x, y, g.s, g.s);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter';

  // étoiles filantes
  nextShooter -= dt;
  if (nextShooter <= 0) { shooter(); nextShooter = 2.5 + Math.random() * 3.5; }
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.012;
    if (s.life <= 0 || s.x < -200 || s.y > H + 200) { shooters.splice(i, 1); continue; }
    const tail = 14;
    const gr = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
    gr.addColorStop(0, `rgba(255,255,255,${s.life})`);
    gr.addColorStop(1, 'rgba(255,120,190,0)');
    ctx.strokeStyle = gr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${s.life})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.2, 0, 6.283);
    ctx.fill();
  }

  // feux d'artifice automatiques
  nextFW -= dt;
  if (nextFW <= 0) { firework(W * (0.15 + Math.random() * 0.7), H * (0.1 + Math.random() * 0.35)); nextFW = 5 + Math.random() * 5; }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.035; s.vx *= 0.985; s.vy *= 0.985;
    s.life -= 0.014;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    ctx.globalAlpha = s.life;
    ctx.fillStyle = `hsl(${s.hue},95%,65%)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * (0.5 + s.life), 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
