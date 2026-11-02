/* =========================================================
   lanterns.js — فوانيس كتطلع فالسما فوق الما، بالأمنيات ديالك
   - كتب أمنية → "Release" → فانوس كيطلع
   - clic على السما = فانوس بأمنية عشوائية
   - انعكاس على الما، قمر، نجوم، شرارات
   ✏️ بدّل WISHES باش تبدل الأمنيات الافتراضية
   ========================================================= */
const WISHES = [
  'Be happy always', 'Dream big', 'Stay amazing', 'You are loved',
  'Endless smiles', 'Peace in your heart', 'All your wishes come true',
  'يا رب تفرحي ديما', 'الله يحقق ليك أحلامك', 'ديما مبتسمة', 'غالية عليا',
  'أمال، نتي نور', 'الصحة والهنا', 'كل خير', 'Shine, أمال'
];

const cv = document.getElementById('lan');
const ctx = cv.getContext('2d');
let W, H, dpr, WATER;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  WATER = H * 0.8;
}
resize();
addEventListener('resize', resize);

const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random() * 0.78, r: Math.random() * 1.3 + 0.2, p: Math.random() * 6.28, s: Math.random() * 2 + 0.5 }));
const lanterns = [];
const embers = [];
const rand = (a, b) => a + Math.random() * (b - a);

function release(text, x, y0) {
  if (lanterns.length > 60) lanterns.shift();
  const w = rand(58, 80);
  lanterns.push({
    x: x !== undefined ? x : rand(W * 0.1, W * 0.9),
    y: y0 !== undefined ? y0 : WATER - 10,
    vy: -rand(0.35, 0.75),
    w, h: w * 1.25,
    ph: Math.random() * 6.28,
    hue: rand(18, 42),
    text: text || WISHES[Math.floor(Math.random() * WISHES.length)],
    age: 0
  });
}
for (let i = 0; i < 9; i++) release(null, rand(W * 0.08, W * 0.92), rand(H * 0.18, WATER - 30));

cv.addEventListener('pointerdown', e => { if (e.clientY < WATER + 40) release(null, e.clientX, Math.min(e.clientY + 80, WATER - 10)); });
const input = document.getElementById('wishInput');
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const t = input.value.trim();
  release(t || null, rand(W * 0.2, W * 0.8));
  input.value = '';
});

function wrap(text, maxChars) {
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function drawLantern(l, t, mirror) {
  const fl = 0.88 + 0.12 * Math.sin(t * 7 + l.ph) + 0.05 * Math.sin(t * 13 + l.ph * 2);
  const sway = Math.sin(t * 0.9 + l.ph) * 6;
  const x = l.x + sway, w = l.w, h = l.h;
  const fadeTop = Math.min(1, Math.max(0, (l.y + 40) / (H * 0.12)));
  const alpha = Math.min(1, l.age * 0.8) * fadeTop;
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(x, l.y);
  if (mirror) { ctx.scale(1, -1); }
  ctx.globalAlpha = alpha * (mirror ? 0.28 : 1);

  // glow
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(0, 0, w * 0.1, 0, 0, w * 1.7 * fl);
  g.addColorStop(0, `hsla(${l.hue},100%,60%,.32)`);
  g.addColorStop(1, `hsla(${l.hue},100%,50%,0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, w * 1.7 * fl, 0, 6.283); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // body
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, -h / 2);
  ctx.lineTo(w * 0.34, -h / 2);
  ctx.quadraticCurveTo(w * 0.66, 0, w * 0.4, h / 2);
  ctx.lineTo(-w * 0.4, h / 2);
  ctx.quadraticCurveTo(-w * 0.66, 0, -w * 0.34, -h / 2);
  ctx.closePath();
  const body = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  body.addColorStop(0, `hsl(${l.hue},95%,${52 * fl}%)`);
  body.addColorStop(0.55, `hsl(${l.hue + 8},100%,${72 * fl}%)`);
  body.addColorStop(1, `hsl(${l.hue},100%,${88 * fl}%)`);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = `hsla(${l.hue},90%,35%,.55)`;
  ctx.lineWidth = 1;
  ctx.stroke();
  // ribs
  ctx.strokeStyle = `hsla(${l.hue},90%,38%,.25)`;
  ctx.beginPath(); ctx.moveTo(-w * 0.14, -h / 2); ctx.quadraticCurveTo(-w * 0.2, 0, -w * 0.14, h / 2);
  ctx.moveTo(w * 0.14, -h / 2); ctx.quadraticCurveTo(w * 0.2, 0, w * 0.14, h / 2); ctx.stroke();
  // top/bottom rim
  ctx.fillStyle = 'rgba(70,25,10,.7)';
  ctx.fillRect(-w * 0.34, -h / 2 - 3, w * 0.68, 4);
  ctx.fillRect(-w * 0.4, h / 2 - 1, w * 0.8, 4);
  // flame
  ctx.fillStyle = `rgba(255,250,210,${0.9 * fl})`;
  ctx.beginPath(); ctx.ellipse(0, h / 2 - 7, 3.2, 7 * fl, 0, 0, 6.283); ctx.fill();

  // wish text
  if (!mirror) {
    ctx.fillStyle = 'rgba(95,30,10,.85)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(9, w * 0.15)}px Cairo, Poppins, Arial`;
    const lines = wrap(l.text, Math.floor(w / 6.4));
    const lh = w * 0.17;
    lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * lh, w * 0.62));
  }
  ctx.restore();
}

