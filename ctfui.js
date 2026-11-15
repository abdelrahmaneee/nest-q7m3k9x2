/* ===== عُقاب — Stage 2: Capture The Flag (everything is simulated inside the app) ===== */
'use strict';
const TRACKS = [
  { id: 'recon', n: 'الاستطلاع', ic: '🔭', d: 'اجمع المعلومات مثل العُقاب من السماء' },
  { id: 'web', n: 'ثغرات الويب', ic: '🌐', d: 'مواقع وهمية فيها أخطاء حقيقية' },
  { id: 'crypto', n: 'كسر الشيفرات', ic: '🔐', d: 'رسائل مشفّرة ومرمّزة تنتظرك' },
  { id: 'files', n: 'تحليل الملفات', ic: '🕵️', d: 'كل ملف يخفي قصة' }
];
const CTFTools = {
  ext(world = {}) {
    const W = world;
    const fileOf = (T, n) => { const node = T.node(T.resolve(n)); return node && node.t === 'f' ? node : null; };
    return {
      help: [['scan هدف', 'امسح شبكة أو جهازاً لتعرف الأبواب المفتوحة'], ['connect عنوان منفذ', 'اتصل بباب مفتوح وانظر ماذا يقول'], ['lookup اسم [TXT]', 'اسأل DNS عن اسم موقع'], ['curl /مسار', 'اطلب صفحة من الموقع'], ['file ملف', 'اكشف النوع الحقيقي للملف'], ['strings ملف', 'استخرج الكلام المقروء من ملف'], ['xxd ملف', 'اعرض الملف بالأرقام السداسية'], ['exif ملف', 'اعرض البيانات الوصفية للصورة'], ['base64 -d نص', 'فكّ ترميز Base64']],
      cmds: {
        scan(a, raw, T) {
          const t = a[0]; if (!t) return T.err('scan: اكتب الهدف، مثل scan 10.10.0.0/24');
          const hosts = W.hosts || {};
          T.print('🔭 جارٍ المسح ' + esc(t) + ' ...', 'dim');
          if (/\/24$|\.0$/.test(t)) {
            const base = t.replace(/\/24$/, '').split('.').slice(0, 3).join('.');
            const found = Object.keys(hosts).filter(h => h.startsWith(base + '.'));
            if (!found.length) return T.print('لم يُعثر على أجهزة.', 'dim');
            found.forEach(h => T.print('<span class="hl">' + esc(h) + '</span>  ' + esc(hosts[h].name || '') + '   الأبواب المفتوحة: ' + Object.keys(hosts[h].ports || {}).join('، ')));
            T.print('المسح انتهى: ' + found.length + ' أجهزة.', 'dim');
          } else {
            const h = hosts[t]; if (!h) return T.print('الجهاز لا يرد.', 'dim');
            Object.entries(h.ports || {}).forEach(([p, v]) => T.print('<span class="pr">' + esc(p) + '/open</span>  ' + esc(v.svc || '')));
          }
        },
        connect(a, raw, T) {
          const [ip, port] = a; const h = (W.hosts || {})[ip]; if (!ip || !port) return T.err('connect: الطريقة: connect عنوان منفذ');
          if (!h) return T.err('connect: لا يوجد جهاز بهذا العنوان');
          const p = (h.ports || {})[port]; if (!p) return T.err('connect: الباب ' + port + ' مغلق (Connection refused)');
          T.print('🔌 متصل بـ ' + esc(ip) + ':' + esc(port), 'dim'); T.print(esc(p.banner || '...'));
        },
        lookup(a, raw, T) {
          const n = (a[0] || '').toLowerCase(), ty = (a[1] || 'A').toUpperCase(); const r = (W.dns || {})[n];
          if (!n) return T.err('lookup: اكتب اسم الموقع');
          if (!r) return T.err('lookup: الاسم ' + n + ' غير موجود (NXDOMAIN)');
          if (ty === 'A') { T.print(esc(n) + '  A  <span class="hl">' + esc(r.A || '-') + '</span>'); if (r.TXT) T.print('(يوجد أيضاً سجل TXT: جرّب lookup ' + esc(n) + ' TXT)', 'dim'); }
          else if (ty === 'TXT') T.print(esc(n) + '  TXT  "' + esc(r.TXT || '') + '"');
          else T.print('لا يوجد سجل من نوع ' + esc(ty), 'dim');
        },
        curl(a, raw, T) { const u = (a[0] || '').replace(/^https?:\/\/[^/]+/, ''); const pg = (W.web || {})[u || '/']; if (pg == null) return T.print('404 Not Found', 'er'); T.print(esc(pg)); },
        file(a, raw, T) {
          const f = fileOf(T, a[0] || ''); if (!f) return T.err('file: لا يوجد ملف بهذا الاسم');
          const ty = (W.types || {})[a[0]] || (f.x.startsWith('\u0089PNG') ? 'PNG image data (صورة PNG)' : f.x.startsWith('PK') ? 'Zip archive (ملف مضغوط)' : f.x.startsWith('%PDF') ? 'PDF document' : f.x.startsWith('ÿØ') ? 'JPEG image data (صورة JPEG)' : 'ASCII text (نص عادي)');
          T.print(esc(a[0]) + ': ' + esc(ty));
        },
        strings(a, raw, T) { const f = fileOf(T, a[0] || ''); if (!f) return T.err('strings: لا يوجد ملف بهذا الاسم'); const runs = f.x.match(/[\x20-\x7E]{4,}/g) || []; runs.forEach(r => T.print(esc(r))); if (!runs.length) T.print('(لا كلام مقروء)', 'dim'); },
        xxd(a, raw, T) { const f = fileOf(T, a[0] || ''); if (!f) return T.err('xxd: لا يوجد ملف بهذا الاسم'); const by = Array.from(f.x.slice(0, 64)).map(c => c.charCodeAt(0) & 255); for (let i = 0; i < by.length; i += 16) { const r = by.slice(i, i + 16); T.print(esc(i.toString(16).padStart(8, '0') + ': ' + r.map(x => x.toString(16).padStart(2, '0')).join(' ').padEnd(48) + ' ' + r.map(x => x >= 32 && x < 127 ? String.fromCharCode(x) : '.').join(''))); } },
        exif(a, raw, T) { const m = (W.meta || {})[a[0]]; if (!fileOf(T, a[0] || '')) return T.err('exif: لا يوجد ملف بهذا الاسم'); if (!m) return T.print('(لا توجد بيانات وصفية)', 'dim'); Object.entries(m).forEach(([k, v]) => T.print('<span class="dim">' + esc(k.padEnd(14)) + '</span>: ' + esc(v))); },
        nc(a, raw, T) { this.connect(a, raw, T); },
        dig(a, raw, T) { this.lookup(a, raw, T); },
        nslookup(a, raw, T) { this.lookup(a, raw, T); },
        base64(a, raw, T) {
          const d = a.includes('-d'); const arg = a.filter(x => x !== '-d').join(' '); if (!arg) return T.err('base64: اكتب النص أو اسم الملف');
          const f = fileOf(T, arg); const src = f ? f.x.trim() : arg;
          if (d) { try { T.print(esc(decodeURIComponent(escape(atob(src.trim()))))); } catch (e) { T.err('base64: هذا ليس Base64 صحيحاً'); } }
          else T.print(esc(btoa(unescape(encodeURIComponent(src)))));
        }
      }
    };
  }
};

