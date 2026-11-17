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
      if (!S.showSrc) $('iframe', el).srcdoc = '<meta charset="utf-8"><style>body{font-family:Tajawal,system-ui,sans-serif;padding:12px;direction:rtl}input,button{font:inherit}</style>' + pg.html.replace(/<script[\s\S]*?<\/script>/gi, '');
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
    const A = w.lang === 'en' ? EN : AR; let sh = w.shift0 || 0, txt = w.text || '';
    const shift = (t, k) => Array.from(t).map(ch => { const l = ch.toLowerCase(); const i = A.indexOf(l); if (i < 0) return ch; const r = A[(i + k % A.length + A.length) % A.length]; return ch !== l ? r.toUpperCase() : r; }).join('');
    const draw = () => {
      el.innerHTML = '<div class="wbox wheel-wrap"><div class="alpha">' + Array.from(A).map(c => '<span>' + c + '</span>').join('') + '</div><div style="font-size:1.4em">⬇️ إزاحة <b class="big-num" style="font-size:1.2em">' + sh + '</b></div><div class="alpha sh">' + Array.from(A).map((c, i) => '<span>' + A[(i + sh) % A.length] + '</span>').join('') + '</div>' +
        '<div class="row"><button class="btn sm sec" data-s="-1">−</button><input type="range" min="0" max="' + (A.length - 1) + '" value="' + sh + '" id="csr" style="width:180px"><button class="btn sm sec" data-s="1">+</button></div>' +
        (w.secret ? '<div class="card" style="width:100%;margin:6px 0"><small class="muted">الرسالة السرية:</small><div style="font-size:1.3em;font-weight:800' + (w.lang === 'en' ? ';direction:ltr;font-family:var(--f-mono)' : '') + '">' + esc(w.secret) + '</div><small class="muted">بعد فكّها بالإزاحة ' + sh + ' (للخلف):</small><div style="font-size:1.3em;font-weight:800;color:var(--ok)' + (w.lang === 'en' ? ';direction:ltr;font-family:var(--f-mono)' : '') + '">' + esc(shift(w.secret, -sh)) + '</div></div>' : '<div style="width:100%"><input class="inp' + (w.lang === 'en' ? ' mono" dir="ltr' : '') + '" id="cin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + (w.paste ? 'الصق الرسالة المشفّرة هنا' : 'اكتب رسالة لتشفيرها') + '" value="' + esc(txt) + '"><p>' + (w.paste ? 'بعد الإزاحة: ' : 'المشفّرة: ') + '<b id="cout" class="' + (w.lang === 'en' ? 'mono' : '') + '" style="font-size:1.2em;direction:ltr;unicode-bidi:isolate"></b></p></div>') + '</div>';
      const cin = $('#cin', el); if (cin) { const up = () => { txt = cin.value; $('#cout', el).textContent = shift(cin.value, sh); }; cin.oninput = up; up(); }
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
  card(w, el, api) { el.innerHTML = '<div class="wbox" style="text-align:center">' + (w.big ? '<div dir="ltr" style="font-size:44px;line-height:1.4;white-space:nowrap;overflow-x:auto">' + w.big + '</div>' : '') + (w.html || '') + '</div>'; api.done && api.done(); },

  /* ---- sorting game: swap neighbours until sorted ---- */
  sortgame(w, el, api) {
    let a = (w.nums || shuffle([3, 9, 1, 7, 4, 6])).slice(); while (a.every((x, i) => i === 0 || a[i - 1] <= x)) a = shuffle(a);
    let swaps = 0, cmp = 0; let sel = null;
    const draw = () => {
      el.innerHTML = '<div class="wbox"><p style="margin-top:0">' + md(w.goalText || 'رتّب البطاقات من الأصغر إلى الأكبر. اضغط على بطاقتين **متجاورتين** لتبدّلهما.') + '</p><div class="row" style="justify-content:center;direction:ltr;gap:8px">' + a.map((x, i) => '<button class="tag' + (sel === i ? ' sel' : '') + '" data-i="' + i + '" style="font-size:1.6em;min-width:54px;min-height:70px">' + (w.labels ? w.labels[x] : x) + '</button>').join('') + '</div><p class="muted" style="text-align:center;margin:8px 0 0">التبديلات: <b>' + swaps + '</b></p></div>';
    };
    draw();
    el.onclick = e => {
      const b = e.target.closest('[data-i]'); if (!b) return; const i = +b.dataset.i;
      if (sel === null) { sel = i; Snd.click(); draw(); return; }
      if (Math.abs(sel - i) !== 1) { sel = i; Snd.click(); draw(); return; }
      const [p, q] = [Math.min(sel, i), Math.max(sel, i)]; cmp++;
      if (a[p] > a[q]) { [a[p], a[q]] = [a[q], a[p]]; swaps++; Snd.ok(); } else { Snd.bad(); api.fb(false, 'هاتان مرتّبتان أصلاً! بدّل فقط الجارتين اللتين الكبيرة فيهما على اليسار.'); }
      sel = null; draw();
      if (a.every((x, k) => k === 0 || a[k - 1] <= x)) { api.done(w.yes || 'رتّبتها بـ ' + swaps + ' تبديلات! هذه خوارزمية «الفقاعة»: كل مرة نبدّل جارتين حتى يكتمل الترتيب.'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- binary search guessing game ---- */
  guess(w, el, api) {
    const max = w.max || 100; let secret = 1 + Math.floor(Math.random() * max), tries = 0, lo = 1, hi = max, log = [];
    const draw = () => {
      el.innerHTML = '<div class="wbox"><p style="margin-top:0">🤖 اخترت رقماً سرياً بين <b>1</b> و <b>' + max + '</b>. خمّنه! سأقول لك: أكبر أم أصغر.' + (w.limit ? ' الهدف: ' + w.limit + ' محاولات أو أقل.' : '') + '</p>' +
        '<div class="meter" style="height:22px;position:relative;direction:ltr"><i style="position:absolute;left:' + ((lo - 1) / max * 100) + '%;width:' + ((hi - lo + 1) / max * 100) + '%;background:var(--ok)"></i></div><p class="muted" style="text-align:center;margin:4px 0">الرقم بين <b>' + lo + '</b> و <b>' + hi + '</b></p>' +
        '<form class="row flagin"><input class="inp mono" type="number" min="1" max="' + max + '" id="gq" placeholder="?"><button class="btn">خمّن</button></form><div class="hexv" style="margin-top:8px;white-space:pre-wrap;min-height:30px">' + esc(log.join('\n')) + '</div></div>';
      const f = $('form', el); const q = $('#gq', el); setTimeout(() => q.focus({ preventScroll: true }), 30);
      f.onsubmit = e => { e.preventDefault(); const v = +q.value; if (!v) return; tries++;
        if (v === secret) { log.push('🎯 ' + v + ' صحيح! بـ ' + tries + ' محاولات'); draw(); Snd.win(); if (!w.limit || tries <= w.limit) { api.done(w.yes || 'وجدته بـ ' + tries + ' محاولات! السر: كل مرة خمّن **المنتصف**، فيختفي نصف الأرقام دفعة واحدة. هذا «البحث الثنائي».'); if (w.medal) api.medal(w.medal); } else { api.fb(false, 'وجدته، لكن بأكثر من ' + w.limit + ' محاولات. السر: خمّن دائماً منتصف المجال الأخضر! جرّب مرة أخرى.'); setTimeout(() => { secret = 1 + Math.floor(Math.random() * max); tries = 0; lo = 1; hi = max; log = []; draw(); }, 1800); } return; }
        if (v < secret) { lo = Math.max(lo, v + 1); log.push(v + ' ← أكبر ⬆️'); } else { hi = Math.min(hi, v - 1); log.push(v + ' ← أصغر ⬇️'); } Snd.click(); draw(); };
    };
    draw();
  },

  sqlRun(T, q) {
      q = q.replace(/--[\s\S]*$/, '').replace(/\s+/g, ' ').trim().replace(/;$/, '').trim();
      const m = q.match(/^select\s+(.+?)\s+from\s+(\w+)(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+(\w+)(\s+desc|\s+asc)?)?(?:\s+limit\s+(\d+))?$/i);
      if (!m) throw new Error('لم أفهم السؤال. الشكل: SELECT أعمدة FROM جدول WHERE شرط');
      const tbl = T[m[2].toLowerCase()]; if (!tbl) throw new Error('لا يوجد جدول اسمه ' + m[2] + '. الجداول: ' + Object.keys(T).join('، '));
      let rows = tbl.rows.map(r => Object.fromEntries(tbl.cols.map((c, i) => [c, r[i]])));
      if (m[3]) {
        const cond = m[3];
        const one = (c) => { const x = c.trim().match(/^(\w+)\s*(=|!=|<>|>=|<=|>|<|like)\s*(.+)$/i); if (!x) { if (/^'?1'?\s*=\s*'?1'?$/.test(c.trim())) return () => true; throw new Error('شرط غير مفهوم: ' + c); } const col = x[1].toLowerCase(); if (!tbl.cols.includes(col)) throw new Error('لا يوجد عمود اسمه ' + x[1]); let v = x[3].trim(); const str = /^'.*'$/.test(v); v = str ? v.slice(1, -1) : +v; const op = x[2].toLowerCase(); return r => { const a = r[col]; if (op === '=') return a == v; if (op === '!=' || op === '<>') return a != v; if (op === '>') return a > v; if (op === '<') return a < v; if (op === '>=') return a >= v; if (op === '<=') return a <= v; if (op === 'like') return new RegExp('^' + String(v).replace(/%/g, '.*') + '$', 'i').test(a); }; };
        const ors = cond.split(/\s+or\s+/i).map(o => o.split(/\s+and\s+/i).map(one));
        rows = rows.filter(r => ors.some(ands => ands.every(f => f(r))));
      }
      if (m[4]) { const c = m[4].toLowerCase(); rows.sort((a, b) => a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0); if (/desc/i.test(m[5] || '')) rows.reverse(); }
      if (m[6]) rows = rows.slice(0, +m[6]);
      const sel = m[1].trim();
      if (/^count\(\*\)$/i.test(sel)) return { cols: ['count'], rows: [[rows.length]] };
      const cols = sel === '*' ? tbl.cols : sel.split(',').map(x => x.trim().toLowerCase());
      cols.forEach(c => { if (!tbl.cols.includes(c)) throw new Error('لا يوجد عمود اسمه ' + c + '. الأعمدة: ' + tbl.cols.join('، ')); });
      return { cols, rows: rows.map(r => cols.map(c => r[c])) };
  },
  sqlTable(cols, rows) { return '<div style="overflow:auto"><table class="t ltr" style="direction:ltr"><thead><tr>' + cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(v => '<td class="mono">' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'; },

  /* ---- tiny SQL playground (fake in-memory tables) ---- */
  sql(w, el, api) {
    const T = w.tables; const done = {};
    const run = q => Widgets.sqlRun(T, q);
    const tblHtml = (cols, rows) => '<div style="overflow:auto"><table class="t ltr" style="direction:ltr"><thead><tr>' + cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(v => '<td class="mono">' + esc(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    el.innerHTML = '<div class="wbox">' + (w.show !== false ? Object.keys(T).map(n => '<p style="margin:0"><b>📋 جدول ' + esc(n) + '</b> <small class="muted">(' + T[n].rows.length + ' صفوف)</small></p>' + (w.preview ? tblHtml(T[n].cols, T[n].rows.slice(0, 4)) : '<p class="mono muted" style="margin:0 0 6px;direction:ltr;text-align:left">' + esc(T[n].cols.join(', ')) + '</p>')).join('') : '') +
      (w.missions ? '<ul class="goals">' + w.missions.map((m, i) => '<li id="sq' + i + '"><i></i>' + md(m.d) + '</li>').join('') + '</ul>' : '') +
      '<textarea class="inp mono" id="sqi" dir="ltr" rows="3" spellcheck="false" placeholder="SELECT * FROM ...">' + esc(w.start || '') + '</textarea><button class="btn sm" id="sqr" style="margin-top:6px">' + ic('play', 18) + 'نفّذ</button><div id="sqo" style="margin-top:8px"></div></div>';
    $('#sqr', el).onclick = () => {
      const q = $('#sqi', el).value; let r;
      try { r = run(q); } catch (e) { $('#sqo', el).innerHTML = '<div class="feedback bad">⚠️ ' + esc(e.message) + '</div>'; Snd.bad(); return; }
      $('#sqo', el).innerHTML = tblHtml(r.cols, r.rows) + '<p class="muted" style="margin:4px 0">' + r.rows.length + ' نتيجة</p>'; Snd.ok();
      (w.missions || []).forEach((m, i) => { if (!done[i] && m.ok(r, q)) { done[i] = 1; const li = $('#sq' + i, el); li.classList.add('done'); $('i', li).textContent = '✓'; } });
      if (w.missions && Object.keys(done).length === w.missions.length) { api.done(w.yes || 'أنجزت كل الأسئلة!'); if (w.medal) api.medal(w.medal); }
    };
    if (!w.missions) api.done();
  },

  /* ---- login form that builds SQL by gluing text (to show SQL injection) ---- */
  sqli(w, el, api) {
    const T = w.tables; let safe = false;
    el.innerHTML = '<div class="wbox"><div class="browser"><div class="addr"><span>🔒</span><input value="https://game.oqab/login" readonly></div><div style="padding:12px;direction:rtl"><b>🎮 تسجيل الدخول</b><label style="display:block;margin-top:8px">اسم المستخدم<input class="inp mono" id="su" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(w.user || '') + '"></label><label style="display:block;margin-top:6px">كلمة المرور<input class="inp mono" id="sp" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false"></label><button class="btn sm" id="sgo" style="margin-top:8px">دخول</button></div></div>' +
      '<p style="margin:10px 0 4px"><b>🔬 ما يرسله الخادم لقاعدة البيانات:</b></p><div class="hexv" id="sq" style="white-space:pre-wrap"></div>' + (w.fix ? '<label class="row" style="margin-top:8px;gap:6px"><input type="checkbox" id="sfx"> 🛡️ شغّل الحماية (الاستعلام المُعَدّ مسبقاً)</label>' : '') + '<div id="sres" style="margin-top:8px"></div></div>';
    const build = () => { const u = $('#su', el).value, p = $('#sp', el).value; return safe ? "SELECT * FROM users WHERE username = ? AND password = ?\n   ← ? = " + JSON.stringify(u) + " , " + JSON.stringify(p) + '   (كنص فقط، لا يصبح أمراً أبداً)' : "SELECT * FROM users WHERE username = '" + u + "' AND password = '" + p + "'"; };
    const up = () => { $('#sq', el).textContent = build(); }; up();
    $('#su', el).oninput = up; $('#sp', el).oninput = up;
    const fx = $('#sfx', el); if (fx) fx.onchange = () => { safe = fx.checked; up(); };
    $('#sgo', el).onclick = () => {
      const u = $('#su', el).value, p = $('#sp', el).value; let rows;
      if (safe) { const t = T.users; rows = t.rows.filter(r => r[t.cols.indexOf('username')] === u && r[t.cols.indexOf('password')] === p).map(r => r); }
      else { try { rows = Widgets.sqlRun(T, build()).rows; } catch (e) { $('#sres', el).innerHTML = '<div class="feedback bad">💥 خطأ في قاعدة البيانات: ' + esc(e.message) + '<div class="why">علامة التنصيص التي كتبتها كسرت الأمر! هذه أول علامة على وجود ثغرة حقن.</div></div>'; Snd.bad(); return; } }
      if (!rows.length) { $('#sres', el).innerHTML = '<div class="feedback bad">❌ اسم المستخدم أو كلمة المرور خطأ</div>'; Snd.bad(); if (safe && /'/.test(p)) { api.done(w.yesFix || 'مع الحماية، كلامك بقي نصاً عادياً ولم يخدع قاعدة البيانات! 🛡️'); if (w.medalFix) api.medal(w.medalFix); } return; }
      const name = rows[0][0 + T.users.cols.indexOf('username')];
      $('#sres', el).innerHTML = '<div class="feedback ok">✅ أهلاً يا <b>' + esc(name) + '</b>' + (name === 'admin' ? ' 👑 (لوحة المدير مفتوحة!)' : '') + '</div>'; Snd.win();
      if (name === 'admin' && !safe && /'/.test(p) && w.fix) api.fb(false, 'الحيلة ما زالت تعمل لأن الحماية مطفأة. شغّل الحماية ✅ ثم جرّب مرة أخرى.');
      if (name === 'admin' && !safe && /'/.test(p) && !w.fix) { api.done(w.yes || 'دخلت كمدير دون أن تعرف كلمة المرور! هذا هو حقن SQL.'); if (w.medal) api.medal(w.medal); }
    };
  },

  /* ---- comment box that shows script injection (XSS) inside a sealed frame ---- */
  xss(w, el, api) {
    let safe = false, hits = 0, safeTried = false;
    el.innerHTML = '<div class="wbox"><div class="browser"><div class="addr"><span>🌐</span><input value="game.oqab/comments" readonly></div><iframe sandbox="allow-scripts" title="صفحة التعليقات" style="height:190px"></iframe></div>' +
      '<div class="row" style="margin-top:8px"><input class="inp" id="xc" style="flex:1" dir="auto" autocomplete="off" spellcheck="false" placeholder="اكتب تعليقاً..."><button class="btn sm" id="xs">انشر</button></div>' + (w.fix ? '<label class="row" style="margin-top:8px;gap:6px"><input type="checkbox" id="xf"> 🛡️ شغّل الحماية (اعرض التعليق كنص فقط)</label>' : '') + '<div id="xr" style="margin-top:6px"></div></div>';
    const fr = $('iframe', el); const list = (w.seed || ['لعبة رائعة! 👍', 'متى التحديث القادم؟']).map(x => esc(x));
    const paint = () => { fr.srcdoc = '<meta charset="utf-8"><body style="font-family:Tajawal,sans-serif;direction:rtl;padding:8px;margin:0"><script>window.alert=function(m){parent.postMessage({oqab:"xss",m:String(m)},"*")};<\/script><b>💬 التعليقات</b>' + list.map(c => '<div style="border-bottom:1px solid #ddd;padding:6px 0">' + c + '</div>').join('') + '</body>'; };
    paint();
    const onMsg = e => { if (!el.isConnected) { window.removeEventListener('message', onMsg); return; } if (!e.data || e.data.oqab !== 'xss' || e.source !== fr.contentWindow) return; hits++; $('#xr', el).innerHTML = '<div class="feedback bad">⚡ تنبيه من داخل الصفحة: «' + esc(e.data.m) + '»<div class="why">كودك <b>نُفّذ</b> داخل الصفحة! لو كان مهاجماً، لسرق كوكيز كل من يفتح التعليقات.</div></div>'; Snd.bad(); if (!w.fix) { api.done(w.yes || 'هذه ثغرة حقن السكربت XSS!'); if (w.medal) api.medal(w.medal); } else api.fb(false, 'الكود نُفّذ لأن الحماية مطفأة. شغّل الحماية ✅ ثم انشر نفس الكود.'); };
    window.addEventListener('message', onMsg);
    const fx = $('#xf', el); if (fx) fx.onchange = () => { safe = fx.checked; };
    $('#xs', el).onclick = () => {
      const v = $('#xc', el).value; if (!v.trim()) return; $('#xr', el).innerHTML = '';
      list.push(safe ? esc(v) : v); paint(); Snd.click();
      if (w.fix && safe && /</.test(v)) { safeTried = true; setTimeout(() => { if (el.isConnected) { $('#xr', el).innerHTML = '<div class="feedback ok">🛡️ ظهر كودك كنص عادي ولم يُنفَّذ!</div>'; api.done(w.yesFix || 'الحماية تعمل: المتصفح عرض الكود كحروف فقط.'); if (w.medalFix) api.medal(w.medalFix); } }, 400); }
    };
  },

  /* ---- mini web studio: HTML / CSS / JS tabs + live page + missions checked inside the page ---- */
  web(w, el, api) {
    const tabs = w.tabs || ['html', 'css', 'js'], code = { html: w.html || '', css: w.css || '', js: w.js || '' };
    const name = { html: '🦴 HTML', css: '🎨 CSS', js: '⚡ JS' };
    let cur = w.tab || tabs[0], fails = 0, nonce = rid(6), done = {}, finished = false;
    el.innerHTML = (w.missions ? '<ul class="goals">' + w.missions.map((m, i) => '<li id="wm' + i + '"><i></i><span>' + md(m.d) + '</span></li>').join('') + '</ul>' : '') +
      '<div class="pybox"><div class="row" style="gap:4px;padding:6px 8px;border-bottom:2px solid var(--line);direction:ltr">' + tabs.map(t => '<button class="tag' + (t === cur ? ' sel' : '') + '" data-wt="' + t + '">' + name[t] + '</button>').join('') + '</div>' +
      tabs.map(t => '<textarea data-wc="' + t + '" spellcheck="false" autocapitalize="off" dir="ltr"' + (t === cur ? '' : ' hidden') + '>' + esc(code[t]) + '</textarea>').join('') +
      '<div class="bar2"><button class="btn sm ok" id="wrun">' + ic('play', 18) + 'شغّل الصفحة</button>' + (w.hint ? '<button class="btn sm sec" id="whint">' + ic('bulb', 18) + 'تلميح</button>' : '') + (w.sol ? '<button class="btn sm sec hide" id="wsol">👀 الحل</button>' : '') + '</div></div>' +
      '<div class="browser" style="margin-top:8px"><div class="addr"><span>🔒</span><input value="' + esc(w.addr || 'my-site.oqab') + '" readonly></div><iframe sandbox="allow-scripts" title="صفحتك" style="height:' + (w.h || 260) + 'px"></iframe></div><div class="pyout" id="wout" style="display:none;margin-top:6px"></div>';
    $$('textarea', el).forEach(ta => { Py.tabKeys(ta); ta.oninput = () => { code[ta.dataset.wc] = ta.value; }; });
    const fr = $('iframe', el);
    const probe = ms => '<script>(function(){var R=[],L=[],E=null;var ol=console.log;console.log=function(){L.push(Array.prototype.map.call(arguments,String).join(" "))};window.addEventListener("error",function(e){E=e.message});' +
      'window.__oqabCheck=function(){var M=' + JSON.stringify(ms.map(m => ({ a: m.act || '', c: m.dom || '' }))) + ';M.forEach(function(m){var ok=null;try{if(m.a)(new Function(m.a))();if(m.c)ok=!!(new Function("return ("+m.c+")"))()}catch(x){ok=false}R.push(ok)});parent.postMessage({oqabweb:"' + nonce + '",r:R,log:L,err:E},"*")};})()<\/script>';
    const render = check => {
      const ms = check ? (w.missions || []) : [];
      fr.srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font-family:Tajawal,system-ui,sans-serif;padding:10px;margin:0}</style>' + probe(ms) + '<style>' + code.css + '</style>' + code.html + '<script>try{(new Function(' + JSON.stringify(code.js).replace(/<\//g, '<\\/') + '))()}catch(e){console.log("⚠️ "+e.name+": "+e.message+(e.name==="SyntaxError"?" (هل نسيت أن تكمل مكان النقاط ... أو أن تغلق قوساً؟)":""))}<\/script><script>setTimeout(function(){window.__oqabCheck()},' + (check ? 120 : 1e9) + ')<\/script>';
    };
    const onMsg = e => {
      if (!el.isConnected) { window.removeEventListener('message', onMsg); return; }
      if (!e.data || e.data.oqabweb !== nonce) return;
      const out = $('#wout', el); const lg = (e.data.log || []).join('\n'); out.style.display = lg || e.data.err ? '' : 'none'; out.innerHTML = esc(lg) + (e.data.err ? '<span class="er">⚠️ ' + esc(e.data.err) + '</span>' : '');
      const src = code.html + '\n' + code.css + '\n' + code.js;
      (w.missions || []).forEach((m, i) => { if (done[i]) return; let ok = e.data.r[i]; if (ok === null) ok = true; if (ok && m.src) ok = new RegExp(m.src, 'i').test(src); if (ok && m.nosrc) ok = !new RegExp(m.nosrc, 'i').test(src); if (ok) { done[i] = 1; const li = $('#wm' + i, el); li.classList.add('done'); $('i', li).textContent = '✓'; } });
      const all = !w.missions || Object.keys(done).length === w.missions.length;
      if (all && !finished) { finished = true; api.done(w.yes || 'صفحتك تعمل! 🎉'); if (w.medal) api.medal(w.medal); }
      else if (!all) { fails++; api.wrong && api.wrong(); api.fb(false, w.outMsg || 'بعض المهام لم تكتمل بعد. انظر للمهام التي بلا ✓.'); if (fails >= 2 && w.sol) { const b = $('#wsol', el); if (b) b.classList.remove('hide'); } }
    };
    window.addEventListener('message', onMsg);
    el.onclick = e => {
      const t = e.target.closest('[data-wt]'); if (t) { cur = t.dataset.wt; $$('[data-wt]', el).forEach(b => b.classList.toggle('sel', b === t)); $$('[data-wc]', el).forEach(x => x.hidden = x.dataset.wc !== cur); return; }
      if (e.target.closest('#wrun')) { nonce = rid(6); render(true); Snd.click(); return; }
      if (e.target.closest('#whint')) { api.hint && api.hint(); api.fb(false, '💡 ' + w.hint); return; }
      if (e.target.closest('#wsol')) { Object.assign(code, w.sol); $$('[data-wc]', el).forEach(x => x.value = code[x.dataset.wc]); return; }
    };
    render(false);
    if (!w.missions && !w.goal) api.done && api.done();
  },

  /* ---- file permissions editor (rwx) ---- */
  perm(w, el, api) {
    let p = (w.start || 'rw-r--r--').split('');
    const who = [['👤 صاحب الملف', 'u'], ['👥 المجموعة', 'g'], ['🌍 الآخرون', 'o']];
    const draw = () => {
      const s = p.join(''); const oct = [0, 3, 6].map(i => (p[i] !== '-' ? 4 : 0) + (p[i + 1] !== '-' ? 2 : 0) + (p[i + 2] !== '-' ? 1 : 0)).join('');
      el.innerHTML = '<div class="wbox"><p style="margin-top:0">' + md(w.goalText || '') + '</p><div class="grid2">' + who.map((x, j) => '<div class="bucket"><h4>' + x[0] + '</h4><div class="row" style="justify-content:center;direction:ltr">' + ['r', 'w', 'x'].map((b, k) => '<button class="tag' + (p[j * 3 + k] !== '-' ? ' right' : '') + '" data-b="' + (j * 3 + k) + '">' + { r: '📖 قراءة r', w: '✏️ كتابة w', x: '▶️ تشغيل x' }[b] + '</button>').join('') + '</div></div>').join('') + '</div>' +
        '<p class="mono" style="text-align:center;font-size:1.4em;direction:ltr;margin:10px 0 0">' + esc(w.file || 'secret.txt') + ':  -' + s + '  =  <b>' + oct + '</b></p>' + (w.target ? '<button class="btn" id="pck" style="margin-top:8px">تحقّق</button>' : '') + '</div>';
    };
    draw();
    el.onclick = e => {
      const b = e.target.closest('[data-b]'); if (b) { const i = +b.dataset.b; p[i] = p[i] === '-' ? 'rwx'[i % 3] : '-'; Snd.click(); draw(); if (!w.target) api.done(); return; }
      if (e.target.id === 'pck') { if (p.join('') === w.target) { api.done(w.yes || 'صلاحيات مضبوطة تماماً!'); if (w.medal) api.medal(w.medal); } else { api.wrong(); api.fb(false, w.hint || 'ليس بعد. راجع المطلوب.'); } }
    };
  },

  /* ---- JavaScript sandbox: runs in an isolated frame, console.log captured ---- */
  js(w, el, api) {
    el.innerHTML = '<div class="pybox"><textarea spellcheck="false" autocapitalize="off" dir="ltr">' + esc(w.code || '') + '</textarea><div class="bar2"><button class="btn sm ok" data-j="run">' + ic('play', 18) + 'شغّل</button>' + (w.sol ? '<button class="btn sm sec hide" data-j="sol">👀 الحل</button>' : '') + (w.hint ? '<button class="btn sm sec" data-j="hint">' + ic('bulb', 18) + 'تلميح</button>' : '') + '</div><div class="pyout"></div></div>' + (w.page ? '<div class="browser" style="margin-top:8px"><div class="addr"><span>🌐</span><input value="page.oqab" readonly></div><iframe sandbox="allow-scripts" title="الصفحة" style="height:200px"></iframe></div>' : '');
    const ta = $('textarea', el), out = $('.pyout', el); Py.tabKeys(ta); let fails = 0;
    const onMsg = e => { if (!el.isConnected) { window.removeEventListener('message', onMsg); return; } if (!e.data || e.data.oqab !== 'js') return; const r = e.data; out.innerHTML = esc(r.out || '') + (r.err ? '<span class="er">⚠️ ' + esc(r.err) + '</span>' : '') || '<span class="dim">(لم يطبع شيئاً)</span>';
      const o = (r.out || '').trim(); let ok = !r.err;
      if (ok && w.check) { if (w.check.out != null) ok = o === w.check.out; if (ok && w.check.has) ok = w.check.has.every(t => ta.value.includes(t)); if (ok && w.check.outHas) ok = [].concat(w.check.outHas).every(t => o.includes(t)); if (ok && w.check.page) ok = new RegExp(w.check.page).test(r.html || ''); }
      if (ok) { api.done(w.yes || 'الكود يعمل! ⚡'); if (w.medal) api.medal(w.medal); } else { fails++; api.wrong && api.wrong(); if (!r.err) api.fb(false, w.outMsg || 'يعمل، لكن ليس الناتج المطلوب بعد.'); if (fails >= 2 && w.sol) { const sb = $('[data-j="sol"]', el); if (sb) sb.classList.remove('hide'); } } };
    window.addEventListener('message', onMsg);
    el.onclick = e => {
      const b = e.target.closest('[data-j]'); if (!b) return;
      if (b.dataset.j === 'sol') { ta.value = w.sol; return; }
      if (b.dataset.j === 'hint') { api.hint && api.hint(); api.fb(false, '💡 ' + w.hint); return; }
      const fr = w.page ? $('iframe', el) : (() => { let f = $('iframe.hidden-js', el); if (!f) { f = document.createElement('iframe'); f.className = 'hidden-js'; f.setAttribute('sandbox', 'allow-scripts'); f.style.display = 'none'; el.appendChild(f); } return f; })();
      const code = ta.value;
      fr.srcdoc = '<meta charset="utf-8"><body style="font-family:Tajawal,sans-serif;direction:rtl;padding:8px">' + (w.page || '') + '<script>(function(){var out=[];var L=function(){out.push(Array.prototype.map.call(arguments,function(x){return typeof x==="object"?JSON.stringify(x):String(x)}).join(" "))};console.log=L;var err=null;try{' + code.replace(/<\/script/gi, '<\\/script') + '\n}catch(e){err=e.name+": "+e.message}setTimeout(function(){parent.postMessage({oqab:"js",out:out.join("\\n"),err:err,html:document.body.innerHTML},"*")},50)})()<\/script></body>';
    };
  },

  /* ---- XOR machine ---- */
  xor(w, el, api) {
    el.innerHTML = '<div class="wbox"><div class="row"><label style="flex:1">الرسالة<input class="inp" id="xm" value="' + esc(w.text || 'سر') + '"></label><label style="width:120px">المفتاح<input class="inp mono" id="xk" dir="ltr" maxlength="1" value="' + esc(w.key || 'K') + '"></label></div><div class="hexv" id="xo" style="margin-top:8px;white-space:pre-wrap"></div><p id="xr" style="font-weight:800"></p></div>';
    let n = 0;
    const up = () => {
      const t = $('#xm', el).value, k = ($('#xk', el).value || 'K').charCodeAt(0) & 255; const bytes = Array.from(new TextEncoder().encode(t)).slice(0, 6);
      const b8 = x => x.toString(2).padStart(8, '0');
      $('#xo', el).textContent = bytes.map(b => '  ' + b8(b) + '   (الحرف)\n⊕ ' + b8(k) + '   (المفتاح)\n= ' + b8(b ^ k) + '   (المشفّر)\n⊕ ' + b8(k) + '   (المفتاح مرة أخرى)\n= ' + b8(b) + '   ← رجع الأصل!\n').join('\n');
      $('#xr', el).textContent = 'لاحظ: XOR بنفس المفتاح مرتين يرجع الرسالة كما كانت 🔁';
      if (++n > 2) { api.done(w.yes || 'هذه قوة XOR: نفس المفتاح يشفّر ويفك!'); if (w.medal) api.medal(w.medal); }
    };
    $('#xm', el).oninput = up; $('#xk', el).oninput = up; up();
  },

  /* ---- real digital signature (ECDSA in the browser) ---- */
  sign(w, el, api) {
    el.innerHTML = '<div class="wbox"><p style="margin-top:0">✍️ عُقاب يملك <b>مفتاحاً خاصاً</b> يوقّع به، والجميع يملكون <b>مفتاحه العام</b> ليتحقّقوا.</p><textarea class="inp" id="sgm" rows="2">' + esc(w.text || 'اجتماع الأبطال غداً الساعة 5') + '</textarea><div class="row" style="margin-top:8px"><button class="btn sm" id="sgs">✍️ وقّع بالمفتاح الخاص</button><button class="btn sm sec" id="sgv">🔍 تحقّق بالمفتاح العام</button></div><div class="hexv" id="sgo" style="margin-top:8px;white-space:pre-wrap;word-break:break-all;min-height:40px"></div><p id="sgr" style="font-weight:800"></p></div>';
    let keys = null, sig = null, signedText = '', verified = 0, tamper = 0;
    const enc = t => new TextEncoder().encode(t);
    const ensure = async () => { if (!keys) keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']); };
    $('#sgs', el).onclick = async () => { try { await ensure(); signedText = $('#sgm', el).value; sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keys.privateKey, enc(signedText))); $('#sgo', el).textContent = 'التوقيع: ' + Array.from(sig.slice(0, 24)).map(b => b.toString(16).padStart(2, '0')).join('') + '...'; $('#sgr', el).textContent = 'وُقّعت الرسالة. الآن جرّب التحقّق، ثم غيّر حرفاً واحداً في الرسالة وتحقّق مرة أخرى!'; $('#sgr', el).style.color = ''; Snd.ok(); } catch (e) { $('#sgr', el).textContent = 'المتصفح لا يدعم التوقيع هنا'; api.done(); } };
    $('#sgv', el).onclick = async () => { if (!sig) { toast('وقّع أولاً'); return; } const cur = $('#sgm', el).value; const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, keys.publicKey, sig, enc(cur)); $('#sgr', el).textContent = ok ? '✅ التوقيع صحيح: الرسالة من عُقاب ولم يغيّرها أحد' : '❌ التوقيع لا يطابق! الرسالة تغيّرت بعد التوقيع (أو ليست من عُقاب)'; $('#sgr', el).style.color = ok ? 'var(--ok)' : 'var(--bad)'; ok ? (Snd.ok(), verified++) : (Snd.bad(), tamper++); if (verified && tamper) { api.done(w.yes || 'رأيت بنفسك: أي تغيير ولو حرفاً واحداً يكشفه التوقيع!'); if (w.medal) api.medal(w.medal); } };
  },

  /* ---- ransomware simulation: backups save the day ---- */
  ransom(w, el, api) {
    let files = ['📷 صور العائلة', '📝 واجب المدرسة', '🎮 حفظ اللعبة', '🎨 رسوماتي'], hit = false, backup = false, restored = false, round = 0;
    const draw = () => {
      el.innerHTML = '<div class="wbox"><div class="grid2"><div class="bucket"><h4>💻 حاسوبك</h4>' + files.map(f => '<div class="tag" style="margin:4px 0">' + (hit && !restored ? '🔒 ' + f.slice(2) + '.locked' : f) + '</div>').join('') + '</div><div class="bucket"><h4>💾 قرص النسخ الاحتياطي</h4>' + (backup ? files.map(f => '<div class="tag right" style="margin:4px 0">' + f + '</div>').join('') : '<p class="muted" style="text-align:center">(فارغ)</p>') + '</div></div>' +
        (hit && !restored ? '<div class="feedback bad">💀 «تم تشفير ملفاتك! ادفع لنفكّها...» <div class="why">لا تدفع أبداً! لا شيء يضمن أنهم سيعيدونها.</div></div>' : '') +
        '<div class="row" style="margin-top:8px">' + (!hit ? '<button class="btn sm sec" id="rb">💾 انسخ احتياطياً</button><button class="btn sm bad" id="rh">📎 افتح المرفق المريب</button>' : !restored ? (backup ? '<button class="btn sm ok" id="rr">♻️ امسح الجهاز واسترجع النسخة</button>' : '<button class="btn sm" id="rt">↺ جرّب مرة أخرى (مع نسخة احتياطية)</button>') : '<p class="feedback ok" style="width:100%">🎉 استرجعت كل ملفاتك دون أن تدفع شيئاً!</p>') + '</div></div>';
      const b = $('#rb', el); if (b) b.onclick = () => { backup = true; Snd.ok(); draw(); };
      const h = $('#rh', el); if (h) h.onclick = () => { hit = true; Snd.bad(); draw(); };
      const r = $('#rr', el); if (r) r.onclick = () => { restored = true; Snd.win(); draw(); api.done(w.yes || 'النسخة الاحتياطية هزمت برنامج الفدية!'); if (w.medal) api.medal(w.medal); };
      const t = $('#rt', el); if (t) t.onclick = () => { hit = false; backup = false; round++; draw(); api.fb(false, 'بلا نسخة احتياطية ضاعت الملفات. هذه المرة انسخ أولاً!'); };
    };
    draw();
  },

  /* ---- packet capture viewer ---- */
  packets(w, el, api) {
    const P = w.packets; let sel = null;
    el.innerHTML = '<div class="wbox"><input class="inp mono" id="pf" dir="ltr" placeholder="فلتر: اكتب كلمة مثل HTTP أو 10.0.0.5" autocomplete="off" spellcheck="false"><div id="pl" dir="ltr" style="margin-top:6px;max-height:260px;overflow:auto"></div><div id="pd"></div>' + (w.ask ? '<form class="flagin" id="pfa" style="margin-top:8px"><input class="inp mono" placeholder="' + esc(w.askPh || 'إجابتك') + '" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn">تحقّق</button></form><p style="margin:4px 0"><b>' + md(w.ask) + '</b></p>' : '') + '</div>';
    const draw = () => { const q = $('#pf', el).value.trim().toLowerCase(); const rows = P.map((p, i) => [p, i]).filter(([p]) => !q || [p.src, p.dst, p.proto, String(p.port), p.info].join(' ').toLowerCase().includes(q)); $('#pl', el).innerHTML = '<table class="t ltr mono" style="direction:ltr;font-size:11.5px;white-space:nowrap"><thead><tr><th>#</th><th>من</th><th>إلى</th><th>نوع</th><th>منفذ</th><th>معلومات</th></tr></thead><tbody>' + rows.map(([p, i]) => '<tr data-p="' + i + '" style="cursor:pointer' + (sel === i ? ';background:var(--warn-bg)' : '') + '"><td>' + (i + 1) + '</td><td>' + esc(p.src) + '</td><td>' + esc(p.dst) + '</td><td>' + esc(p.proto) + '</td><td>' + esc(p.port) + '</td><td>' + esc(p.info) + '</td></tr>').join('') + '</tbody></table><small class="muted" dir="rtl" style="display:block">' + rows.length + ' من ' + P.length + ' حزمة · اضغط على حزمة لترى محتواها</small>'; };
    $('#pf', el).oninput = draw; draw();
    el.addEventListener('click', e => { const r = e.target.closest('[data-p]'); if (!r) return; sel = +r.dataset.p; const p = P[sel]; draw(); $('#pd', el).innerHTML = '<p style="margin:8px 0 4px"><b>محتوى الحزمة ' + (sel + 1) + ':</b></p><div class="hexv" style="white-space:pre-wrap">' + esc(p.data || '(لا محتوى)') + '</div>'; Snd.click(); });
    const f = $('#pfa', el); if (f) f.onsubmit = e => { e.preventDefault(); const v = norm($('input', f).value); if ([].concat(w.ans).some(a => norm(a) === v)) { api.done(w.yes || 'أحسنت يا متتبّع الحزم!'); if (w.medal) api.medal(w.medal); } else { api.wrong && api.wrong(); api.fb(false, 'ليس بعد. استخدم الفلتر وافتح الحزم.', w.hint); } };
    if (!w.ask) api.done && api.done();
  }
};
