/* ===== عُقاب — المختبرات الحيّة: رسوم متحركة تفاعلية (الطفل يغيّر شيئاً، ويرى النتيجة تتحرك) =====
   كل مختبر: فكرة واحدة، أهداف صغيرة تظهر كقائمة ✅، والطفل يتحكّم بكل شيء.
   تحترم إعداد «تقليل الحركة»، ولا تحتاج إنترنت ولا مكتبات. el.__solve() للاختبارات الآلية فقط. */
'use strict';
const Lab = {
  rm() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); },
  wait(ms) { return new Promise(r => setTimeout(r, Lab.rm() ? Math.min(ms, 40) : ms)); },
  alive(el) { return el.isConnected; },
  /* goals: [[id, text]]; returns { hit(id), box() } and calls api.done when all are reached */
  track(el, api, w, goals, yes) {
    const done = {}; let fin = false;
    const box = () => '<div class="lgoals">' + goals.map(([id, t]) => '<div class="' + (done[id] ? 'ok' : '') + '">' + (done[id] ? '✅' : '⬜') + ' ' + md(t) + '</div>').join('') + '</div>';
    const paint = () => { const b = el.querySelector('.lgoals'); if (b) b.outerHTML = box(); };
    return {
      box, hit(id) { if (done[id] || !goals.some(g => g[0] === id)) return; done[id] = 1; Snd.ok(); paint(); if (!fin && goals.every(g => done[g[0]])) { fin = true; api.done(w.yes || yes); if (w.medal) api.medal(w.medal); } },
      has(id) { return !!done[id]; }
    };
  },
  big(n) { if (n < 1e3) return String(Math.round(n)); if (n >= 1e15) return 'رقم من ' + Math.floor(Math.log10(n) + 1) + ' خانة'; const u = [[1e12, 'تريليون'], [1e9, 'مليار'], [1e6, 'مليون'], [1e3, 'ألف']]; for (const [v, t] of u) if (n >= v) { const x = n / v; return (x >= 1000 ? Lab.big(x) + ' ' : (x < 10 ? x.toFixed(1).replace(/\.0$/, '') : Math.round(x)) + ' ') + t; } return String(n); },
  time(sec) {
    if (sec < 1) return 'أقل من ثانية';
    if (sec < 60) return Math.round(sec) + ' ثانية';
    if (sec < 3600) return Math.round(sec / 60) + ' دقيقة';
    if (sec < 86400) return Math.round(sec / 3600) + ' ساعة';
    if (sec < 31536000) return Math.round(sec / 86400) + ' يوماً';
    const y = sec / 31536000; return y >= 1e12 ? 'أكثر من تريليون سنة 🤯' : Lab.big(y) + ' سنة';
  }
};

