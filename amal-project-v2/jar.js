/* =========================================================
   jar.js — برطمان زجاج مليان قلوب (physics)
   - كل قلب فيه رسالة، كليكي عليه باش تقراها
   - Add a heart / Shake
   ✏️ بدّل MSGS باش تبدل الرسائل  [English, عربي]
   ========================================================= */
const MSGS = [
  ['You make the world softer.', 'الدنيا أحلى بيك.'],
  ['Your smile is my favorite view.', 'ضحكتك أحلى منظر.'],
  ['Never forget how special you are.', 'ما تنساي أبدا شحال نتي مميزة.'],
  ['You are braver than you think.', 'نتي أشجع مما كتظني.'],
  ['Thank you for being you.', 'شكرا حيت نتي نتي.'],
  ['Some people are simply light. You are one.', 'كاين ناس نور، ونتي منهم.'],
  ['May your days be gentle and bright.', 'الله يجعل أيامك هادئة ومنوّرة.'],
  ['You deserve all the good things.', 'تستاهلي كل خير.'],
  ['Your kindness changes people.', 'طيبوبتك كتبدل الناس.'],
  ['I hope today treats you softly.', 'نتمنى نهارك يكون لطيف عليك.'],
  ['You are loved more than you know.', 'محبوبة أكثر مما كتعرفي.'],
  ['Keep shining, أمال.', 'كمّلي تنوّري، يا أمال.'],
  ['Every dream of yours matters.', 'كل حلم ديالك عندو قيمة.'],
  ['You are a gift to everyone around you.', 'نتي هدية لكل لي حواليك.'],
  ['Breathe. You are doing great.', 'تنفّسي. كتديري خير.'],
  ['You are my favorite kind of magic.', 'نتي سحري المفضل.'],
  ['Wherever you go, joy follows.', 'فين ما مشيتي، الفرحة كتتبعك.'],
  ['Be proud of how far you have come.', 'افتخري بشحال قطعتي.'],
  ['You are enough, always.', 'نتي كافية، ديما.'],
  ['Stay soft. Stay strong. Stay you.', 'بقاي حنينة، قوية، ونتي.'],
  ['Today and always: you matter.', 'اليوم وديما: نتي مهمة.'],
  ['Your laugh is my favorite song.', 'ضحكتك أحلى أغنية.'],
  ['The best is still coming for you.', 'الأحسن باقي جاي ليك.'],
  ['أمال, you are one of a kind.', 'يا أمال، نتي وحدة فالدنيا.']
];

const cv = document.getElementById('jar');
const ctx = cv.getContext('2d');
let W, H, dpr, J;
function geom() {
  const body = Math.min(W * 0.4, 175);
  J = {
    cx: W / 2, body, neck: body * 0.64,
    rim: H * 0.13, shoulder: H * 0.22, bodyTop: H * 0.33, bottom: H * 0.86, rad: 44
  };
}
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  geom();
}
resize();
addEventListener('resize', () => { resize(); hearts.forEach(h => { h.x = Math.min(Math.max(h.x, J.cx - J.body + h.r), J.cx + J.body - h.r); h.y = Math.min(h.y, J.bottom - h.r); }); });

const smooth = t => t * t * (3 - 2 * t);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
function halfW(y) {
  if (y <= J.shoulder) return J.neck;
  if (y >= J.bodyTop) return J.body;
  return J.neck + (J.body - J.neck) * smooth((y - J.shoulder) / (J.bodyTop - J.shoulder));
}

/* ---------- Heart sprites ---------- */
function heartSprite(hue) {
  const S = 112, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.translate(S / 2, S / 2 + 4);
  const s = 36;
  const path = () => {
    g.beginPath();
    g.moveTo(0, s * 0.95);
    g.bezierCurveTo(-s * 1.35, s * 0.1, -s * 0.95, -s * 0.95, 0, -s * 0.38);
    g.bezierCurveTo(s * 0.95, -s * 0.95, s * 1.35, s * 0.1, 0, s * 0.95);
    g.closePath();
  };
  path();
  const gr = g.createRadialGradient(-s * 0.3, -s * 0.3, 2, 0, 0, s * 1.2);
  gr.addColorStop(0, `hsl(${hue},95%,72%)`);
  gr.addColorStop(1, `hsl(${hue},85%,42%)`);
  g.fillStyle = gr; g.shadowColor = `hsla(${hue},100%,60%,.8)`; g.shadowBlur = 10; g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = `hsla(${hue},90%,30%,.5)`; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.5)';
  g.beginPath(); g.ellipse(-s * 0.46, -s * 0.34, s * 0.2, s * 0.11, -0.7, 0, 6.283); g.fill();
  return c;
}
const HUES = [345, 352, 330, 8, 318, 300, 340, 20];
const sprites = HUES.map(heartSprite);

