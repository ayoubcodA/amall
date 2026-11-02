/* =========================================================
   tree.js — لعبة شجرة أمال
   1) Hold = مطر. دوّز السحابة فوق الشجرة باش تكبر 💧
   2) ملي تزهّر، صيد الـ fireflies ✨ (tap)
   3) كل firefly كيشعل فانوس وكيبين ليك رسالة 🏮
   4) 12 فانوس = نهاية احتفالية
   ✏️ بدّل MSG باش تبدل الرسائل
   ========================================================= */
(() => {
  const cv = document.getElementById('tree');
  const ctx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  const MOBILE = innerWidth < 640;
  const D = MOBILE ? 7 : 8;          // عمق الأغصان
  const LIGHTS = 12;
  const LIGHT_AT = 0.72;             // من أي نسبة نمو كتبدا الـ fireflies
  const KEY = 'amalTreeGame1';

  const MSG = [
    { en: 'You are the light in every room you walk into.', ar: 'نتي النور فكل بلاصة كتدخلي ليها.' },
    { en: 'Your smile could grow a thousand trees.', ar: 'ضحكتك كتنبّت ألف شجرة.' },
    { en: 'Kindness looks beautiful on you.', ar: 'الطيبوبة زوينة عليك.' },
    { en: 'Some people are made of sunshine. You are one of them.', ar: 'كاين ناس مخلوقين من ضو الشمس، ونتي منهم.' },
    { en: 'Dream big. The sky has room for every wish.', ar: 'حلمي كبير، السما واسعة على كل أمنية.' },
    { en: 'You make ordinary days feel like celebrations.', ar: 'كتحوّلي الأيام العادية لأعياد.' },
    { en: 'Never forget how far you have already come.', ar: 'ما تنساي أبدا شحال قطعتي.' },
    { en: 'The world is softer because you are in it.', ar: 'الدنيا أحنّ حيت نتي فيها.' },
    { en: 'May your heart always be as full as this tree.', ar: 'الله يخلي قلبك عامر بحال هاد الشجرة.' },
    { en: 'You deserve every good thing coming your way.', ar: 'تستاهلي كل خير جاي فطريقك.' },
    { en: 'You are stronger, braver and brighter than you know.', ar: 'نتي أقوى وأشجع وأنور مما كتظني.' },
    { en: 'And this tree will always be yours.', ar: 'وهاد الشجرة ديما غتبقى ديالك.' }
  ];
  const HUES = [20, 35, 48, 350, 10, 40, 28, 340, 55, 15, 45, 330];

  /* ---------- Canvas ---------- */
  let W, H, dpr, S, gx, gy;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gx = W / 2; gy = H * 0.87;
    S = Math.min(H * 0.17, W * 0.22);
  }
  resize();
  addEventListener('resize', resize);

  /* ---------- Tree structure (generated once) ---------- */
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const br = [];
  const UP = -Math.PI / 2;
  function gen(parent, parentAbs, a, len, depth) {
    let abs = parentAbs + a;
    abs = clamp(abs, UP - 1.15, UP + 1.15);
    a = abs - parentAbs;
    const i = br.length;
    br.push({ p: parent, a, len, depth, ph: rnd() * 6.28, x0: 0, y0: 0, x1: 0, y1: 0, ang: 0, pr: 0 });
    if (depth >= D) return;
    const n = depth === 0 ? 3 : (depth === 1 ? 3 : (rnd() < 0.22 ? 3 : 2));
    for (let k = 0; k < n; k++) {
      const spread = n === 2 ? (k ? 0.42 : -0.42) : (k - 1) * 0.55;
      gen(i, abs, spread + (rnd() - 0.5) * 0.55, len * (0.75 + rnd() * 0.1), depth + 1);
    }
  }
  gen(-1, 0, UP, 1.0, 0);   // الجذع

  function layout(g, t, sway) {
    for (let i = 0; i < br.length; i++) {
      const b = br[i];
      const st = b.depth === 0 ? 0 : 0.12 + (b.depth - 1) * 0.68 / D;
      const du = b.depth === 0 ? 0.12 : 0.68 / D;
      b.pr = clamp((g - st) / du);
      const par = b.p < 0 ? null : br[b.p];
      const pa = par ? par.ang : 0;
      const sw = sway ? (Math.sin(t * 0.9 + b.ph) * 0.02 + Math.sin(t * 0.45) * 0.014) * (b.depth / D) : 0;
      b.ang = (b.p < 0 ? UP : pa + b.a) + sw;
      b.x0 = par ? par.x1 : gx;
      b.y0 = par ? par.y1 : gy;
      b.x1 = b.x0 + Math.cos(b.ang) * b.len * S * b.pr;
      b.y1 = b.y0 + Math.sin(b.ang) * b.len * S * b.pr;
    }
  }

  /* ---------- State ---------- */
  let st = { g: 0, lit: Array(LIGHTS).fill(false) };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const o = JSON.parse(raw); if (o && Array.isArray(o.lit) && o.lit.length === LIGHTS) st = { g: clamp(+o.g || 0), lit: o.lit.map(Boolean) }; }
  } catch (_) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (_) {} };
  let G = st.g;                       // growth المعروض
  let started = st.g > 0.02;
  let finaleShown = false;
  const litCount = () => st.lit.filter(Boolean).length;

  /* ---------- Light slots (فين كيتعلقو الفوانيس) ---------- */
  layout(1, 0, false);
  const slots = (() => {
    const cand = br.map((b, i) => ({ i, x: b.x1, y: b.y1, d: b.depth }))
      .filter(o => o.d >= D - 3 && o.d <= D - 1 && o.y < gy - S * 0.55)
      .sort((a, b) => a.x - b.x);
    const per = cand.length / LIGHTS, out = [];
    for (let k = 0; k < LIGHTS; k++) {
      const chunk = cand.slice(Math.floor(k * per), Math.floor((k + 1) * per));
      out.push(chunk[Math.floor(chunk.length / 2)].i);
    }
    return out;
  })();
  const slotPos = i => {
    const b = br[slots[i]], k = Math.max(0.85, S / 110);
    return { x: b.x1, y: b.y1 + 10 * k + 15 * k };
  };

  /* ---------- Sprites ---------- */
  function blossom(hue, light) {
    const s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    g.translate(32, 32);
    for (let k = 0; k < 5; k++) {
      g.save(); g.rotate(k * Math.PI * 2 / 5);
      const gr = g.createRadialGradient(0, -14, 2, 0, -14, 17);
      gr.addColorStop(0, `hsl(${hue},90%,${light + 20}%)`);
      gr.addColorStop(1, `hsl(${hue},80%,${light}%)`);
      g.fillStyle = gr;
      g.beginPath(); g.ellipse(0, -15, 9.5, 15, 0, 0, 6.283); g.fill();
      g.restore();
    }
    g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.fill();
    return c;
  }
  const BL = [blossom(338, 66), blossom(348, 74), blossom(328, 62), blossom(352, 82)];

  /* ---------- Entities ---------- */
  const drops = [], sparks = [], flies = [], petals = [], ambient = [];
  for (let i = 0; i < 22; i++) ambient.push({ x: rand(0, 1), y: rand(0.3, 0.95), p: rand(0, 6.28), s: rand(0.2, 0.6) });
  const stars = Array.from({ length: 150 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: Math.random() * 1.3 + 0.2, p: Math.random() * 6.28, s: Math.random() * 2 + 0.5 }));

  let raining = false, px = W / 2, py = H / 2, cloudX = W / 2, cloudA = 0;
  let t = 0, flyTimer = 1, saveTimer = 0, finaleAt = 0, toastTimer = 0;

  /* ---------- Input ---------- */
  cv.addEventListener('pointerdown', e => {
    if (!started) return;
    px = e.clientX; py = e.clientY;
    for (const f of flies) {
      if (!f.fly && Math.hypot(f.x - px, f.y - py) < 40) { catchFly(f); return; }
    }
    for (let i = 0; i < LIGHTS; i++) {
      if (st.lit[i] && G > LIGHT_AT) {
        const p = slotPos(i);
        if (Math.hypot(p.x - px, p.y - py) < 32) { showMsg(i); return; }
      }
    }
    raining = true;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  });
  cv.addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; });
  const stopRain = () => { raining = false; };
  cv.addEventListener('pointerup', stopRain);
  cv.addEventListener('pointercancel', stopRain);
  addEventListener('blur', stopRain);

  $('play').addEventListener('click', () => { started = true; $('intro').classList.add('hide'); });
  $('admire').addEventListener('click', () => $('finale').classList.remove('show'));
  const restart = () => {
    st = { g: 0, lit: Array(LIGHTS).fill(false) };
    G = 0; flies.length = 0; finaleShown = false; finaleAt = 0;
    $('finale').classList.remove('show');
    save();
  };
  $('reset').addEventListener('click', restart);
  $('again').addEventListener('click', restart);
  if (started) $('intro').classList.add('hide');

  /* ---------- Game actions ---------- */
  function showMsg(i) {
    const m = MSG[i];
    const el = $('toast');
    el.innerHTML = `<small>LIGHT ${i + 1} / ${LIGHTS}</small><b></b><span dir="rtl"></span>`;
    el.querySelector('b').textContent = m.en;
    el.querySelector('span').textContent = m.ar;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 5500);
  }
  function burst(x, y, hue, n, speed, grav = 0.04) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = rand(0.3, 1) * speed;
      sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hue: hue + rand(-12, 12), r: rand(1, 2.6), g: grav });
    }
  }
  function catchFly(f) {
    const free = [];
    for (let i = 0; i < LIGHTS; i++) if (!st.lit[i] && !flies.some(o => o.fly && o.fly.slot === i)) free.push(i);
    if (!free.length) return;
    const slot = free[Math.floor(Math.random() * free.length)];
    f.fly = { t: 0, x0: f.x, y0: f.y, slot };
    burst(f.x, f.y, 50, 14, 3);
  }
  function arrive(f) {
    const i = f.fly.slot;
    st.lit[i] = true;
    const p = slotPos(i);
    burst(p.x, p.y, HUES[i], 36, 4.2);
    showMsg(i);
    save();
    if (litCount() === LIGHTS && !finaleShown) { finaleShown = true; finaleAt = t; setTimeout(() => $('finale').classList.add('show'), 2600); }
  }
  if (litCount() === LIGHTS) { finaleShown = true; finaleAt = 0.01; }

  /* ---------- Drawing helpers ---------- */
  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, gy);
    sky.addColorStop(0, '#04030f'); sky.addColorStop(0.55, '#150a2c'); sky.addColorStop(1, '#43183a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.s + s.p));
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // moon
    const mx = W * 0.84, my = H * 0.2, mr = Math.max(26, Math.min(W, H) * 0.055);
    const mg = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4.2);
    mg.addColorStop(0, 'rgba(255,240,215,.42)'); mg.addColorStop(1, 'rgba(255,240,215,0)');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr * 4.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#fff3dc'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(210,180,150,.35)';
    ctx.beginPath(); ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.2, 0, 6.283); ctx.arc(mx + mr * 0.25, my + mr * 0.3, mr * 0.14, 0, 6.283); ctx.fill();
    // hills
    const hill = (base, amp, f, ph, col) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, base - Math.sin(x * f + ph) * amp - Math.sin(x * f * 2.3 + ph * 2) * amp * 0.3);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    };
    hill(gy - S * 0.2, S * 0.2, 0.006, 1, '#140a24');
    hill(gy - S * 0.05, S * 0.1, 0.01, 3, '#0c0618');
    // warm light on ground (يزيد مع الفوانيس)
    const lc = litCount();
    const wg = ctx.createRadialGradient(gx, gy, 5, gx, gy, S * 3.2);
    wg.addColorStop(0, `rgba(255,170,90,${0.05 + 0.3 * lc / LIGHTS})`); wg.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
    // ground
    const gg = ctx.createLinearGradient(0, gy - 8, 0, H);
    gg.addColorStop(0, '#1d1230'); gg.addColorStop(1, '#07030f');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, gy + 6);
    for (let x = 0; x <= W; x += 14) ctx.lineTo(x, gy + 4 + Math.sin(x * 0.012) * 3 - Math.exp(-Math.pow((x - gx) / (S * 0.5), 2)) * 9);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  function drawTree() {
    ctx.lineCap = 'round';
    for (let i = 0; i < br.length; i++) {
      const b = br[i];
      if (b.pr <= 0) continue;
      const k = b.depth / (D + 1);
      const w = 1.1 + Math.pow(1 - k, 2.3) * S * 0.1;
      ctx.lineWidth = w * (0.6 + 0.4 * b.pr);
      ctx.strokeStyle = `rgb(${Math.round(64 + k * 70)},${Math.round(40 + k * 40)},${Math.round(40 + k * 34)})`;
      ctx.beginPath(); ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x1, b.y1); ctx.stroke();
      if (b.depth < 2) {   // bark highlight
        ctx.lineWidth = w * 0.22;
        ctx.strokeStyle = 'rgba(255,200,170,.12)';
        ctx.beginPath(); ctx.moveTo(b.x0 - w * 0.2, b.y0); ctx.lineTo(b.x1 - w * 0.2, b.y1); ctx.stroke();
      }
    }
    // seed
    if (G < 0.04) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 3);
      const sg = ctx.createRadialGradient(gx, gy - 6, 1, gx, gy - 6, 26);
      sg.addColorStop(0, `rgba(180,255,170,${0.8 * pulse})`); sg.addColorStop(1, 'rgba(120,255,140,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(gx, gy - 6, 26, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#7a4a2c'; ctx.beginPath(); ctx.ellipse(gx, gy - 4, 6, 4, 0, 0, 6.283); ctx.fill();
    }
    // blossoms
    const f = clamp((G - 0.74) / 0.26);
    if (f > 0) {
      for (let i = 0; i < br.length; i++) {
        const b = br[i];
        if (b.pr < 1) continue;
        if (!(b.depth >= D - 1 || (b.depth === D - 2 && i % 3 === 0))) continue;
        const size = S * 0.17 * f * (0.7 + ((i * 7) % 10) / 22);
        ctx.save();
        ctx.translate(b.x1, b.y1);
        ctx.rotate(i * 0.7 + Math.sin(t + b.ph) * 0.25);
        ctx.drawImage(BL[i % BL.length], -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
  }

  function drawLantern(i) {
    const p = slotPos(i), k = Math.max(0.85, S / 110), w = 21 * k, h = 30 * k;
    const lit = st.lit[i];
    const b = br[slots[i]];
    ctx.strokeStyle = 'rgba(255,220,180,.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(p.x, p.y - h / 2); ctx.stroke();
    const cy = p.y;
    if (lit) {
      const fl = 0.86 + 0.14 * Math.sin(t * 6 + i * 2);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(p.x, cy, 2, p.x, cy, 80 * k * fl);
      g.addColorStop(0, `hsla(${HUES[i]},100%,60%,.6)`); g.addColorStop(1, `hsla(${HUES[i]},100%,50%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, cy, 80 * k * fl, 0, 6.283); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.beginPath();
    ctx.moveTo(p.x - w * 0.34, cy - h / 2); ctx.lineTo(p.x + w * 0.34, cy - h / 2);
    ctx.quadraticCurveTo(p.x + w * 0.66, cy, p.x + w * 0.4, cy + h / 2);
    ctx.lineTo(p.x - w * 0.4, cy + h / 2);
    ctx.quadraticCurveTo(p.x - w * 0.66, cy, p.x - w * 0.34, cy - h / 2);
    ctx.closePath();
    if (lit) {
      const bg = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
      bg.addColorStop(0, `hsl(${HUES[i]},95%,55%)`); bg.addColorStop(1, `hsl(${HUES[i]},100%,85%)`);
      ctx.fillStyle = bg;
    } else ctx.fillStyle = 'rgba(150,130,170,.35)';
    ctx.fill();
    ctx.strokeStyle = lit ? 'rgba(255,230,200,.6)' : 'rgba(255,255,255,.28)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(60,25,15,.75)';
    ctx.fillRect(p.x - w * 0.34, cy - h / 2 - 2, w * 0.68, 3);
    ctx.fillRect(p.x - w * 0.4, cy + h / 2 - 1, w * 0.8, 3);
  }

  function drawCloud(x, y, a, s) {
    ctx.save(); ctx.globalAlpha = a * 0.92; ctx.fillStyle = '#c9d3ff';
    ctx.shadowColor = 'rgba(150,170,255,.6)'; ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x - 34 * s, y + 6 * s, 20 * s, 0, 6.283); ctx.arc(x - 10 * s, y - 8 * s, 26 * s, 0, 6.283);
    ctx.arc(x + 20 * s, y - 2 * s, 24 * s, 0, 6.283); ctx.arc(x + 42 * s, y + 8 * s, 17 * s, 0, 6.283);
    ctx.rect(x - 34 * s, y + 6 * s, 76 * s, 19 * s);
    ctx.fill(); ctx.restore();
  }

  /* ---------- Main loop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;

    G += (st.g - G) * 0.06;
    layout(G, t, true);
    drawBackground();
    drawTree();

    // lanterns
    if (G > LIGHT_AT - 0.02) {
      ctx.globalAlpha = clamp((G - (LIGHT_AT - 0.02)) / 0.1);
      for (let i = 0; i < LIGHTS; i++) drawLantern(i);
      ctx.globalAlpha = 1;
    }

    // ambient fireflies
    ctx.globalCompositeOperation = 'lighter';
    for (const a of ambient) {
      const x = ((a.x + Math.sin(t * a.s + a.p) * 0.03) % 1) * W, y = (a.y + Math.cos(t * a.s * 0.8 + a.p) * 0.03) * H;
      const al = 0.25 + 0.5 * Math.abs(Math.sin(t * 1.4 + a.p));
      const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, `rgba(200,255,150,${al})`); g.addColorStop(1, 'rgba(200,255,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
    }

    // catchable fireflies
    flyTimer -= dt;
    const free = LIGHTS - litCount() - flies.length;
    if (started && G >= LIGHT_AT && flyTimer <= 0 && free > 0 && flies.length < 3) {
      const side = Math.random() < 0.5;
      flies.push({ x: side ? -20 : W + 20, y: rand(H * 0.18, gy - S * 0.5), a: side ? 0 : Math.PI, ph: rand(0, 6.28), fly: null });
      flyTimer = rand(1.3, 2.4);
    }
    for (let i = flies.length - 1; i >= 0; i--) {
      const f = flies[i];
      if (f.fly) {
        f.fly.t += dt * 0.85;
        const k = clamp(f.fly.t), e = k * k * (3 - 2 * k), p = slotPos(f.fly.slot);
        const cx = (f.fly.x0 + p.x) / 2, cy = Math.min(f.fly.y0, p.y) - 90;
        f.x = (1 - e) * (1 - e) * f.fly.x0 + 2 * (1 - e) * e * cx + e * e * p.x;
        f.y = (1 - e) * (1 - e) * f.fly.y0 + 2 * (1 - e) * e * cy + e * e * p.y;
        sparks.push({ x: f.x, y: f.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), life: 0.8, hue: 48, r: rand(1, 2), g: 0 });
        if (k >= 1) { arrive(f); flies.splice(i, 1); continue; }
      } else {
        f.a += (Math.sin(t * 1.3 + f.ph) * 0.12 + (Math.random() - 0.5) * 0.18);
        f.x += Math.cos(f.a) * 1.5; f.y += Math.sin(f.a) * 1.1;
        if (f.x < 20) f.a = 0; if (f.x > W - 20) f.a = Math.PI;
        if (f.y < 70) f.a = Math.PI / 2; if (f.y > gy - 40) f.a = -Math.PI / 2;
      }
      const pulse = 0.7 + 0.3 * Math.sin(t * 6 + f.ph);
      const r = 26 * pulse;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
      g.addColorStop(0, 'rgba(255,255,200,.95)'); g.addColorStop(0.3, 'rgba(255,220,90,.5)'); g.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y, 2.2, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // rain
    cloudX += (px - cloudX) * 0.18;
    cloudA += ((raining ? 1 : 0) - cloudA) * 0.15;
    if (raining && cloudA > 0.5) {
      for (let i = 0; i < 5; i++) drops.push({ x: cloudX + rand(-36, 36), y: H * 0.13 + 18, vy: rand(5, 8) });
    }
    ctx.strokeStyle = 'rgba(170,205,255,.75)'; ctx.lineWidth = 1.6;
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += 0.35; d.y += d.vy;
      ctx.beginPath(); ctx.moveTo(d.x, d.y - 8); ctx.lineTo(d.x, d.y); ctx.stroke();
      if (d.y >= gy + rand(0, 10)) {
        if (Math.abs(d.x - gx) < S * 1.9 && st.g < 1) {
          st.g = Math.min(1, st.g + 0.0003);
          saveTimer += 0.0003;
          if (Math.random() < 0.35) burst(d.x, gy, 140, 1, 1.4, 0.05);
        }
        if (Math.random() < 0.4) burst(d.x, gy, 210, 2, 1.6, 0.08);
        drops.splice(i, 1);
      }
    }
    if (cloudA > 0.02) drawCloud(cloudX, H * 0.13, cloudA, 1.15);
    if (saveTimer > 0.05) { saveTimer = 0; save(); }

    // falling petals after bloom
    if (G > 0.95 && Math.random() < 0.06) {
      const b = br[br.length - 1 - Math.floor(Math.random() * Math.min(br.length, 400))];
      petals.push({ x: b.x1, y: b.y1, vx: rand(-0.3, 0.3), vy: rand(0.3, 0.8), r: rand(0, 6.28), vr: rand(-0.05, 0.05), s: rand(4, 8), h: rand(335, 358), ph: rand(0, 6.28) });
    }
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.y += p.vy; p.x += p.vx + Math.sin(t * 1.5 + p.ph) * 0.5; p.r += p.vr;
      if (p.y > gy + 8) { petals.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = 0.85; ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${p.h},85%,72%)`;
      ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }

    // finale fireworks + rising hearts
    if (finaleAt && Math.random() < 0.05) {
      const x = rand(W * 0.12, W * 0.88), y = rand(H * 0.1, gy * 0.55), h = Math.random() < 0.5 ? rand(335, 355) : rand(35, 50);
      burst(x, y, h, 48, 5.2, 0.05);
    }
    if (finaleAt && Math.random() < 0.08) {
      sparks.push({ x: rand(W * 0.2, W * 0.8), y: gy, vx: rand(-0.4, 0.4), vy: -rand(1.4, 2.8), life: 1.6, hue: 345, r: 0, g: -0.002, heart: rand(12, 22) });
    }

    // sparks
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += s.g; s.vx *= 0.99; s.life -= 0.016;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = clamp(s.life);
      if (s.heart) { ctx.fillStyle = `hsl(${s.hue},95%,65%)`; ctx.font = `${s.heart}px Arial`; ctx.textAlign = 'center'; ctx.fillText('♥', s.x, s.y); }
      else { ctx.fillStyle = `hsl(${s.hue},100%,65%)`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.5 + s.life * 0.6), 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    // HUD
    const gp = Math.round(st.g * 100), lc = litCount();
    $('gBar').style.width = gp + '%'; $('gTxt').textContent = gp + '%';
    $('lBar').style.width = (lc / LIGHTS * 100) + '%'; $('lTxt').textContent = lc + '/' + LIGHTS;
    const hint = $('hint');
    let msg = '';
    if (started && lc < LIGHTS) msg = st.g < LIGHT_AT ? 'Hold to make it rain 💧 and move the cloud over the tree' : 'Tap the fireflies ✨ to light your lanterns';
    if (hint.dataset.m !== msg) { hint.dataset.m = msg; hint.textContent = msg; }

    requestAnimationFrame(frame);
  }
  (window.AMAL_FONTS || Promise.resolve()).then(() => { last = performance.now(); requestAnimationFrame(frame); });
})();