Object.assign(Widgets, {
  /* 1 ---- سباق كسر كلمة المرور ---- */
  crack(w, el, api) {
    const T = Lab.track(el, api, w, [['weak', 'اجعل المهاجم يكسرها في **أقل من ثانية** (شغّل الهجوم)'], ['strong', 'اصنع كلمة تحتاج **أكثر من 1000 سنة** (شغّل الهجوم)']], 'رأيت بعينيك: كل حرف إضافي يضرب الوقت في عدد كبير. الطول يهزم السرعة!');
    let len = 4; const sets = { d: [10, 'أرقام 0-9', 1], l: [26, 'حروف صغيرة a-z', 0], u: [26, 'حروف كبيرة A-Z', 0], s: [32, 'رموز !@#', 0] };
    const SPEED = 1e10;
    const calc = () => { const n = Object.values(sets).reduce((a, s) => a + (s[2] ? s[0] : 0), 0) || 10; const combos = Math.pow(n, len); return { n, combos, sec: combos / SPEED }; };
    const draw = (msg) => {
      const c = calc();
      el.innerHTML = '<div class="wbox lab crack">' + T.box() +
        '<label class="lrow">📏 الطول: <b>' + len + '</b> <input type="range" dir="ltr" min="4" max="16" value="' + len + '" data-len></label>' +
        '<div class="lchips">' + Object.keys(sets).map(k => '<button class="chip' + (sets[k][2] ? ' on' : '') + '" data-set="' + k + '">' + (sets[k][2] ? '☑️ ' : '⬜ ') + sets[k][1] + '</button>').join('') + '</div>' +
        '<div class="lstat">🔢 الاحتمالات: <b>' + Lab.big(c.combos) + '</b><br>⏱️ مهاجم يجرّب 10 مليارات في الثانية يحتاج: <b>' + Lab.time(c.sec) + '</b></div>' +
        '<div class="track"><span class="runner">🤖</span><span class="goal">🔐</span></div><div class="lmsg">' + (msg || '') + '</div>' +
        '<button class="btn sm" data-run>▶️ ابدأ الهجوم</button></div>';
    };
    const run = async () => {
      const c = calc(), r = el.querySelector('.runner'), dur = 1800; const frac = c.sec <= 1.8 ? 1 : Math.max(0.02, Math.min(0.6, 1.8 / c.sec));
      r.style.transition = Lab.rm() ? 'none' : 'left ' + (c.sec <= 1.8 ? Math.max(0.3, c.sec) : dur / 1000) + 's linear'; r.style.left = 'calc(' + Math.round(frac * 88) + '% )';
      await Lab.wait(c.sec <= 1.8 ? Math.max(300, c.sec * 1000) : dur); if (!Lab.alive(el)) return;
      if (c.sec <= 1.8) { el.querySelector('.goal').textContent = '🔓'; el.querySelector('.lmsg').innerHTML = '💥 <b>كُسرت!</b> في ' + Lab.time(c.sec) + '.'; Snd.bad(); if (c.sec < 1) T.hit('weak'); }
      else { el.querySelector('.lmsg').innerHTML = '🐢 المهاجم ما زال يجرّب... سيحتاج <b>' + Lab.time(c.sec) + '</b>. ' + (c.sec >= 3.15e10 ? '🛡️ كلمتك تصمد!' : ''); if (c.sec >= 3.15e10) T.hit('strong'); }
    };
    draw();
    el.oninput = e => { if (e.target.matches('[data-len]')) { len = +e.target.value; draw(); } };
    el.onclick = e => { const s = e.target.closest('[data-set]'); if (s) { sets[s.dataset.set][2] ^= 1; if (!Object.values(sets).some(x => x[2])) sets.d[2] = 1; Snd.click(); draw(); return; } if (e.target.closest('[data-run]')) run(); };
    el.__solve = async () => { len = 4; draw(); await run(); len = 16; sets.l[2] = 1; sets.u[2] = 1; draw(); await run(); };
  },

  /* 2 ---- شبكة حيّة: حزم، طريق بديل، وحزمة ضائعة ---- */
  net(w, el, api) {
    const T = Lab.track(el, api, w, [['send', 'أرسل الرسالة وراقب الحزم'], ['reroute', 'اضغط على راوتر في الطريق لتعطّله، ثم أرسل مرة أخرى'], ['loss', 'فعّل «🌩️ ضيّع حزمة» وأرسل: ماذا يحدث للحزمة الضائعة؟']], 'الشبكة ذكية: إذا تعطّل طريق تجد غيره، وإذا ضاعت حزمة يُعاد إرسالها، والرسالة تُركّب بالترتيب.');
    const N = { A: [24, 100, '📱'], R1: [100, 100, '📡'], R2: [190, 40, '📡'], R3: [190, 160, '📡'], R4: [280, 100, '📡'], B: [344, 100, '📱'] };
    const broken = {}; let lose = false, busy = false; const MSG = ['مر', 'حباً', ' يا', ' صديقي'];
    const pathNow = () => !broken.R2 ? ['A', 'R1', 'R2', 'R4', 'B'] : !broken.R3 ? ['A', 'R1', 'R3', 'R4', 'B'] : null;
    const draw = () => {
      const E = [['A', 'R1'], ['R1', 'R2'], ['R1', 'R3'], ['R2', 'R4'], ['R3', 'R4'], ['R4', 'B']];
      el.innerHTML = '<div class="wbox lab netl">' + T.box() + '<svg viewBox="0 0 368 200" class="netsvg">' +
        E.map(([a, b]) => '<line x1="' + N[a][0] + '" y1="' + N[a][1] + '" x2="' + N[b][0] + '" y2="' + N[b][1] + '" class="' + (broken[a] || broken[b] ? 'cut' : '') + '"/>').join('') +
        Object.keys(N).map(k => '<g class="node' + (broken[k] ? ' off' : '') + (k[0] === 'R' && k !== 'R1' && k !== 'R4' ? ' tap' : '') + '" data-n="' + k + '"><circle cx="' + N[k][0] + '" cy="' + N[k][1] + '" r="19"/><text x="' + N[k][0] + '" y="' + (N[k][1] + 7) + '" text-anchor="middle" font-size="20">' + (broken[k] ? '💥' : N[k][2]) + '</text><text x="' + N[k][0] + '" y="' + (N[k][1] + 34) + '" text-anchor="middle" class="lbl">' + (k === 'A' ? 'أنت' : k === 'B' ? 'صديقك' : k) + '</text></g>').join('') +
        '<g class="pk"></g></svg>' +
        '<div class="inbox">📬 وصل: <span dir="ltr">' + MSG.map((m, i) => '<span class="slot" data-s="' + i + '">' + (i + 1) + '</span>').join(' ') + '</span> <b class="txt"></b></div>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-send>📨 أرسل</button><button class="chip' + (lose ? ' on' : '') + '" data-lose>🌩️ ضيّع حزمة: ' + (lose ? 'نعم' : 'لا') + '</button></div><div class="lmsg"></div></div>';
    };
    const pt = k => N[k];
    const fly = (c, path, ms, stopAt) => new Promise(res => {
      const pts = path.map(pt); const segs = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
      const end = stopAt ? L * stopAt : L; const t0 = performance.now(); const dur = Lab.rm() ? 1 : ms * end / L;
      const step = now => { if (!Lab.alive(el)) return res(); let d = Math.min(end, (now - t0) / dur * end); let i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; } const f = Math.min(1, d / segs[i]); c.setAttribute('transform', 'translate(' + (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f) + ',' + (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) + ')'); if ((now - t0) < dur) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
    const send = async () => {
      if (busy) return; const path = pathNow(); const msg = el.querySelector('.lmsg');
      if (!path) { msg.innerHTML = '⛔ كل الطرق مقطوعة! أصلح راوتراً بالضغط عليه.'; Snd.bad(); return; }
      busy = true; el.querySelectorAll('.slot').forEach(s => s.classList.remove('got')); el.querySelector('.txt').textContent = ''; msg.innerHTML = path.includes('R3') ? '🔀 R2 معطّل، فالحزم تأخذ طريقاً آخر عبر R3!' : '📦 الرسالة قُطّعت إلى 4 حزم مرقّمة...';
      const g = el.querySelector('.pk'); g.innerHTML = '';
      const got = {}; const one = async (i, lost) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'g'); c.innerHTML = '<circle r="10" class="' + (lost ? 'lost' : '') + '"/><text y="4" text-anchor="middle" font-size="11">' + (i + 1) + '</text>'; g.appendChild(c);
        await Lab.wait(i * 350); await fly(c, path, 1600, lost ? 0.45 : 0);
        if (lost) { c.classList.add('vanish'); await Lab.wait(400); c.remove(); return false; }
        c.remove(); got[i] = 1; const s = el.querySelector('[data-s="' + i + '"]'); if (s) s.classList.add('got'); return true;
      };
      const lostIdx = lose ? 2 : -1;
      await Promise.all(MSG.map((m, i) => one(i, i === lostIdx)));
      if (!Lab.alive(el)) return;
      if (lostIdx >= 0) { msg.innerHTML = '📭 الحزمة <b>3</b> لم تصل! صديقك يطلبها مرة أخرى...'; Snd.bad(); await Lab.wait(900); await one(lostIdx, false); if (!Lab.alive(el)) return; msg.innerHTML = '🔁 أُعيد إرسال الحزمة 3، فاكتملت الرسالة.'; }
      el.querySelector('.txt').textContent = '«' + MSG.join('') + '»'; busy = false;
      T.hit('send'); if (path.includes('R3')) T.hit('reroute'); if (lostIdx >= 0) T.hit('loss');
    };
    draw();
    el.onclick = e => {
      const n = e.target.closest('.node.tap'); if (n && !busy) { const k = n.dataset.n; broken[k] = !broken[k]; Snd.click(); draw(); return; }
      if (e.target.closest('[data-lose]') && !busy) { lose = !lose; Snd.click(); draw(); return; }
      if (e.target.closest('[data-send]')) send();
    };
    el.__solve = async () => { await send(); broken.R2 = true; draw(); await send(); broken.R2 = false; lose = true; draw(); await send(); };
  },

  /* 3 ---- جدار ناري تحت الهجوم ---- */
  fwlab(w, el, api) {
    const T = Lab.track(el, api, w, [['run', 'شغّل موجة والأبواب كلها مفتوحة: كم مهاجماً دخل؟'], ['perfect', 'اضبط الأبواب حتى يدخل **كل الزوّار** ولا يدخل **أي مهاجم**']], 'هذا عمل الجدار الناري: أبواب الخدمة مفتوحة للزوّار، وكل باب آخر مغلق في وجه المهاجمين.');
    const P = [[21, 'FTP'], [22, 'SSH'], [23, 'Telnet'], [80, 'موقع'], [443, 'موقع آمن'], [3306, 'قاعدة بيانات'], [3389, 'تحكّم عن بُعد']];
    const open = {}; P.forEach(p => { open[p[0]] = true; }); let busy = false;
    const WAVE = [[80, 0], [22, 1], [443, 0], [3306, 1], [80, 0], [23, 1], [443, 0], [3389, 1], [21, 1], [80, 0]];
    const draw = (res) => {
      el.innerHTML = '<div class="wbox lab fwl">' + T.box() + '<div class="fwgrid">' + P.map(([p, n]) => '<button class="port' + (open[p] ? ' open' : '') + '" data-p="' + p + '"><b dir="ltr">' + p + '</b><small>' + n + '</small><i>' + (open[p] ? '🔓 مفتوح' : '🔒 مغلق') + '</i><span class="hitz"></span></button>').join('') + '</div>' +
        '<div class="lstat">' + (res || 'الخادم يقدّم <b>موقعاً</b> فقط. 🙂 = زائر، 🦹 = مهاجم.') + '</div><button class="btn sm" data-wave>▶️ شغّل موجة</button></div>';
    };
    const wave = async () => {
      if (busy) return; busy = true; let ok = 0, vis = 0, blocked = 0, breach = 0;
      for (const [p, bad] of WAVE) {
        if (!Lab.alive(el)) return;
        const b = el.querySelector('[data-p="' + p + '"] .hitz'); const s = document.createElement('span'); s.className = 'flyer'; s.textContent = bad ? '🦹' : '🙂'; b.appendChild(s);
        await Lab.wait(260);
        if (open[p]) { s.classList.add(bad ? 'boom' : 'in'); if (bad) { breach++; Snd.bad(); } else { ok++; } } else { s.classList.add('bounce'); if (bad) blocked++; }
        if (!bad) vis++;
        await Lab.wait(220);
      }
      busy = false; if (!Lab.alive(el)) return;
      draw('النتيجة: 🙂 زوّار دخلوا <b>' + ok + '/' + vis + '</b> · 🦹 مهاجمون صُدّوا <b>' + blocked + '</b> · 💥 اختراقات <b>' + breach + '</b>' + (breach ? '<br>⚠️ كل باب مفتوح لا نحتاجه = فرصة للمهاجم.' : ok < vis ? '<br>😕 أغلقت باباً يحتاجه الزوّار!' : '<br>🛡️ ممتاز! الموقع يعمل، والمهاجمون في الخارج.'));
      T.hit('run'); if (!breach && ok === vis) T.hit('perfect');
    };
    draw();
    el.onclick = e => { const p = e.target.closest('[data-p]'); if (p && !busy) { open[p.dataset.p] = !open[p.dataset.p]; Snd.click(); draw(); return; } if (e.target.closest('[data-wave]')) wave(); };
    el.__solve = async () => { await wave(); P.forEach(p => { open[p[0]] = p[0] === 80 || p[0] === 443; }); draw(); await wave(); };
  },

  /* 4 ---- الترتيب والبحث: شاهد الخطوات ---- */
  sortsearch(w, el, api) {
    const T = Lab.track(el, api, w, [['sort', 'شغّل خوارزمية الفقاعة حتى تترتّب كل الأعمدة'], ['race', 'شغّل سباق البحث: العادي ضد الثنائي']], 'الفقاعة تقارن الجيران مرة بعد مرة، والبحث الثنائي يرمي النصف في كل خطوة.');
    let a = shuffle([2, 7, 4, 8, 1, 6, 3, 5]), i = 0, j = 0, cmp = 0, sw = 0, running = false, speed = 350;
    const sorted = () => a.every((x, k) => !k || a[k - 1] <= x);
    const draw = (hi) => {
      el.innerHTML = '<div class="wbox lab ss">' + T.box() + '<b>🫧 الفقاعة</b><div class="bars" dir="ltr">' + a.map((x, k) => '<div class="bar' + (hi && hi.includes(k) ? ' hi' : '') + (sorted() ? ' done' : '') + '" style="height:' + (x * 11 + 8) + 'px"><i>' + x + '</i></div>').join('') + '</div>' +
        '<div class="lstat">🔍 مقارنات: <b>' + cmp + '</b> · 🔄 تبديلات: <b>' + sw + '</b>' + (sorted() ? ' · ✅ مرتّبة!' : '') + '</div>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-sort>' + (running ? '⏸️ إيقاف' : '▶️ تشغيل') + '</button><button class="btn sm sec" data-step>⏭ خطوة</button><button class="btn sm sec" data-new>🔀 خلط جديد</button><label class="lrow">🐢<input type="range" dir="ltr" min="60" max="700" value="' + (760 - speed) + '" data-sp>🐇</label></div>' +
        '<hr><b>🏁 سباق البحث عن الرقم <span class="tg">737</span> بين 1 و 1000 (القائمة مرتّبة)</b><div class="race"><div>🐢 عادي: <b class="lin">0</b> خطوة</div><div>🐇 ثنائي: <b class="bin">0</b> خطوة <small class="rng"></small></div></div><button class="btn sm" data-race>▶️ ابدأ السباق</button></div>';
    };
    const step = () => {
      if (sorted()) { running = false; T.hit('sort'); draw(); return false; }
      cmp++; const hi = [j, j + 1]; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; sw++; Snd.click(); }
      j++; if (j >= a.length - 1 - i) { j = 0; i++; } draw(hi); if (sorted()) { running = false; T.hit('sort'); draw(); return false; } return true;
    };
    const loop = async () => { while (running && Lab.alive(el)) { if (!step()) break; await Lab.wait(speed); } };
    const race = async () => {
      const t = 737; let lo = 1, hi = 1000, b = 0; const B = el.querySelector('.bin'), Rg = el.querySelector('.rng'), Lt = el.querySelector('.lin');
      const binP = (async () => { while (lo <= hi) { b++; const m = Math.floor((lo + hi) / 2); B.textContent = b; Rg.textContent = '(' + lo + '–' + hi + ' ← ' + m + ')'; await Lab.wait(450); if (m === t) break; if (m < t) lo = m + 1; else hi = m - 1; } Rg.textContent += ' ✅'; })();
      const linP = (async () => { for (let k = 1; k <= t; k += 13) { Lt.textContent = k; await Lab.wait(25); if (!Lab.alive(el)) return; } Lt.textContent = t + ' ✅'; })();
      await Promise.all([binP, linP]); if (Lab.alive(el)) T.hit('race');
    };
    draw();
    el.oninput = e => { if (e.target.matches('[data-sp]')) speed = 760 - +e.target.value; };
    el.onclick = e => {
      if (e.target.closest('[data-sort]')) { running = !running; draw(); if (running) loop(); return; }
      if (e.target.closest('[data-step]')) { running = false; step(); return; }
      if (e.target.closest('[data-new]')) { running = false; a = shuffle([2, 7, 4, 8, 1, 6, 3, 5]); i = j = cmp = sw = 0; draw(); return; }
      if (e.target.closest('[data-race]')) race();
    };
    el.__solve = async () => { while (step()) { } await race(); };
  },

  /* 5 ---- آلة البصمة: حرف واحد يغيّر كل شيء ---- */
  avalanche(w, el, api) {
    const T = Lab.track(el, api, w, [['one', 'غيّر **حرفاً واحداً فقط** وراقب كم خانة تتغيّر في البصمة'], ['same', 'أرجع النص كما كان بالضبط: هل ترجع البصمة نفسها؟']], 'تغيير صغير جداً ← بصمة مختلفة تماماً. ونفس النص ← نفس البصمة دائماً. هاتان صفتا البصمة.');
    const start = w.text || 'oqab'; let prevText = start, prevHash = '', firstHash = '';
    const fallback = s => { let h = ''; for (let k = 0; k < 8; k++) { let x = 2166136261 ^ k; for (const ch of s + k) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619) >>> 0; x ^= x >>> 13; } h += (x >>> 0).toString(16).padStart(8, '0'); } return h; };
    const hash = async s => { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { return fallback(s); } };
    const oneEdit = (x, y) => { if (x === y) return false; if (Math.abs(x.length - y.length) > 1) return false; if (x.length === y.length) { let d = 0; for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) d++; return d === 1; } const [s, l] = x.length < y.length ? [x, y] : [y, x]; for (let k = 0; k < l.length; k++) if (l.slice(0, k) + l.slice(k + 1) === s) return true; return false; };
    el.innerHTML = '<div class="wbox lab av">' + T.box() + '<input class="inp" dir="ltr" value="' + esc(start) + '" data-t autocomplete="off" autocapitalize="off" spellcheck="false"><div class="hexgrid" dir="ltr"></div><div class="lstat"></div></div>';
    const grid = el.querySelector('.hexgrid'), stat = el.querySelector('.lstat');
    const show = async (text) => {
      const h = await hash(text); if (!Lab.alive(el)) return; let ch = 0;
      grid.innerHTML = [...h].map((c, k) => { const d = prevHash && prevHash[k] !== c; if (d) ch++; return '<i class="' + (d ? 'fl' : '') + '">' + c + '</i>'; }).join('');
      if (!firstHash) { firstHash = h; stat.innerHTML = 'هذه بصمة النص. الآن غيّر حرفاً واحداً فقط...'; }
      else { stat.innerHTML = '🔄 تغيّرت <b>' + ch + '</b> خانة من ' + h.length + (h === firstHash ? '<br>✅ النص رجع كما كان، فرجعت البصمة نفسها بالضبط!' : ''); if (oneEdit(prevText, text) && ch >= h.length / 3) T.hit('one'); if (h === firstHash && T.has('one')) T.hit('same'); }
      prevHash = h; prevText = text;
    };
    show(start);
    el.oninput = e => { if (e.target.matches('[data-t]')) show(e.target.value); };
    el.__solve = async () => { const i = el.querySelector('[data-t]'); await show(start + 's'); i.value = start; await show(start); };
  },

  /* 6 ---- حقن SQL على الهواء ---- */
  sqllive(w, el, api) {
    const T = Lab.track(el, api, w, [['inject', 'اكتب الحيلة في كلمة المرور (أو اضغط زرّها) وراقب الجزء الأحمر'], ['safe', 'شغّل «الاستعلام المُعدّ» 🛡️ وجرّب الحيلة نفسها']], 'الحيلة تنجح عندما يصير كلام المستخدم جزءاً من الأمر. والاستعلام المُعدّ يبقيه بيانات فقط.');
    let name = 'admin', pw = '', safe = false;
    const build = () => { const parts = [["SELECT * FROM users WHERE name='", 0], [name, 1], ["' AND pw='", 0], [pw, 1], ["'", 0]]; const chars = []; parts.forEach(([t, u]) => [...t].forEach(c => chars.push([c, u]))); let inQ = false; return chars.map(([c, u]) => { let cls = u ? 'ud' : 'tp'; if (c === "'") { inQ = !inQ; if (u) cls = 'inj'; } else if (u && !inQ) cls = 'inj'; return [c, cls]; }); };
    const verdict = (ch) => { if (safe) return name === 'sara' && pw === 'blue-cat-42' ? 'ok' : 'no'; const injected = ch.some(x => x[1] === 'inj'), raw = name + ' ' + pw; if (injected && (/or\s*'?\s*(\w+)\s*'?\s*=\s*'?\s*\1/i.test(raw) || /'\s*--/.test(raw))) return 'hack'; return name === 'sara' && pw === 'blue-cat-42' ? 'ok' : 'no'; };
    const draw = () => {
      const ch = build(), v = verdict(ch), injected = !safe && ch.some(x => x[1] === 'inj');
      el.innerHTML = '<div class="wbox lab sqll">' + T.box() +
        '<div class="row" style="gap:6px;flex-wrap:wrap"><input class="inp mono" dir="ltr" data-f="name" value="' + esc(name) + '" placeholder="name"><input class="inp mono" dir="ltr" data-f="pw" value="' + esc(pw) + '" placeholder="password"></div>' +
        '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px"><button class="chip" data-trick>🪄 ضع الحيلة: \' OR \'1\'=\'1</button><button class="chip' + (safe ? ' on' : '') + '" data-safe>🛡️ الاستعلام المُعدّ: ' + (safe ? 'يعمل' : 'مطفأ') + '</button></div>' +
        '<small class="muted">🖥️ ما يصل إلى قاعدة البيانات:</small><pre class="sqlq" dir="ltr">' + (safe ? '<span class="tp">SELECT * FROM users WHERE name = </span><span class="ph">?</span><span class="tp"> AND pw = </span><span class="ph">?</span>\n<span class="tp">-- البيانات وحدها: </span><span class="ud">' + esc(JSON.stringify([name, pw])) + '</span>' : ch.map(([c, cls]) => '<span class="' + cls + '">' + esc(c) + '</span>').join('')) + '</pre>' +
        '<div class="lstat">' + (injected ? '⚠️ الجزء <b class="injc">الأحمر</b> كتبه المستخدم، لكنه صار <b>خارج</b> علامات التنصيص: أي صار أمراً!<br>' : '') + (v === 'hack' ? '💥 <b>دخل المهاجم كـ admin!</b>' : v === 'ok' ? '✅ دخول صحيح.' : '⛔ رُفض الدخول.') + '</div></div>';
      if (v === 'hack') T.hit('inject'); if (safe && /'\s*or/i.test(pw + name) && v === 'no') T.hit('safe');
    };
    draw();
    el.oninput = e => { const f = e.target.dataset && e.target.dataset.f; if (f) { if (f === 'name') name = e.target.value; else pw = e.target.value; const pos = e.target.selectionStart; draw(); const n = el.querySelector('[data-f="' + f + '"]'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { } } };
    el.onclick = e => { if (e.target.closest('[data-trick]')) { pw = "' OR '1'='1"; Snd.click(); draw(); } if (e.target.closest('[data-safe]')) { safe = !safe; Snd.click(); draw(); } };
    el.__solve = async () => { pw = "' OR '1'='1"; draw(); safe = true; draw(); };
  },

  /* 7 ---- المصافحة وفيضان SYN ---- */
  synflood(w, el, api) {
    const T = Lab.track(el, api, w, [['normal', 'اتصل اتصالاً عادياً وشاهد المصافحة'], ['blocked', 'شغّل الفيضان، ثم حاول الاتصال: ماذا يحدث؟'], ['protect', 'فعّل الحماية والفيضان شغّال، ثم اتصل']], 'الفيضان يملأ طاولة الخادم بمصافحات لا تكتمل. والحماية تجعل الخادم لا يحجز مكاناً حتى تكتمل المصافحة.');
    const S = 6; const slots = new Array(S).fill(null); let flood = false, prot = false, tm = null;
    const draw = (msg) => {
      el.innerHTML = '<div class="wbox lab syn">' + T.box() + '<div class="lane" dir="ltr"><span>💻</span><b class="arrow"></b><span>🖥️</span></div>' +
        '<small class="muted">🪑 طاولة الخادم (اتصالات تنتظر):</small><div class="slots">' + slots.map(s => '<i class="' + (s || '') + '">' + (s === 'flood' ? '⏳' : s === 'user' ? '🙂' : '') + '</i>').join('') + '</div>' +
        '<div class="lstat">' + (msg || '') + '</div><div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-c>🙂 اتصال عادي</button><button class="chip' + (flood ? ' on' : '') + '" data-fl>🦹 فيضان SYN: ' + (flood ? 'شغّال' : 'متوقّف') + '</button><button class="chip' + (prot ? ' on' : '') + '" data-pr>🛡️ الحماية: ' + (prot ? 'مفعّلة' : 'مطفأة') + '</button></div></div>';
    };
    const paintSlots = () => { const b = el.querySelectorAll('.slots i'); slots.forEach((s, k) => { if (b[k]) { b[k].className = s || ''; b[k].textContent = s === 'flood' ? '⏳' : s === 'user' ? '🙂' : ''; } }); };
    const free = () => slots.indexOf(null);
    const tick = () => { if (!Lab.alive(el)) { clearInterval(tm); return; } if (flood && !prot) { const k = free(); if (k >= 0) { slots[k] = 'flood'; paintSlots(); setTimeout(() => { if (slots[k] === 'flood') { slots[k] = null; if (!flood) paintSlots(); } }, 9000); } } };
    const arrow = async (t) => { const a = el.querySelector('.arrow'); if (!a) return; a.textContent = t; a.classList.remove('go'); void a.offsetWidth; a.classList.add('go'); await Lab.wait(550); };
    const connect = async () => {
      const lst = el.querySelector('.lstat'); await arrow('SYN ➡️');
      if (!Lab.alive(el)) return; const k = prot ? (free() >= 0 ? free() : 0) : free();
      if (k < 0 || (!prot && slots.every(Boolean))) { lst.innerHTML = '😢 <b>الخادم مشغول!</b> الطاولة ممتلئة بمصافحات المهاجم التي لا تكتمل. الزائر الحقيقي لم يجد مكاناً.'; Snd.bad(); T.hit('blocked'); return; }
      await arrow('⬅️ SYN-ACK'); await arrow('ACK ➡️'); if (!Lab.alive(el)) return;
      if (prot && slots[k] === 'flood') slots[k] = null; slots[k] = 'user'; paintSlots(); lst.innerHTML = '🤝 المصافحة اكتملت، والاتصال بدأ!' + (flood && prot ? ' 🛡️ الحماية لم تحجز مكاناً لمصافحات المهاجم.' : ''); Snd.ok();
      if (flood && prot) T.hit('protect'); else if (!flood) T.hit('normal');
      setTimeout(() => { if (slots[k] === 'user') { slots[k] = null; paintSlots(); } }, 1500);
    };
    draw('💻 جهازك و 🖥️ الخادم. اضغط «اتصال عادي».'); tm = setInterval(tick, 300);
    el.onclick = e => {
      if (e.target.closest('[data-c]')) connect();
      if (e.target.closest('[data-fl]')) { flood = !flood; if (!flood) slots.fill(null); draw(flood ? '🦹 المهاجم يرسل SYN كثيرة ولا يرسل ACK أبداً... راقب الطاولة.' : 'توقّف الفيضان.'); }
      if (e.target.closest('[data-pr]')) { prot = !prot; if (prot) slots.forEach((s, k) => { if (s === 'flood') slots[k] = null; }); draw(prot ? '🛡️ الحماية: الخادم لا يحجز مكاناً قبل أن تكتمل المصافحة.' : 'الحماية مطفأة.'); }
    };
    el.__solve = async () => { await connect(); flood = true; slots.fill('flood'); draw(); await connect(); prot = true; slots.fill(null); draw(); await connect(); flood = false; prot = false; };
  },

  /* 8 ---- مطبخ الحاسوب: التخزين والذاكرة ---- */
  kitchen(w, el, api) {
    const all = { open: 'افتح برنامجين: اضغط عليهما في الثلاجة 🧊', full: 'املأ الطاولة أكثر من طاقتها وراقب الطاهي', off: 'أطفئ الجهاز 🔌 وانظر: ماذا يبقى؟' };
    const G = (w.goals || ['open', 'full', 'off']).map(g => [g, all[g]]);
    const T = Lab.track(el, api, w, G, 'الثلاجة تحفظ كل شيء ببطء، والطاولة سريعة لكنها صغيرة وتُمسح عند الإطفاء.');
    const APPS = [['🎮', 'لعبة', 4], ['🌐', 'متصفح', 2], ['🎵', 'موسيقى', 1], ['🎬', 'فيديو', 3], ['🖍️', 'رسم', 2]]; const CAP = 8; let ram = [], on = true;
    const used = () => ram.reduce((a, k) => a + APPS[k][2], 0);
    const draw = (msg) => {
      const u = used(), over = u > CAP;
      el.innerHTML = '<div class="wbox lab kit">' + T.box() + '<div class="kitrow"><div class="fridge"><b>🧊 الثلاجة (التخزين)</b>' + APPS.map((a, k) => '<button class="app' + (ram.includes(k) ? ' dim' : '') + '" data-a="' + k + '">' + a[0] + ' ' + a[1] + ' <small>' + a[2] + 'GB</small></button>').join('') + '</div>' +
        '<div class="table' + (over ? ' over' : '') + (on ? '' : ' off') + '"><b>🍽️ الطاولة (الذاكرة) ' + Math.min(u, 99) + '/' + CAP + 'GB</b><div class="ramblocks">' + ram.map(k => '<button class="blk" data-r="' + k + '" style="flex:' + APPS[k][2] + '">' + APPS[k][0] + '</button>').join('') + '</div><div class="chef">' + (on ? (over ? '👨‍🍳🥵' : ram.length ? '👨‍🍳🙂' : '👨‍🍳😴') : '🌑') + '</div></div></div>' +
        '<div class="lstat">' + (msg || (on ? (over ? '🐢 <b>الطاولة امتلأت!</b> الطاهي يعيد أشياء للثلاجة ويحضرها من جديد، فيصير الجهاز بطيئاً جداً.' : 'اضغط على برنامج في الثلاجة لتفتحه، وعلى برنامج في الطاولة لتغلقه.') : 'الجهاز مطفأ.')) + '</div>' +
        '<button class="btn sm ' + (on ? 'sec' : '') + '" data-pw>' + (on ? '🔌 أطفئ الجهاز' : '⚡ شغّل الجهاز') + '</button></div>';
    };
    const fly = async (k) => { const b = el.querySelector('[data-a="' + k + '"]'), t = el.querySelector('.ramblocks'); if (!b || !t || Lab.rm()) return; const r1 = b.getBoundingClientRect(), r2 = t.getBoundingClientRect(); const f = document.createElement('span'); f.className = 'flyapp'; f.textContent = APPS[k][0]; f.style.left = r1.left + 'px'; f.style.top = r1.top + 'px'; document.body.appendChild(f); await Lab.wait(20); f.style.transform = 'translate(' + (r2.left - r1.left + 20) + 'px,' + (r2.top - r1.top) + 'px) scale(1.3)'; await Lab.wait(420); f.remove(); };
    const open = async k => { if (!on || ram.includes(k)) return; Snd.click(); await fly(k); if (!Lab.alive(el)) return; ram.push(k); draw(); if (ram.length >= 2) T.hit('open'); if (used() > CAP) { Snd.bad(); T.hit('full'); } };
    const power = async () => { if (on) { on = false; draw('🔌 انقطعت الكهرباء...'); await Lab.wait(500); if (!Lab.alive(el)) return; ram = []; draw('🧹 <b>الطاولة مُسحت كلها!</b> لكن الثلاجة كما هي: البرامج والملفات محفوظة. لهذا نضغط «حفظ» قبل الإطفاء.'); T.hit('off'); } else { on = true; draw(); } };
    draw();
    el.onclick = e => { const a = e.target.closest('[data-a]'); if (a) { open(+a.dataset.a); return; } const r = e.target.closest('[data-r]'); if (r) { ram = ram.filter(x => x !== +r.dataset.r); Snd.click(); draw(); return; } if (e.target.closest('[data-pw]')) power(); };
    el.__solve = async () => { for (const k of [0, 1, 3]) await open(k); if (G.some(g => g[0] === 'off')) await power(); };
  },

  /* 9 ---- innerHTML ضد textContent ---- */
  xsslive(w, el, api) {
    const T = Lab.track(el, api, w, [['normal', 'انشر تعليقاً عادياً'], ['bold', 'انشر تعليقاً فيه وسم مثل <b>: لاحظ الفرق بين الصندوقين'], ['attack', 'انشر الكود الخبيث وراقب الصندوقين']], 'innerHTML يحوّل الكلام إلى HTML يعمل، و textContent يعرضه حروفاً فقط. لذلك كلام الزوّار يُعرض دائماً بـ textContent.');
    let txt = 'لعبة رائعة!';
    const danger = s => /<\s*script|on\w+\s*=|javascript:/i.test(s);
    const safeRender = s => esc(s).replace(/&lt;(\/?)(b|i|u)&gt;/gi, '<$1$2>');
    el.innerHTML = '<div class="wbox lab xl">' + T.box() + '<input class="inp" dir="auto" data-t value="' + esc(txt) + '"><div class="row" style="gap:6px;flex-wrap:wrap;margin:6px 0"><button class="chip" data-ex="&lt;b&gt;مرحبا&lt;/b&gt;">‹b› وسم عريض</button><button class="chip" data-ex="&lt;img src=x onerror=steal()&gt;">🦹 كود خبيث</button><button class="btn sm" data-post>📝 انشر</button></div>' +
      '<div class="xlpanes"><div class="xlp bad"><b>⚠️ صفحة تستعمل innerHTML</b><div class="out"></div></div><div class="xlp good"><b>🛡️ صفحة تستعمل textContent</b><div class="out"></div></div></div><div class="lstat"></div></div>';
    const inp = el.querySelector('[data-t]'), A = el.querySelector('.bad .out'), B = el.querySelector('.good .out'), st = el.querySelector('.lstat');
    const post = () => {
      txt = inp.value; Snd.click();
      if (danger(txt)) { A.innerHTML = '<div class="boomx">⚡ <b>الكود اشتغل!</b><br>في موقع حقيقي كان سيرسل كوكي الزائر للمهاجم 🎟️➡️🦹</div>'; A.parentNode.classList.remove('shake'); void A.offsetWidth; A.parentNode.classList.add('shake'); Snd.bad(); st.innerHTML = 'نفس التعليق: في اليسار صار **كوداً يعمل**، وفي اليمين بقي **حروفاً** لا تؤذي.'.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); T.hit('attack'); }
      else { A.innerHTML = '<div>' + safeRender(txt) + '</div>'; st.innerHTML = /<\s*(b|i|u)\s*>/i.test(txt) ? 'innerHTML فهم الوسم وجعل الكلام عريضاً، و textContent عرض الوسم نفسه حروفاً.' : 'تعليق عادي: الصندوقان متشابهان.'; if (/<\s*(b|i|u)\s*>/i.test(txt)) T.hit('bold'); else T.hit('normal'); }
      B.textContent = txt;
    };
    el.onclick = e => { const x = e.target.closest('[data-ex]'); if (x) { const d = document.createElement('textarea'); d.innerHTML = x.dataset.ex; inp.value = d.value; Snd.click(); return; } if (e.target.closest('[data-post]')) post(); };
    el.__solve = async () => { inp.value = 'مرحبا'; post(); inp.value = '<b>مرحبا</b>'; post(); inp.value = '<img src=x onerror=steal()>'; post(); };
  },

  /* 10 ---- الفدية والنسخ الاحتياطية الثلاث ---- */
  ransomlab(w, el, api) {
    const T = Lab.track(el, api, w, [['none', 'جرّب الهجوم **بدون** نسخة احتياطية'], ['online', 'جرّب مع نسخة **متصلة** بالحاسوب دائماً'], ['offline', 'جرّب مع نسخة **مفصولة** بعد النسخ']], 'النسخة المتصلة تُشفَّر مع الملفات! فقط النسخة المفصولة تنجو. لهذا قاعدة 3-2-1 تطلب نسخة واحدة على الأقل بعيدة وغير متصلة.');
    const F = ['🖼️ صور', '📄 واجب', '🎮 حفظ اللعبة', '🎵 أغاني', '📊 مشروع', '🎬 فيديو']; let mode = 'none', locked = [], bLocked = false, busy = false, phase = 'ready';
    const draw = (msg) => {
      el.innerHTML = '<div class="wbox lab rl">' + T.box() + '<div class="row" style="gap:6px;flex-wrap:wrap">' + [['none', '🚫 بلا نسخة'], ['online', '🔌 نسخة متصلة'], ['offline', '💾 نسخة مفصولة']].map(([k, t]) => '<button class="chip' + (mode === k ? ' on' : '') + '" data-m="' + k + '">' + t + '</button>').join('') + '</div>' +
        '<div class="rlrow"><div class="files">' + F.map((f, k) => '<span class="file' + (locked.includes(k) ? ' lock' : '') + '">' + (locked.includes(k) ? '🔒 ' + f.split(' ')[1] : f) + '</span>').join('') + '</div>' +
        '<div class="bk' + (mode === 'none' ? ' gone' : '') + (bLocked ? ' lock' : '') + '">' + (mode === 'none' ? '—' : (bLocked ? '🔒' : '💾') + '<br><small>' + (mode === 'online' ? 'متصلة 🔌' : 'مفصولة ✂️') + '</small>') + '</div></div>' +
        '<div class="lstat">' + (msg || 'اختر نوع النسخة الاحتياطية، ثم شغّل الهجوم.') + '</div><div class="row" style="gap:6px">' + (phase === 'ready' ? '<button class="btn sm" data-go>💀 شغّل الهجوم</button>' : phase === 'hit' ? '<button class="btn sm" data-rs>🛠️ حاول الاستعادة</button>' : '<button class="btn sm sec" data-again>↺ جرّب نوعاً آخر</button>') + '</div></div>';
    };
    const attack = async () => {
      if (busy) return; busy = true; locked = []; bLocked = false;
      for (let k = 0; k < F.length; k++) { locked.push(k); Snd.click(); draw('💀 البرنامج يشفّر الملفات...'); await Lab.wait(220); if (!Lab.alive(el)) return; }
      if (mode === 'online') { bLocked = true; draw('😱 والنسخة المتصلة؟ البرنامج وجدها لأنها متصلة... وشفّرها أيضاً!'); Snd.bad(); await Lab.wait(500); }
      phase = 'hit'; busy = false; draw('💀 «ادفع لتستعيد ملفاتك!» الآن حاول الاستعادة.');
    };
    const restore = async () => {
      if (busy) return; busy = true;
      if (mode === 'offline') { for (let k = F.length - 1; k >= 0; k--) { locked.pop(); draw('🛠️ نوصل النسخة المفصولة ونعيد الملفات...'); await Lab.wait(180); if (!Lab.alive(el)) return; } phase = 'end'; draw('🎉 <b>عادت كل الملفات!</b> النسخة كانت مفصولة فلم يصل إليها البرنامج.'); Snd.ok(); T.hit('offline'); }
      else { phase = 'end'; draw(mode === 'none' ? '😭 لا توجد نسخة... الملفات ضاعت.' : '😭 النسخة نفسها مشفّرة! النسخة المتصلة لا تحمي من الفدية.'); Snd.bad(); T.hit(mode); }
      busy = false;
    };
    draw();
    el.onclick = e => {
      const m = e.target.closest('[data-m]'); if (m && phase === 'ready' && !busy) { mode = m.dataset.m; Snd.click(); draw(); return; }
      if (e.target.closest('[data-go]')) attack(); if (e.target.closest('[data-rs]')) restore();
      if (e.target.closest('[data-again]')) { phase = 'ready'; locked = []; bLocked = false; draw(); }
    };
    el.__solve = async () => { for (const k of ['none', 'online', 'offline']) { mode = k; phase = 'ready'; locked = []; bLocked = false; draw(); await attack(); await restore(); } };
  }
});
