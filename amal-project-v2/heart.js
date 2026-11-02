/* =========================================================
   heart.js — قلب كيتبنى من الكلمات، كلمة بعد كلمة
   - فالبداية ما كاين لا قلب لا contour، غير الكلمات كتطلع وحدة وحدة
   - مني تكمل كلها: contour مضيء + الاسم أمال فالوسط + نبض
   - الكلمات كتبعد ملي كتدوز عليها بالفأرة / الصباع
   - clic = قلوب صغار
   ========================================================= */
const canvas = document.getElementById('heart');
const ctx = canvas.getContext('2d');
const W = 800, H = 700;
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = W * dpr;
canvas.height = H * dpr;

const NAME = 'أمال';

/* ✏️ بدّل الجمل كيفما بغيتي */
const phrases = [
  'My precious one', 'My sunshine', 'My princess', 'My little star', 'So precious',
  'Endless love', 'My beautiful world', 'My treasure', 'Forever special', 'Sweet angel',
  'You are amazing', 'My favorite person', 'Pure happiness', 'My heart', 'Sending kisses',
  'One of a kind', 'Always special', 'You deserve the world', 'My sweetest dream',
  'Endless tenderness', 'So beautiful', 'A precious soul', 'You make me smile', 'My universe',
  'A heart full of love', 'Simply wonderful', 'My angel', 'Precious memories',
  'Infinite sweetness', 'You are magic', 'My lovely star', 'A rare treasure',
  'يا قلبي', 'نتي القمر', 'ديما فبالي', 'غالية عليا', 'نور عيني', 'أحلى حاجة', 'الله يحفظك',
  '❤️', '💕', '✨'
];
/* الاسم كيتكرر بزاف */
const nameTokens = [
  NAME, NAME, NAME, `${NAME} ♥`, `يا ${NAME}`, `${NAME} ✨`, `${NAME} 💕`, `My ${NAME}`, `${NAME} ❤️`
];
const NAME_RATIO = 0.34;

function heartPoint(t) {
  return {
    x: 400 + 15 * 16 * Math.pow(Math.sin(t), 3),
    y: 355 - 15 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
  };
}
const outline = [];
for (let t = 0; t <= Math.PI * 2; t += 0.015) outline.push(heartPoint(t));

function insideHeart(x, y) {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i], b = outline[j];
    if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) inside = !inside;
  }
  return inside;
}

/* ---------- Words ---------- */
let particles = [];
let tEnd = 0;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function build() {
  particles = [];
  const spacingX = 48, spacingY = 22;
  for (let y = 70; y < 650; y += spacingY) {
    for (let x = 65; x < 740; x += spacingX) {
      const px = x + (Math.random() - 0.5) * 12;
      const py = y + (Math.random() - 0.5) * 5;
      if (!insideHeart(px, py)) continue;
      if (Math.abs(px - 400) < 84 && Math.abs(py - 385) < 36) continue; // مكان الاسم فالوسط
      const isName = Math.random() < NAME_RATIO;
      particles.push({
        hx: px, hy: py, ox: 0, oy: 0, vx: 0, vy: 0, isName,
        text: isName ? nameTokens[Math.floor(Math.random() * nameTokens.length)]
                     : phrases[Math.floor(Math.random() * phrases.length)],
        size: isName ? 11.5 + Math.random() * 2.5 : 7.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        t0: 0
      });
    }
  }
  // ترتيب الظهور: عشوائي (واحد تلو الآخر)
  const order = particles.map((_, i) => i).sort(() => Math.random() - 0.5);
  const step = Math.min(0.055, 9 / particles.length);
  order.forEach((idx, k) => { particles[idx].t0 = 0.6 + k * step; });
  tEnd = 0.6 + particles.length * step + 0.8;
}
build();

/* ---------- Pointer ---------- */
const mouse = { x: -999, y: -999 };
const floaters = [];
function setPointer(e) {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (W / r.width);
  mouse.y = (e.clientY - r.top) * (H / r.height);
}
canvas.addEventListener('pointermove', setPointer);
canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
canvas.addEventListener('pointerdown', e => {
  setPointer(e);
  for (let i = 0; i < 16; i++) {
    floaters.push({
      x: mouse.x, y: mouse.y, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2.6 - 0.6,
      life: 1, s: 10 + Math.random() * 14, c: Math.random() < 0.5 ? '#ff477e' : '#ffb3cc'
    });
  }
});