const CTF = {
  t0: 0,
  trackOf(id) { return C.ctf.find(c => c.id === id); },
  isOpen(ch) { const k = Kid.get(); const list = C.ctf.filter(c => c.track === ch.track); const i = list.indexOf(ch); return i === 0 || !!(k.C[list[i - 1].id] && k.C[list[i - 1].id].d); },
  hub(D) {
    if (!D.stage2) { setTimeout(() => App.go('map')); return {}; }
    const k = Kid.get(); const pts = D.solved.reduce((s, id) => s + (CTF.trackOf(id) || { pts: 0 }).pts, 0);
    let h = '<div class="hero">' + Art.eagle('happy', D.rank, true) + '<div class="bubble"><b>صيد الأعلام 🚩</b><br>' + D.solved.length + ' من ' + C.ctf.length + ' أعلام · ' + pts + ' نقطة<div class="bar" style="margin-top:6px"><i style="width:' + Math.round(D.solved.length / C.ctf.length * 100) + '%"></i></div></div></div>';
    h += '<div class="card" style="padding:10px 14px;font-size:.92em">🦅 <b>تذكير عُقاب:</b> كل هذه الأنظمة وهمية داخل التطبيق. ما تتعلّمه هنا لا يُجرَّب أبداً على موقع أو جهاز حقيقي.</div>';
    TRACKS.forEach(t => {
      const list = C.ctf.filter(c => c.track === t.id);
      h += '<div class="ctf-track"><h2 style="margin:0">' + t.ic + ' ' + t.n + '</h2><p class="muted" style="margin:0 0 6px">' + t.d + '</p><div class="ctf-grid">' + list.map(c => { const s = k.C[c.id] && k.C[c.id].d; const o = CTF.isOpen(c); return '<a class="ctf-card ' + (s ? 'solved' : o ? '' : 'locked') + '" href="' + (o ? '#/ctfc/' + c.id : 'javascript:void 0') + '"><b>' + (s ? '✅ ' : o ? '🚩 ' : '🔒 ') + esc(c.title) + '</b><span class="pts">' + c.pts + ' نقطة</span></a>'; }).join('') + '</div></div>';
    });
    const all = D.solved.length >= C.ctf.length;
    h += '<a class="unit ' + (all ? 'cur' : 'locked') + '" href="' + (all ? '#/next' : 'javascript:void 0') + '"><div class="ic">🌍</div><div class="tx"><b>الخطوة التالية: ساحات التدريب الحقيقية</b><small>' + (all ? 'افتح لتعرف أين تكمل رحلتك' : '🔒 بعد التقاط كل الأعلام') + '</small></div></a>';
    return { html: h };
  },
  challenge(id, D) {
    const ch = CTF.trackOf(id); if (!ch || !D.stage2 || !CTF.isOpen(ch)) { setTimeout(() => App.go('ctf')); return {}; }
    const k = Kid.get(); const st = k.C[id] || {}; const solved = !!st.d;
    CTF.t0 = now(); CTF.shown = st.h || 0; App.celeOK = false;
    const tr = TRACKS.find(t => t.id === ch.track);
    let h = '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/ctf">' + ic('back', 18) + 'الأعلام</a><span class="pill">' + tr.ic + ' ' + tr.n + '</span><span class="pill warn">' + ch.pts + ' نقطة</span></div>';
    h += '<h1 style="margin:4px 0">' + esc(ch.title) + '</h1><div class="mentor">' + Art.eagle('think', D.rank, true) + '<div class="bubble">' + md(ch.story) + '</div></div>';
    h += '<div id="env"></div>';
    h += '<div class="card"><b>🚩 العلم:</b> <small class="muted">' + md(ch.flagHint || 'شكله: `OQAB{...}`') + '</small><form class="flagin" id="ff" style="margin-top:6px"><input class="inp mono" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="OQAB{...}"' + (solved ? ' value="' + esc(ch.flag) + '" disabled' : '') + '><button class="btn"' + (solved ? ' disabled' : '') + '>تحقّق</button></form><div id="fb"></div>';
    h += '<div id="hints">' + ch.hints.map((x, i) => i < CTF.shown || solved ? '<div class="hint">💡 <b>تلميح ' + (i + 1) + ':</b> ' + md(x) + '</div>' : '').join('') + '</div>' + (!solved && CTF.shown < ch.hints.length ? '<button class="btn sm sec" id="hb">' + ic('bulb', 18) + 'تلميح ' + (CTF.shown + 1) + ' (−15 نقطة)</button>' : '') + '</div>';
    h += '<div id="after">' + (solved ? CTF.afterHtml(ch) : '') + '</div>';
    return {
      html: h, mount() {
        CTF.mountEnv(ch, $('#env'));
        const f = $('#ff'); f.onsubmit = e => {
          e.preventDefault(); const v = $('input', f).value.trim(); if (!v) return;
          const ok = [ch.flag].concat(ch.alt || []).some(x => x.toLowerCase().replace(/\s/g, '') === v.toLowerCase().replace(/\s/g, ''));
          if (!ok) { Kid.ctfTouch(id, 't'); Lesson.fb(false, /^oqab\{/i.test(v) ? 'هذا ليس العلم الصحيح. استمر في البحث!' : 'العلم يبدأ عادةً بـ <span class="mono">OQAB{</span> وينتهي بـ <span class="mono">}</span>'); return; }
          const before = App.derive().xp;
          Kid.ctfDone(id, { h: CTF.shown, t: (Kid.get().C[id] || {}).t || 0, s: Math.round((now() - CTF.t0) / 1000) });
          const k2 = Kid.get(); const sol = C.ctf.filter(c => k2.C[c.id] && k2.C[c.id].d);
          if (sol.length >= 8) Kid.medal('flags'); if (sol.length >= C.ctf.length) Kid.medal('flagmaster'); if (sol.filter(c => !k2.C[c.id].h).length >= 5) Kid.medal('nohint');
          const gain = App.derive().xp - before;
          $('input', f).disabled = true; $('button', f).disabled = true; const hb = $('#hb'); if (hb) hb.remove();
          Lesson.fb(true, 'التقطت العلم! 🚩 <bdi>+' + gain + ' XP</bdi>');
          Snd.fanfare(); confetti(110);
          $('#after').innerHTML = CTF.afterHtml(ch); App.celeOK = true; App.paintTop();
          setTimeout(App.checkCele, 1500);
        };
        const hb = $('#hb'); if (hb) hb.onclick = () => { CTF.shown++; Kid.ctfTouch(id, 'h'); Snd.click(); $('#hints').insertAdjacentHTML('beforeend', '<div class="hint">💡 <b>تلميح ' + CTF.shown + ':</b> ' + md(ch.hints[CTF.shown - 1]) + '</div>'); if (CTF.shown >= ch.hints.length) hb.remove(); else hb.innerHTML = ic('bulb', 18) + 'تلميح ' + (CTF.shown + 1) + ' (−15 نقطة)'; };
      }
    };
  },
  afterHtml(ch) {
    const list = C.ctf.filter(c => c.track === ch.track); const nx = list[list.indexOf(ch) + 1];
    return '<div class="card"><h2 style="margin-top:0">🧩 كيف حُلّ التحدي؟</h2><p>' + md(ch.solution) + '</p></div><div class="defend"><h3 style="margin:0 0 4px">🛡️ كيف ندافع ضد هذا؟</h3>' + md(ch.defend) + '</div><div class="row">' + (nx ? '<a class="btn" href="#/ctfc/' + nx.id + '">التحدي التالي: ' + esc(nx.title) + '</a>' : '') + '<a class="btn sec" href="#/ctf">كل الأعلام</a></div>';
  },
  mountEnv(ch, el) {
    const envs = [].concat(ch.env || []);
    const stub = { done() { }, fb: Lesson.fb, medal() { }, wrong() { }, card() { }, hint() { } };
    envs.forEach(e => {
      const box = document.createElement('div'); box.style.margin = '10px 0'; el.appendChild(box);
      if (e.type === 'term') Term.create(box, { fs: e.fs, cwd: e.cwd, host: e.host, user: e.user, motd: e.motd || 'اكتب help لترى كل الأوامر (ومنها أدوات الصيد)', ext: CTFTools.ext(e.world) });
      else if (e.type === 'py') Py.exercise({ code: e.code, check: { any: 1 }, hint: e.hint }, box, stub);
      else Widgets.mount(e.w || e, box, stub);
    });
  },
  next() {
    const D = App.derive(); if (!(D.solved.length >= C.ctf.length) && !App.preview && Dev.get().role !== 'coach') { setTimeout(() => App.go('ctf')); return {}; }
    let h = '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/ctf">' + ic('back', 18) + 'الأعلام</a></div>';
    h += '<div class="hero">' + Art.eagle('happy', 6, true) + '<div class="bubble"><b>أنهيت عُقاب كله! 🏆</b><br>أنت الآن جاهز للساحات الحقيقية. هذه مواقع <b>قانونية وآمنة</b> صُنعت خصيصاً ليتدرّب فيها الناس على الاختراق، وكل ما فيها مسموح.</div></div>';
    h += '<div class="card"><h2 style="margin-top:0">1️⃣ أكاديمية CyLab للأمن (picoCTF سابقاً)</h2><p>من جامعة <b>كارنيغي ميلون</b> الأمريكية، وهي أشهر ساحة تدريب للطلاب في العالم. مجانية تماماً، وفيها مئات التحديات من نفس أنواع ما حللته هنا: <b>General Skills</b> (مهارات عامة) و <b>Cryptography</b> (تشفير) و <b>Web Exploitation</b> (ثغرات الويب) و <b>Forensics</b> (تحقيق).</p>' +
      '<p><b>كيف تبدأ؟</b></p><ol><li>اطلب من أخيك أن يسجّلك معه في: <span class="mono" dir="ltr">learn.cylabacademy.org</span> (الحساب يحتاج موافقة ولي الأمر لمن هو دون 18 سنة).</li><li>افتح مكتبة التحديات (picoGym سابقاً) واختر فئة <b>General Skills</b> أولاً.</li><li>رتّب التحديات من الأسهل (أقل نقاط) إلى الأصعب.</li><li>استخدم <b>Webshell</b>: طرفية لينكس حقيقية داخل المتصفح، فيها نفس الأوامر التي تعلّمتها!</li><li>عندما تعلق: اقرأ التلميح، ثم ابحث، ثم اسأل أخاك.</li></ol></div>';
    h += '<div class="card"><h2 style="margin-top:0">2️⃣ لعبة Bandit من OverTheWire</h2><p>لعبة مجانية في الطرفية: كل مرحلة فيها كلمة سر مخبّأة توصلك للمرحلة التالية. تبدأ بـ <code>ls</code> و <code>cat</code> مثل ما تعلّمت، ثم تصعب تدريجياً. هذه تحتاج أخاك ليساعدك في أول اتصال (عبر أمر <code>ssh</code>).</p><p class="mono" dir="ltr">overthewire.org/wargames/bandit</p></div>';
    h += '<div class="card" style="border-color:var(--gold)"><h2 style="margin-top:0">📒 نصائح عُقاب الأخيرة</h2><ul><li><b>دفتر الصيّاد:</b> اكتب في دفتر كل تحدٍّ حللته وكيف. الخبراء كلهم يفعلون هذا.</li><li><b>لا تستعجل الحل:</b> المتعة في البحث، والتعلّم يحدث عندما تحاول.</li><li><b>القاعدة لا تتغيّر:</b> التجربة فقط في الساحات المصمّمة لذلك، أو بإذن مكتوب من صاحب النظام.</li><li><b>استمر في البرمجة:</b> Python ستبقى أقوى أداة في يدك.</li></ul></div>';
    return { html: h };
  }
};
