/* ===== عُقاب — coach dashboard ===== */
'use strict';
const CoachUI = {
  open: false, tab: 'day', day: null,
  genCode() { const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; const r = crypto.getRandomValues(new Uint8Array(12)); let s = ''; r.forEach((x, i) => { s += a[x % a.length]; if (i === 3 || i === 7) s += '-'; }); return s; },
  async setPin(pin) { const fam = Dev.get().fam || ''; const c = Coach.get(); c.pin = { h: await sha('oqab|' + pin), u: now() }; Coach.save(); },
  async checkPin(pin) { const c = Coach.get(); if (!c.pin) return false; return (await sha('oqab|' + pin)) === c.pin.h; },

  /* first-time setup on the coach's own device */
  setup() {
    const st = CoachUI.sst || { step: 0 };
    CoachUI.sst = st;
    let h = '<div style="padding-top:16px"><div class="mentor">' + Art.eagle('happy', 3) + '<div class="bubble">أهلاً أيها المدرب! سنجهّز جهازك لتتابع أخاك.</div></div>';
    if (st.step === 0) {
      h += '<div class="card"><h2>هل لديك رمز ربط من قبل؟</h2><p>إذا كانت هذه أول مرة، اختر «رمز جديد». وإذا جهّزت المدرب على جهاز آخر من قبل، اختر «عندي رمز».</p><div class="grid2"><button class="btn" data-s="new">رمز جديد</button><button class="btn sec" data-s="have">عندي رمز</button></div></div><a class="btn sec" href="#/">رجوع</a>';
    } else if (st.step === 1) {
      h += '<div class="card"><h2>' + (st.mode === 'have' ? 'اكتب رمز الربط' : 'رمز الربط الخاص بكما') + '</h2>' + (st.mode === 'have' ? '<input class="inp mono" id="cfam" dir="ltr" placeholder="XXXX-XXXX-XXXX">' : '<div class="big-num mono" style="direction:ltr;letter-spacing:.08em">' + st.code + '</div><p>هذا الرمز يربط جهازك بجهاز أخيك. احتفظ به، وستكتبه على جهازه مرة واحدة.</p>') + '</div>' +
        '<div class="card"><h2>اختر رمز المدرب (4 أرقام)</h2><p class="muted">يحمي لوحة المدرب على جهاز أخيك.</p><input class="inp mono" id="cp1" dir="ltr" inputmode="numeric" maxlength="8" placeholder="••••" type="password"><input class="inp mono" id="cp2" dir="ltr" inputmode="numeric" maxlength="8" placeholder="أعد كتابته" type="password" style="margin-top:8px"><p id="cmsg" class="muted"></p></div><button class="btn wide" data-s="save">حفظ وتجهيز جهازي</button>';
    }
    h += '</div>';
    return {
      html: h, mount() {
        $$('[data-s]').forEach(b => b.onclick = async () => {
          const s = b.dataset.s;
          if (s === 'new' || s === 'have') { st.mode = s; st.code = CoachUI.genCode(); st.step = 1; App.render(); return; }
          if (s === 'save') {
            const msg = $('#cmsg'); const p1 = $('#cp1').value.trim(), p2 = $('#cp2').value.trim();
            let code = st.mode === 'have' ? Views.normFam($('#cfam').value) : st.code;
            if (!code) { msg.textContent = 'الرمز يتكوّن من 12 حرفاً ورقماً.'; msg.style.color = 'var(--bad)'; return; }
            if (!/^\d{4,8}$/.test(p1)) { msg.textContent = 'رمز المدرب: من 4 إلى 8 أرقام.'; msg.style.color = 'var(--bad)'; return; }
            if (p1 !== p2) { msg.textContent = 'الرمزان غير متطابقين.'; msg.style.color = 'var(--bad)'; return; }
            b.disabled = true;
            Dev.set('role', 'coach');
            if (st.mode === 'have') { await Views.linkFamily(code); } else { Dev.set('fam', code); }
            const c = Coach.get();
            if (st.mode === 'have' && c.pin) { if (!(await CoachUI.checkPin(p1))) { msg.textContent = 'هذا الرمز مسجّل برمز مدرب مختلف. اكتب رمز المدرب القديم.'; msg.style.color = 'var(--bad)'; b.disabled = false; return; } }
            else await CoachUI.setPin(p1);
            Sync.start(); Sync.schedule(true);
            CoachUI.open = true; CoachUI.sst = null; Snd.win(); confetti(60);
            App.go('coach');
          }
        });
      }
    };
  },

  view(r, D) {
    const d = Dev.get(), c = Coach.get();
    const isCoachDev = d.role === 'coach';
    if (!CoachUI.open && !(isCoachDev && d.coachUntil > now())) return CoachUI.pinScreen(!c.pin);
    const tabs = [['day', 'الأيام'], ['prog', 'التقدّم'], ['ctl', 'التحكّم'], ['msg', 'الرسائل والتحدي'], ['data', 'البيانات']];
    let h = '<div class="row" style="justify-content:space-between"><h1 style="margin:0">لوحة المدرب</h1><button class="btn sm sec" id="clk">' + ic('lock', 18) + 'قفل</button></div>';
    h += '<div class="ctabs">' + tabs.map(t => '<button data-ct="' + t[0] + '" aria-pressed="' + (CoachUI.tab === t[0]) + '">' + t[1] + '</button>').join('') + '</div>';
    h += CoachUI['t_' + CoachUI.tab](D);
    return { html: h, mount: CoachUI.mount };
  },
  pinScreen(noPin) {
    if (noPin) return {
      html: '<div class="card" style="margin-top:20px"><h2>لوحة المدرب لم تُجهّز بعد</h2><p>هذه اللوحة لأخيك الأكبر. إذا كنت المدرب، جهّزها الآن.</p><a class="btn" href="#/coachsetup">تجهيز المدرب</a></div>'
    };
    const st = { pin: '' };
    return {
      html: '<div class="pin">' + ic('lock', 44) + '<h2>أدخل رمز المدرب</h2><div class="dots" id="pdots">' + '<i></i>'.repeat(4) + '</div><div class="keys">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button data-n="' + n + '">' + n + '</button>').join('') + '<button data-n="x" aria-label="مسح">⌫</button><button data-n="0">0</button><button data-n="ok" aria-label="دخول">✓</button></div><p id="pm" class="muted"></p></div>',
      mount() {
        const paint = () => { $('#pdots').innerHTML = Array.from({ length: Math.max(4, st.pin.length) }, (_, i) => '<i class="' + (i < st.pin.length ? 'on' : '') + '"></i>').join(''); };
        const tryIt = async () => { if (await CoachUI.checkPin(st.pin)) { CoachUI.open = true; if (Dev.get().role === 'coach') Dev.set('coachUntil', now() + 30 * 864e5); Snd.ok(); App.render(); } else if (st.pin.length >= 4) { $('#pm').textContent = 'الرمز غير صحيح'; Snd.bad(); st.pin = ''; paint(); } };
        $('.keys').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; const n = b.dataset.n; if (n === 'x') st.pin = st.pin.slice(0, -1); else if (n === 'ok') { tryIt(); return; } else if (st.pin.length < 8) st.pin += n; paint(); if (st.pin.length >= 4) tryIt(); };
      }
    };
  },
  mount() {
    $$('[data-ct]').forEach(b => b.onclick = () => { CoachUI.tab = b.dataset.ct; App.render(); });
    $('#clk').onclick = () => { CoachUI.open = false; Dev.set('coachUntil', 0); App.go(Dev.get().role === 'coach' ? 'coach' : 'map'); };
    const m = CoachUI['m_' + CoachUI.tab]; if (m) m();
  },

  /* ---- aggregations ---- */
  dayStats(k, day) {
    const devs = k.D[day] || {}; let s = 0; const tk = {}; let ty = 0, rx = 0;
    for (const dv in devs) { s += devs[dv].s || 0; Object.assign(tk, devs[dv].k || {}); ty = Math.max(ty, devs[dv].ty || 0); rx = Math.max(rx, devs[dv].rx || 0); }
    const evs = Object.values(k.E).filter(e => dayKey(e.t) === day).sort((a, b) => a.t - b.t);
    return { s, tk, ty, rx, evs };
  },
  lessonTitle(id) { const [u, l] = id.split('.'); const U = unitById(u); const L = U && U.lessons.find(x => x.id === l); return L ? L.title : id; },
  unitTitle(id) { const U = unitById(id); return U ? U.title : id; },

  t_day(D) {
    const k = Kid.get();
    const days = uniq(Object.keys(k.D).concat(Object.values(k.E).map(e => dayKey(e.t)))).sort().reverse();
    const day = CoachUI.day || days[0] || dayKey();
    const S = CoachUI.dayStats(k, day);
    const tot = Object.keys(k.D).reduce((a, d) => a + CoachUI.dayStats(k, d).s, 0);
    let h = '<div class="kpi"><div><b>' + D.xp + '</b>XP · ' + esc(RANKS[D.rank].n) + '</div><div><b>' + D.streak + '</b>سلسلة الأيام 🔥</div><div><b>' + Object.keys(D.lessonsDone).length + '</b>درساً أنهاه</div><div><b>' + Math.round(tot / 60) + '</b>دقيقة إجمالاً</div></div>';
    h += '<div class="card"><label><b>اختر اليوم:</b></label> <select class="inp" id="cday" style="width:auto">' + (days.length ? days : [day]).map(x => '<option value="' + x + '"' + (x === day ? ' selected' : '') + '>' + fmtDay(x) + (x === dayKey() ? ' (اليوم)' : '') + '</option>').join('') + '</select>';
    h += '<p style="margin:10px 0 4px">⏱️ الوقت في التطبيق: <b>' + fmtMin(S.s) + '</b></p>';
    h += '<p style="margin:4px 0">المهام اليومية: ' + [['typing', 'إحماء الأصابع'], ['lesson', 'درس/علم'], ['review', 'المراجعة']].map(t => (S.tk[t[0]] ? '✅ ' : '⬜ ') + t[1]).join(' · ') + '</p>';
    if (S.ty) h += '<p style="margin:4px 0">⚡ سرعة الكتابة: ' + S.ty + ' كلمة/دقيقة</p>';
    if (S.rx) h += '<p style="margin:4px 0">🧠 إجابات صحيحة في المراجعة: ' + S.rx + '</p>';
    h += '</div>';
    if (!S.evs.length) h += '<div class="card muted">لا نشاط مسجّل في هذا اليوم.</div>';
    else {
      h += '<table class="t"><thead><tr><th>الوقت</th><th>ما حدث</th><th>التفاصيل</th></tr></thead><tbody>';
      S.evs.forEach(e => {
        let what = '', det = '';
        if (e.k === 'lesson') { what = '✅ درس: ' + esc(e.n || CoachUI.lessonTitle(e.id)); det = '<small>' + esc(CoachUI.unitTitle(e.id.split('.')[0])) + '</small><br>' + fmtMin(e.s) + ' · ' + (e.tr ? '<span class="pill ' + (e.tr > 4 ? 'bad' : 'warn') + '">' + cnt(e.tr, ['خطأ واحد', 'خطآن', 'أخطاء', 'خطأً']) + '</span>' : '<span class="pill ok">بلا أخطاء</span>') + (e.h ? ' <span class="pill warn">طلب التبسيط/تلميح ×' + e.h + '</span>' : ''); }
        else if (e.k === 'test') { what = (e.ok ? '🏅 نجح في' : '📝 حاول') + ' اختبار: ' + esc(CoachUI.unitTitle(e.id)); det = '<span class="pill ' + (e.ok ? 'ok' : 'bad') + '">' + e.sc + '%</span>'; }
        else if (e.k === 'medal') { what = '🎖️ ميدالية: ' + esc((MEDALS[e.id] || {}).n || e.id); }
        else if (e.k === 'ctf') { const ch = C.ctf.find(x => x.id === e.id); what = '🚩 علم: ' + esc(ch ? ch.title : e.id); det = (e.h ? cnt(e.h, F_HINT) : 'بلا تلميحات') + (e.tr ? ' · ' + cnt(e.tr, F_TRY) + ' خاطئة' : ''); }
        else if (e.k === 'typing') { what = '⚡ إحماء الأصابع'; det = e.wpm + ' كلمة/دقيقة'; }
        else if (e.k === 'weekly') { what = '🏆 أجاب عن تحدّي الأسبوع'; }
        else what = esc(e.k);
        h += '<tr><td class="mono" style="white-space:nowrap">' + fmtTime(e.t) + '</td><td>' + what + '</td><td>' + det + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    return h;
  },
  m_day() { const s = $('#cday'); if (s) s.onchange = () => { CoachUI.day = s.value; App.render(); }; },

  t_prog(D) {
    const k = Kid.get();
    let h = '<table class="t"><thead><tr><th>الوحدة</th><th>الدروس</th><th>الاختبار</th><th>صعوبة</th></tr></thead><tbody>';
    const weak = {};
    C.units.concat(C.final ? [C.final] : []).forEach(u => {
      const s = D.st[u.id]; let tr = 0, hn = 0, secs = 0;
      u.lessons.forEach(l => { const L = k.L[u.id + '.' + l.id]; if (L) { tr += L.t || 0; hn += L.h || 0; secs += L.s || 0; (L.w || []).forEach(t => weak[t] = (weak[t] || 0) + 1); } });
      const T = k.T[u.id]; const atts = T ? Object.values(T.a || {}) : []; atts.forEach(a => (a.w || []).forEach(t => weak[t] = (weak[t] || 0) + 1));
      const fails = atts.filter(a => a.sc < 80).length;
      const hard = tr + hn * 2 + fails * 4; const lvl = hard > 25 ? 'bad' : hard > 10 ? 'warn' : 'ok';
      h += '<tr><td><b>' + u.icon + ' ' + esc(u.title) + '</b>' + (s && !s.open ? ' <span class="pill">🔒</span>' : '') + '<br><small class="muted">' + fmtMin(secs) + '</small></td><td>' + (s ? s.ld + '/' + s.total : '-') + '</td><td>' + (u.id === 'final' ? (k.X.final ? '✅' : '-') : T ? '<span class="pill ' + (T.p ? 'ok' : 'bad') + '">' + (T.b || 0) + '%</span><br><small>' + cnt(atts.length, F_TRY) + '</small>' : '-') + '</td><td>' + (tr || hn || fails ? '<span class="pill ' + lvl + '">' + tr + ' خطأ · ' + hn + ' تلميح' + (fails ? ' · ' + fails + ' رسوب' : '') + '</span>' : '-') + '</td></tr>';
    });
    h += '</tbody></table>';
    const wk = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 10);
    h += '<div class="sec-h"><h2>الأفكار التي يتعثّر فيها</h2></div><div class="card">' + (wk.length ? wk.map(([t, n]) => '<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding:4px 0"><span>' + esc(t) + '</span><span class="pill ' + (n > 4 ? 'bad' : 'warn') + '">' + n + '</span></div>').join('') : '<p class="muted">لا تعثّرات ملحوظة حتى الآن 👍</p>') + '</div>';
    if (C.ctf.length) {
      h += '<div class="sec-h"><h2>الأعلام</h2></div><table class="t"><tbody>' + C.ctf.map(ch => { const x = k.C[ch.id]; return '<tr><td>' + esc(ch.title) + '</td><td>' + (x && x.d ? '✅' : x ? '⏳' : '-') + '</td><td>' + (x ? (x.t ? cnt(x.t, F_TRY) + ' خاطئة · ' : '') + (x.h ? cnt(x.h, F_HINT) : '') : '') + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    return h;
  },

  t_ctl(D) {
    const c = Coach.get();
    const opt = (id, cur) => '<select class="inp" data-u="' + id + '" style="width:auto;padding:4px 8px">' + [['', 'تلقائي'], ['open', 'مفتوحة'], ['lock', 'مقفلة']].map(o => '<option value="' + o[0] + '"' + ((cur || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>';
    let h = '<p class="muted">«تلقائي» = تُفتح عندما ينجح في اختبار الوحدة السابقة بـ 80%.</p><table class="t"><tbody>';
    C.units.forEach(u => { h += '<tr><td>' + u.icon + ' ' + esc(u.title) + '</td><td>' + (D.st[u.id].open ? '🔓' : '🔒') + '</td><td>' + opt(u.id, c.U[u.id] && c.U[u.id].m) + '</td></tr>'; });
    if (C.final) h += '<tr><td>⭐ ' + esc(C.final.title) + '</td><td>' + (D.st.final.open ? '🔓' : '🔒') + '</td><td>' + opt('final', c.U.final && c.U.final.m) + '</td></tr>';
    h += '<tr><td>🚩 المرحلة الثانية (الأعلام)</td><td>' + (D.stage2 ? '🔓' : '🔒') + '</td><td><select class="inp" id="cs2" style="width:auto;padding:4px 8px">' + [['', 'تلقائي'], ['open', 'مفتوحة'], ['lock', 'مقفلة']].map(o => '<option value="' + o[0] + '"' + (((c.ctfU && c.ctfU.m) || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></td></tr>';
    h += '</tbody></table>';
    h += '<div class="card"><h3 style="margin-top:0">معاينة</h3><p class="muted">تصفّح التطبيق كما يراه أخوك، دون أن يُسجَّل شيء.</p><button class="btn sec" id="cprev">' + ic('eye', 20) + 'معاينة كأخي</button> <button class="btn sec" id="cpg">🎁 معاينة هدية الرتبة</button> <button class="btn sec" id="cps2">🌙 معاينة دخول المرحلة الثانية</button></div>';
    return h;
  },
  m_ctl() {
    $$('[data-u]').forEach(s => s.onchange = () => { const c = Coach.get(); c.U[s.dataset.u] = { m: s.value, u: now() }; Coach.save(); toast('تم الحفظ ✅'); App.render(); });
    $('#cs2').onchange = e => { const c = Coach.get(); c.ctfU = { m: e.target.value, u: now() }; Coach.save(); toast('تم الحفظ ✅'); App.render(); };
    $('#cprev').onclick = () => { App.preview = true; App.go('map'); };
    $('#cpg').onclick = () => { const s = Dev.get().seen; const keep = s ? JSON.stringify(s) : null; App.showCele(['rank', Math.min(6, App.derive().rank + 1)]); const fix = setInterval(() => { if (!App.celeOn) { clearInterval(fix); const d = Dev.get(); d.seen = keep ? JSON.parse(keep) : null; Dev.save(); App.render(); } }, 300); };
    $('#cps2').onclick = () => { const s = Dev.get().seen; const keep = s ? JSON.stringify(s) : null; App.showCele(['stage2']); const fix = setInterval(() => { if (!App.celeOn) { clearInterval(fix); const d = Dev.get(); d.seen = keep ? JSON.parse(keep) : null; Dev.save(); delete document.documentElement.dataset.stage; App.go('coach'); } }, 300); };
  },

  t_msg() {
    const c = Coach.get(), k = Kid.get();
    let h = '<div class="card"><h3 style="margin-top:0">💬 رسالة تشجيع</h3><p class="muted">تظهر له كنافذة عندما يفتح التطبيق.</p><textarea class="inp" id="cmx" rows="3" placeholder="مثلاً: فخور بك يا بطل! أكمل هكذا 💪"></textarea><button class="btn" id="cms" style="margin-top:8px">أرسل</button></div>';
    const ms = Object.entries(c.msgs || {}).sort((a, b) => b[1].t - a[1].t);
    if (ms.length) h += '<table class="t"><tbody>' + ms.slice(0, 15).map(([id, m]) => '<tr><td class="mono" style="white-space:nowrap">' + fmtDay(dayKey(m.t)) + '</td><td style="white-space:pre-wrap">' + esc(m.x) + '</td><td>' + (k.MR[id] ? '<span class="pill ok">قرأها</span>' : '<span class="pill">لم تُقرأ</span>') + '</td></tr>').join('') + '</tbody></table>';
    h += '<div class="card"><h3 style="margin-top:0">🏆 تحدّي الأسبوع</h3><p class="muted">اكتب تحدياً خاصاً، مثل: «اكتب برنامج Python يطبع جدول الضرب للرقم 7» أو «اشرح لي بصوتك كيف يعمل DNS».</p><input class="inp" id="cwt" placeholder="العنوان" value="' + esc(c.wk ? c.wk.title : '') + '"><textarea class="inp" id="cwb" rows="4" style="margin-top:8px" placeholder="التفاصيل">' + esc(c.wk ? c.wk.body : '') + '</textarea><div class="row" style="margin-top:8px"><button class="btn gold" id="cwn">نشر كتحدٍّ جديد</button>' + (c.wk ? '<button class="btn sec" id="cwx">إخفاء التحدي</button>' : '') + '</div></div>';
    const hist = Object.values(c.wkh || {}).sort((a, b) => b.u - a.u);
    if (hist.length) h += '<div class="sec-h"><h2>الإجابات</h2></div>' + hist.slice(0, 10).map(w => { const a = k.W[w.id]; return '<div class="card"><b>' + esc(w.title) + '</b> <small class="muted">' + fmtDay(dayKey(w.u)) + '</small><p style="white-space:pre-wrap;margin:6px 0">' + (a ? '✅ ' + esc(a.ans) : '<span class="muted">لم يجب بعد</span>') + '</p></div>'; }).join('');
    return h;
  },
  m_msg() {
    $('#cms').onclick = () => { const x = $('#cmx').value.trim(); if (!x) return; const c = Coach.get(); c.msgs[rid(8)] = { t: now(), x }; Coach.save(); toast('أُرسلت ✅'); App.render(); };
    $('#cwn').onclick = () => { const t = $('#cwt').value.trim(), b = $('#cwb').value.trim(); if (!t) { toast('اكتب عنواناً'); return; } const c = Coach.get(); const w = { id: rid(8), title: t, body: b, u: now() }; c.wk = w; c.wkh[w.id] = w; Coach.save(); toast('نُشر التحدي ✅'); App.render(); };
    const x = $('#cwx'); if (x) x.onclick = () => { const c = Coach.get(); c.wk = { id: '', title: '', body: '', u: now() }; Coach.save(); App.render(); };
  },

  t_data() {
    const d = Dev.get();
    let h = '<div class="card"><h3 style="margin-top:0">🔗 رمز الربط</h3><div class="big-num mono" style="direction:ltr;font-size:1.6em">' + esc(d.fam || 'غير مربوط') + '</div><p>الحالة: <b>' + ({ local: 'على هذا الجهاز فقط', wait: 'جارٍ الاتصال', on: 'متصل ✅', fail: 'تعذّر الاتصال' }[Sync.status()]) + '</b></p><p class="muted">على جهاز أخيك: ملفي ← الإعدادات ← رمز الربط.</p></div>';
    h += '<div class="card"><h3 style="margin-top:0">💾 نسخة احتياطية</h3><p class="muted">ملف فيه كل تقدّمه. احفظه عندك من حين لآخر. الاستيراد <b>يدمج</b> ولا يحذف شيئاً.</p><div class="row"><button class="btn" id="cexp">' + ic('dl', 20) + 'تنزيل نسخة</button><label class="btn sec" style="cursor:pointer">استيراد نسخة<input type="file" id="cimp" accept=".json,application/json" hidden></label></div></div>';
    h += '<div class="card"><h3 style="margin-top:0">🔑 تغيير رمز المدرب</h3><input class="inp mono" id="cnp" dir="ltr" type="password" inputmode="numeric" maxlength="8" placeholder="الرمز الجديد"><button class="btn sec" id="cnps" style="margin-top:8px">حفظ</button></div>';
    h += '<div class="card"><h3 style="margin-top:0">📱 هذا الجهاز</h3><p>نوعه: <b>' + (d.role === 'coach' ? 'جهاز المدرب (لا يُسجَّل عليه وقت)' : 'جهاز أخي') + '</b></p><button class="btn sec" id="crole">' + (d.role === 'coach' ? 'اجعله جهاز أخي' : 'اجعله جهاز المدرب') + '</button></div>';
    return h;
  },
  m_data() {
    $('#cexp').onclick = () => { const blob = new Blob([JSON.stringify({ app: 'oqab', v: SCHEMA, at: new Date().toISOString(), kid: Kid.get(), coach: Coach.get() }, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'oqab-backup-' + dayKey() + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('تم التنزيل ✅'); };
    $('#cimp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); if (j.app !== 'oqab') throw 0; Kid.mergeIn(j.kid); Coach.mergeIn(j.coach); Kid.save(); Coach.save(); toast('تم الدمج ✅'); App.render(); } catch (x) { toast('الملف غير صالح'); } };
    $('#cnps').onclick = async () => { const p = $('#cnp').value.trim(); if (!/^\d{4,8}$/.test(p)) { toast('من 4 إلى 8 أرقام'); return; } await CoachUI.setPin(p); toast('تم تغيير الرمز ✅'); $('#cnp').value = ''; };
    $('#crole').onclick = () => { const d = Dev.get(); Dev.set('role', d.role === 'coach' ? 'kid' : 'coach'); if (d.role === 'kid') { CoachUI.open = false; Dev.set('coachUntil', 0); } App.render(); };
  }
};
