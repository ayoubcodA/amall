/* =========================================================
   reasons.js — carousel 3D ديال 12 سبب
   - سحب بالفأرة / الصباع، inertia، snap
   - Auto rotation + أزرار Prev / Next
   ✏️ بدّل REASONS باش تبدل الأسباب
   ========================================================= */
const REASONS = [
  { e: '✨', h: 340, t: 'Your smile',    en: 'It lights up the whole day.',                    ar: 'ضحكتك كتنوّر النهار كامل.' },
  { e: '💛', h: 45,  t: 'Your kindness', en: 'You care without asking anything back.',         ar: 'كتهتمي بالناس بلا ما تنتاظري شي حاجة.' },
  { e: '🌙', h: 255, t: 'Your calm',     en: 'Next to you, the noise of the world goes quiet.', ar: 'حداك الدنيا كتهدا.' },
  { e: '🔥', h: 15,  t: 'Your strength', en: 'You keep going, even when it is hard.',          ar: 'كتكمّلي حتى ملي كتكون الأمور صعيبة.' },
  { e: '🎶', h: 285, t: 'Your laugh',    en: 'The best sound there is.',                       ar: 'أحلى صوت كاين.' },
  { e: '🌸', h: 330, t: 'Your heart',    en: 'Soft, honest and full of love.',                 ar: 'حنين، صادق، وعامر بالحب.' },
  { e: '🧠', h: 200, t: 'Your mind',     en: 'Curious, clever and always surprising.',         ar: 'ذكية، فضولية، وديما كتفاجئي.' },
  { e: '🦋', h: 190, t: 'Your energy',   en: 'You turn ordinary moments into magic.',          ar: 'كتحوّلي اللحظات العادية لسحر.' },
  { e: '🏡', h: 30,  t: 'Your presence', en: 'Wherever you are starts to feel like home.',     ar: 'فين ما كنتي كتولّي دار.' },
  { e: '💫', h: 270, t: 'Your dreams',   en: 'Big, beautiful and worth chasing.',              ar: 'كبار وزوينين وتستاهل تجري عليهم.' },
  { e: '🤍', h: 310, t: 'Your words',    en: 'Even the simplest ones comfort people.',         ar: 'حتى أبسط كلامك كيريّح.' },
  { e: '👑', h: 350, t: 'Simply you',    en: 'Because there is only one you.',                 ar: 'حيت كاينة غير أمال وحدة.' }
];

const scene = document.getElementById('scene');
const ring = document.getElementById('ring');
const n = REASONS.length, step = 360 / n;
const cards = REASONS.map((r, i) => {
  const d = document.createElement('div');
  d.className = 'rcard';
  d.style.setProperty('--h', r.h);
  d.innerHTML = `<span class="n">REASON ${String(i + 1).padStart(2, '0')}</span><span class="e">${r.e}</span><h3>${r.t}</h3><p>${r.en}</p><div class="a" dir="rtl">${r.ar}</div>`;
  ring.appendChild(d);
  return d;
});

let R = 0;
function layout() {
  const cw = ring.offsetWidth;
  R = Math.round(cw / 2 / Math.tan(Math.PI / n)) + 26;
  cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
}
layout();
addEventListener('resize', layout);

let rot = 0, vel = 0, dragging = false, lastX = 0, auto = true, snapTo = null;
const autoBtn = document.getElementById('auto');

scene.addEventListener('pointerdown', e => {
  if (e.target.closest('.ctl')) return;
  dragging = true; lastX = e.clientX; vel = 0; snapTo = null;
  scene.setPointerCapture(e.pointerId);
});
scene.addEventListener('pointermove', e => {
  if (!dragging) return;
  const d = e.clientX - lastX; lastX = e.clientX;
  rot += d * 0.32; vel = d * 0.32;
});
const endDrag = () => { dragging = false; };
scene.addEventListener('pointerup', endDrag);
scene.addEventListener('pointercancel', endDrag);
scene.addEventListener('wheel', e => { rot -= e.deltaY * 0.08; }, { passive: true });

function go(dir) { auto = false; autoBtn.classList.remove('on'); snapTo = Math.round(rot / step) * step + dir * -step; }
document.getElementById('prev').addEventListener('click', () => go(-1));
document.getElementById('next').addEventListener('click', () => go(1));
autoBtn.addEventListener('click', () => { auto = !auto; autoBtn.classList.toggle('on', auto); snapTo = null; });
addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });

let frontIdx = -1;
function frame() {
  if (!dragging) {
    if (snapTo !== null) {
      rot += (snapTo - rot) * 0.09;
      if (Math.abs(snapTo - rot) < 0.05) { rot = snapTo; snapTo = null; }
    } else if (Math.abs(vel) > 0.06) {
      rot += vel; vel *= 0.94;
    } else if (auto) {
      rot -= 0.16;
    } else {
      const near = Math.round(rot / step) * step;
      rot += (near - rot) * 0.08;
    }
  }
  ring.style.transform = `translateZ(${-R}px) rotateY(${rot}deg)`;
  const idx = ((Math.round(-rot / step) % n) + n) % n;
  if (idx !== frontIdx) {
    frontIdx = idx;
    cards.forEach((c, i) => c.classList.toggle('front', i === idx));
  }
  requestAnimationFrame(frame);
}
(window.AMAL_FONTS || Promise.resolve()).then(frame);