let start = performance.now();
let finaleFired = false;
document.getElementById('replay').addEventListener('click', () => {
  build();
  start = performance.now();
  finaleFired = false;
});

/* ---------- Loop ---------- */
function draw() {
  const time = (performance.now() - start) / 1000;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const fin = clamp((time - tEnd) / 1.4);                  // 0 → 1 mli kaytkml l9lb
  const beat = 1 + fin * (0.018 * Math.pow(Math.max(0, Math.sin(time * 3.2)), 3) + 0.008 * Math.sin(time * 1.6));
  ctx.save();
  ctx.translate(400, 385);
  ctx.scale(beat, beat);
  ctx.translate(-400, -385);

  // contour: كيبان غير فالنهاية
  if (fin > 0) {
    ctx.globalAlpha = fin * 0.9;
    ctx.beginPath();
    outline.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.strokeStyle = '#ff477e';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff2e63';
    ctx.shadowBlur = 14 + Math.sin(time * 2) * 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of particles) {
    const age = time - p.t0;
    if (age < 0) continue;

    // تفاعل مع الفأرة
    const dx = p.hx + p.ox - mouse.x, dy = p.hy + p.oy - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 4900) {
      const d = Math.sqrt(d2) || 1;
      const f = (70 - d) / 70 * 2.2;
      p.vx += dx / d * f; p.vy += dy / d * f;
    }
    p.vx += -p.ox * 0.06; p.vy += -p.oy * 0.06;
    p.vx *= 0.82; p.vy *= 0.82;
    p.ox += p.vx; p.oy += p.vy;

    const x = p.hx + p.ox;
    const y = p.hy + p.oy + Math.sin(time * 1.4 + p.phase) * 1.5;

    // pop d'apparition
    const k = easeOutBack(clamp(age / 0.75));
    const shimmer = 0.74 + Math.sin(time * 2 + p.phase) * 0.24;
    if (age < 0.55) {
      ctx.globalAlpha = (1 - age / 0.55) * 0.55;
      ctx.strokeStyle = p.isName ? '#ffd27a' : '#ff8eb3';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 4 + age * 55, 0, 6.283);
      ctx.stroke();
    }
    ctx.globalAlpha = clamp(age / 0.35) * shimmer;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.font = `${p.isName ? 700 : 600} ${p.size}px Poppins, Cairo, Arial`;
    if (age < 0.5) { ctx.fillStyle = '#fff'; ctx.shadowColor = '#ff2e63'; ctx.shadowBlur = 12; }
    else if (p.isName) { ctx.fillStyle = Math.sin(time * 1.3 + p.phase) > 0 ? '#ffe3a8' : '#ffd27a'; }
    else { ctx.fillStyle = Math.sin(time + p.phase) > 0 ? '#ff8eb3' : '#ff477e'; }
    ctx.fillText(p.text, 0, 0, p.isName ? 60 : 47);
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // الاسم فالوسط (آخر حاجة كتبان)
  const nameAge = time - (tEnd - 0.2);
  if (nameAge > 0) {
    const k = easeOutBack(clamp(nameAge / 1.1));
    ctx.save();
    ctx.translate(400, 385);
    ctx.scale(k, k);
    ctx.globalAlpha = clamp(nameAge / 0.6);
    ctx.font = '700 80px "Aref Ruqaa", Cairo, serif';
    ctx.shadowColor = '#ff2e63';
    ctx.shadowBlur = 22 + Math.sin(time * 3.2) * 9;
    ctx.fillStyle = '#fff';
    ctx.fillText(NAME, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
    if (!finaleFired) {
      finaleFired = true;
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * 6.28, s = 1 + Math.random() * 3.5;
        floaters.push({ x: 400, y: 385, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1, s: 10 + Math.random() * 16, c: Math.random() < 0.5 ? '#ff477e' : '#ffd27a' });
      }
    }
  }
  ctx.restore();

  // قلوب صغار
  ctx.textAlign = 'center';
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.x += f.vx; f.y += f.vy; f.vy += 0.02; f.life -= 0.012;
    if (f.life <= 0) { floaters.splice(i, 1); continue; }
    ctx.globalAlpha = f.life;
    ctx.fillStyle = f.c;
    ctx.font = `${f.s}px Arial`;
    ctx.fillText('♥', f.x, f.y);
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}
(window.AMAL_FONTS || Promise.resolve()).then(() => { start = performance.now(); draw(); });