let last = performance.now(), t = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now; t += dt;

  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, WATER);
  sky.addColorStop(0, '#05030f'); sky.addColorStop(0.55, '#1b0a30'); sky.addColorStop(1, '#4a1635');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, WATER);

  for (const s of stars) {
    ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.s + s.p));
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // moon
  const mx = W * 0.82, my = H * 0.2, mr = Math.min(W, H) * 0.06;
  const mg = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 4);
  mg.addColorStop(0, 'rgba(255,240,215,.4)'); mg.addColorStop(1, 'rgba(255,240,215,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr * 4, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#fff3dc'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(210,180,150,.35)';
  ctx.beginPath(); ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.2, 0, 6.283); ctx.arc(mx + mr * 0.25, my + mr * 0.3, mr * 0.14, 0, 6.283); ctx.fill();

  // far hills
  ctx.fillStyle = '#12061d';
  ctx.beginPath(); ctx.moveTo(0, WATER);
  for (let x = 0; x <= W; x += 20) ctx.lineTo(x, WATER - 26 - Math.sin(x * 0.006 + 1) * 22 - Math.sin(x * 0.017) * 8);
  ctx.lineTo(W, WATER); ctx.closePath(); ctx.fill();

  // lanterns update + draw
  lanterns.sort((a, b) => a.w - b.w);
  for (let i = lanterns.length - 1; i >= 0; i--) {
    const l = lanterns[i];
    l.age += dt; l.y += l.vy; l.x += Math.sin(t * 0.5 + l.ph) * 0.25;
    if (Math.random() < 0.05) embers.push({ x: l.x + rand(-6, 6), y: l.y + l.h / 2, vx: rand(-0.2, 0.2), vy: rand(0.2, 0.7), life: 1, hue: l.hue });
    if (l.y < -l.h * 3) { lanterns.splice(i, 1); }
  }
  for (const l of lanterns) drawLantern(l, t, false);

  // embers
  ctx.globalCompositeOperation = 'lighter';
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];
    e.x += e.vx; e.y += e.vy; e.life -= 0.02;
    if (e.life <= 0) { embers.splice(i, 1); continue; }
    ctx.globalAlpha = e.life;
    ctx.fillStyle = `hsl(${e.hue + 10},100%,65%)`;
    ctx.fillRect(e.x, e.y, 1.8, 1.8);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

  // water
  const water = ctx.createLinearGradient(0, WATER, 0, H);
  water.addColorStop(0, '#2a0f33'); water.addColorStop(1, '#07030c');
  ctx.fillStyle = water; ctx.fillRect(0, WATER, W, H - WATER);

  // reflections
  ctx.save();
  ctx.beginPath(); ctx.rect(0, WATER, W, H - WATER); ctx.clip();
  for (const l of lanterns) {
    const d = WATER - l.y;
    if (d < 0) continue;
    const ry = WATER + d * 0.55 + 10;
    if (ry > H) continue;
    const a = Math.max(0, 0.45 - d / (H * 1.4)) * Math.min(1, l.age);
    const wob = Math.sin(t * 2 + l.ph + d * 0.02) * 6;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(l.x + wob, ry, 2, l.x + wob, ry, l.w * 1.4);
    g.addColorStop(0, `hsla(${l.hue},100%,60%,${a})`); g.addColorStop(1, `hsla(${l.hue},100%,50%,0)`);
    ctx.fillStyle = g;
    ctx.save(); ctx.translate(l.x + wob, ry); ctx.scale(1, 2.8); ctx.translate(-(l.x + wob), -ry);
    ctx.beginPath(); ctx.arc(l.x + wob, ry, l.w * 1.4, 0, 6.283); ctx.fill(); ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
  // moon reflection + ripples
  const rg = ctx.createLinearGradient(0, WATER, 0, H);
  rg.addColorStop(0, 'rgba(255,240,215,.22)'); rg.addColorStop(1, 'rgba(255,240,215,0)');
  ctx.fillStyle = rg;
  for (let y = WATER + 4; y < H; y += 7) {
    const k = (y - WATER) / (H - WATER);
    const ww = mr * 1.6 * (1 - k * 0.3) * (0.5 + 0.5 * Math.sin(t * 2 + y * 0.3));
    ctx.fillRect(mx + Math.sin(t + y * 0.2) * 8 - ww / 2, y, ww, 1.6);
  }
  ctx.strokeStyle = 'rgba(255,200,230,.07)'; ctx.lineWidth = 1;
  for (let y = WATER + 10; y < H; y += 16) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.03 + t * 1.5 + y) * 2);
    ctx.stroke();
  }
  ctx.restore();

  requestAnimationFrame(frame);
}
(window.AMAL_FONTS || Promise.resolve()).then(() => requestAnimationFrame(frame));
