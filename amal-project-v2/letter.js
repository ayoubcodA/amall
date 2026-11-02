/* =========================================================
   letter.js — ظرف كيتفتح، ورقة كتتكتب بحال بيد
   ✏️ بدّل النص ديال الرسالة من LETTER تحت (عربي + English)
   ========================================================= */
const LETTER = {
  ar: {
    dir: 'rtl',
    text:
`إلى أمال،

كاين ناس كيدّوزو فحياتنا وكيتنسّاو، وكاين ناس كيجيو يبدّلو كلشي. ونتي من النوع التاني.

ضحكتك كتنوّر النهار، وكلامك كيريّح القلب، وحضورك وحدو كيكفي باش الدنيا تولّي أزوين.

هاد الموقع الصغير دّيت فيه شوية ديال الورود، والنجوم، والكلمات... ولكن ماشي غير هادشي. كلشي فيه كيقول نفس الجملة:

نتي غالية عليا بزاف، يا أمال.

الله يخليك ليا، ويحفظك، وديما تبقاي مبتسمة. ❤️

— من القلب`
  },
  en: {
    dir: 'ltr',
    text:
`Dear Amal,

Some people pass through our lives and are forgotten. Others arrive and quietly change everything. You are one of the second kind.

Your smile lights up the day, your words calm the heart, and your presence alone is enough to make the world feel beautiful.

I filled this little website with roses, stars and words... but it is not really about any of that. Everything in it says the very same sentence:

You are so precious to me, Amal.

May you always stay happy, safe, and smiling. ❤️

— With all my heart`
  }
};

const env = document.getElementById('env');
const sheet = document.getElementById('sheet');
const paper = document.getElementById('paper');
const body = document.getElementById('lbody');
const btnAr = document.getElementById('langAr');
const btnEn = document.getElementById('langEn');
let lang = 'ar', timer = null, typing = false;

function typeText() {
  clearTimeout(timer);
  const L = LETTER[lang];
  const chars = Array.from(L.text);
  paper.dir = L.dir;
  body.textContent = '';
  body.classList.remove('done');
  typing = true;
  let i = 0;
  (function tick() {
    i++;
    body.textContent = chars.slice(0, i).join('');
    paper.scrollTop = paper.scrollHeight;
    if (i >= chars.length) { finish(); return; }
    const c = chars[i - 1];
    const wait = c === '\n' ? 380 : (c === '.' || c === '،' || c === ',') ? 220 : 34 + Math.random() * 26;
    timer = setTimeout(tick, wait);
  })();
}
function finish() {
  clearTimeout(timer);
  typing = false;
  body.textContent = LETTER[lang].text;
  body.classList.add('done');
  for (let i = 0; i < 14; i++) setTimeout(floatHeart, i * 140);
}
function floatHeart() {
  const h = document.createElement('div');
  h.textContent = Math.random() < 0.7 ? '❤️' : '💕';
  Object.assign(h.style, {
    position: 'fixed', left: (10 + Math.random() * 80) + 'vw', bottom: '-30px', zIndex: 25,
    fontSize: (16 + Math.random() * 22) + 'px', pointerEvents: 'none', opacity: 0.95,
    transition: 'transform 4.5s ease-out, opacity 4.5s ease-in'
  });
  document.body.appendChild(h);
  requestAnimationFrame(() => {
    h.style.transform = `translate(${(Math.random() - 0.5) * 120}px, -${60 + Math.random() * 45}vh)`;
    h.style.opacity = 0;
  });
  setTimeout(() => h.remove(), 4700);
}

env.addEventListener('click', () => {
  if (env.classList.contains('open')) { sheet.classList.add('show'); return; }
  env.classList.add('open');
  setTimeout(() => { sheet.classList.add('show'); typeText(); }, 1700);
});
paper.addEventListener('click', () => { if (typing) finish(); });
document.getElementById('close').addEventListener('click', () => {
  sheet.classList.remove('show');
  clearTimeout(timer);
  setTimeout(() => env.classList.remove('open'), 500);
});
function setLang(l) {
  lang = l;
  btnAr.classList.toggle('on', l === 'ar');
  btnEn.classList.toggle('on', l === 'en');
  typeText();
}
btnAr.addEventListener('click', () => setLang('ar'));
btnEn.addEventListener('click', () => setLang('en'));