/* ---------- Hearts ---------- */
const hearts = [];
let readSet = new Set(), msgIndex = 0;
const countEl = document.getElementById('count');
function updateCount() {
  countEl.textContent = `${hearts.length} hearts · ${readSet.size} read`;
}
let lidLift = 0;
function addHeart() {
  if (hearts.length >= 60) return;
  const r = 19 + Math.random() * 7;
  hearts.push({
    x: J.cx + (Math.random() - 0.5) * J.neck, y: J.rim - 70, vx: (Math.random() - 0.5) * 1.2, vy: 1,
    r, a: (Math.random() - 0.5) * 0.8, va: (Math.random() - 0.5) * 0.04,
    img: sprites[Math.floor(Math.random() * sprites.length)],
    msg: msgIndex++ % MSGS.length, entered: false, pop: 0, pulse: 0
  });
  lidLift = 1;
  updateCount();
}
document.getElementById('add').addEventListener('click', addHeart);
document.getElementById('shake').addEventListener('click', () => {
  hearts.forEach(h => { h.vy -= 9 + Math.random() * 7; h.vx += (Math.random() - 0.5) * 12; });
});
let seed = 0;
const seedTimer = setInterval(() => { if (seed++ < 26) addHeart(); else clearInterval(seedTimer); }, 320);

/* ---------- Note ---------- */
const note = document.getElementById('note');
function openNote(h) {
  const m = MSGS[h.msg];
  document.getElementById('noteEn').textContent = m[0];
  document.getElementById('noteAr').textContent = m[1];
  note.classList.add('show');
  readSet.add(h.msg);
  h.pulse = 1;
  updateCount();
}
document.getElementById('noteClose').addEventListener('click', () => note.classList.remove('show'));
note.addEventListener('click', e => { if (e.target === note) note.classList.remove('show'); });

function hit(e) {
  const r = cv.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    if (Math.hypot(h.x - x, h.y - y) < h.r * 1.15) return h;
  }
  return null;
}
cv.addEventListener('pointerdown', e => { const h = hit(e); if (h) openNote(h); });
cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) ? 'pointer' : 'default'; });

/* ---------- Physics ---------- */
function step() {
  for (const h of hearts) {
    h.vy += 0.42; h.vx *= 0.995; h.vy *= 0.999;
    h.x += h.vx; h.y += h.vy; h.a += h.va + h.vx * 0.004;
  }
  for (let i = 0; i < hearts.length; i++) {
    for (let j = i + 1; j < hearts.length; j++) {
      const a = hearts[i], b = hearts[j];
      const dx = b.x - a.x, dy = b.y - a.y, min = (a.r + b.r) * 0.92;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < min * min) {
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = (min - d) / 2;
        a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { const imp = -(1 + 0.25) * vn / 2; a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny; }
      }
    }
  }
  for (const h of hearts) {
    const hw = halfW(h.y) - h.r * 0.9;
    if (h.x < J.cx - hw) { h.x = J.cx - hw; h.vx = Math.abs(h.vx) * 0.3; }
    if (h.x > J.cx + hw) { h.x = J.cx + hw; h.vx = -Math.abs(h.vx) * 0.3; }
    const floor = J.bottom - h.r * 0.85;
    if (h.y > floor) { h.y = floor; h.vy = -Math.abs(h.vy) * 0.28; h.vx *= 0.96; }
    if (!h.entered && h.y > J.rim + h.r) h.entered = true;
    if (h.entered && h.y < J.rim + h.r) { h.y = J.rim + h.r; h.vy = Math.abs(h.vy) * 0.3; }
  }
}

/* ---------- Drawing ---------- */
function jarPath() {
  const { cx, body, neck, rim, shoulder, bodyTop, bottom, rad } = J;
  ctx.beginPath();
  ctx.moveTo(cx - neck, rim);
  ctx.lineTo(cx - neck, shoulder);
  ctx.bezierCurveTo(cx - neck, (shoulder + bodyTop) / 2, cx - body, (shoulder + bodyTop) / 2, cx - body, bodyTop);
  ctx.lineTo(cx - body, bottom - rad);
  ctx.quadraticCurveTo(cx - body, bottom, cx - body + rad, bottom);
  ctx.lineTo(cx + body - rad, bottom);
  ctx.quadraticCurveTo(cx + body, bottom, cx + body, bottom - rad);
  ctx.lineTo(cx + body, bodyTop);
  ctx.bezierCurveTo(cx + body, (shoulder + bodyTop) / 2, cx + neck, (shoulder + bodyTop) / 2, cx + neck, shoulder);
  ctx.lineTo(cx + neck, rim);
}

