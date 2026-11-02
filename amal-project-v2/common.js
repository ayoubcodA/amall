/* =========================================================
   common.js — مشترك بين كل الصفحات
   - transition بين الصفحات
   - خلفية particles + أثر الفأرة
   - 3D tilt للكارطات
   - machine à écrire  ([data-type])
   - موسيقى هادئة (WebAudio) بزر ♪
   - زر Next → للصفحة الموالية
   ========================================================= */
(() => {
  const PAGES = [
    ['index.html', 'Home'],
    ['heart.html', 'Heart of Words'],
    ['roses.html', 'Garden of Roses'],
    ['stars.html', 'Sky of Wishes'],
    ['letter.html', 'The Letter'],
    ['lanterns.html', 'Sky Lanterns'],
    ['stardust.html', 'Stardust'],
    ['reasons.html', 'Reasons'],
    ['jar.html', 'Jar of Wishes'],
    ['tree.html', "Amal's Tree"]
  ];
  const body = document.body;
  const file = location.pathname.split('/').pop() || 'index.html';

  /* ---------- Fonts ready (canvas text needs them) ---------- */
  window.AMAL_FONTS = Promise.race([
    Promise.all([
      document.fonts.load('700 48px "Aref Ruqaa"', 'أمال'),
      document.fonts.load('600 14px Cairo', 'أمال'),
      document.fonts.load('600 14px Poppins'),
      document.fonts.load('400 40px "Great Vibes"')
    ]),
    new Promise(r => setTimeout(r, 2500))
  ]).catch(() => {});

  /* ---------- Page transition ---------- */
  const veil = document.createElement('div');
  veil.className = 'veil';
  body.appendChild(veil);
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('gone')));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-link]');
    if (!a) return;
    e.preventDefault();
    veil.classList.remove('gone');
    setTimeout(() => { location.href = a.getAttribute('href'); }, 650);
  });
  addEventListener('pageshow', e => { if (e.persisted) veil.classList.add('gone'); });

  /* ---------- Top bar: music + next ---------- */
  const bar = document.createElement('div');
  bar.className = 'topbar';
  const snd = document.createElement('button');
  snd.className = 'pill';
  snd.textContent = '♪ Music';
  bar.appendChild(snd);
  const idx = PAGES.findIndex(p => p[0] === file);
  if (idx > 0) {
    const nx = PAGES[(idx + 1) % PAGES.length];
    const a = document.createElement('a');
    a.className = 'pill';
    a.href = nx[0];
    a.setAttribute('data-link', '');
    a.textContent = 'Next →';
    a.title = nx[1];
    bar.appendChild(a);
  }
  body.appendChild(bar);

  /* ---------- Generative ambient music ---------- */
  let ac, master, timer, playing = false;
  const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880];
  const CHORDS = [[146.83, 220, 293.66], [130.81, 196, 261.63], [123.47, 185, 246.94], [110, 164.81, 220]];
  function note(freq, t, dur, vol, type) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (dur > 2 ? 1.2 : 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.1);
  }
  function startMusic() {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain();
      master.gain.value = 0.9;
      const delay = ac.createDelay(), fb = ac.createGain(), lp = ac.createBiquadFilter();
      delay.delayTime.value = 0.42; fb.gain.value = 0.42;
      lp.type = 'lowpass'; lp.frequency.value = 1800;
      master.connect(ac.destination);
      master.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(ac.destination);
    }
    ac.resume();
    let step = 0, chord = 0;
    const tick = () => {
      const t = ac.currentTime + 0.05;
      if (step % 16 === 0) {
        CHORDS[chord++ % CHORDS.length].forEach(f => note(f, t, 7.5, 0.035, 'sine'));
      }
      if (Math.random() < 0.72) {
        const f = SCALE[Math.floor(Math.random() * SCALE.length)];
        note(f, t, 2.2, 0.05, 'triangle');
      }
      step++;
    };
    tick();
    timer = setInterval(tick, 520);
    playing = true;
    snd.classList.add('on');
    snd.textContent = '♪ On';
  }
  function stopMusic() {
    clearInterval(timer);
    if (ac) ac.suspend();
    playing = false;
    snd.classList.remove('on');
    snd.textContent = '♪ Music';
  }
  snd.addEventListener('click', e => {
    e.stopPropagation();
    playing ? stopMusic() : startMusic();
    try { localStorage.setItem('amalMusic', playing ? '1' : '0'); } catch (_) {}
  });
  try {
    if (localStorage.getItem('amalMusic') === '1') {
      snd.textContent = '♪ Tap to resume';
      const resume = () => { if (!playing) startMusic(); };
      addEventListener('pointerdown', resume, { once: true });
      addEventListener('keydown', resume, { once: true });
    }
  } catch (_) {}

  /* ---------- Ambient background ---------- */
  if (body.dataset.bg !== 'off') {
    const c = document.createElement('canvas');
    c.id = 'bg';
    body.prepend(c);
    const x = c.getContext('2d');
    let w, h, dpr;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
    const spawn = init => ({
      x: Math.random() * w, y: init ? Math.random() * h : h + 20,
      r: Math.random() * 2.2 + 0.6, s: Math.random() * 0.35 + 0.1,
      p: Math.random() * 6.28, heart: Math.random() < 0.16
    });
    const dots = Array.from({ length: innerWidth < 600 ? 32 : 70 }, () => spawn(true));
    const trail = [];
    addEventListener('pointermove', e => {
      for (let i = 0; i < 2; i++) trail.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 1.4, vy: -Math.random() * 1.2 - 0.2, life: 1, r: Math.random() * 2.6 + 1 });
      if (trail.length > 140) trail.splice(0, trail.length - 140);
    });
    let t = 0;
    (function loop() {
      t += 0.016;
      x.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y -= d.s; d.x += Math.sin(t + d.p) * 0.25;
        if (d.y < -20) Object.assign(d, spawn(false));
        x.globalAlpha = Math.max(0.05, 0.25 + 0.3 * Math.sin(t * 1.5 + d.p));
        if (d.heart) { x.fillStyle = '#ff6b9a'; x.font = `${d.r * 7}px Arial`; x.fillText('♥', d.x, d.y); }
        else {
          x.fillStyle = '#ffb3cc';
          x.beginPath(); x.arc(d.x, d.y, d.r, 0, 6.283); x.fill();
          x.globalAlpha *= 0.25;
          x.beginPath(); x.arc(d.x, d.y, d.r * 3, 0, 6.283); x.fill();
        }
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        x.globalAlpha = p.life * 0.8;
        x.fillStyle = i % 3 ? '#ff477e' : '#ffd27a';
        x.beginPath(); x.arc(p.x, p.y, p.r * p.life, 0, 6.283); x.fill();
      }
      x.globalAlpha = 1;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 3D tilt ---------- */
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateY(-6px)`;
      el.style.setProperty('--mx', (px + 0.5) * 100 + '%');
      el.style.setProperty('--my', (py + 0.5) * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- Typewriter ([data-type]) ---------- */
  document.querySelectorAll('[data-type]').forEach(el => {
    const text = el.dataset.type;
    let i = 0;
    setTimeout(function tick() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 55);
    }, 1400);
  });
})();
