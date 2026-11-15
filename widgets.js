/* ===== عُقاب — interactive widgets ===== */
'use strict';
const Widgets = {
  mount(w, el, api) {
    const f = Widgets[w.type];
    if (!f) { el.innerHTML = '<p class="muted">...</p>'; api.done && api.done(); return; }
    f(w, el, api || { done() { }, fb() { }, medal() { }, wrong() { } });
  },

  /* ---- binary bulbs ---- */
  bits(w, el, api) {
    const n = w.n || 8; const vals = Array.from({ length: n }, (_, i) => 2 ** (n - 1 - i)); const on = new Array(n).fill(0);
    const targets = [].concat(w.target == null ? [] : w.target); let ti = 0;
    const draw = () => {
      const v = on.reduce((s, b, i) => s + b * vals[i], 0);
      el.innerHTML = '<div class="wbox">' + (targets.length ? '<p style="text-align:center;margin-top:0">' + (ti < targets.length ? 'أشعل المصابيح لتصنع الرقم <b class="big-num" style="font-size:1.6em">' + targets[ti] + '</b> <small class="muted">(' + (ti + 1) + ' من ' + targets.length + ')</small>' : '✅ أنهيت كل الأرقام!') + '</p>' : '') +
        '<div class="bits">' + vals.map((x, i) => '<div class="bit"><button class="' + (on[i] ? 'on' : '') + '" data-b="' + i + '" aria-label="مصباح ' + x + '">' + on[i] + '</button><small>' + x + '</small></div>').join('') + '</div>' +
        '<p style="text-align:center;margin:8px 0 0"><span class="mono" style="font-size:1.2em;letter-spacing:.15em">' + on.join('') + '</span> = <b class="big-num" style="font-size:1.6em">' + v + '</b></p></div>';
      return v;
    };
    draw();
    el.onclick = e => {
      const b = e.target.closest('[data-b]'); if (!b) return; const i = +b.dataset.b; on[i] = on[i] ? 0 : 1; Snd.click();
      const v = draw();
      if (ti < targets.length && v === targets[ti]) { ti++; Snd.ok(); if (ti === targets.length) { draw(); api.done(w.yes || 'رائع! صنعت كل الأرقام بالثنائي.'); if (w.medal) api.medal(w.medal); } else { setTimeout(() => { on.fill(0); draw(); }, 700); } }
    };
  },

  /* ---- text → numbers → binary ---- */
  ascii(w, el, api) {
    el.innerHTML = '<div class="wbox"><input class="inp" id="asc" maxlength="12" placeholder="' + esc(w.ph || 'اكتب اسمك') + '"><div id="asco" style="margin-top:10px"></div></div>';
    const inp = $('#asc', el); let fired = false;
    inp.oninput = () => {
      const t = Array.from(inp.value);
      $('#asco', el).innerHTML = '<div class="hexv" style="white-space:pre-wrap">' + t.map(ch => { const c = ch.codePointAt(0); return esc(ch === ' ' ? '␣' : ch) + '  →  ' + c + '  →  ' + c.toString(2).padStart(8, '0'); }).join('\n') + '</div>';
      if (!fired && t.filter(c => c.trim()).length >= (w.min || 2)) { fired = true; api.done(w.yes || 'هذا اسمك كما يراه الحاسوب: أصفار وآحاد!'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- RAM vs storage ---- */
  ram(w, el, api) {
    let ram = ['🎮 لعبة مفتوحة', '📝 رسالة لم تُحفظ', '🖼️ رسمة جديدة'], disk = ['📁 صور الرحلة'], off = false, saved = 0;
    const draw = () => {
      el.innerHTML = '<div class="wbox"><div class="grid2"><div class="bucket"><h4>🍳 الذاكرة (RAM)<br><small class="muted">طاولة المطبخ: سريعة، تُمسح عند الإطفاء</small></h4>' + (off ? '<p class="muted" style="text-align:center">(فارغة! انطفأ الجهاز)</p>' : ram.map((x, i) => '<div class="row tag" style="justify-content:space-between;margin:4px 0">' + x + ' <button class="btn sm sec" data-s="' + i + '">احفظ ←</button></div>').join('')) + '</div><div class="bucket"><h4>🧊 التخزين (Storage)<br><small class="muted">الثلاجة: أبطأ، لكن تحفظ للأبد</small></h4>' + disk.map(x => '<div class="tag" style="margin:4px 0">' + x + '</div>').join('') + '</div></div>' +
        '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn ' + (off ? 'ok' : 'bad') + '" data-p>' + (off ? '🔌 شغّل الجهاز' : '⏻ أطفئ الجهاز') + '</button></div></div>';
    };
    draw();
    el.onclick = e => {
      const s = e.target.closest('[data-s]'); if (s) { const i = +s.dataset.s; disk.push(ram[i]); ram.splice(i, 1); saved++; Snd.ok(); draw(); return; }
      if (e.target.closest('[data-p]')) {
        if (!off) { off = true; Snd.whoosh(); draw(); if (saved) api.done('لاحظ: ما حفظته في التخزين بقي، وما كان في الذاكرة فقط اختفى!'); else api.fb(false, 'اختفى كل ما في الذاكرة! جرّب مرة أخرى: احفظ شيئاً قبل الإطفاء.'); }
        else { off = false; ram = saved ? ['🎮 لعبة مفتوحة'] : ['🎮 لعبة مفتوحة', '📝 رسالة لم تُحفظ', '🖼️ رسمة جديدة']; Snd.ok(); draw(); }
      }
    };
  },

  /* ---- password strength ---- */
  pw(w, el, api) {
    const COMMON = ['123456', 'password', '12345678', 'qwerty', '111111', 'abc123', 'football', 'iloveyou', 'admin', 'welcome', 'monkey', 'dragon', 'letmein', 'princess', '000000', 'password1', 'ahmed', 'mohamed', 'egypt', 'messi', 'ronaldo'];
    el.innerHTML = '<div class="wbox"><input class="inp mono" id="pw" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="جرّب كلمة مرور (لا تكتب كلمتك الحقيقية!)"><div class="meter" style="margin-top:10px"><i id="pwm" style="width:0"></i></div><p id="pwl" style="font-weight:800;margin:6px 0"></p><p id="pwt" class="muted" style="margin:0"></p><ul id="pwh" style="margin:6px 0;padding-inline-start:20px"></ul></div>';
    const inp = $('#pw', el); let fired = false;
    inp.oninput = () => {
      const p = inp.value; let pool = 0;
      if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/[0-9]/.test(p)) pool += 10; if (/[^a-zA-Z0-9]/.test(p)) pool += 33;
      let bits = p.length * Math.log2(pool || 1);
      const low = p.toLowerCase(); const common = COMMON.some(c => low.includes(c));
      if (common) bits = Math.min(bits, 10);
      if (/^(.)\1+$/.test(p)) bits = Math.min(bits, 8);
      const secs = Math.pow(2, bits) / 1e10;
      const t = secs < 1 ? 'أقل من ثانية ⚡' : secs < 3600 ? Math.round(secs / 60) + ' دقيقة تقريباً' : secs < 86400 * 365 ? Math.round(secs / 86400) + ' يوم تقريباً' : secs < 86400 * 365 * 1e6 ? Math.round(secs / 86400 / 365).toLocaleString('en') + ' سنة' : 'ملايين السنين 🛡️';
      const lv = !p ? 0 : bits < 30 ? 1 : bits < 50 ? 2 : bits < 70 ? 3 : 4;
      const L = ['', 'ضعيفة جداً 😱', 'ضعيفة 😟', 'جيدة 🙂', 'قوية جداً 💪'][lv], col = ['', '#E04B4B', '#F97316', '#C27C00', '#14A37F'][lv];
      $('#pwm', el).style.width = Math.min(100, bits / 80 * 100) + '%'; $('#pwm', el).style.background = col;
      $('#pwl', el).textContent = p ? 'القوة: ' + L : ''; $('#pwl', el).style.color = col;
      $('#pwt', el).textContent = p ? 'حاسوب سريع يجرّب 10 مليارات كلمة في الثانية يكسرها في: ' + t : '';
      const tips = []; if (p && p.length < 12) tips.push('اجعلها أطول (12 حرفاً أو أكثر).'); if (common) tips.push('فيها كلمة مشهورة يجرّبها المهاجمون أولاً!'); if (p && !/[0-9]/.test(p)) tips.push('أضف أرقاماً.'); if (p && !/[^a-zA-Z0-9]/.test(p)) tips.push('أضف رمزاً مثل ! أو -');
      $('#pwh', el).innerHTML = tips.map(x => '<li>' + x + '</li>').join('');
      if (!fired && lv === 4) { fired = true; api.done(w.yes || 'كلمة مرور قوية جداً! تذكّر: لا تستعمل هذه نفسها، فقد كتبتها هنا.'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- phishing inbox: find red flags ---- */
  inbox(w, el, api) {
    const m = w.mail; let found = 0; const total = (m.body.match(/\{\{/g) || []).length + (m.fromFlag ? 1 : 0) + (m.subjFlag ? 1 : 0);
    const flag = (txt, why) => '<span class="flag" data-why="' + esc(why) + '">' + esc(txt) + '</span>';
    const body = esc(m.body).replace(/\{\{([^|]+)\|([^}]+)\}\}/g, (x, t, why) => '<span class="flag" data-why="' + why + '">' + t + '</span>').replace(/\n/g, '<br>');
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">🔎 اضغط على كل شيء مريب في الرسالة. وجدت <b id="ifc">0</b> من ' + total + '.</p><div class="mail"><div class="hs">من: ' + (m.fromFlag ? flag(m.from, m.fromFlag) : esc(m.from)) + '</div><div class="hs">الموضوع: <b>' + (m.subjFlag ? flag(m.subj, m.subjFlag) : esc(m.subj)) + '</b></div><hr style="border:0;border-top:1px solid var(--line)"><div>' + body + '</div></div><div id="iwhy"></div></div>';
    el.onclick = e => {
      const f = e.target.closest('.flag'); if (!f || f.classList.contains('found')) return;
      f.classList.add('found'); found++; Snd.ok(); $('#ifc', el).textContent = found;
      $('#iwhy', el).insertAdjacentHTML('beforeend', '<div class="feedback ok" style="margin:6px 0">🚩 ' + f.dataset.why + '</div>');
      if (found === total) { api.done(w.yes || 'كشفت كل العلامات! هذه رسالة تصيّد.'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- two-factor login ---- */
  twofa(w, el, api) {
    let code = '', stage = 0, t = 0;
    const newCode = () => { code = String(Math.floor(100000 + Math.random() * 900000)); };
    newCode();
    const draw = () => {
      el.innerHTML = '<div class="wbox"><div class="grid2"><div><h4 style="margin:0">💻 موقع اللعبة</h4>' +
        (stage === 0 ? '<p>اسم المستخدم: <span class="mono">hero</span></p><input class="inp mono" id="tp" dir="ltr" placeholder="كلمة المرور: Blue-Tiger-42"><button class="btn sm" id="tb" style="margin-top:6px">دخول</button>' :
          stage === 1 ? '<p>✅ كلمة المرور صحيحة. الآن اكتب <b>الرمز المرسل إلى هاتفك</b>:</p><input class="inp mono" id="tc" dir="ltr" maxlength="6" placeholder="------"><button class="btn sm" id="tb2" style="margin-top:6px">تأكيد</button>' :
            '<p style="font-size:1.2em">🎉 دخلت بأمان!</p>') + '</div>' +
        '<div style="text-align:center"><h4 style="margin:0">📱 هاتفك</h4><div style="display:inline-block;border:4px solid var(--ink);border-radius:22px;padding:18px 14px;min-width:150px;margin-top:6px;background:var(--bg)">' + (stage >= 1 ? '<small>رمز الدخول</small><div class="mono" style="font-size:1.6em;font-weight:800;letter-spacing:.1em">' + code + '</div><small class="muted" id="tt">يتغيّر بعد 30 ثانية</small>' : '<small class="muted">لا رسائل</small>') + '</div></div></div><div id="tf2"></div></div>';
      const tb = $('#tb', el); if (tb) tb.onclick = () => { if ($('#tp', el).value === 'Blue-Tiger-42') { stage = 1; Snd.ok(); draw(); timer(); } else { Snd.bad(); api.fb(false, 'اكتب كلمة المرور المكتوبة كما هي: Blue-Tiger-42'); } };
      const tb2 = $('#tb2', el); if (tb2) tb2.onclick = () => { if ($('#tc', el).value.trim() === code) { stage = 2; clearInterval(t); draw(); api.done(w.yes || 'دخلت بخطوتين: شيء تعرفه (كلمة المرور) + شيء تملكه (الهاتف).'); } else { Snd.bad(); api.fb(false, 'الرمز غير صحيح. انظر إلى الهاتف.'); } };
    };
    const timer = () => { let s = 30; clearInterval(t); t = setInterval(() => { s--; const e = $('#tt', el); if (!e) { clearInterval(t); return; } if (s <= 0) { newCode(); s = 30; draw(); timer(); } else e.textContent = 'يتغيّر بعد ' + s + ' ثانية'; }, 1000); };
    draw();
  },

  /* ---- packets through the post office ---- */
  packet(w, el, api) {
    const msg = w.msg || 'أهلاً يا صديقي';
    const parts = []; const words = msg.split(' '); words.forEach((x, i) => parts.push({ n: i + 1, t: x }));
    let phase = 0;
    const nodes = [['💻', 'جهازك', 10, 50], ['📮', 'الراوتر', 32, 22], ['🏢', 'مكتب بريد', 55, 78], ['🏤', 'مكتب بريد', 62, 25], ['🖥️', 'جهاز صديقك', 90, 50]];
    const draw = () => {
      el.innerHTML = '<div class="wbox"><div class="net" id="net">' + nodes.map(n => '<div class="node" style="left:' + n[2] + '%;top:' + n[3] + '%"><div class="b">' + n[0] + '</div>' + n[1] + '</div>').join('') + '</div>' +
        '<p style="margin:8px 0">الرسالة: <b>«' + esc(msg) + '»</b> قُسّمت إلى ' + parts.length + ' حزم، وعلى كل حزمة رقمها.</p>' +
        (phase === 0 ? '<button class="btn wide" id="psend">📨 أرسل الحزم</button>' : phase === 1 ? '<p class="muted">الحزم تسافر في طرق مختلفة...</p>' : '<div id="pord"></div>') + '</div>';
    };
    draw();
    el.onclick = e => {
      if (e.target.id !== 'psend') return; phase = 1; draw(); Snd.whoosh();
      const net = $('#net', el); const routes = [[0, 1, 3, 4], [0, 2, 4], [0, 1, 2, 4], [0, 3, 4], [0, 2, 3, 4], [0, 1, 4]];
      const arrival = [];
      parts.forEach((p, i) => {
        const pk = document.createElement('div'); pk.className = 'pk'; pk.textContent = '#' + p.n; net.appendChild(pk);
        const rt = routes[i % routes.length]; let j = 0;
        pk.style.left = nodes[0][2] + '%'; pk.style.top = nodes[0][3] + '%';
        const hop = () => { j++; if (j >= rt.length) { arrival.push(p); if (arrival.length === parts.length) setTimeout(done, 500); return; } const n = nodes[rt[j]]; pk.style.left = n[2] + '%'; pk.style.top = (n[3] + (i % 3 - 1) * 6) + '%'; setTimeout(hop, 900 + Math.random() * 500); };
        setTimeout(hop, 200 + i * 350);
      });
      const done = () => {
        phase = 2; draw();
        const sub = { t: 'order', items: parts.map(p => '#' + p.n + ' «' + p.t + '»'), yes: 'رتّبتها! جهاز صديقك يفعل هذا تلقائياً بأرقام الحزم.' };
        const box = $('#pord', el); box.innerHTML = '<p><b>وصلت الحزم بترتيب مختلف!</b> رتّبها بالأرقام لتظهر الرسالة:</p><div></div>';
        Steps.order(sub, box.lastChild, { done: m => { api.done(m || sub.yes); if (w.medal) api.medal(w.medal); }, fb: api.fb, card() { }, wrong: api.wrong });
      };
    };
  },

  /* ---- firewall: ports ---- */
  firewall(w, el, api) {
    const ports = w.ports; const st = ports.map(p => !!p.open);
    const draw = () => { el.innerHTML = '<div class="wbox"><p style="margin-top:0">' + md(w.goalText || '') + '</p><div class="fw">' + ports.map((p, i) => '<button class="port ' + (st[i] ? 'open' : 'closed') + '" data-p="' + i + '"><div class="door">' + (st[i] ? '🚪' : '🧱') + '</div><b class="mono">' + p.n + '</b><br><small>' + esc(p.s) + '</small><br><span class="pill ' + (st[i] ? 'ok' : '') + '">' + (st[i] ? 'مفتوح' : 'مغلق') + '</span></button>').join('') + '</div><button class="btn" id="fwc" style="margin-top:10px">تحقّق</button></div>'; };
    draw();
    el.onclick = e => {
      const p = e.target.closest('[data-p]'); if (p) { const i = +p.dataset.p; st[i] = !st[i]; Snd.click(); draw(); return; }
      if (e.target.id === 'fwc') {
        const bad = ports.filter((p, i) => st[i] !== p.need);
        if (!bad.length) { api.done(w.yes || 'ممتاز! الخادم يعمل، وكل باب غير ضروري مغلق.'); if (w.medal) api.medal(w.medal); }
        else { api.wrong(); const b = bad[0]; api.fb(false, b.need ? 'المنفذ ' + b.n + ' (' + b.s + ') يحتاجه الخادم ليعمل! افتحه.' : 'المنفذ ' + b.n + ' (' + b.s + ') لا يحتاجه الخادم. أغلقه، فكل باب مفتوح فرصة للمهاجم.'); }
      }
    };
  },

  /* ---- DNS phonebook ---- */
  dns(w, el, api) {
    const book = w.book; const want = w.find || []; const got = {};
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">📖 دليل الهاتف (DNS): اكتب اسم الموقع لتعرف عنوانه.</p>' + (want.length ? '<p>المطلوب: ' + want.map(x => '<span class="pill" id="dw-' + x.replace(/\W/g, '') + '">' + esc(x) + '</span>').join(' ') + '</p>' : '') +
      '<form class="row flagin"><input class="inp mono" id="dq" placeholder="example.com" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn">ابحث</button></form><div class="terminal" id="dout" style="min-height:90px;margin-top:8px"></div></div>';
    const out = $('#dout', el);
    $('form', el).onsubmit = e => {
      e.preventDefault(); const q = $('#dq', el).value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (!q) return;
      const ip = book[q]; out.insertAdjacentHTML('beforeend', '<div class="ln"><span class="pr">?</span> ' + esc(q) + '  →  ' + (ip ? '<span class="hl">' + esc(ip) + '</span>' : '<span class="er">غير موجود في الدليل</span>') + '</div>'); out.scrollTop = 1e9;
      if (ip) Snd.ok(); else Snd.bad();
      if (ip && want.includes(q) && !got[q]) { got[q] = 1; const p = $('#dw-' + q.replace(/\W/g, ''), el); if (p) p.className = 'pill ok'; if (Object.keys(got).length === want.length) { api.done(w.yes || 'وجدت كل العناوين! هذا ما يفعله DNS ملايين المرات كل ثانية.'); if (w.medal) api.medal(w.medal); } }
      $('#dq', el).value = '';
    };
  },

  /* ---- HTTP request builder ---- */
  http(w, el, api) {
    const routes = w.routes; const missions = w.missions || []; const doneM = {};
    el.innerHTML = '<div class="wbox"><div class="row ltr" style="direction:ltr"><select class="inp mono" id="hm" style="width:auto"><option>GET</option><option>POST</option></select><select class="inp mono" id="hp" style="flex:1;width:auto">' + Object.keys(routes).map(p => '<option>' + esc(p) + '</option>').join('') + '<option>/secret-room</option></select><button class="btn" id="hs">أرسل ➤</button></div>' +
      (missions.length ? '<ul class="goals">' + missions.map((m, i) => '<li id="hg' + i + '"><i></i>' + md(m.d) + '</li>').join('') + '</ul>' : '') + '<div id="hr"></div></div>';
    $('#hs', el).onclick = () => {
      const m = $('#hm', el).value, p = $('#hp', el).value; const r = routes[p] && (routes[p][m] || routes[p]['*']);
      const code = r ? r.code : 404; const body = r ? r.body : 'الصفحة غير موجودة 🤷';
      const names = { 200: 'OK (تمام)', 201: 'Created (تم الإنشاء)', 301: 'Moved (انتقلت)', 401: 'Unauthorized (يجب تسجيل الدخول)', 403: 'Forbidden (ممنوع)', 404: 'Not Found (غير موجود)', 405: 'Method Not Allowed (طريقة غير مسموحة)', 500: 'Server Error (خطأ في الخادم)' };
      $('#hr', el).innerHTML = '<div class="terminal" style="min-height:0"><div class="ln"><span class="pr">طلبك ➤</span> ' + m + ' ' + esc(p) + ' HTTP/1.1</div><div class="ln dim">Host: game.oqab</div><div class="ln" style="margin-top:6px"><span class="' + (code < 300 ? 'pr' : code < 400 ? 'hl' : 'er') + '">◀ الرد: ' + code + ' ' + (names[code] || '') + '</span></div><div class="ln">' + esc(body) + '</div></div>';
      code < 400 ? Snd.ok() : Snd.bad();
      missions.forEach((ms, i) => { if (!doneM[i] && ms.m === m && ms.p === p) { doneM[i] = 1; $('#hg' + i, el).classList.add('done'); $('#hg' + i + ' i', el).textContent = '✓'; } });
      if (missions.length && Object.keys(doneM).length === missions.length) api.done(w.yes || 'أنهيت كل المهام! صرت تتكلم لغة الخوادم.');
    };
  },

  /* ---- live HTML playground ---- */
  html(w, el, api) {
    el.innerHTML = '<div class="pybox"><textarea id="hx" spellcheck="false">' + esc(w.code || '') + '</textarea><div class="bar2"><button class="btn sm" id="hrun">' + ic('play', 18) + 'اعرض الصفحة</button><small class="muted">' + md(w.tip || '') + '</small></div></div><div class="browser" style="margin-top:8px"><div class="addr"><span>🔒</span><input value="my-first-page.oqab" readonly></div><iframe id="hf" sandbox="" title="صفحتي"></iframe></div>';
    const run = () => { const c = $('#hx', el).value; $('#hf', el).srcdoc = '<meta charset="utf-8"><style>body{font-family:Tajawal,system-ui,sans-serif;padding:10px}</style>' + c; if (w.check && new RegExp(w.check, 'i').test(c)) { api.done(w.yes || 'صفحتك تعمل!'); } else if (w.check) api.fb(false, w.hint || 'جرّب التغيير المطلوب ثم اضغط «اعرض الصفحة».'); else api.done(); };
    $('#hrun', el).onclick = run; setTimeout(() => { $('#hf', el).srcdoc = '<meta charset="utf-8"><style>body{font-family:Tajawal,system-ui,sans-serif;padding:10px}</style>' + (w.code || ''); }, 30);
    Py.tabKeys($('#hx', el));
  },

  /* ---- fake browser (pages, source view, cookies, url params) ---- */
  browser(w, el, api) {
    const S = { url: w.start || '/', cookies: Object.assign({}, w.cookies || {}), showSrc: false };
    const resolve = () => {
      const u = S.url; const [path, qs] = u.split('?'); const params = {}; (qs || '').split('&').filter(Boolean).forEach(x => { const i = x.indexOf('='); const a = i < 0 ? x : x.slice(0, i), b = i < 0 ? '' : x.slice(i + 1); let v = b; try { v = decodeURIComponent(b.replace(/\+/g, ' ')); } catch (e) { } params[a] = v; });
      const pg = w.pages[path] || w.pages['404'] || { html: '<h1>404</h1><p>الصفحة غير موجودة</p>' };
      return typeof pg === 'function' ? pg(params, S.cookies) : pg;
    };
    const draw = () => {
      const pg = resolve();
      el.innerHTML = '<div class="browser"><div class="addr"><span>🌐</span><span class="mono" style="font-size:13px">' + esc(w.host || 'site.oqab') + '</span><input id="bu" value="' + esc(S.url) + '" spellcheck="false" autocapitalize="off"><button class="btn sm" id="bgo">اذهب</button></div>' +
        '<div class="row" style="padding:6px 8px;background:var(--bg);gap:6px">' + (w.src !== false ? '<button class="btn sm sec" id="bsrc">' + (S.showSrc ? '👁️ الصفحة' : '&lt;/&gt; عرض الكود') + '</button>' : '') + (w.cookieEdit ? '<button class="btn sm sec" id="bck">🍪 الكوكيز</button>' : '') + '</div>' +
        (S.showSrc ? '<div class="src">' + esc(pg.html).replace(/&lt;!--([\s\S]*?)--&gt;/g, '<span class="cm">&lt;!--$1--&gt;</span>') + '</div>' : '<iframe sandbox="" title="الموقع"></iframe>') + '<div id="bck2"></div></div>';
      if (!S.showSrc) $('iframe', el).srcdoc = '<meta charset="utf-8"><style>body{font-family:Tajawal,system-ui,sans-serif;padding:12px;direction:rtl}input,button{font:inherit}</style>' + pg.html;
      $('#bgo', el).onclick = () => { S.url = $('#bu', el).value.trim() || '/'; if (!S.url.startsWith('/')) S.url = '/' + S.url.replace(/^https?:\/\/[^/]+/, ''); Snd.click(); draw(); w.onNav && w.onNav(S, api); };
      $('#bu', el).onkeydown = e => { if (e.key === 'Enter') $('#bgo', el).click(); };
      const bs = $('#bsrc', el); if (bs) bs.onclick = () => { S.showSrc = !S.showSrc; draw(); if (S.showSrc) w.onSrc && w.onSrc(api); };
      const bc = $('#bck', el); if (bc) bc.onclick = () => {
        const box = $('#bck2', el); box.innerHTML = '<div style="padding:8px;background:var(--bg2)"><b>🍪 الكوكيز المحفوظة لهذا الموقع:</b>' + Object.keys(S.cookies).map(k => '<div class="row ltr" style="direction:ltr;margin:4px 0"><span class="mono">' + esc(k) + ' =</span><input class="inp mono" style="flex:1;padding:4px 8px" data-ck="' + esc(k) + '" value="' + esc(S.cookies[k]) + '"></div>').join('') + '<button class="btn sm" id="bcs">حفظ وإعادة تحميل</button></div>';
        $('#bcs', el).onclick = () => { $$('[data-ck]', el).forEach(i => S.cookies[i.dataset.ck] = i.value.trim()); Snd.click(); draw(); };
      };
    };
    draw();
  },

  /* ---- Caesar wheel ---- */
  caesar(w, el, api) {
    const AR = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي', EN = 'abcdefghijklmnopqrstuvwxyz';
    const A = w.lang === 'en' ? EN : AR; let sh = w.shift0 || 0;
    const shift = (t, k) => Array.from(t).map(ch => { const l = ch.toLowerCase(); const i = A.indexOf(l); if (i < 0) return ch; return A[(i + k % A.length + A.length) % A.length]; }).join('');
    const draw = () => {
      el.innerHTML = '<div class="wbox wheel-wrap"><div class="alpha">' + Array.from(A).map(c => '<span>' + c + '</span>').join('') + '</div><div style="font-size:1.4em">⬇️ إزاحة <b class="big-num" style="font-size:1.2em">' + sh + '</b></div><div class="alpha sh">' + Array.from(A).map((c, i) => '<span>' + A[(i + sh) % A.length] + '</span>').join('') + '</div>' +
        '<div class="row"><button class="btn sm sec" data-s="-1">−</button><input type="range" min="0" max="' + (A.length - 1) + '" value="' + sh + '" id="csr" style="width:180px"><button class="btn sm sec" data-s="1">+</button></div>' +
        (w.secret ? '<div class="card" style="width:100%;margin:6px 0"><small class="muted">الرسالة السرية:</small><div style="font-size:1.3em;font-weight:800' + (w.lang === 'en' ? ';direction:ltr;font-family:var(--f-mono)' : '') + '">' + esc(w.secret) + '</div><small class="muted">بعد فكّها بالإزاحة ' + sh + ' (للخلف):</small><div style="font-size:1.3em;font-weight:800;color:var(--ok)' + (w.lang === 'en' ? ';direction:ltr;font-family:var(--f-mono)' : '') + '">' + esc(shift(w.secret, -sh)) + '</div></div>' : '<div style="width:100%"><input class="inp" id="cin" placeholder="اكتب رسالة لتشفيرها" value="' + esc(w.text || '') + '"><p>المشفّرة: <b id="cout" style="font-size:1.2em"></b></p></div>') + '</div>';
      const cin = $('#cin', el); if (cin) { const up = () => { $('#cout', el).textContent = shift(cin.value, sh); }; cin.oninput = up; up(); }
      $('#csr', el).oninput = e => { sh = +e.target.value; draw(); check(); };
    };
    const check = () => { if (w.goalShift != null && sh === w.goalShift) { api.done(w.yes || 'فككت الشيفرة!'); if (w.medal) api.medal(w.medal); } else if (w.goal === 'any' && sh > 0) api.done(); };
    draw();
    el.onclick = e => { const b = e.target.closest('[data-s]'); if (b) { sh = (sh + +b.dataset.s + A.length) % A.length; Snd.click(); draw(); check(); } };
  },

  /* ---- Base64 ---- */
  b64(w, el, api) {
    const enc = s => { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return '(خطأ)'; } };
    const dec = s => { try { return decodeURIComponent(escape(atob(s.trim()))); } catch (e) { return null; } };
    el.innerHTML = '<div class="wbox"><div class="row"><button class="btn sm" data-m="e">نص ← Base64</button><button class="btn sm sec" data-m="d">Base64 ← نص</button></div><textarea class="inp mono" id="bi" dir="ltr" rows="2" style="margin-top:8px" placeholder="اكتب هنا">' + esc(w.text || '') + '</textarea><div class="hexv" id="bo" style="margin-top:8px;white-space:pre-wrap;min-height:44px"></div></div>';
    let mode = w.mode || 'e';
    const up = () => { const v = $('#bi', el).value; const r = mode === 'e' ? enc(v) : dec(v); $('#bo', el).textContent = r == null ? '⚠️ هذا ليس Base64 صحيحاً' : r; $$('[data-m]', el).forEach(b => b.className = 'btn sm' + (b.dataset.m === mode ? '' : ' sec')); if (w.want && r != null && r.trim() === w.want) api.done(w.yes || 'فككتها! لاحظ: لم تحتج أي مفتاح.'); };
    el.onclick = e => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; up(); } };
    $('#bi', el).oninput = up; up(); if (!w.want) api.done();
  },

  /* ---- Hash machine ---- */
  hash(w, el, api) {
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">🧬 آلة البصمة (SHA-256): اكتب أي شيء.</p><input class="inp" id="ha" value="' + esc(w.a || 'عُقاب') + '"><div class="hexv" id="hah" style="margin:6px 0;white-space:pre-wrap;word-break:break-all"></div><input class="inp" id="hb" value="' + esc(w.b || 'عقاب') + '"><div class="hexv" id="hbh" style="margin:6px 0;white-space:pre-wrap;word-break:break-all"></div><p id="hcmp" style="font-weight:800"></p></div>';
    let changes = 0;
    const up = async () => {
      const a = $('#ha', el).value, b = $('#hb', el).value; const [x, y] = await Promise.all([sha(a), sha(b)]);
      $('#hah', el).textContent = x; $('#hbh', el).textContent = y;
      let same = 0; for (let i = 0; i < x.length; i++) if (x[i] === y[i]) same++;
      $('#hcmp', el).innerHTML = a === b ? '✅ نفس النص ← نفس البصمة تماماً' : '❗ النصان مختلفان قليلاً، لكن البصمتين مختلفتان تماماً (تشابه ' + Math.round(same / 64 * 100) + '% فقط، بالصدفة)';
      if (++changes > 2) { api.done(w.yes || 'لاحظت؟ تغيير حرف واحد يغيّر البصمة كلها!'); if (w.medal) api.medal(w.medal); }
    };
    $('#ha', el).oninput = up; $('#hb', el).oninput = up; up();
  },

  /* ---- public key mailbox ---- */
  pubkey(w, el, api) {
    let st = 0;
    const steps = ['سارة تعطي الجميع <b>قفلاً مفتوحاً</b> 🔓 (المفتاح العام)، وتحتفظ بمفتاحه 🗝️ (المفتاح الخاص) عندها فقط.', 'ضع رسالتك في الصندوق 📦', 'أغلق الصندوق بقفل سارة 🔒', 'أرسله! المتطفّل يمسكه في الطريق...', 'وصل الصندوق إلى سارة، فتفتحه بمفتاحها الخاص 🗝️'];
    const draw = () => {
      el.innerHTML = '<div class="wbox"><div class="row" style="justify-content:space-around;font-size:40px;text-align:center"><div>🧒<br><small style="font-size:14px">أنت</small></div><div>' + (st >= 3 && st < 5 ? '🦹<br><small style="font-size:14px">المتطفّل</small>' : '<span style="opacity:.2">🦹</span>') + '</div><div>👧<br><small style="font-size:14px">سارة</small></div></div>' +
        '<div style="text-align:center;font-size:44px;margin:6px 0">' + ['🔓', '📦✉️', '📦🔒', '📦🔒', '✉️😊'][st] + '</div><p style="text-align:center">' + steps[st] + '</p>' +
        (st === 3 ? '<p class="feedback bad" style="text-align:center">🦹 المتطفّل يحاول فتحه... لكن ليس معه المفتاح الخاص! الصندوق لا يُفتح.</p>' : '') +
        (st < 4 ? '<button class="btn wide" id="pk">' + ['خذ قفل سارة', 'ضع الرسالة', 'أغلق بالقفل', 'أكمل الرحلة'][st] + '</button>' : '') + '</div>';
      const b = $('#pk', el); if (b) b.onclick = () => { st++; st === 3 ? Snd.bad() : Snd.ok(); draw(); if (st === 4) { api.done(w.yes || 'هذه فكرة المفتاح العام: أي أحد يستطيع أن يقفل، وصاحب المفتاح الخاص وحده يفتح.'); if (w.medal) api.medal(w.medal); } };
    };
    draw();
  },

  /* ---- house weak points ---- */
  house(w, el, api) {
    const spots = w.spots; const found = {};
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">🦅 بعين العُقاب: اضغط على كل نقطة ضعف في هذا البيت. وجدت <b id="hsc">0</b> من ' + spots.length + '.</p><svg viewBox="0 0 400 260" style="width:100%;max-height:330px;background:linear-gradient(#BFE3FF,#E9F6FF);border-radius:14px" id="hsvg">' +
      '<rect x="0" y="220" width="400" height="40" fill="#8BCB7A"/><path d="M60 110 L200 30 L340 110 Z" fill="#C0504D" stroke="#7A2B29" stroke-width="3"/><rect x="80" y="110" width="240" height="115" fill="#FFF3D6" stroke="#B88A4E" stroke-width="3"/>' +
      '<rect x="180" y="150" width="44" height="75" fill="#9B6B3D" stroke="#5E3E1F" stroke-width="3"/><circle cx="215" cy="190" r="3" fill="#FFD36B"/>' +
      '<rect x="100" y="130" width="54" height="44" fill="#9FD8FF" stroke="#5E3E1F" stroke-width="3"/><path d="M100 130 l-20 -14 v44 l20 14z" fill="#9FD8FF" stroke="#5E3E1F" stroke-width="2"/>' +
      '<rect x="250" y="130" width="54" height="44" fill="#9FD8FF" stroke="#5E3E1F" stroke-width="3"/><line x1="277" y1="130" x2="277" y2="174" stroke="#5E3E1F" stroke-width="3"/>' +
      '<rect x="170" y="225" width="64" height="8" fill="#7A4A2A"/><text x="200" y="232" font-size="9" text-anchor="middle" fill="#FFD36B">🔑</text>' +
      '<rect x="232" y="160" width="14" height="14" fill="#FFF59D" stroke="#C9B400"/><text x="239" y="170" font-size="5" text-anchor="middle">1234</text>' +
      '<rect x="345" y="170" width="45" height="55" fill="#D7D7D7" stroke="#777" stroke-width="2"/><rect x="345" y="170" width="45" height="18" fill="#BBB"/><text x="367" y="205" font-size="9" text-anchor="middle">🚲</text>' +
      '<rect x="20" y="150" width="34" height="70" fill="#4A4A4A"/><text x="37" y="190" font-size="8" fill="#fff" text-anchor="middle">📶</text><text x="37" y="205" font-size="5" fill="#FFD36B" text-anchor="middle">wifi:12345</text>' +
      spots.map((s, i) => '<circle class="hs" data-i="' + i + '" cx="' + s.x + '" cy="' + s.y + '" r="' + (s.r || 22) + '" fill="transparent" style="cursor:pointer"/>').join('') + '</svg><div id="hlist"></div></div>';
    el.onclick = e => {
      const c = e.target.closest('.hs'); if (!c) { if (e.target.closest('#hsvg')) { Snd.click(); } return; }
      const i = +c.dataset.i; if (found[i]) return; found[i] = 1; Snd.ok();
      c.setAttribute('stroke', '#E04B4B'); c.setAttribute('stroke-width', '4');
      $('#hsc', el).textContent = Object.keys(found).length;
      $('#hlist', el).insertAdjacentHTML('beforeend', '<div class="feedback ok" style="margin:6px 0">🚩 ' + md(spots[i].t) + '<div class="why">🛡️ ' + md(spots[i].fix) + '</div></div>');
      if (Object.keys(found).length === spots.length) { api.done(w.yes || 'رأيت كل شيء بعين العُقاب!'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- log viewer with filter ---- */
  logs(w, el, api) {
    const lines = w.lines;
    el.innerHTML = '<div class="wbox"><div class="row flagin"><input class="inp mono" id="lq" placeholder="فلتر: اكتب كلمة مثل FAIL" autocomplete="off" autocapitalize="off" spellcheck="false"></div><div class="terminal" id="lo" style="margin-top:8px;font-size:13px"></div><p class="muted" id="lc" style="margin:4px 0"></p>' + (w.ask ? '<form class="row flagin" id="lf"><input class="inp mono" placeholder="' + esc(w.askPh || 'إجابتك') + '" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn">تحقّق</button></form><p style="margin:4px 0"><b>' + md(w.ask) + '</b></p>' : '') + '</div>';
    const draw = () => { const q = $('#lq', el).value.trim().toLowerCase(); const sh = lines.filter(l => !q || l.toLowerCase().includes(q)); $('#lo', el).innerHTML = sh.map(l => '<div class="ln">' + esc(l).replace(/(FAIL\w*|DENIED|ERROR)/g, '<span class="er">$1</span>').replace(/(OK|SUCCESS)/g, '<span class="pr">$1</span>') + '</div>').join('') || '<div class="ln dim">(لا شيء)</div>'; $('#lc', el).textContent = 'يظهر ' + sh.length + ' من ' + lines.length + ' سطراً'; };
    $('#lq', el).oninput = draw; draw();
    const f = $('#lf', el); if (f) f.onsubmit = e => { e.preventDefault(); const v = norm($('input', f).value); if ([].concat(w.ans).some(a => norm(a) === v)) { api.done(w.yes || 'أحسنت أيها المحقّق!'); if (w.medal) api.medal(w.medal); } else { api.wrong(); api.fb(false, 'ليس بعد. استخدم الفلتر لتبحث.', w.hint); } };
    if (!w.ask) api.done();
  },

  /* ---- hex / file viewer ---- */
  hexview(w, el, api) {
    const bytes = w.bytes; let h = '';
    for (let i = 0; i < bytes.length; i += 8) { const row = bytes.slice(i, i + 8); h += i.toString(16).padStart(4, '0') + '  ' + row.map(b => b.toString(16).padStart(2, '0')).join(' ').padEnd(24) + '  ' + row.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : '.').join('') + '\n'; }
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">📄 <span class="mono">' + esc(w.name) + '</span> بعين المحقّق (أرقام سداسية عشرية):</p><div class="hexv">' + esc(h) + '</div>' + (w.meta ? '<p style="margin:8px 0 4px"><b>معلومات الملف (Metadata):</b></p><div class="kv">' + Object.entries(w.meta).map(([k, v]) => '<span class="muted">' + esc(k) + '</span><span>' + esc(v) + '</span>').join('') + '</div>' : '') + '</div>';
    api.done && api.done();
  },

  /* ---- generic image/emoji card ---- */
  card(w, el, api) { el.innerHTML = '<div class="wbox" style="text-align:center">' + (w.big ? '<div dir="ltr" style="font-size:44px;line-height:1.4;white-space:nowrap;overflow-x:auto">' + w.big + '</div>' : '') + (w.html || '') + '</div>'; api.done && api.done(); }
};
