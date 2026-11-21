/* ===== عُقاب — «اطلب المساعدة من أخيك»: زر دائم للاعب، وصندوق طلبات في لوحة المدرب ===== */
'use strict';
const Help = {
  KINDS: { u: ['🤔', 'لم أفهم الشرح'], b: ['🐞', 'شيء لا يعمل'], s: ['😕', 'علقت ولا أعرف ماذا أفعل'], o: ['💬', 'شيء آخر'] },
  QUICK: ['رأيت سؤالك، سآتي إليك الآن 🏃', 'أكمل الدرس، وسنراجع هذه النقطة معاً الليلة 🌙', 'اقرأ زر «اشرح لي بطريقة أبسط» أولاً، ثم أخبرني 💡', 'أحسنت أنك سألت! 👏'],
  PAGES: { map: 'خريطة الرحلة', today: 'مهام اليوم', review: 'المراجعة', typing: 'تدريب الكتابة', glossary: 'القاموس', me: 'ملفي', look: 'خزانتي', league: 'المنافسة', ctf: 'صفحة الأعلام', next: 'الخطوة التالية', weekly: 'التحدي الأسبوعي' },
  hidden: ['who', 'newplayer', 'coach', 'coachsetup'],

  /* ---------- where is the player right now? ---------- */
  where() {
    const r = App.route || [], o = { r: r.slice(0, 3), i: null, w: '', x: '' };
    const strip = t => String(t || '').replace(/\[\[([a-z0-9_]+)(\|([^\]]+))?\]\]/g, (m, k, _, sh) => sh || (C.terms[k] ? C.terms[k].ar : k)).replace(/[*`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 170);
    const step = s => s && strip(s.m || s.q || (s.w && s.w.goalText) || '');
    if (r[0] === 'lesson' && Lesson.cur) { const L = Lesson.cur; o.i = L.i; o.w = L.u.title + ' › ' + L.l.title + ' › الخطوة ' + (L.i + 1) + ' من ' + L.steps.length; o.x = step(L.steps[L.i]); }
    else if (r[0] === 'test' && Test.cur) { const T = Test.cur; o.i = T.i; o.w = 'اختبار إتقان: ' + T.u.title + ' › السؤال ' + (T.i + 1) + ' من ' + T.qs.length; o.x = step(T.qs[T.i] && T.qs[T.i].s); }
    else if (r[0] === 'ctfc') { const ch = C.ctf.find(c => c.id === r[1]); o.w = 'تحدي العلم: ' + (ch ? ch.title : r[1]); o.x = ch ? strip(ch.story) : ''; }
    else if (r[0] === 'unit') { const u = C.units.find(x => x.id === r[1]); o.w = 'صفحة الوحدة: ' + (u ? u.title : r[1]); }
    else o.w = Help.PAGES[r[0]] || 'الصفحة الرئيسية';
    return o;
  },
  mine() { const k = Kid.get(); return Object.entries(k.HQ || {}).map(([id, q]) => Object.assign({ id }, q)).sort((a, b) => b.t - a.t); },
  ans(pid, id) { return (Coach.get().HA || {})[pid + '.' + id] || null; },
  open(pid, q) { const a = Help.ans(pid, q.id); return !q.c && !(a && a.s === 'done'); },

  /* ---------- the always-visible button ---------- */
  paint() {
    let b = document.getElementById('helpbtn');
    const show = Kid.pid() && Kid.get().pledge && !App.preview && Kid.pid() !== 'demo' && !Help.hidden.includes((App.route || [])[0]);
    if (!show) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('button'); b.id = 'helpbtn'; b.type = 'button'; b.onclick = () => Help.dialog(); document.body.appendChild(b); }
    const pid = Kid.pid(), mine = Help.mine();
    const unread = mine.filter(q => { const a = Help.ans(pid, q.id); return a && a.r && (!q.rr || q.rr < a.u); }).length;
    const wait = mine.filter(q => Help.open(pid, q) && !(Help.ans(pid, q.id) || {}).r).length;
    b.className = unread ? 'hb-reply' : wait ? 'hb-wait' : '';
    /* inside a lesson/test the floating button could sit on top of «next»: dock it in the lesson header instead */
    const head = document.querySelector('.lhead');
    if (head) { b.classList.add('inhead'); if (b.parentNode !== head) head.appendChild(b); } else if (b.parentNode !== document.body) document.body.appendChild(b);
    b.innerHTML = unread ? '💬 <span>ردّ أخوك!</span>' : wait ? '⏳ <span>أخبرت أخاك</span>' : '🙋 <span>اطلب المساعدة</span>';
    b.setAttribute('aria-label', 'اطلب المساعدة من أخيك');
  },

  /* ---------- player: ask / see replies ---------- */
  dialog() {
    const pid = Kid.pid(), w = Help.where(), mine = Help.mine().slice(0, 6);
    let kind = 'u';
    const list = mine.map(q => {
      const a = Help.ans(pid, q.id) || {}, done = q.c || a.s === 'done';
      return '<div class="hq' + (done ? ' done' : '') + '"><div class="row" style="justify-content:space-between"><b>' + (Help.KINDS[q.k] || Help.KINDS.o)[0] + ' ' + esc(q.w) + '</b><small class="muted">' + Help.ago(q.t) + '</small></div>' + (q.n ? '<p style="margin:4px 0">«' + esc(q.n) + '»</p>' : '') +
        (a.r ? '<div class="feedback ok" style="margin:6px 0">💬 <b>ردّ أخيك:</b> ' + esc(a.r) + '</div>' : '') +
        '<small class="muted">' + (done ? '✅ انتهت' : a.r ? 'ردّ عليك' : a.s === 'seen' ? '👀 رآها أخوك' : '⏳ وصلت لأخيك') + '</small>' + (!done ? ' <button class="btn sm sec" data-hx="' + q.id + '" style="padding:2px 10px;min-height:0">انحلّت ✓</button>' : '') + '</div>';
    }).join('');
    const m = modal('<h2 style="margin-top:0">🙋 اطلب المساعدة من أخيك</h2>' +
      '<p class="muted" style="margin:0 0 6px">سيعرف أخوك <b>المكان بالضبط</b> الذي أنت فيه، فيفتحه ويساعدك:</p><div class="card" style="margin:0 0 10px;padding:8px 12px"><b>📍 ' + esc(w.w) + '</b></div>' +
      '<p style="margin:6px 0"><b>ما المشكلة؟</b></p><div class="grid2" id="hk">' + Object.entries(Help.KINDS).map(([k, v]) => '<button class="opt' + (k === kind ? ' sel' : '') + '" data-k="' + k + '" aria-pressed="' + (k === kind) + '">' + v[0] + ' ' + v[1] + '</button>').join('') + '</div>' +
      '<textarea class="inp" id="hn" rows="2" maxlength="200" placeholder="اكتب ما تريد أن تقوله لأخيك (اختياري)" style="margin-top:10px"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn" id="hs">أرسل لأخي 📨</button><button class="btn sec" data-close>إلغاء</button></div>' +
      (Kid.pid() === 'kt' ? '<p class="muted" style="font-size:.85em">🧪 حساب الاختبار: الطلب يظهر في لوحة المدرب على هذا الجهاز فقط.</p>' : '') +
      (list ? '<h3 style="margin:16px 0 6px">طلباتي</h3>' + list : ''));
    const el = m.el;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { kind = b.dataset.k; el.querySelectorAll('[data-k]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-pressed', x === b); }); Snd.click(); });
    el.querySelector('#hs').onclick = () => {
      const id = Kid.askHelp({ k: kind, n: el.querySelector('#hn').value.trim().slice(0, 200), w: w.w, x: w.x, r: w.r, i: w.i });
      m.close(); if (!id) return;
      Snd.ok(); modal('<div style="text-align:center"><div style="font-size:56px">📨</div><h2>وصل طلبك لأخيك!</h2><p>سيرى المكان الذي أنت فيه ويساعدك. يمكنك أن تكمل أو تنتظره قليلاً.</p><p class="muted">سؤالك يعني أنك تتعلّم بجدّ 💪</p><button class="btn" data-close>حسناً</button></div>');
      Help.paint();
    };
    el.querySelectorAll('[data-hx]').forEach(b => b.onclick = () => { Kid.helpEdit(b.dataset.hx, { c: now() }); m.close(); toast('رائع! انحلّت ✅'); Help.paint(); });
    // opening the dialog marks replies as read
    mine.forEach(q => { const a = Help.ans(pid, q.id); if (a && a.r && (!q.rr || q.rr < a.u)) Kid.helpEdit(q.id, { rr: now() }); });
  },
  /* pop up a new reply once (not in the middle of a lesson step) */
  checkReplies() {
    if (App.preview || App.celeOn || $('.modal') || !Kid.pid() || Kid.pid() === 'demo') return;
    if (['who', 'newplayer', 'coach', 'coachsetup'].includes(App.route[0])) return;
    const pid = Kid.pid(); const q = Help.mine().find(q => { const a = Help.ans(pid, q.id); return a && a.r && (!q.rr || q.rr < a.u); });
    if (!q) return; const a = Help.ans(pid, q.id);
    Snd.win(); Kid.helpEdit(q.id, { rr: now() });
    modal('<div style="text-align:center"><div style="font-size:52px">💬</div><h2 style="margin:4px 0">ردّ أخوك على سؤالك!</h2><p class="muted" style="margin:0">📍 ' + esc(q.w) + '</p><div class="feedback ok" style="font-size:1.1em;text-align:start">' + esc(a.r) + '</div><button class="btn" data-close>شكراً! 💙</button></div>');
  },

  /* ---------- coach side ---------- */
  players() { const ps = Prof.list().map(p => ({ id: p.id, name: p.name })); if (Object.keys(Kid.of('kt').HQ || {}).length) ps.push({ id: 'kt', name: 'المختبِر 🧪' }); return ps; },
  all() { const out = []; Help.players().forEach(p => { const k = Kid.of(p.id); Object.entries(k.HQ || {}).forEach(([id, q]) => out.push(Object.assign({ id, pid: p.id, name: p.name }, q))); }); return out.sort((a, b) => b.t - a.t); },
  pending() { return Help.all().filter(q => Help.open(q.pid, q)); },
  ago(t) { const m = Math.round((now() - t) / 60000); if (m < 1) return 'الآن'; if (m < 60) return 'قبل ' + m + ' دقيقة'; const h = Math.round(m / 60); if (h < 24) return 'قبل ' + h + ' ساعة'; return 'قبل ' + Math.round(h / 24) + ' يوم'; },
  coachTab() {
    const all = Help.all(), open = all.filter(q => Help.open(q.pid, q)), old = all.filter(q => !Help.open(q.pid, q)).slice(0, 12);
    const card = q => {
      const a = Help.ans(q.pid, q.id) || {}, isOpen = Help.open(q.pid, q), K = Help.KINDS[q.k] || Help.KINDS.o;
      return '<div class="card hq' + (isOpen ? ' new' : ' done') + '" data-q="' + q.pid + '.' + q.id + '"><div class="row" style="justify-content:space-between"><b>🧒 ' + esc(q.name) + ' · ' + K[0] + ' ' + K[1] + '</b><small class="muted">' + Help.ago(q.t) + '</small></div>' +
        '<p style="margin:6px 0"><b>📍 ' + esc(q.w) + '</b></p>' + (q.n ? '<p style="margin:4px 0;font-size:1.05em">«' + esc(q.n) + '»</p>' : '') +
        (q.x ? '<div class="hexv" style="white-space:pre-wrap;font-family:inherit;direction:rtl;text-align:start;font-size:.9em;margin:6px 0">' + esc(q.x) + '</div>' : '') +
        (a.r ? '<div class="feedback ok" style="margin:6px 0">💬 ردّك: ' + esc(a.r) + (q.rr && q.rr >= a.u ? ' <small>(قرأه ✓)</small>' : '') + '</div>' : '') +
        (q.c ? '<small class="muted">✅ قال إنها انحلّت</small>' : '') +
        (isOpen ? '<div class="row" style="margin-top:6px;gap:6px">' + (q.r && ['lesson', 'test', 'ctfc', 'unit'].includes(q.r[0]) ? '<button class="btn sm" data-hgo>👁️ افتح المكان نفسه</button>' : '') + '<button class="btn sm ok" data-hdone>✓ انحلّت</button></div>' +
          '<div class="row" style="margin-top:6px;gap:4px;flex-wrap:wrap">' + Help.QUICK.map((t, i) => '<button class="tag" data-hq="' + i + '" style="font-size:.85em">' + esc(t) + '</button>').join('') + '</div>' +
          '<div class="row" style="margin-top:6px"><input class="inp" data-hr style="flex:1" maxlength="300" placeholder="اكتب ردّاً يظهر له في التطبيق"><button class="btn sm" data-hsend>أرسل</button></div>' : '') + '</div>';
    };
    let h = '<div class="card" style="background:var(--warn-bg)"><b>🙋 طلبات المساعدة</b><p class="muted" style="margin:4px 0 0;font-size:.9em">عندما يضغط أحد أخويك «اطلب المساعدة» يصلك هنا المكان والخطوة بالضبط. افتح المكان نفسه لترى ما يراه (معاينة لا تغيّر تقدّمه)، ثم ردّ عليه أو علّمها «انحلّت».</p>' +
      ('Notification' in window ? (Notification.permission === 'granted' ? '<p class="muted" style="margin:6px 0 0;font-size:.85em">🔔 تنبيهات المتصفح مفعّلة على هذا الجهاز (تعمل ما دام التطبيق مفتوحاً في تبويب).</p>' : Notification.permission !== 'denied' ? '<button class="btn sm sec" id="hnotif" style="margin-top:6px">🔔 فعّل تنبيه المتصفح على هذا الجهاز</button>' : '') : '') + '</div>';
    h += open.length ? open.map(card).join('') : '<div class="card" style="text-align:center"><div style="font-size:44px">😌</div><b>لا توجد طلبات مفتوحة</b><p class="muted" style="margin:4px 0">أخواك يتقدّمان بلا مشاكل الآن.</p></div>';
    if (old.length) h += '<h3>السابقة</h3>' + old.map(card).join('');
    const errs = []; Help.players().forEach(p => Object.values(Kid.of(p.id).ER || {}).forEach(e => errs.push(Object.assign({ name: p.name }, e)))); errs.sort((a, b) => b.u - a.u);
    if (errs.length) h += '<details class="card"><summary><b>🐞 أخطاء تقنية ظهرت في التطبيق (' + errs.length + ')</b></summary><p class="muted" style="font-size:.85em">تُسجَّل تلقائياً. انسخها وأرسلها لمن يطوّر التطبيق ليصلحها.</p><pre class="hexv" id="errtxt" dir="ltr" style="white-space:pre-wrap;font-size:.8em">' + esc(errs.map(e => new Date(e.t).toISOString().slice(0, 16) + ' | ' + e.name + ' | ' + e.w + ' | ' + e.m + (e.n > 1 ? ' (x' + e.n + ')' : '') + (e.v ? ' | v' + e.v : '')).join('\n')) + '</pre><button class="btn sm sec" id="errcp">📋 انسخ</button></details>';
    return h;
  },
  mountCoach() {
    const ec = $('#errcp'); if (ec) ec.onclick = async () => { try { await navigator.clipboard.writeText($('#errtxt').textContent); toast('نُسخ ✅'); } catch (e) { toast('حدّد النص وانسخه يدوياً'); } };
    const nb = $('#hnotif'); if (nb) nb.onclick = async () => { try { await Notification.requestPermission(); } catch (e) { } App.render(); };
    document.querySelectorAll('.hq[data-q]').forEach(box => {
      const key = box.dataset.q, [pid, id] = key.split('.'); const q = (Kid.of(pid).HQ || {})[id]; if (!q) return;
      const a = Help.ans(pid, id); if (!a && Help.open(pid, Object.assign({ id }, q))) Coach.helpSet(key, { s: 'seen' });
      const send = t => { if (!t) return; Coach.helpSet(key, { r: t, s: 'replied' }); toast('أُرسل الرد ✅'); App.render(); };
      const g = box.querySelector('[data-hgo]'); if (g) g.onclick = () => { App.helpJump = q.i; App.startPreview(pid); App.go('/' + q.r.join('/')); };
      const d = box.querySelector('[data-hdone]'); if (d) d.onclick = () => { Coach.helpSet(key, { s: 'done' }); toast('✓ علّمتها منحلّة'); App.render(); };
      box.querySelectorAll('[data-hq]').forEach(b => b.onclick = () => send(Help.QUICK[+b.dataset.hq]));
      const s = box.querySelector('[data-hsend]'); if (s) s.onclick = () => send(box.querySelector('[data-hr]').value.trim());
    });
  },
  /* coach devices: announce new requests once */
  dock() { if (Help.mo) return; Help.mo = new MutationObserver(() => { const h = document.querySelector('.lhead'), b = document.getElementById('helpbtn'); if ((h && !(b && h.contains(b))) || (!h && b && b.parentNode !== document.body)) Help.paint(); }); Help.mo.observe(document.body, { childList: true, subtree: true }); },
  watch() {
    Help.dock(); Help.paint(); Help.checkReplies();
    const n = Dev.get().role === 'coach' ? Help.pending().length : 0; const dot = document.querySelector('#tabs .hdot'); if (dot) { dot.textContent = n; dot.hidden = !n; }
    if (Dev.get().role !== 'coach') return;
    const seen = Dev.get().hseen || {}; let fresh = null;
    Help.pending().forEach(q => { const k = q.pid + '.' + q.id; if (!seen[k]) { seen[k] = 1; fresh = fresh || q; } });
    if (!fresh) return; Dev.set('hseen', seen);
    if (now() - fresh.t > 6 * 3600e3) return; // old ones arriving after a long time offline: no noise
    Snd.fanfare(); toast('🙋 <b>' + esc(fresh.name) + '</b> يطلب مساعدتك<br><small>' + esc(fresh.w) + '</small>', 6000);
    try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('🙋 ' + fresh.name + ' يطلب مساعدتك', { body: fresh.w, tag: 'oqab-help' }); } catch (e) { }
  }
};
