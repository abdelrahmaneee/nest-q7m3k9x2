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
    const c = Coach.get();
    if (!CoachUI.open) return CoachUI.pinScreen(!c.pin);
    const ps = Prof.list();
    if (!CoachUI.sel || (CoachUI.sel !== '*' && !Prof.one(CoachUI.sel))) CoachUI.sel = ps[0] ? ps[0].id : null;
    const tabs = [['day', 'الأيام'], ['prog', 'التقدّم'], ['ctl', 'التحكّم'], ['msg', 'الرسائل والتحدي'], ['ply', 'اللاعبون'], ['data', 'البيانات']];
    let h = '<div class="row" style="justify-content:space-between;margin-top:10px"><h1 style="margin:0">لوحة المدرب</h1><button class="btn sm sec" id="clk">' + ic('lock', 18) + 'قفل</button></div><p class="muted" style="margin:0;font-size:.85em">تُقفل وحدها عند الخروج منها أو بعد 3 دقائق بلا نشاط.</p>';
    h += '<div class="ctabs">' + tabs.map(t => '<button data-ct="' + t[0] + '" aria-pressed="' + (CoachUI.tab === t[0]) + '">' + t[1] + '</button>').join('') + '</div>';
    if (['day', 'prog', 'ctl'].includes(CoachUI.tab)) {
      if (!ps.length) return { html: h + '<div class="card">لا يوجد لاعبون بعد. أضف أخويك من تبويب «اللاعبون»، أو يضيف كل واحد منهما حسابه من جهازه.</div>', mount: CoachUI.mount };
      const opts = (CoachUI.tab === 'ctl' ? [['*', 'الجميع']] : []).concat(ps.map(p => [p.id, p.name]));
      if (CoachUI.tab !== 'ctl' && CoachUI.sel === '*') CoachUI.sel = ps[0].id;
      h += '<div class="ctabs" style="margin-top:0">' + opts.map(o => '<button data-ks="' + o[0] + '" aria-pressed="' + (CoachUI.sel === o[0]) + '" style="border-style:dashed">' + (o[0] === '*' ? '👥 ' : '🧒 ') + esc(o[1]) + '</button>').join('') + '</div>';
    }
    h += CoachUI['t_' + CoachUI.tab](D);
    return { html: h, mount: CoachUI.mount };
  },
  pinScreen(noPin) {
    if (noPin) return {
      html: '<div class="card" style="margin-top:20px"><h2>لوحة المدرب لم تُجهّز بعد</h2><p>هذه اللوحة لأخيك الأكبر. إذا كنت المدرب، جهّزها الآن.</p><a class="btn" href="#/coachsetup">تجهيز المدرب</a></div>'
    };
    const st = { pin: '', busy: false };
    const isCoachDev = Dev.get().role === 'coach';
    return {
      html: '<div class="pin">' + ic('lock', 44) + '<h2>أدخل رمز المدرب</h2>' + (isCoachDev ? '<p class="muted" style="margin:0;font-size:.85em">هذا جهاز المدرب. اللوحة تُقفل وحدها لحماية بيانات أخويك.</p>' : '') + '<div class="dots" id="pdots">' + '<i></i>'.repeat(4) + '</div><div class="keys">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<button data-n="' + n + '">' + n + '</button>').join('') + '<button data-n="x" aria-label="مسح">⌫</button><button data-n="0">0</button><button data-n="ok" aria-label="دخول">✓</button></div><p id="pm" class="muted">اكتب الرمز ثم اضغط ✓</p>' +
        (isCoachDev ? '<button class="btn sm sec" id="pforgot" style="margin-top:6px">نسيت الرمز؟</button>' : '<a class="btn sm sec" href="#/who" style="margin-top:6px">رجوع لشاشة اللاعبين</a>') + '</div>',
      mount() {
        const paint = () => { $('#pdots').innerHTML = Array.from({ length: Math.max(4, st.pin.length) }, (_, i) => '<i class="' + (i < st.pin.length ? 'on' : '') + '"></i>').join(''); };
        const ok = () => { CoachUI.open = true; App.lastAct = now(); Snd.ok(); App.render(); };
        // silent check while typing (supports 4–8 digits); errors only when ✓ is pressed or 8 digits are typed
        const tryIt = async (final) => {
          if (st.busy) return; st.busy = true; const good = await CoachUI.checkPin(st.pin); st.busy = false;
          if (good) return ok();
          if (final) { $('#pm').textContent = 'الرمز غير صحيح'; $('#pm').style.color = 'var(--bad)'; Snd.bad(); st.pin = ''; paint(); }
        };
        $('.keys').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; const n = b.dataset.n; if (n === 'x') st.pin = st.pin.slice(0, -1); else if (n === 'ok') { if (st.pin.length) tryIt(true); return; } else if (st.pin.length < 8) st.pin += n; paint(); if (st.pin.length >= 4) tryIt(st.pin.length >= 8); };
        const kd = e => { if (!$('.keys')) { document.removeEventListener('keydown', kd); return; } if (/^[0-9]$/.test(e.key) && st.pin.length < 8) { st.pin += e.key; paint(); if (st.pin.length >= 4) tryIt(st.pin.length >= 8); } else if (e.key === 'Backspace') { st.pin = st.pin.slice(0, -1); paint(); } else if (e.key === 'Enter' && st.pin.length) tryIt(true); };
        document.addEventListener('keydown', kd);
        const fg = $('#pforgot'); if (fg) fg.onclick = () => {
          const m = modal('<h2>رمز مدرب جديد</h2><p class="muted">للتأكد أنك المدرب، اكتب <b>رمز الربط</b> الخاص بالعائلة، ثم الرمز الجديد.</p><input class="inp mono" id="rf" dir="ltr" placeholder="XXXX-XXXX-XXXX"><input class="inp mono" id="rp1" dir="ltr" type="password" inputmode="numeric" maxlength="8" placeholder="الرمز الجديد (4–8 أرقام)" style="margin-top:8px"><input class="inp mono" id="rp2" dir="ltr" type="password" inputmode="numeric" maxlength="8" placeholder="أعد كتابته" style="margin-top:8px"><p id="rm" style="color:var(--bad);font-weight:800;min-height:1.3em;margin:4px 0"></p><div class="row"><button class="btn" id="rok">حفظ</button><button class="btn sec" data-close>إلغاء</button></div>');
          $('#rok', m.el).onclick = async () => {
            const f = Views.normFam($('#rf', m.el).value || ''), p1 = $('#rp1', m.el).value.trim(), p2 = $('#rp2', m.el).value.trim();
            if (!f || f !== Dev.get().fam) { $('#rm', m.el).textContent = 'رمز الربط غير صحيح'; return; }
            if (!/^\d{4,8}$/.test(p1)) { $('#rm', m.el).textContent = 'من 4 إلى 8 أرقام'; return; }
            if (p1 !== p2) { $('#rm', m.el).textContent = 'غير متطابقين'; return; }
            await CoachUI.setPin(p1); m.close(); toast('تم تعيين الرمز الجديد ✅'); ok();
          };
        };
      }
    };
  },
  mount() {
    $$('[data-ct]').forEach(b => b.onclick = () => { CoachUI.tab = b.dataset.ct; App.render(); });
    $$('[data-ks]').forEach(b => b.onclick = () => { CoachUI.sel = b.dataset.ks; CoachUI.day = null; App.render(); });
    $('#clk').onclick = () => { CoachUI.open = false; App.go(Dev.get().role === 'coach' ? 'coach' : 'who'); App.render(); };
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
    const k = Kid.of(CoachUI.sel); D = App.derive(CoachUI.sel);
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
    const k = Kid.of(CoachUI.sel); D = App.derive(CoachUI.sel);
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
    const c = Coach.get(); const sc = CoachUI.sel; const one = sc !== '*';
    if (one) D = App.derive(sc);
    const cur = (uid) => { const x = c.U[sc] && c.U[sc][uid]; return x ? x.m : ''; };
    const opt = (id, v) => '<select class="inp" data-u="' + id + '" style="width:auto;padding:4px 8px">' + [['', one ? 'حسب «الجميع» / تلقائي' : 'تلقائي'], ['open', 'مفتوحة'], ['lock', 'مقفلة']].map(o => '<option value="' + o[0] + '"' + ((v || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>';
    let h = '<p class="muted">«تلقائي» = تُفتح عندما ينجح في اختبار الوحدة السابقة بـ 80%. إعداد اللاعب الواحد يغلب إعداد «الجميع» إذا كان أحدث.</p><table class="t"><tbody>';
    C.units.forEach(u => { h += '<tr><td>' + u.icon + ' ' + esc(u.title) + '</td><td>' + (one ? (D.st[u.id].open ? '🔓' : '🔒') : '') + '</td><td>' + opt(u.id, cur(u.id)) + '</td></tr>'; });
    if (C.final) h += '<tr><td>⭐ ' + esc(C.final.title) + '</td><td>' + (one ? (D.st.final.open ? '🔓' : '🔒') : '') + '</td><td>' + opt('final', cur('final')) + '</td></tr>';
    const s2 = c.ctfU[sc] ? c.ctfU[sc].m : '';
    h += '<tr><td>🚩 المرحلة الثانية (الأعلام)</td><td>' + (one ? (D.stage2 ? '🔓' : '🔒') : '') + '</td><td><select class="inp" id="cs2" style="width:auto;padding:4px 8px">' + [['', one ? 'حسب «الجميع» / تلقائي' : 'تلقائي'], ['open', 'مفتوحة'], ['lock', 'مقفلة']].map(o => '<option value="' + o[0] + '"' + (s2 === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></td></tr></tbody></table>';
    h += '<div class="card"><h3 style="margin-top:0">معاينة</h3><p class="muted">تصفّح التطبيق كما يراه ' + (one ? esc(Prof.one(sc).name) : 'أخوك') + '، دون أن يُسجَّل شيء.</p>' + (one ? '<button class="btn sec" id="cprev">' + ic('eye', 20) + 'معاينة كـ' + esc(Prof.one(sc).name) + '</button> ' : '') + '<button class="btn sec" id="cpg">🎁 هدية الرتبة</button> <button class="btn sec" id="cpc">👑 تاج بطل الأسبوع</button> <button class="btn sec" id="cps2">🌙 دخول المرحلة الثانية</button></div>';
    return h;
  },
  m_ctl() {
    const sc = CoachUI.sel;
    $$('[data-u]').forEach(s => s.onchange = () => { const c = Coach.get(); c.U[sc] = c.U[sc] || {}; c.U[sc][s.dataset.u] = { m: s.value, u: now() }; Coach.save(); toast('تم الحفظ ✅'); App.render(); });
    $('#cs2').onchange = e => { const c = Coach.get(); c.ctfU[sc] = { m: e.target.value, u: now() }; Coach.save(); toast('تم الحفظ ✅'); App.render(); };
    const pv = $('#cprev'); if (pv) pv.onclick = () => App.startPreview(sc);
    $('#cpg').onclick = () => App.showCele(['rank', 3], true);
    $('#cpc').onclick = () => App.showCele(['crown', 1], true);
    $('#cps2').onclick = () => App.showCele(['stage2'], true);
  },

  t_msg() {
    const c = Coach.get(); const ps = Prof.list();
    const tgt = id => '<select class="inp" id="' + id + '" style="width:auto;padding:4px 8px"><option value="*">للجميع 👥</option>' + ps.map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select>';
    const nm = to => !to || to === '*' ? 'الجميع' : ((Prof.one(to) || {}).name || '?');
    let h = '<div class="card"><h3 style="margin-top:0">💬 رسالة تشجيع</h3><p class="muted">تظهر كنافذة عندما يفتح التطبيق.</p><textarea class="inp" id="cmx" rows="3" placeholder="مثلاً: فخور بك يا بطل! أكمل هكذا 💪"></textarea><div class="row" style="margin-top:8px"><span>إلى:</span>' + tgt('cmto') + '<button class="btn" id="cms">أرسل</button></div></div>';
    const ms = Object.entries(c.msgs || {}).sort((a, b) => b[1].t - a[1].t);
    if (ms.length) h += '<table class="t"><tbody>' + ms.slice(0, 15).map(([id, m]) => { const rcpt = (m.to && m.to !== '*' ? [Prof.one(m.to) && Object.assign({ id: m.to }, Prof.one(m.to))].filter(Boolean) : ps); return '<tr><td class="mono" style="white-space:nowrap">' + fmtDay(dayKey(m.t)) + '<br><small>إلى: ' + esc(nm(m.to)) + '</small></td><td style="white-space:pre-wrap">' + esc(m.x) + '</td><td>' + rcpt.map(p => '<span class="pill ' + (Kid.of(p.id).MR[id] ? 'ok' : '') + '">' + esc(p.name) + (Kid.of(p.id).MR[id] ? ' ✓' : '') + '</span>').join(' ') + '</td></tr>'; }).join('') + '</tbody></table>';
    h += '<div class="card"><h3 style="margin-top:0">🏆 تحدّي الأسبوع</h3><p class="muted">اكتب تحدياً خاصاً، مثل: «اكتب برنامج Python يطبع جدول الضرب للرقم 7» أو «اشرح لي بصوتك كيف يعمل DNS».</p><input class="inp" id="cwt" placeholder="العنوان" value="' + esc(c.wk ? c.wk.title : '') + '"><textarea class="inp" id="cwb" rows="4" style="margin-top:8px" placeholder="التفاصيل">' + esc(c.wk ? c.wk.body : '') + '</textarea><div class="row" style="margin-top:8px"><span>إلى:</span>' + tgt('cwto') + '<button class="btn gold" id="cwn">نشر كتحدٍّ جديد</button>' + (c.wk && c.wk.title ? '<button class="btn sec" id="cwx">إخفاء التحدي</button>' : '') + '</div></div>';
    const hist = Object.values(c.wkh || {}).sort((a, b) => b.u - a.u);
    if (hist.length) h += '<div class="sec-h"><h2>الإجابات</h2></div>' + hist.slice(0, 10).map(w => '<div class="card"><b>' + esc(w.title) + '</b> <small class="muted">' + fmtDay(dayKey(w.u)) + ' · إلى: ' + esc(nm(w.to)) + '</small>' + ps.filter(p => !w.to || w.to === '*' || w.to === p.id).map(p => { const a = Kid.of(p.id).W[w.id]; return '<p style="white-space:pre-wrap;margin:6px 0"><b>' + esc(p.name) + ':</b> ' + (a ? '✅ ' + esc(a.ans) : '<span class="muted">لم يجب بعد</span>') + '</p>'; }).join('') + '</div>').join('');
    return h;
  },
  m_msg() {
    $('#cms').onclick = () => { const x = $('#cmx').value.trim(); if (!x) return; const c = Coach.get(); c.msgs[rid(8)] = { t: now(), x, to: $('#cmto').value }; Coach.save(); toast('أُرسلت ✅'); App.render(); };
    $('#cwn').onclick = () => { const t = $('#cwt').value.trim(), b = $('#cwb').value.trim(); if (!t) { toast('اكتب عنواناً'); return; } const c = Coach.get(); const w = { id: rid(8), title: t, body: b, to: $('#cwto').value, u: now() }; c.wk = w; c.wkh[w.id] = w; Coach.save(); toast('نُشر التحدي ✅'); App.render(); };
    const x = $('#cwx'); if (x) x.onclick = () => { const c = Coach.get(); c.wk = { id: '', title: '', body: '', u: now() }; Coach.save(); App.render(); };
  },

  t_ply() {
    const ps = Prof.list(); const c = Coach.get(); const goal = (c.goal && c.goal.n) || 400;
    let h = '<div class="card"><h3 style="margin-top:0">🧒 اللاعبون</h3><p class="muted">كل لاعب له اسم وكلمة مرور بسيطة. تُحفظ كلمة المرور في قاعدة البيانات <b>مشفّرة كبصمة (Hash)</b>، ولا يمكن لأحد قراءتها، ولا تظهر في كود الموقع.</p>' +
      (ps.length ? '<table class="t"><tbody>' + ps.map(p => { const D = App.derive(p.id); return '<tr><td>' + Art.eagle('happy', D.rank, false, App.lookOf(Kid.of(p.id), false)).replace('class="eagle"', 'class="eagle" style="width:44px;vertical-align:middle"') + ' <b>' + esc(p.name) + '</b><br><small class="muted">' + esc(RANKS[D.rank].n) + ' · <bdi>' + D.xp + ' XP</bdi></small></td><td><button class="btn sm sec" data-ren="' + p.id + '">تغيير الاسم</button> <button class="btn sm sec" data-pw="' + p.id + '">كلمة مرور جديدة</button></td></tr>'; }).join('') + '</tbody></table>' : '<p>لا يوجد لاعبون بعد.</p>') +
      (Prof.freeId() && ps.length < 4 ? '<button class="btn" id="cadd" style="margin-top:8px">＋ إضافة لاعب</button>' : '') + '</div>';
    h += '<div class="card"><h3 style="margin-top:0">🤝 هدف الإخوة المشترك (أسبوعياً)</h3><p class="muted">إذا جمعوا معاً هذا العدد من النقاط في الأسبوع، يحصل كل من شارك على +30 XP. يشجّعهم على التعاون لا التنافس فقط.</p><div class="row"><input class="inp mono" id="cgoal" type="number" min="100" step="50" value="' + goal + '" style="width:140px"><button class="btn sec" id="cgs">حفظ</button>' + (ps.length > 1 ? '<a class="btn sec" href="#/league" id="clg">🏆 لوحة الأبطال</a>' : '') + '</div></div>';
    return h;
  },
  m_ply() {
    const ask = (title, fields, cb) => { const m = modal('<h2>' + title + '</h2>' + fields.map((f, i) => '<input class="inp" id="mf' + i + '" ' + (f.pw ? 'type="password" autocomplete="new-password"' : '') + ' placeholder="' + esc(f.ph) + '" style="margin:6px 0">').join('') + '<p id="mfm" style="color:var(--bad);font-weight:800;min-height:1.3em;margin:0"></p><div class="row"><button class="btn" id="mfok">حفظ</button><button class="btn sec" data-close>إلغاء</button></div>'); $('#mfok', m.el).onclick = async () => { const v = fields.map((f, i) => $('#mf' + i, m.el).value.trim()); const err = await cb(v); if (err) $('#mfm', m.el).textContent = err; else { m.close(); toast('تم ✅'); App.render(); } }; };
    $$('[data-ren]').forEach(b => b.onclick = () => ask('تغيير الاسم', [{ ph: 'الاسم الجديد' }], async v => { if (!v[0]) return 'اكتب اسماً'; Prof.set(b.dataset.ren, { name: v[0] }); const k = Kid.of(b.dataset.ren); k.name = v[0]; k.nameU = now(); Kid.mergeInto(b.dataset.ren, k); Sync.schedule(); }));
    $$('[data-pw]').forEach(b => b.onclick = () => ask('كلمة مرور جديدة لـ' + esc(Prof.one(b.dataset.pw).name), [{ ph: 'كلمة المرور الجديدة', pw: 1 }, { ph: 'أعد كتابتها', pw: 1 }], async v => { if (v[0].length < 4) return '4 أحرف على الأقل'; if (v[0] !== v[1]) return 'غير متطابقتين'; await Prof.setPw(b.dataset.pw, v[0]); }));
    const ad = $('#cadd'); if (ad) ad.onclick = () => ask('لاعب جديد', [{ ph: 'الاسم' }, { ph: 'كلمة المرور', pw: 1 }, { ph: 'أعد كتابتها', pw: 1 }], async v => { if (!v[0]) return 'اكتب اسماً'; if (Prof.list().some(p => p.name === v[0])) return 'الاسم موجود'; if (v[1].length < 4) return 'كلمة المرور: 4 أحرف على الأقل'; if (v[1] !== v[2]) return 'غير متطابقتين'; const id = await Prof.create(v[0], v[1]); if (!id) return 'لا يوجد مكان'; const k = Kid.of(id); k.name = v[0]; k.nameU = now(); Kid.mergeInto(id, k); Sync.schedule(); });
    $('#cgs').onclick = () => { const n = Math.max(100, +$('#cgoal').value || 400); const c = Coach.get(); c.goal = { n, u: now() }; Coach.save(); toast('تم الحفظ ✅'); };
    const lg = $('#clg'); if (lg) lg.onclick = e => { e.preventDefault(); const ps = Prof.list(); App.startPreview(ps[0].id); App.go('league'); };
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
    $('#cexp').onclick = () => { const blob = new Blob([JSON.stringify({ app: 'oqab', v: SCHEMA, at: new Date().toISOString(), prof: Prof.get(), kids: Object.fromEntries(Object.keys(Prof.get().list).map(id => [id, Kid.of(id)])), coach: Coach.get() }, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'oqab-backup-' + dayKey() + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('تم التنزيل ✅'); };
    $('#cimp').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); if (j.app !== 'oqab') throw 0; if (j.prof) Prof.mergeIn(j.prof); if (j.kids) Object.keys(j.kids).forEach(id => Kid.mergeInto(id, j.kids[id])); if (j.kid) { const f = Prof.list()[0]; if (f) Kid.mergeInto(f.id, j.kid); } if (j.coach) Coach.mergeIn(j.coach); Coach.save(); Sync.schedule(); toast('تم الدمج ✅'); App.render(); } catch (x) { toast('الملف غير صالح'); } };
    $('#cnps').onclick = async () => { const p = $('#cnp').value.trim(); if (!/^\d{4,8}$/.test(p)) { toast('من 4 إلى 8 أرقام'); return; } await CoachUI.setPin(p); toast('تم تغيير الرمز ✅'); $('#cnp').value = ''; };
    $('#crole').onclick = () => { const d = Dev.get(); Dev.set('role', d.role === 'coach' ? 'kid' : 'coach');  App.render(); };
  }
};