let t = 0;
function frame() {
  t += 0.016;
  step(); step();
  ctx.clearRect(0, 0, W, H);

  // shelf glow
  const glow = ctx.createRadialGradient(J.cx, J.bottom, 10, J.cx, J.bottom, J.body * 2.2);
  glow.addColorStop(0, 'rgba(255,71,126,.28)'); glow.addColorStop(1, 'rgba(255,71,126,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // shelf
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.fillRect(J.cx - J.body * 1.5, J.bottom, J.body * 3, 4);

  // back glass
  jarPath();
  ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.fill();

  // hearts (clipped to jar)
  ctx.save();
  jarPath(); ctx.clip();
  for (const h of hearts) {
    h.pop = Math.min(1, h.pop + 0.06);
    h.pulse = Math.max(0, h.pulse - 0.04);
    const sc = (h.r * 2.25 / 112) * (0.4 + 0.6 * h.pop) * (1 + h.pulse * 0.35);
    ctx.save();
    ctx.translate(h.x, h.y); ctx.rotate(h.a * 0.6); ctx.scale(sc, sc);
    ctx.globalAlpha = readSet.has(h.msg) ? 0.8 : 1;
    ctx.drawImage(h.img, -56, -56);
    ctx.restore();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  // unread sparkle
  for (const h of hearts) {
    if (!readSet.has(h.msg)) {
      const s = 0.5 + 0.5 * Math.sin(t * 3 + h.x * 0.05);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * s})`;
      ctx.fillRect(h.x - h.r * 0.45, h.y - h.r * 0.5, 2, 2);
    }
  }

  // front glass highlights
  jarPath();
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save();
  jarPath(); ctx.clip();
  const sh = ctx.createLinearGradient(J.cx - J.body, 0, J.cx + J.body, 0);
  sh.addColorStop(0, 'rgba(255,255,255,.16)'); sh.addColorStop(0.18, 'rgba(255,255,255,0)');
  sh.addColorStop(0.85, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,.1)');
  ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.roundRect(J.cx - J.body + 14, J.bodyTop + 20, 7, J.bottom - J.bodyTop - 100, 4); ctx.fill();
  ctx.restore();
  // rim
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(J.cx, J.rim, J.neck, 7, 0, 0, 6.283); ctx.stroke();

  // label
  const lw = J.body * 1.15, lh = 74, ly = J.bottom - 170;
  ctx.save();
  ctx.fillStyle = 'rgba(255,246,234,.92)';
  ctx.beginPath(); ctx.roundRect(J.cx - lw / 2, ly, lw, lh, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(190,100,120,.6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(J.cx - lw / 2 + 5, ly + 5, lw - 10, lh - 10, 8); ctx.stroke();
  ctx.fillStyle = '#b3173f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '700 38px "Aref Ruqaa", Cairo, serif';
  ctx.fillText('أمال', J.cx, ly + 31);
  ctx.fillStyle = '#7a4a55'; ctx.font = '600 10px Poppins, Arial';
  ctx.fillText('J A R   O F   W I S H E S', J.cx, ly + 58);
  ctx.restore();

  // lid
  lidLift = Math.max(0, lidLift - 0.022);
  const lift = Math.sin(lidLift * Math.PI) * 62;
  ctx.save();
  ctx.translate(0, -lift - 4);
  ctx.rotate(-Math.sin(lidLift * Math.PI) * 0.18);
  const lg = ctx.createLinearGradient(J.cx - J.neck, 0, J.cx + J.neck, 0);
  lg.addColorStop(0, '#c9962c'); lg.addColorStop(0.5, '#ffe08a'); lg.addColorStop(1, '#b17f1f');
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.roundRect(J.cx - J.neck - 10, J.rim - 26, (J.neck + 10) * 2, 30, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  for (let x = J.cx - J.neck; x < J.cx + J.neck; x += 9) ctx.fillRect(x, J.rim - 24, 2, 26);
  ctx.fillStyle = '#ff477e';
  ctx.font = '22px Arial'; ctx.textAlign = 'center';
  ctx.fillText('♥', J.cx, J.rim - 30);
  ctx.restore();

  requestAnimationFrame(frame);
}
(window.AMAL_FONTS || Promise.resolve()).then(() => { updateCount(); frame(); });
