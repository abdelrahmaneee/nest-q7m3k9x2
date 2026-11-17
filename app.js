/* ===== عُقاب — app: rules, router, views ===== */
'use strict';

const RANKS = [
  { n: 'مستكشف رقمي', x: 0 }, { n: 'متدرّب أمني', x: 300 }, { n: 'حارس الشبكة', x: 900 }, { n: 'محلّل أمني', x: 1800 },
  { n: 'صائد الثغرات', x: 3000 }, { n: 'هاكر أخلاقي', x: 4500 }, { n: 'خبير أمن سيبراني', x: 6500 }
];
const DOMAINS = { pc: ['الحاسوب', '#2F6BD8'], safe: ['الأمان الشخصي', '#14A37F'], term: ['الطرفية', '#334155'], py: ['البرمجة', '#9B6BFF'], net: ['الشبكات', '#0EA5E9'], web: ['الويب', '#F97316'], cry: ['التشفير', '#C27C00'], mind: ['التفكير الأمني', '#E04B4B'], for: ['التحقيق الرقمي', '#0F766E'], ctf: ['التحديات', '#16A34A'], algo: ['الخوارزميات', '#7C3AED'], linux: ['لينكس', '#475569'], db: ['قواعد البيانات', '#0891B2'], mal: ['البرمجيات الخبيثة', '#BE123C'], js: ['JavaScript', '#CA8A04'], team: ['المنافسة', '#DB2777'], gen: ['المثابرة', '#64748B'] };
const MEDALS = {
  binary: { n: 'لغة الآلة', ic: '🔢', d: 'pc', how: 'اكتب اسمك بالثنائي' },
  pcparts: { n: 'مهندس العتاد', ic: '🧩', d: 'pc', how: 'رتّب أجزاء الحاسوب كلها' },
  phish: { n: 'صائد التصيّد', ic: '🎣', d: 'safe', how: 'اكشف كل علامات الرسالة المزيّفة' },
  pwguard: { n: 'حارس كلمة المرور', ic: '🔐', d: 'safe', how: 'اصنع كلمة مرور قوية جداً' },
  term: { n: 'سيد الطرفية', ic: '⌨️', d: 'term', how: 'أنهِ مهمة الطرفية الكبرى' },
  firstcode: { n: 'أول سطر كود', ic: '🐍', d: 'py', how: 'شغّل أول برنامج لك' },
  loops: { n: 'صانع الحلقات', ic: '🔁', d: 'py', how: 'اكتب حلقة تكرار صحيحة' },
  funcs: { n: 'مهندس الدوال', ic: '🛠️', d: 'py', how: 'اصنع دالة تعمل' },
  postman: { n: 'ساعي البريد الرقمي', ic: '📮', d: 'net', how: 'أوصل الرسالة كاملة عبر الشبكة' },
  ports: { n: 'حارس المنافذ', ic: '🚪', d: 'net', how: 'أغلق المنافذ غير الضرورية' },
  dns: { n: 'مستكشف DNS', ic: '📖', d: 'net', how: 'اعثر على عناوين المواقع' },
  inspector: { n: 'مفتّش الكود', ic: '🔍', d: 'web', how: 'اعثر على السر داخل كود الصفحة' },
  caesar: { n: 'كاسر شيفرة قيصر', ic: '🏛️', d: 'cry', how: 'فكّ رسالة قيصر' },
  hash: { n: 'سيد الـHash', ic: '🧬', d: 'cry', how: 'اكتشف قوة البصمة' },
  keys: { n: 'حارس المفاتيح', ic: '🗝️', d: 'cry', how: 'أرسل رسالة بالمفتاح العام' },
  eagleeye: { n: 'عين العُقاب', ic: '🦅', d: 'mind', how: 'اكتشف كل نقاط الضعف في البيت' },
  detective: { n: 'محقّق رقمي', ic: '🕵️', d: 'for', how: 'احلّ قضية الخادم المخترَق' },
  grepper: { n: 'صيّاد الكلمات', ic: '🔦', d: 'term', how: 'ابحث بـ grep و find' },
  bugfix: { n: 'صيّاد الحشرات', ic: '🐛', d: 'py', how: 'أصلح 3 أخطاء برمجية' },
  counter: { n: 'عدّاد الهجمات', ic: '🧮', d: 'py', how: 'اصنع أداة تعدّ محاولات الهجوم' },
  urlcheck: { n: 'قارئ الروابط', ic: '🔗', d: 'web', how: 'اكشف الروابط المزيّفة' },
  bruteforce: { n: 'كاسر قيصر', ic: '🔨', d: 'cry', how: 'اكسر شيفرة بتجربة كل المفاتيح' },
  meta: { n: 'كاشف الأسرار المخفية', ic: '🗺️', d: 'for', how: 'اكتشف البيانات الوصفية في صورة' },
  webdesigner: { n: 'المصمّم الصغير', ic: '🎨', d: 'web', how: 'صمّم صفحتك الشخصية' },
  webdev: { n: 'مطوّر الواجهات', ic: '🕹️', d: 'web', how: 'اصنع صفحة اختبار تفاعلية' },
  backend: { n: 'مهندس الخوادم', ic: '🖥️', d: 'py', how: 'احمِ بيانات المستخدمين على الخادم' },
  gitguard: { n: 'حارس المستودع', ic: '🗃️', d: 'web', how: 'امنع تسرّب الأسرار في Git' },
  webmaster: { n: 'صانع المواقع الآمنة', ic: '🏰', d: 'web', how: 'أنهِ المشروع الكبير الثالث' },
  flags: { n: 'صائد الأعلام', ic: '🚩', d: 'ctf', how: 'التقط 8 أعلام' },
  flagmaster: { n: 'سيد الأعلام', ic: '🏆', d: 'ctf', how: 'التقط كل الأعلام' },
  nohint: { n: 'بلا تلميحات', ic: '🧠', d: 'ctf', how: 'التقط 5 أعلام دون تلميح' },
  typer: { n: 'أصابع البرق', ic: '⚡', d: 'gen', how: 'اكتب 25 كلمة في الدقيقة' },
  streak7: { n: 'أسبوع النار', ic: '🔥', d: 'gen', how: '7 أيام متتالية' },
  streak30: { n: 'شهر الحديد', ic: '🛡️', d: 'gen', how: '30 يوماً متتالياً' },
  stage1: { n: 'خرّيج المرحلة الأولى', ic: '🎓', d: 'gen', how: 'أنهِ المشروع الكبير الثاني' },
  proj1: { n: 'حارس العُش', ic: '🪺', d: 'gen', how: 'أنهِ المشروع الكبير الأول' },
  sorter: { n: 'مرتّب البطاقات', ic: '🃏', d: 'algo', how: 'رتّب البطاقات بخوارزمية' },
  binsearch: { n: 'صائد الرقم', ic: '🎯', d: 'algo', how: 'اعثر على الرقم بأقل التخمينات' },
  dicts: { n: 'سيد القواميس', ic: '📚', d: 'py', how: 'استخدم القواميس في Python' },
  filer: { n: 'أمين الملفات', ic: '🗃️', d: 'py', how: 'اقرأ ملفاً واكتبه بـ Python' },
  perms: { n: 'حارس الصلاحيات', ic: '🔏', d: 'linux', how: 'اضبط صلاحيات ملف سري' },
  root: { n: 'مروّض المدير', ic: '👑', d: 'linux', how: 'افهم sudo وحساب root' },
  sql: { n: 'سيد SQL', ic: '🗄️', d: 'db', how: 'اكتب استعلامات SQL صحيحة' },
  dbguard: { n: 'حارس البيانات', ic: '🛡️', d: 'db', how: 'احمِ قاعدة البيانات من الحقن' },
  pinger: { n: 'صاحب الصدى', ic: '📡', d: 'net', how: 'استخدم ping و traceroute' },
  handshake: { n: 'المصافحة الثلاثية', ic: '🤝', d: 'net', how: 'رتّب مصافحة TCP' },
  antivirus: { n: 'صائد الديدان', ic: '🦠', d: 'mal', how: 'صنّف البرامج الخبيثة' },
  backup: { n: 'بطل النسخ الاحتياطي', ic: '💾', d: 'mal', how: 'اهزم برنامج الفدية' },
  jsfirst: { n: 'أول سكربت', ic: '⚡', d: 'js', how: 'شغّل أول كود JavaScript' },
  xss: { n: 'كاشف الحقن', ic: '💉', d: 'js', how: 'اكتشف ثغرة حقن السكربت' },
  xor: { n: 'ساحر XOR', ic: '🔀', d: 'cry', how: 'شفّر وفكّ بـ XOR' },
  signer: { n: 'صاحب التوقيع', ic: '✍️', d: 'cry', how: 'وقّع رسالة وتحقّق منها' },
  lessons25: { n: 'تلميذ مجتهد', ic: '📗', d: 'gen', how: 'أنهِ 25 درساً' },
  lessons50: { n: 'باحث لا يتوقف', ic: '📘', d: 'gen', how: 'أنهِ 50 درساً' },
  lessons100: { n: 'الموسوعة', ic: '📚', d: 'gen', how: 'أنهِ 100 درس' },
  perfect: { n: 'العلامة الكاملة', ic: '💯', d: 'gen', how: '100% في اختبار من أول محاولة' },
  stars5: { n: 'جامع النجوم', ic: '🌟', d: 'gen', how: '3 نجوم في 5 وحدات' },
  starsall: { n: 'نجوم السماء', ic: '🌌', d: 'gen', how: '3 نجوم في كل الوحدات' },
  review50: { n: 'ذاكرة الفيل', ic: '🐘', d: 'gen', how: '50 إجابة صحيحة في المراجعة' },
  streak14: { n: 'أسبوعان من النار', ic: '☄️', d: 'gen', how: '14 يوماً متتالياً' },
  typer40: { n: 'إعصار الكيبورد', ic: '🌪️', d: 'gen', how: 'اكتب 40 كلمة في الدقيقة' },
  weekly5: { n: 'صائد التحديات', ic: '🏹', d: 'gen', how: 'أجب عن 5 تحديات أسبوعية' },
  crowns3: { n: 'الملك المتوّج', ic: '🤴', d: 'team', how: 'كن بطل الأسبوع 3 مرات' },
  win2: { n: 'لا يُوقف', ic: '🚀', d: 'team', how: 'افز بأسبوعين متتاليين' },
  goals5: { n: 'روح الفريق', ic: '🤝', d: 'team', how: 'حقّقوا الهدف المشترك 5 مرات' },
  tr_recon: { n: 'عين السماء', ic: '🔭', d: 'ctf', how: 'أنهِ مسار الاستطلاع' },
  tr_web: { n: 'فارس الويب', ic: '🌐', d: 'ctf', how: 'أنهِ مسار ثغرات الويب' },
  tr_crypto: { n: 'كاسر الأقفال', ic: '🔓', d: 'ctf', how: 'أنهِ مسار كسر الشيفرات' },
  tr_files: { n: 'عدسة المحقّق', ic: '🔍', d: 'ctf', how: 'أنهِ مسار تحليل الملفات' },
  tr_linux: { n: 'سيد الخوادم', ic: '🐧', d: 'ctf', how: 'أنهِ مسار لينكس' },
  tr_code: { n: 'قارئ الكود', ic: '🧾', d: 'ctf', how: 'أنهِ مسار قراءة الكود' },
  tr_net: { n: 'متتبّع الحزم', ic: '📦', d: 'ctf', how: 'أنهِ مسار حزم الشبكة' },
  tr_case: { n: 'محقّق القضايا الكبرى', ic: '🗂️', d: 'ctf', how: 'احلّ كل القضايا' }
};
/* titles shown under the player's name (chosen in the wardrobe) */
const TITLES = [
  ['t0', 'مستكشف صغير', null], ['t1', 'سيد الطرفية', { medal: 'term' }], ['t2', 'المبرمج الصغير', { medal: 'funcs' }], ['t3', 'كاسر الشيفرات', { medal: 'caesar' }],
  ['t4', 'حارس الشبكة', { medal: 'ports' }], ['t5', 'المحقّق الرقمي', { medal: 'detective' }], ['t6', 'سيد لينكس', { medal: 'root' }], ['t7', 'خبير البيانات', { medal: 'sql' }],
  ['t8', 'صائد الديدان', { medal: 'antivirus' }], ['t9', 'جامع النجوم', { medal: 'stars5' }], ['t10', 'صائد الأعلام', { medal: 'flags' }], ['t11', 'الملك المتوّج', { medal: 'crowns3' }],
  ['t12', 'الموسوعة', { medal: 'lessons100' }], ['t13', 'أسطورة عُقاب', { medal: 'flagmaster' }], ['t14', 'صانع المواقع', { medal: 'webmaster' }]
];

const App = {
  preview: false, route: [], celeQ: [], celeOn: false, lessonKey: null, busy: false,

  boot() {
    buildIndex();
    const d = Dev.get();
    if (d.big) document.documentElement.dataset.big = '1';
    window.addEventListener('hashchange', () => App.render());
    Kid.on(() => App.onKid());
    Coach.on(() => App.onCoach());
    Prof.on(() => { if (['who', 'league', 'coach'].includes(App.route[0])) App.render(); });
    const act = () => { App.lastAct = now(); };
    document.addEventListener('pointerdown', act, true);
    document.addEventListener('keydown', act, true);
    document.addEventListener('click', App.onClick);
    document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('.term'); if (t) App.termTip(t, false); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && CoachUI.open) { CoachUI.open = false; App.hiddenLock = true; } else if (!document.hidden && App.hiddenLock) { App.hiddenLock = false; if (App.route[0] === 'coach') App.render(); } });
    App.lastAct = now();
    setInterval(App.tick, 5000);
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
    App.render();
  },
  cloudReady(m) { Sync.attach(m); },
  cloudFail() { Sync.fail(); },
  tick() {
    const idle = now() - App.lastAct;
    // the coach panel closes by itself after 3 idle minutes
    if (CoachUI.open && idle > 180000) { CoachUI.open = false; if (App.route[0] === 'coach') App.render(); }
    // a player is signed out after 30 idle minutes (shared device)
    if (Kid.pid() && !App.preview && idle > 30 * 60000) { Kid.use(null); App.go('who'); return; }
    if (document.hidden || App.preview || !Kid.pid()) return;
    if (idle > 60000) return;
    if (!Kid.get().pledge) return;
    Kid.tick(5, App.lessonKey);
    if (Math.random() < .2) Sync.schedule();
  },
  refresh() { if (['lesson', 'test', 'ctfc', 'review', 'typing', 'newplayer'].includes(App.route[0])) { App.paintTop(); return; } App.render(); },
  onKid() { Help.watch(); if (App.route[0] === 'coach' && CoachUI.open && CoachUI.tab === 'help' && !$('.modal') && !(document.activeElement && document.activeElement.matches('input,textarea'))) App.render(); App.paintTop(); clearTimeout(App.amT); App.amT = setTimeout(App.autoMedals, 300); App.checkCele(); },
  onCoach() { App.applyStage(); App.checkMsgs(); Help.watch(); },

  /* ---------- derived ---------- */
  /* every XP source with its time, so we can total it for any period */
  xpItems(k) {
    const it = []; const noon = d => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd, 12).getTime(); };
    for (const key in k.L) if (k.L[key].d) it.push([k.L[key].d, 20]);
    for (const u in k.T) if (k.T[u].p) it.push([k.T[u].p, 100 + Math.max(0, (k.T[u].b || 0) - 80) * 2]);
    for (const m in k.M) if (MEDALS[m]) it.push([k.M[m], 50]);
    for (const id in k.C) if (k.C[id].d) { const ch = C.ctf.find(x => x.id === id); if (ch) it.push([k.C[id].d, Math.max(Math.round(ch.pts / 2), ch.pts - 15 * (k.C[id].h || 0))]); }
    const active = {};
    for (const day in k.D) {
      const devs = k.D[day]; const tk = {}; let rx = 0;
      for (const dv in devs) { Object.assign(tk, devs[dv].k || {}); rx = Math.max(rx, devs[dv].rx || 0); }
      let x = 0; if (tk.typing) x += 10; if (tk.review) x += 10; x += Math.min(20, rx * 2);
      const n = (tk.typing ? 1 : 0) + (tk.review ? 1 : 0) + (tk.lesson ? 1 : 0);
      if (n === 3) x += 20; if (n >= 2) active[day] = n;
      if (x) it.push([noon(day), x]);
    }
    for (const w in k.W) it.push([k.W[w].d || 0, 50]);
    for (const x in k.X) if (x === 'final' || x.startsWith('p_')) { if (!(x === 'p_final' && k.X.final)) it.push([k.X[x], 200]); }
    return { it, active };
  },
  weekStart(t) { const d = new Date(t || now()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 1) % 7)); return d.getTime(); },
  /* family league: weekly XP per player, shared-goal bonus and crowns */
  league() {
    const ps = Prof.comp(); const goal = (Coach.get().goal && Coach.get().goal.n) || 400;
    const base = {}; ps.forEach(p => { base[p.id] = App.xpItems(Kid.of(p.id)).it; });
    const wk = t => App.weekStart(t);
    const weeks = {}; // weekStart -> {pid: xp}
    ps.forEach(p => base[p.id].forEach(([t, x]) => { const w = wk(t); weeks[w] = weeks[w] || {}; weeks[w][p.id] = (weeks[w][p.id] || 0) + x; }));
    const cur = wk(now()); const bonus = {}; const crowns = {}; let lastWinner = null;
    Object.keys(weeks).map(Number).sort().forEach(w => {
      const W = weeks[w]; const sum = Object.values(W).reduce((a, b) => a + b, 0);
      if (ps.length > 1 && sum >= goal) ps.forEach(p => { if (W[p.id]) bonus[p.id] = (bonus[p.id] || 0) + 30; });
      if (w < cur && ps.length > 1) { const best = Object.entries(W).sort((a, b) => b[1] - a[1]); if (best[0] && (!best[1] || best[0][1] > best[1][1])) { crowns[best[0][0]] = (crowns[best[0][0]] || 0) + 1; lastWinner = best[0][0]; } else lastWinner = null; }
    });
    const prev = cur - 7 * 864e5; const pw = weeks[prev] || {}; const pr = Object.entries(pw).sort((a, b) => b[1] - a[1]);
    const king = ps.length > 1 && pr[0] && (!pr[1] || pr[0][1] > pr[1][1]) ? pr[0][0] : null;
    const thisWeek = weeks[cur] || {}; const sumNow = Object.values(thisWeek).reduce((a, b) => a + b, 0);
    return { ps, goal, weeks, cur, thisWeek, sumNow, bonus, crowns, king };
  },
  derive(pid) {
    pid = pid || Kid.pid();
    const k = pid ? Kid.of(pid) : Kid.get();
    const units = C.units;
    const { it, active } = App.xpItems(k);
    const lg = Prof.comp().length > 1 ? App.league() : null;
    let xp = it.reduce((a, b) => a + b[1], 0) + (lg && lg.bonus[pid] || 0);
    const ws = App.weekStart(); const week = it.filter(x => x[0] >= ws).reduce((a, b) => a + b[1], 0);
    const lessonsDone = {}; for (const key in k.L) if (k.L[key].d) lessonsDone[key] = 1;
    let streak = 0; const today = dayKey();
    let cur = active[today] ? today : addDays(today, -1);
    while (active[cur]) { streak++; cur = addDays(cur, -1); }
    let rank = 0; RANKS.forEach((r, i) => { if (xp >= r.x) rank = i; });
    const st = {}; const testAll = pid === 'kt' && Dev.get().testOpen;
    const passedOf = (u) => u.project ? !!(k.X['p_' + u.id] || (u.id === 'final' && k.X.final)) : !!(k.T[u.id] && k.T[u.id].p);
    units.forEach((u, i) => {
      const prev = units[i - 1];
      const ld = u.lessons.filter(l => k.L[u.id + '.' + l.id] && k.L[u.id + '.' + l.id].d).length;
      const started = ld > 0 || !!k.T[u.id];
      let open = i === 0 || passedOf(prev) || started || testAll;
      const ov = Coach.unit(pid, u.id);
      if (ov === 'open') open = true; if (ov === 'lock') open = false;
      const best = (k.T[u.id] && k.T[u.id].b) || 0;
      st[u.id] = { open, ld, total: u.lessons.length, passed: passedOf(u), best, stars: u.project ? 0 : best >= 100 ? 3 : best >= 90 ? 2 : best >= 80 ? 1 : 0, ov, project: !!u.project };
    });
    let stage2 = passedOf(units.find(u => u.id === 'final2') || units[units.length - 1]) || testAll;
    const cu = Coach.stage2(pid); if (cu === 'open') stage2 = true; if (cu === 'lock') stage2 = false;
    const solved = Object.keys(k.C).filter(id => k.C[id].d && C.ctf.some(x => x.id === id));
    const crowns = lg ? (lg.crowns[pid] || 0) : 0, king = lg ? lg.king === pid : false;
    return { xp, week, rank, streak, active, st, stage2, solved, lessonsDone, crowns, king };
  },
  pname(pid) { return pid === 'kt' ? 'المختبِر 🧪' : pid === 'demo' ? 'لاعب جديد' : ((Prof.one(pid) || {}).name || ''); },
  titleOf(k) { const t = TITLES.find(x => x[0] === ((k && k.look && k.look.title) || 't0')); const ok = t && (!t[2] || (k.M && k.M[t[2].medal])); return ok ? t[1] : TITLES[0][1]; },
  /* medals that come from totals rather than one lesson */
  autoMedals() {
    if (!Kid.live() || App.amBusy) return; App.amBusy = true;
    try {
      const k = Kid.get(), D = App.derive(), give = id => { if (!k.M[id] && MEDALS[id]) Kid.medal(id); };
      const nL = Object.keys(D.lessonsDone).length;
      if (nL >= 25) give('lessons25'); if (nL >= 50) give('lessons50'); if (nL >= 100) give('lessons100');
      const tested = C.units.filter(u => !u.project); const s3 = tested.filter(u => D.st[u.id].stars === 3).length;
      if (s3 >= 5) give('stars5'); if (s3 === tested.length) give('starsall');
      let rx = 0; for (const d in k.D) { let m = 0; for (const dv in k.D[d]) m = Math.max(m, k.D[d][dv].rx || 0); rx += m; } if (rx >= 50) give('review50');
      if (D.streak >= 7) give('streak7'); if (D.streak >= 14) give('streak14'); if (D.streak >= 30) give('streak30');
      if (Object.keys(k.W).length >= 5) give('weekly5');
      if (D.crowns >= 3) give('crowns3');
      const pid = Kid.pid();
      if (Prof.comp().length > 1 && Prof.comp().some(x => x.id === pid)) {
        const lg = App.league(); let goals = 0, run = 0, best = 0;
        Object.keys(lg.weeks).map(Number).sort().forEach(w => { const W = lg.weeks[w]; const sum = Object.values(W).reduce((a, b) => a + b, 0); if (sum >= lg.goal && W[pid]) goals++; if (w < lg.cur) { const r = Object.entries(W).sort((a, b) => b[1] - a[1]); const win = r[0] && r[0][0] === pid && (!r[1] || r[0][1] > r[1][1]); run = win ? run + 1 : 0; best = Math.max(best, run); } });
        if (goals >= 5) give('goals5'); if (best >= 2) give('win2');
      }
      const tracks = {}; C.ctf.forEach(c => { tracks[c.track] = tracks[c.track] || [0, 0]; tracks[c.track][1]++; if (k.C[c.id] && k.C[c.id].d) tracks[c.track][0]++; });
      for (const t in tracks) if (tracks[t][1] && tracks[t][0] === tracks[t][1]) give('tr_' + t);
    } finally { App.amBusy = false; }
  },
  /* the player's chosen look (with safe defaults) */
  lookOf(k, night) {
    const L = (k && k.look) || {}; const s = night ? 's2' : 's1'; const cat = Art.LOOKS[s]; const v = L[s] || {};
    return { cos: cat.cos.some(c => c[0] === v.cos) ? v.cos : cat.cos[0][0], col: cat.col.includes(v.col) ? v.col : cat.col[0], th: cat.th.some(t => t[0] === v.th) ? v.th : cat.th[0][0] };
  },
  look(night) { if (night == null) night = document.documentElement.dataset.stage === '2'; return App.lookOf(Kid.get(), night); },
  lookOpen(req, D) { if (!req) return true; if (req.medal) return !!Kid.get().M[req.medal]; if (req.rank != null) return D.rank >= req.rank; if (req.crown) return D.crowns >= req.crown || D.king; if (req.flags) return D.solved.length >= req.flags; return true; },
  rankInfo(xp) { let r = 0; RANKS.forEach((x, i) => { if (xp >= x.x) r = i; }); const nx = RANKS[r + 1]; return { i: r, cur: RANKS[r], next: nx, pct: nx ? Math.round((xp - RANKS[r].x) / (nx.x - RANKS[r].x) * 100) : 100 }; },
  seenKey() { const pid = Kid.pid(); return pid ? pid + '.' + (Kid.get().g || 0) : null; },
  seen() { const sk = App.seenKey(); if (!sk) return null; const d = Dev.get(); d.seen = d.seen || {}; return d.seen[sk] || null; },
  applyStage() {
    const d = App.derive(); const pid = Kid.pid(); const r = document.documentElement;
    const sn = App.seen();
    const s2 = !!pid && d.stage2 && !!(sn && sn.stage2) || (App.preview && d.stage2);
    if (s2) r.dataset.stage = '2'; else delete r.dataset.stage;
    const k = Kid.get(); const l1 = App.lookOf(k, false), l2 = App.lookOf(k, true);
    if (pid && l1.th !== 'sky') r.dataset.th = l1.th; else delete r.dataset.th;
    if (pid && l2.th !== 'neon') r.dataset.th2 = l2.th; else delete r.dataset.th2;
    return d;
  },

  /* ---------- router ---------- */
  go(h) { if (location.hash === '#' + h) App.render(); else location.hash = h; },
  parse() { const h = (location.hash || '').replace(/^#\/?/, ''); return h ? h.split('/').map(decodeURIComponent) : []; },
  render() {
    const d = Dev.get();
    App.lessonKey = null; App.celeOK = true;
    let r = App.parse();
    const free = ['coach', 'coachsetup', 'who', 'newplayer'];
    if (Kid.pid() && Kid.pid() !== 'demo' && Kid.pid() !== 'kt' && !Prof.one(Kid.pid())) Kid.use(null);
    if (!App.preview && !free.includes(r[0])) {
      if (!Kid.pid()) r = ['who'];
      else if (!Kid.get().pledge) r = ['newplayer'];
    }
    if (!r.length) r = ['map'];
    if (r[0] !== 'coach') { CoachUI.open = false; CoachUI.firstView = true; }
    if (r[0] === 'who' && Kid.pid() && Kid.get().pledge && !App.preview) { Kid.use(null); }
    App.route = r;
    const D = App.applyStage();
    const views = { who: Views.who, newplayer: Views.newplayer, map: Views.map, unit: Views.unit, lesson: Views.lesson, test: Views.test, today: Views.today, review: Views.review, typing: Views.typing, glossary: Views.glossary, me: Views.me, look: Views.look, league: Views.league, coach: CoachUI.view, coachsetup: CoachUI.setup, ctf: Views.ctf, ctfc: Views.ctfc, next: Views.next, weekly: Views.weekly };
    const v = views[r[0]] || Views.map;
    const app = $('#app');
    const out = v(r, D) || {};
    const showTop = !['who', 'newplayer', 'lesson', 'test', 'review', 'typing', 'coachsetup'].includes(r[0]) && Kid.pid();
    const pv = App.preview && r[0] !== 'coach' && r[0] !== 'coachsetup';
    app.innerHTML = (showTop ? App.topHtml(D) : '') + (pv ? '<div class="card" style="background:var(--warn-bg);padding:8px 12px;margin:6px 0">' + ic('eye', 18) + ' <b>وضع المعاينة:</b> ترى ما يراه ' + esc(App.pname(Kid.pid())) + '، ولا يُسجَّل أي شيء. <button class="btn sm sec" data-act="preview-off">لوحة المدرب</button></div>' : '') + (out.html || '');
    App.paintTabs(r[0]);
    window.scrollTo(0, 0);
    if (out.mount) out.mount();
    App.paintSync();
    Help.paint();
    setTimeout(() => { App.checkCele(); App.checkMsgs(); Help.checkReplies(); }, 400);
  },
  topHtml(D) {
    const night = document.documentElement.dataset.stage === '2';
    const p = Prof.one(Kid.pid()) || {};
    return '<header class="top"><a class="brand" href="#/map">' + Art.logo(night) + '<span>' + (night ? 'عُقاب 🌙' : 'عُقاب') + '</span></a><span class="sp"></span>' +
      '<span class="chip" title="سلسلة الأيام">' + ic('fire', 18) + '<span id="t-streak">' + D.streak + '</span></span>' +
      '<span class="chip" title="نقاط الخبرة">' + ic('star', 18) + '<span id="t-xp">' + D.xp + '</span></span>' +
      '<button class="me-chip" data-act="switch" title="تبديل اللاعب">' + Art.eagle('happy', D.rank, night) + esc(App.pname(Kid.pid())) + (D.king ? ' <span class="crown">👑</span>' : '') + '</button></header>' +
      (Kid.pid() === 'kt' && !App.preview ? '<div class="card" style="background:var(--warn-bg);padding:8px 12px;margin:4px 0;font-size:.9em">🧪 <b>حساب الاختبار:</b> محفوظ على هذا الجهاز فقط، ولا يدخل في المنافسة. <span class="row" style="display:inline-flex;gap:6px;margin-top:4px"><button class="btn sm sec" data-act="t-open">' + (Dev.get().testOpen ? '🔒 أعد القفل الطبيعي' : '🔓 افتح كل شيء') + '</button><button class="btn sm sec" data-act="t-reset">↺ ابدأ من الصفر</button></span></div>' : '') +
      '<div class="sync" id="sync"></div>';
  },
  paintTop() { const D = App.derive(); const a = $('#t-xp'), b = $('#t-streak'); if (a) a.textContent = D.xp; if (b) b.textContent = D.streak; },
  paintSync() {
    const el = $('#sync'); if (!el) return; const s = Sync.status();
    const txt = { local: 'محفوظ على هذا الجهاز', wait: 'جارٍ الاتصال...', on: 'متصل ومحفوظ', fail: 'محفوظ على هذا الجهاز (بلا اتصال)' }[s];
    el.className = 'sync ' + (s === 'on' ? 'on' : s === 'wait' ? 'wait' : ''); el.innerHTML = '<i></i>' + txt;
  },
  paintTabs(cur) {
    const t = $('#tabs'); const hide = ['who', 'newplayer', 'lesson', 'test', 'review', 'typing', 'coachsetup'].includes(cur) || !Kid.pid();
    t.classList.toggle('hide', hide); if (hide) return;
    const D = App.derive();
    const items = [['map', 'map', 'الرحلة'], ['today', 'sun', 'اليوم']];
    if (D.stage2) items.push(['ctf', 'flag', 'الأعلام']);
    if (Prof.comp().length > 1) items.push(['league', 'star', 'الأبطال']);
    items.push(['me', 'hat', 'ملفي'], ['coach', 'lock', 'المدرب']);
    const map = { unit: 'map', ctfc: 'ctf', next: 'ctf', weekly: 'today', glossary: 'me', look: 'me' };
    const c = map[cur] || cur;
    const hn = Dev.get().role === 'coach' ? Help.pending().length : 0;
    t.innerHTML = '<div class="in">' + items.map(i => '<a href="#/' + i[0] + '"' + (c === i[0] ? ' aria-current="page"' : '') + ' style="position:relative">' + ic(i[1]) + i[2] + (i[0] === 'coach' ? '<b class="hdot"' + (hn ? '' : ' hidden') + '>' + hn + '</b>' : '') + '</a>').join('') + '</div>';
  },

  onClick(e) {
    const a = e.target.closest('[data-act]');
    const tm = e.target.closest('.term');
    if (tm && !a) { App.termTip(tm, true); return; }
    if (!a) return;
    const act = a.dataset.act, v = a.dataset.v;
    Snd.click();
    switch (act) {
      case 'go': App.go(v); break;
      case 'sound': Dev.set('sound', Dev.get().sound ? 0 : 1); App.render(); break;
      case 'big': Dev.set('big', Dev.get().big ? 0 : 1); if (Dev.get().big) document.documentElement.dataset.big = '1'; else delete document.documentElement.dataset.big; App.render(); break;
      case 'preview-off': App.endPreview(); break;
      case 'cert': Cert.make(+v); break;
      case 'link': Views.linkDialog(); break;
      case 't-open': Dev.set('testOpen', !Dev.get().testOpen); toast(Dev.get().testOpen ? 'فُتح كل شيء لحساب الاختبار 🔓' : 'عاد القفل الطبيعي 🔒'); App.render(); break;
      case 't-reset': { const m = modal('<h2>ابدأ من الصفر؟</h2><p>يُمسح كل تقدّم حساب الاختبار على هذا الجهاز.</p><div class="row"><button class="btn bad" id="tr1">نعم</button><button class="btn sec" data-close>لا</button></div>'); $('#tr1', m.el).onclick = () => { m.close(); Kid.reset('kt'); const d = Dev.get(); Object.keys(d.seen || {}).forEach(x => { if (x.startsWith('kt')) delete d.seen[x]; }); Dev.set('testOpen', false); Kid.use('kt'); Kid.setName('المختبِر'); App.go('newplayer'); }; break; }
      case 'switch': if (App.preview) { App.endPreview(); break; } modal('<h2>تبديل اللاعب</h2><p>تريد الخروج ليلعب أخوك؟ تقدّمك محفوظ.</p><div class="row"><button class="btn" id="swy">نعم، خروج</button><button class="btn sec" data-close>لا</button></div>').el.querySelector('#swy').onclick = () => { $('.modal').remove(); Kid.use(null); App.go('who'); }; break;
    }
  },
  startPreview(pid) { App.preview = true; App.prevPid = Kid.pid(); Kid.use(pid, false); App.go('map'); },
  endPreview() { App.helpJump = null; App.preview = false; Kid.use(SS.get('oqab_pid'), false); App.go('coach'); },
  termTip(el, click) {
    const t = C.terms[el.dataset.term]; if (!t) return;
    if (!click) { el.title = t.ar + (t.en ? ' (' + t.en + ')' : '') + ': ' + t.d; return; }
    modal('<h2>' + esc(t.ar) + (t.en ? ' <span class="mono muted" style="font-size:.7em">(' + esc(t.en) + ')</span>' : '') + '</h2><p>' + md(t.d) + '</p>' + (t.ex ? '<p class="muted">مثال: ' + md(t.ex) + '</p>' : '') + '<button class="btn wide" data-close>فهمت</button>');
  },

  /* ---------- celebrations (seen state is per player, per device) ---------- */
  checkCele() {
    if (App.celeOn || App.preview) return;
    const pid = Kid.pid(); if (!pid || !Kid.get().pledge) return;
    const d = Dev.get(), D = App.derive(), k = Kid.get(), sk = App.seenKey();
    d.seen = d.seen || {};
    if (!d.seen[sk]) { d.seen[sk] = { rank: D.rank, medals: Object.assign({}, k.M), stage2: D.stage2, crowns: D.crowns }; Dev.save(); return; }
    const s = d.seen[sk]; const q = [];
    for (const m in k.M) if (!s.medals[m] && MEDALS[m]) q.push(['medal', m]);
    if (D.rank > s.rank) q.push(['rank', D.rank]);
    if (D.rank < s.rank) { s.rank = D.rank; Dev.save(); }
    if ((D.crowns || 0) > (s.crowns || 0)) q.push(['crown', D.crowns]);
    if (D.stage2 && !s.stage2) q.push(['stage2']);
    if (!D.stage2 && s.stage2) { s.stage2 = false; Dev.save(); App.applyStage(); }
    if (!q.length) return;
    const busy = ['lesson', 'test', 'ctfc', 'review', 'typing', 'who', 'newplayer'].includes(App.route[0]) && !App.celeOK;
    if (busy || ['who', 'newplayer', 'coach', 'coachsetup'].includes(App.route[0])) return;
    App.showCele(q[0]);
  },
  /* preview=true: show it to the coach without changing anyone's progress */
  showCele(item, preview) {
    App.celeOn = true; const [kind, val] = item; const pid = Kid.pid();
    const el = document.createElement('div'); el.className = 'cele';
    const finish = () => {
      el.remove(); App.celeOn = false;
      if (preview) { App.applyStage(); App.go('coach'); App.render(); return; }
      const s = (Dev.get().seen || {})[App.seenKey()];
      if (s) { if (kind === 'medal') s.medals[val] = 1; else if (kind === 'rank') s.rank = val; else if (kind === 'stage2') s.stage2 = true; else if (kind === 'crown') s.crowns = val; Dev.save(); }
      if (kind === 'stage2') { App.applyStage(); App.go('ctf'); } else App.render();
    };
    if (kind === 'stage2') {
      el.classList.add('stage2-intro');
      el.innerHTML = '<div style="max-width:520px"><p id="s2a" style="opacity:0;transition:opacity 1s;font-size:1.2em">أنهيت المرحلة الأولى...<br>أصبحت تفهم كيف يعمل كل شيء.</p><div id="s2b" style="opacity:0;transition:opacity 1s">' + Art.eagle('wow', 6, true, App.lookOf(Kid.get(), true)).replace('class="eagle"', 'class="eagle" style="width:150px"') + '<div class="glitch">صيد الأعلام</div><p>الآن يتغيّر كل شيء: الليل نزل، وعُقاب صار صيّاداً. وفي خزانتك أزياء وألوان ليلية جديدة!<br>تحديات حقيقية داخل عالم وهمي آمن. كل علم تلتقطه يثبت مهارتك.</p><button class="btn wide" data-x="go">' + (preview ? 'إنهاء المعاينة' : 'ابدأ الصيد') + '</button></div></div>';
      document.body.appendChild(el); Snd.whoosh();
      const root = document.documentElement; const had = root.dataset.stage;
      setTimeout(() => { $('#s2a', el).style.opacity = 1; }, 200);
      setTimeout(() => { $('#s2a', el).style.opacity = 0; root.dataset.stage = '2'; }, 2600);
      setTimeout(() => { $('#s2b', el).style.opacity = 1; Snd.fanfare(); confetti(120); }, 3400);
      el.addEventListener('click', e => { if (e.target.closest('[data-x="go"]')) { if (preview && !had) delete root.dataset.stage; finish(); } });
      return;
    }
    const night = document.documentElement.dataset.stage === '2';
    const prize = kind === 'medal' ? Art.medal(MEDALS[val].ic, (DOMAINS[MEDALS[val].d] || DOMAINS.gen)[1]) : kind === 'crown' ? Art.eagle('happy', 6, night, Object.assign({}, App.look(night), night ? {} : { cos: 'king' })) : Art.hat(val);
    const title = kind === 'medal' ? 'ميدالية جديدة!' : kind === 'crown' ? 'بطل الأسبوع! 👑' : 'رتبة جديدة!';
    const sub = kind === 'medal' ? '<p style="font-size:1.4em;font-weight:800">' + esc(MEDALS[val].n) + '</p><p>' + esc(MEDALS[val].how) + '</p>'
      : kind === 'crown' ? '<p>جمعت أكثر نقاط في الأسبوع الماضي! التاج معك طوال هذا الأسبوع، و<b>زي الملك</b> صار مفتوحاً في خزانتك.</p>'
        : '<p style="font-size:1.4em;font-weight:800">' + esc(RANKS[val].n) + '</p><p>قبعتك البيضاء تطوّرت! ' + (RANKS[val + 1] ? 'الرتبة التالية: ' + RANKS[val + 1].n : 'وصلت لأعلى رتبة!') + '</p>';
    el.innerHTML = '<div class="rays"></div><p style="position:relative;opacity:.85">' + (preview ? 'معاينة · ' : '') + 'هدية من عُقاب</p><h2 style="position:relative">اضغط على الهدية لتفتحها</h2>' +
      '<button class="gift" aria-label="افتح الهدية"><svg viewBox="0 0 170 170"><rect x="25" y="70" width="120" height="90" rx="12" fill="#E04B4B" stroke="#7A1A1A" stroke-width="5"/><rect x="77" y="70" width="16" height="90" fill="#FFD36B"/><g class="lid"><rect x="15" y="48" width="140" height="30" rx="10" fill="#FF6B6B" stroke="#7A1A1A" stroke-width="5"/><rect x="77" y="48" width="16" height="30" fill="#FFD36B"/><path d="M85 48 q-30 -36 -40 -8 q10 10 40 8 q30 2 40 -8 q-10 -28 -40 8" fill="#FFD36B" stroke="#C27C00" stroke-width="4"/></g></svg></button>' +
      '<div class="after hide" style="position:relative"><div class="prize">' + prize + '</div><h2>' + title + '</h2>' + sub + '<button class="btn gold" data-x="ok" style="min-width:200px">' + (preview ? 'إنهاء المعاينة' : 'رائع!') + '</button></div>';
    document.body.appendChild(el);
    el.addEventListener('click', e => {
      const g = e.target.closest('.gift');
      if (g && !g.classList.contains('open')) {
        g.classList.add('open'); Snd.fanfare(); confetti(); if (navigator.vibrate) try { navigator.vibrate([60, 40, 120]); } catch (x) { }
        setTimeout(() => { g.style.display = 'none'; $('h2', el).style.display = 'none'; $('.after', el).classList.remove('hide'); }, 650);
      }
      if (e.target.closest('[data-x="ok"]')) finish();
    });
  },
  checkMsgs() {
    if (App.preview || App.celeOn || $('.modal') || !Kid.pid()) return;
    if (['lesson', 'test', 'ctfc', 'who', 'newplayer', 'review', 'typing'].includes(App.route[0])) return;
    const c = Coach.get(), k = Kid.get(), pid = Kid.pid();
    const unread = Object.entries(c.msgs || {}).filter(([id, m]) => (!m.to || m.to === '*' || m.to === pid) && !k.MR[id]).sort((a, b) => a[1].t - b[1].t);
    if (!unread.length) return;
    const [id, m] = unread[0];
    Snd.win();
    modal('<div style="text-align:center">' + Art.eagle('happy', App.derive().rank).replace('class="eagle"', 'class="eagle" style="width:90px"') + '<p class="muted" style="margin:0">رسالة من أخيك الكبير</p></div><div class="card" style="font-size:1.12em;font-weight:700;white-space:pre-wrap">' + esc(m.x) + '</div><button class="btn wide" data-close>شكراً!</button>', { sticky: true, onClose: () => { Kid.msgRead(id); setTimeout(App.checkMsgs, 300); } });
  }
};

/* ---------- lookups ---------- */
function unitById(id) { return C.units.find(u => u.id === id); }
const QIDX = {};
function buildIndex() {
  const add = (u) => u.lessons.forEach(l => l.steps.forEach((s, i) => { if (s.t === 'q' || s.t === 'in') QIDX[u.id + '.' + l.id + '.' + i] = { s, u, l }; }));
  C.units.forEach(add);
  C.units.forEach(u => (u.test || []).forEach((s, i) => { QIDX[u.id + '.t.' + i] = { s, u, l: null }; }));
}

/* ---------- views ---------- */
const Views = {
  /* ---------- players ---------- */
  who() {
    const ps = Prof.list(); const fam = Dev.get().fam; const lg = Prof.comp().length > 1 ? App.league() : null;
    let h = '<div style="padding-top:16px;text-align:center">' + Art.eagle('happy', 2, false, { cos: 'classic', col: 'blue' }).replace('class="eagle"', 'class="eagle" style="width:120px"') + '<h1 style="margin:0">' + (ps.length ? 'من سيلعب الآن؟' : 'أهلاً بك في عُقاب!') + '</h1></div>';
    if (!fam) h += '<div class="card"><h3 style="margin-top:0">🔗 رمز الربط من أخيك الكبير</h3><p class="muted" style="margin:0 0 8px">اكتبه مرة واحدة على هذا الجهاز ليظهر حسابك وتقدّمك، ويتابعك أخوك.</p><div class="row" style="flex-wrap:nowrap"><input class="inp mono" id="wfam" dir="ltr" placeholder="XXXX-XXXX-XXXX"><button class="btn" id="wfb">ربط</button></div><p id="wfm" class="muted" style="font-size:.85em;margin:4px 0 0"></p></div>';
    h += '<div class="players">' + ps.map(p => { const k = Kid.of(p.id); const D = App.derive(p.id); return '<div class="player" data-p="' + p.id + '" role="button" tabindex="0">' + Art.eagle('happy', D.rank, false, App.lookOf(k, false)) + '<b>' + esc(p.name) + (lg && lg.king === p.id ? ' 👑' : '') + (p.nc ? ' 📚' : '') + '</b><small class="muted">' + esc(App.titleOf(k)) + ' · ' + esc(RANKS[D.rank].n) + '</small></div>'; }).join('') +
      (Prof.freeId() && ps.length < 4 ? '<div class="player add" data-new="1" role="button" tabindex="0"><span style="font-size:40px">＋</span>لاعب جديد</div>' : '') + '</div>';
    h += '<div class="sync" id="sync" style="justify-content:center"></div><div style="text-align:center;margin-top:22px"><a class="btn sec" href="#/coach" style="position:relative">' + ic('lock', 20) + 'لوحة المدرب' + (Dev.get().role === 'coach' && Help.pending().length ? '<b class="hdot">' + Help.pending().length + '</b>' : '') + '</a></div>';
    return {
      html: h, mount() {
        $$('[data-p]').forEach(el => el.onclick = () => Views.login(el.dataset.p));
        const n = $('[data-new]'); if (n) n.onclick = () => { App.np = { step: 0 }; App.go('newplayer'); };
        const fb = $('#wfb'); if (fb) fb.onclick = async () => { fb.disabled = true; const ok = await Views.linkFamily($('#wfam').value, $('#wfm')); fb.disabled = false; if (ok) { toast('تم الربط ✅'); setTimeout(() => App.render(), 1500); App.render(); } };
      }
    };
  },
  login(pid) {
    const p = Prof.one(pid); if (!p) return;
    const m = modal('<div style="text-align:center">' + Art.eagle('think', App.derive(pid).rank, false, App.lookOf(Kid.of(pid), false)).replace('class="eagle"', 'class="eagle" style="width:90px"') + '<h2 style="margin:4px 0">أهلاً ' + esc(p.name) + '!</h2><p class="muted" style="margin:0">اكتب كلمة المرور الخاصة بك</p></div><form id="lgf"><input class="inp" id="lgp" type="password" autocomplete="off" style="margin:10px 0;text-align:center;font-size:1.3em"><p id="lgm" style="color:var(--bad);font-weight:800;min-height:1.4em;margin:0;text-align:center"></p><div class="row"><button class="btn" style="flex:1">دخول</button><button type="button" class="btn sec" data-close>رجوع</button></div></form><p class="muted" style="font-size:.8em;text-align:center">نسيتها؟ أخوك الكبير يستطيع تغييرها من لوحة المدرب.</p>');
    const inp = $('#lgp', m.el); setTimeout(() => inp.focus(), 50);
    $('#lgf', m.el).onsubmit = async e => {
      e.preventDefault();
      if ((App.lgBlock || 0) > now()) { $('#lgm', m.el).textContent = 'انتظر قليلاً ثم حاول مرة أخرى'; return; }
      if (await Prof.check(pid, inp.value)) { m.close(); App.lgFails = 0; Kid.use(pid); Snd.win(); App.go(Kid.get().pledge ? 'map' : 'newplayer'); }
      else { App.lgFails = (App.lgFails || 0) + 1; if (App.lgFails >= 5) { App.lgBlock = now() + 30000; App.lgFails = 0; } Snd.bad(); inp.value = ''; $('#lgm', m.el).textContent = 'كلمة المرور غير صحيحة'; inp.classList.add('wrong'); }
    };
  },
  newplayer() {
    const st = App.np || { step: Kid.pid() ? 2 : 0 }; App.np = st;
    if (Kid.pid() && st.step < 2) st.step = 2;
    let h = '<div style="padding-top:16px">';
    if (st.step === 0) {
      h += '<div style="text-align:center">' + Art.eagle('happy', 0, false, { cos: 'classic', col: 'blue' }).replace('class="eagle"', 'class="eagle" style="width:160px"') + '<h1>أهلاً بك! أنا عُقاب</h1></div>' +
        '<div class="card"><p>أنا عُقاب آلي، أحرس <b>عُشّ البيانات</b>.</p><p>العُقاب يرى من السماء ما لا يراه أحد. وأنا سأعلّمك أن ترى الحاسوب والإنترنت بعين العُقاب: كيف يعمل كل شيء من الداخل، وأين تختبئ الثغرات، وكيف نسدّها.</p><p>رحلتنا طويلة وممتعة. نبدأ من الصفر، خطوة خطوة، وكل درس لعبة تلعبها بنفسك.</p></div>' +
        '<div class="row"><button class="btn" style="flex:1" data-n="1">هيا نبدأ!</button><a class="btn sec" href="#/who">رجوع</a></div>';
    } else if (st.step === 1) {
      h += '<div class="mentor">' + Art.eagle('think', 0) + '<div class="bubble">لنصنع حسابك. اختر اسمك، وكلمة مرور بسيطة تتذكّرها ولا تخبر بها أحداً غير أخيك الكبير.</div></div>' +
        '<div class="card"><label><b>اسمك</b></label><input class="inp" id="npn" maxlength="16" placeholder="مثلاً: سيف"><label style="display:block;margin-top:10px"><b>كلمة المرور</b> <small class="muted">(4 أحرف أو أرقام على الأقل)</small></label><input class="inp" id="npp1" type="password" autocomplete="new-password"><input class="inp" id="npp2" type="password" autocomplete="new-password" placeholder="أعد كتابتها" style="margin-top:8px"><p id="npm" style="color:var(--bad);font-weight:800;min-height:1.4em;margin:6px 0 0"></p></div>' +
        '<button class="btn wide" data-n="2">التالي</button>';
    } else if (st.step === 2) {
      const L = App.lookOf(Kid.get(), false);
      h += '<div class="mentor">' + Art.eagle('happy', 0) + '<div class="bubble">اختر لوني ولون صفحتك! (تستطيع تغييرهما في أي وقت من «ملفي ← خزانتي»، وستفتح أزياء جديدة كلما ارتفعت رتبتك.)</div></div>' + Views.lookPickers(false, App.derive()) + '<button class="btn wide" data-n="3" style="margin-top:12px">التالي</button>';
    } else {
      h += '<div class="mentor">' + Art.eagle('think', 0) + '<div class="bubble">قبل أن ندخل، هذا عهد بيني وبينك. اقرأه جيداً.</div></div>' +
        '<div class="card"><h2 style="text-align:center">عهد عُقاب</h2>' +
        '<div class="warn-card">كل ما أتعلّمه هنا أجرّبه <u>داخل عُقاب فقط</u>.<br>لا أجرّبه أبداً على أي موقع أو جهاز أو حساب حقيقي.</div>' +
        '<p style="margin-top:12px">لماذا؟ لأن تجربة هذه الأشياء على أنظمة الآخرين <b>مخالفة للقانون</b>، حتى لو كانت مزاحاً أو فضولاً.</p>' +
        '<p>داخل عُقاب كل شيء وهمي وآمن: الطرفية، والشبكة، والمواقع. جرّب فيها ما تشاء.</p>' +
        '<p>وإذا رأيت شيئاً غريباً في موقع حقيقي، أخبر أخاك ولا تجرّب عليه شيئاً.</p>' +
        '<label class="row" style="margin-top:10px;font-weight:800;cursor:pointer"><input type="checkbox" id="agree" style="width:24px;height:24px"> قرأت العهد وأوافق عليه</label></div>' +
        '<button class="btn wide" data-n="4" id="agreeBtn" disabled>أعاهدك يا عُقاب</button>';
    }
    h += '</div>';
    return {
      html: h, mount() {
        Views.mountPickers(false);
        const ag = $('#agree'); if (ag) ag.onchange = () => { $('#agreeBtn').disabled = !ag.checked; };
        $$('[data-n]').forEach(b => b.onclick = async () => {
          const n = +b.dataset.n;
          if (n === 2) {
            const name = $('#npn').value.trim(), p1 = $('#npp1').value, p2 = $('#npp2').value, msg = $('#npm');
            if (!name) { msg.textContent = 'اكتب اسمك'; return; }
            if (Prof.list().some(p => p.name === name)) { msg.textContent = 'هذا الاسم موجود. اختر اسماً آخر'; return; }
            if (String(p1).trim().length < 4) { msg.textContent = 'كلمة المرور قصيرة (4 على الأقل)'; return; }
            if (p1 !== p2) { msg.textContent = 'الكلمتان غير متطابقتين'; return; }
            b.disabled = true;
            const first = !Prof.list().length;
            const id = await Prof.create(name, p1);
            if (!id) { msg.textContent = 'لا يوجد مكان لحساب جديد'; b.disabled = false; return; }
            Kid.use(id); if (first) adoptLegacy(id, App.legacyRemote);
            Kid.setName(name);
          }
          if (n === 4) { Kid.pledge(); App.np = null; Snd.win(); confetti(60); App.go('map'); return; }
          st.step = n; App.render();
        });
      }
    };
  },
  /* wardrobe pickers: stage 1 (day) or stage 2 (night) */
  lookPickers(night, D) {
    const s = night ? 's2' : 's1'; const cat = Art.LOOKS[s]; const L = App.lookOf(Kid.get(), night);
    let h = '<div class="card"><h3 style="margin-top:0">' + (night ? '🌙 زيّ عُقاب الليلي' : '🦅 زيّ عُقاب') + '</h3><div class="picks">' + cat.cos.map(c => { const open = App.lookOpen(c[2], D); return '<button class="pick' + (L.cos === c[0] ? ' on' : '') + (open ? '' : ' lock') + '" data-lk="' + s + '" data-k="cos" data-v="' + c[0] + '" data-open="' + (open ? 1 : 0) + '" data-req="' + esc(Views.reqText(c[2])) + '">' + (open ? '' : '<span class="lk">🔒</span>') + Art.eagle('happy', 3, night, { cos: c[0], col: L.col }) + '<br>' + c[1] + '</button>'; }).join('') + '</div>';
    h += '<h3>🎨 لون الريش</h3><div class="picks">' + cat.col.map(c => '<button class="pick' + (L.col === c ? ' on' : '') + '" data-lk="' + s + '" data-k="col" data-v="' + c + '" data-open="1"><span class="dot" style="background:linear-gradient(135deg,' + Art.COLORS[c][1] + ' 50%,' + Art.COLORS[c][0] + ' 50%)"></span><br>' + Art.COLORS[c][2] + '</button>').join('') + '</div>';
    const TH = { sky: ['#EAF1FB', '#1E4FA6', '#F2A51A'], forest: ['#EAF6EE', '#1E7A4A', '#F2A51A'], sunset: ['#FFF1E8', '#C2410C', '#F2A51A'], candy: ['#FBEFFB', '#9D2FA8', '#F2A51A'], desert: ['#FBF5E6', '#8A5A00', '#14A37F'], neon: ['#0A0F1F', '#2BD67B', '#FFC53D'], synth: ['#140A22', '#F04CC8', '#7CF0C0'], ice: ['#06141F', '#2BC8F0', '#FFC53D'], ember: ['#1A0A08', '#FF7A3D', '#FFC53D'] };
    h += '<h3>🖌️ ألوان الصفحة</h3><div class="picks">' + cat.th.map(t => '<button class="pick' + (L.th === t[0] ? ' on' : '') + '" data-lk="' + s + '" data-k="th" data-v="' + t[0] + '" data-open="1"><span class="sw">' + TH[t[0]].map(c => '<i style="background:' + c + '"></i>').join('') + '</span>' + t[1] + '</button>').join('') + '</div></div>';
    return h;
  },
  reqText(r) { if (!r) return ''; if (r.medal) return 'يُفتح بميدالية «' + MEDALS[r.medal].n + '»'; if (r.rank != null) return 'يُفتح عند رتبة «' + RANKS[r.rank].n + '»'; if (r.crown) return 'يُفتح عندما تصبح بطل الأسبوع 👑'; if (r.flags) return 'يُفتح بعد ' + r.flags + ' أعلام'; return ''; },
  mountPickers() {
    $$('.pick[data-lk]').forEach(b => b.onclick = () => {
      if (b.dataset.open !== '1') { Snd.bad(); toast('🔒 ' + b.dataset.req); return; }
      const s = b.dataset.lk; const cur = Object.assign({}, (Kid.get().look || {})[s] || {}); cur[b.dataset.k] = b.dataset.v;
      Kid.setLook({ [s]: cur }); Snd.ok(); App.render();
    });
  },
  look(r, D) {
    let h = '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/me">' + ic('back', 18) + 'ملفي</a></div><h1>👕 خزانتي</h1><p class="muted">اختر شكل عُقاب وألوانه، وألوان صفحتك. أزياء جديدة تُفتح كلما تقدّمت.</p>';
    h += '<div style="text-align:center">' + Art.eagle('happy', D.rank, false).replace('class="eagle"', 'class="eagle" style="width:120px"') + (D.stage2 ? Art.eagle('happy', D.rank, true).replace('class="eagle"', 'class="eagle" style="width:120px"') : '') + '</div>';
    const curT = (Kid.get().look && Kid.get().look.title) || 't0';
    h += '<div class="card"><h3 style="margin-top:0">🏷️ لقبي <small class="muted">(يظهر تحت اسمك)</small></h3><div class="tagbox">' + TITLES.map(t => { const open = !t[2] || !!Kid.get().M[t[2].medal]; return '<button class="tag' + (curT === t[0] ? ' sel' : '') + '" data-title="' + t[0] + '" data-open="' + (open ? 1 : 0) + '" data-req="' + esc(t[2] ? 'يُفتح بميدالية «' + MEDALS[t[2].medal].n + '»' : '') + '">' + (open ? '' : '🔒 ') + esc(t[1]) + '</button>'; }).join('') + '</div></div>';
    h += Views.lookPickers(false, D);
    h += D.stage2 ? Views.lookPickers(true, D) : '<div class="card" style="opacity:.7"><h3 style="margin-top:0">🌙 الخزانة الليلية</h3><p class="muted" style="margin:0">أزياء وألوان خاصة بالمرحلة الثانية (النينجا، صاحب القلنسوة، السايبورغ، الظل...). تُفتح مع صيد الأعلام.</p></div>';
    return { html: h, mount() { Views.mountPickers(); $$('[data-title]').forEach(b => b.onclick = () => { if (b.dataset.open !== '1') { Snd.bad(); toast('🔒 ' + b.dataset.req); return; } Kid.setLook({ title: b.dataset.title }); Snd.ok(); App.render(); }); } };
  },
  /* ---------- family league ---------- */
  league(r, D) {
    const lg = App.league(); if (lg.ps.length < 2) { setTimeout(() => App.go('map')); return {}; }
    const rows = lg.ps.map(p => { const d = App.derive(p.id); return { p, d, w: lg.thisWeek[p.id] || 0, k: Kid.of(p.id) }; }).sort((a, b) => b.w - a.w);
    const max = Math.max(50, ...rows.map(x => x.w));
    const ws = new Date(lg.cur), we = new Date(lg.cur + 6 * 864e5);
    let h = (Prof.one(Kid.pid()) && Prof.one(Kid.pid()).nc ? '<div class="card" style="background:var(--warn-bg)">📚 أنت تتعلّم <b>خارج المنافسة</b>: نقاطك لا تدخل هنا. يمكنك متابعة سباق الإخوة وتشجيعهم!</div>' : '') + '<h1>🏆 لوحة الأبطال</h1><p class="muted">سباق هذا الأسبوع (' + ws.getDate() + ' ' + MONTHS[ws.getMonth()] + ' ← ' + we.getDate() + ' ' + MONTHS[we.getMonth()] + '). من يجمع أكثر نقاط حتى نهاية الجمعة يلبس <b>التاج 👑</b> طوال الأسبوع القادم!</p>';
    h += '<div class="card">' + rows.map((x, i) => '<div class="league-row">' + '<b style="font-size:1.4em;width:28px;text-align:center">' + (i === 0 && x.w ? '🥇' : i === 1 && x.w ? '🥈' : (i + 1)) + '</b>' + Art.eagle('happy', x.d.rank, false, App.lookOf(x.k, false)) + '<div style="flex:1"><b>' + esc(x.p.name) + (lg.king === x.p.id ? ' <span class="crown">👑</span>' : '') + (x.p.id === Kid.pid() ? ' <small class="muted">(أنت)</small>' : '') + ' <small class="muted">· ' + esc(App.titleOf(x.k)) + '</small></b><div class="bar"><i style="width:' + Math.round(x.w / max * 100) + '%"></i></div><small class="muted"><bdi>' + x.w + ' XP</bdi> هذا الأسبوع</small></div></div>').join('') + '</div>';
    const gp = Math.min(100, Math.round(lg.sumNow / lg.goal * 100));
    h += '<div class="card" style="border-color:var(--gold)"><h3 style="margin-top:0">🤝 هدف الإخوة المشترك</h3><p style="margin:0">اجمعوا معاً <b><bdi>' + lg.goal + ' XP</bdi></b> هذا الأسبوع، فيحصل <b>كل من شارك</b> على <b>+30 XP</b> هدية!</p><div class="bar" style="height:18px;margin-top:8px"><i style="width:' + gp + '%"></i></div><small class="muted"><bdi>' + lg.sumNow + ' / ' + lg.goal + '</bdi> ' + (lg.sumNow >= lg.goal ? '✅ تحقّق الهدف!' : '') + '</small></div>';
    h += '<div class="sec-h"><h2>المقارنة الكاملة</h2></div><table class="t"><thead><tr><th></th>' + rows.map(x => '<th>' + esc(x.p.name) + '</th>').join('') + '</tr></thead><tbody>' +
      [['⭐ مجموع النقاط', x => x.d.xp], ['🎩 الرتبة', x => RANKS[x.d.rank].n], ['🔥 السلسلة', x => x.d.streak], ['📘 الدروس', x => Object.keys(x.d.lessonsDone).length], ['🎖️ الميداليات', x => Object.keys(x.k.M).filter(m => MEDALS[m]).length], ['🚩 الأعلام', x => x.d.solved.length], ['👑 التيجان', x => lg.crowns[x.p.id] || 0]].map(rw => '<tr><td>' + rw[0] + '</td>' + rows.map(x => '<td><b>' + rw[1](x) + '</b></td>').join('') + '</tr>').join('') + '</tbody></table>';
    const ev = []; lg.ps.forEach(p => Object.values(Kid.of(p.id).E).forEach(e => { if (['lesson', 'medal', 'ctf', 'test'].includes(e.k) && (e.k !== 'test' || e.ok)) ev.push([e, p]); }));
    ev.sort((a, b) => b[0].t - a[0].t);
    h += '<div class="sec-h"><h2>آخر الإنجازات</h2></div><div class="card feed">' + (ev.slice(0, 10).map(([e, p]) => '<div><b>' + esc(p.name) + '</b> ' + (e.k === 'lesson' ? 'أنهى درس «' + esc(e.n || '') + '» 📘' : e.k === 'medal' ? 'ربح ميدالية «' + esc((MEDALS[e.id] || {}).n || '') + '» 🎖️' : e.k === 'ctf' ? 'التقط علم «' + esc((C.ctf.find(c => c.id === e.id) || {}).title || '') + '» 🚩' : 'أتقن وحدة «' + esc((unitById(e.id) || {}).title || '') + '» 🏅') + ' <small class="muted">' + fmtDay(dayKey(e.t)) + '</small></div>').join('') || '<p class="muted" style="margin:0">لا إنجازات بعد. من سيبدأ أولاً؟</p>') + '</div>';
    return { html: h };
  },
  normFam(f) { const x = f.toUpperCase().replace(/[^A-Z0-9]/g, ''); return x.length === 12 ? x.slice(0, 4) + '-' + x.slice(4, 8) + '-' + x.slice(8) : null; },
  async linkFamily(f, msgEl) {
    const code = Views.normFam(f);
    if (!code) { if (msgEl) { msgEl.textContent = 'الرمز يتكوّن من 12 حرفاً ورقماً. تأكد منه.'; msgEl.style.color = 'var(--bad)'; } return false; }
    if (Dev.get().fam === code) return true;
    Dev.set('fam', code);
    if (Sync.has()) {
      if (msgEl) { msgEl.textContent = 'جارٍ التحميل...'; msgEl.style.color = ''; }
      try {
        const r = await Sync.fetchAll(code);
        if (r) { if (r.coach) Coach.replace(mergeCoach(r.coach, emptyCoach())); if (r.p) Prof.mergeIn(r.p); PIDS.forEach(id => { if (r[id]) Kid.mergeInto(id, r[id]); }); App.legacyRemote = r.kid; }
      } catch (e) { }
      Sync.start();
    }
    return true;
  },
  linkDialog() {
    const m = modal('<h2>رمز الربط</h2><p class="muted">اكتب الرمز الذي أعطاك إياه أخوك الكبير.</p><input class="inp mono" id="fam2" dir="ltr" placeholder="XXXX-XXXX-XXXX" value="' + esc(Dev.get().fam || '') + '"><p id="fm2" class="muted"></p><div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn sec" data-close>إلغاء</button></div>');
    $('#fsv', m.el).onclick = async () => { const ok = await Views.linkFamily($('#fam2', m.el).value, $('#fm2', m.el)); if (ok) { m.close(); toast('تم الربط ✅'); App.render(); } };
  },

  map(r, D) {
    const k = Kid.get(); const ri = App.rankInfo(D.xp); const night = document.documentElement.dataset.stage === '2';
    const curU = C.units.find(u => D.st[u.id].open && !D.st[u.id].passed);
    const greet = k.name ? 'يا ' + esc(k.name) : 'يا بطل';
    let h = '<div class="hero">' + Art.eagle('happy', ri.i, night) + '<div class="bubble">' + (curU ? 'أهلاً ' + greet + '! نكمل اليوم في <b>' + esc(curU.title) + '</b>.' : D.stage2 ? 'أهلاً ' + greet + '! الأعلام تنتظرك في تبويب «الأعلام».' : 'أهلاً ' + greet + '!') + '<div class="bar" style="margin-top:8px"><i style="width:' + ri.pct + '%"></i></div><small class="muted">' + esc(ri.cur.n) + (ri.next ? ' ← ' + esc(ri.next.n) + ' (باقي <bdi>' + (ri.next.x - D.xp) + ' XP</bdi>)' : '') + '</small></div></div>';
    const PARTS = { 1: 'المرحلة الأولى · الجزء ١: الأساسيات', 2: 'المرحلة الأولى · الجزء ٢: التعمّق', 3: 'الجزء ٣: ابنِ موقعك وأمّنه 🏗️' };
    let part = 0, n = 0;
    C.units.forEach((u, i) => {
      if ((u.part || 1) !== part) { if (part) h += '</div>'; part = u.part || 1; h += '<div class="stage-h">' + PARTS[part] + '</div><div class="path">'; }
      if (!u.project) n++;
      const s = D.st[u.id];
      const cls = !s.open ? 'locked' : s.passed ? 'done' : (u === curU ? 'cur' : '');
      const pct = Math.round((s.ld / s.total) * 100);
      const stars = u.project ? '' : ' <span class="stars">' + '★'.repeat(s.stars) + '<i>' + '★'.repeat(3 - s.stars) + '</i></span>';
      h += '<a class="unit ' + cls + (u.project ? ' proj' : '') + '" href="' + (s.open ? '#/unit/' + u.id : 'javascript:void 0') + '" data-locked="' + (!s.open ? 1 : 0) + '"><div class="ic">' + u.icon + '</div><div class="tx"><small>' + (u.project ? '⭐ مشروع كبير' : 'الوحدة ' + n) + (s.passed ? stars : '') + '</small><b>' + esc(u.title) + '</b>' +
        (s.open ? '<div class="bar"><i style="width:' + (s.passed ? 100 : pct) + '%"></i></div><small>' + (s.passed ? (u.project ? '✅ أنجزته' : '✅ أتقنتها (' + s.best + '%)' + (s.stars < 3 ? ' · أعد الاختبار لتجمع النجوم' : ' · أعلى درجة!')) : s.ld + ' من ' + s.total + (u.project ? ' مهام' : ' دروس')) + '</small>' : '<small>🔒 ' + (u.project ? 'بعد إتقان الوحدات السابقة' : 'أتقن الوحدة السابقة لتفتحها') + '</small>') + '</div></a>';
    });
    h += '</div>';
    h += '<div class="stage-h">المرحلة الثانية: صيد الأعلام</div>';
    h += D.stage2 ? '<a class="unit cur" href="#/ctf"><div class="ic">🚩</div><div class="tx"><b>تحديات الأعلام (CTF)</b><small>' + D.solved.length + ' من ' + C.ctf.length + ' أعلام</small></div></a>' : '<div class="unit locked"><div class="ic">🚩</div><div class="tx"><b>تحديات الأعلام (CTF)</b><small>🔒 تُفتح بعد المشروع الكبير الثاني</small></div></div>';
    return { html: h, mount() { $$('[data-locked="1"]').forEach(a => a.onclick = e => { e.preventDefault(); Snd.bad(); toast('🔒 أتقن الوحدة السابقة أولاً (80% في اختبارها)'); }); } };
  },

  unit(r, D) {
    const u = unitById(r[1]); if (!u) return Views.map(r, D);
    const s = D.st[u.id]; if (!s || !s.open) { setTimeout(() => App.go('map')); return {}; }
    const k = Kid.get();
    let h = '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/map">' + ic('back', 18) + 'الرحلة</a></div>';
    h += '<div class="card" style="display:flex;gap:12px;align-items:center"><div style="font-size:48px">' + u.icon + '</div><div><h1 style="margin:0">' + esc(u.title) + '</h1><p class="muted" style="margin:0">' + md(u.blurb || '') + '</p></div></div>';
    let prevDone = true;
    u.lessons.forEach((l, i) => {
      const key = u.id + '.' + l.id, L = k.L[key]; const done = !!(L && L.d);
      const open = prevDone || (s.ov === 'open');
      h += '<a class="unit ' + (done ? 'done' : open ? 'cur' : 'locked') + '" href="' + (open ? '#/lesson/' + u.id + '/' + l.id : 'javascript:void 0') + '"><div class="ic" style="font-size:22px;font-weight:800">' + (done ? '✅' : (i + 1)) + '</div><div class="tx"><b>' + esc(l.title) + '</b><small>' + (done ? 'أنهيته · يمكنك إعادته' : open ? (l.mins || 10) + ' دقائق تقريباً' : '🔒 أنهِ الدرس السابق') + '</small></div></a>';
      prevDone = done;
    });
    if (!u.project) {
      const allDone = s.ld === s.total;
      h += '<div class="card" style="text-align:center"><h2>🏅 اختبار الإتقان</h2><p>' + (s.passed ? 'أتقنت هذه الوحدة! أفضل نتيجة: <b>' + s.best + '%</b>' : 'تحتاج <b>80%</b> لتفتح الوحدة التالية.' + (s.best ? ' أفضل نتيجة حتى الآن: ' + s.best + '%' : '')) + '</p>' +
        (allDone || s.ov === 'open' ? '<a class="btn ' + (s.passed ? 'sec' : 'gold') + '" href="#/test/' + u.id + '">' + (s.passed ? 'أعد الاختبار' : 'ابدأ الاختبار') + '</a>' : '<p class="muted">🔒 أنهِ كل الدروس أولاً</p>') + '</div>';
    }
    return { html: h };
  },

  lesson(r, D) {
    const u = unitById(r[1]); const l = u && u.lessons.find(x => x.id === r[2]);
    if (!u || !l || !D.st[u.id] || !D.st[u.id].open) { setTimeout(() => App.go('map')); return {}; }
    return Lesson.start(u, l, D);
  },
  test(r, D) { const u = unitById(r[1]); if (!u || !D.st[u.id] || !D.st[u.id].open) { setTimeout(() => App.go('map')); return {}; } return Test.start(u, D); },

  today(r, D) {
    const k = Kid.get(); const tk = {}; const dd = k.D[dayKey()] || {}; for (const dv in dd) Object.assign(tk, dd[dv].k || {});
    const due = Review.due().length;
    const nextL = Views.nextLesson(D);
    let h = '<h1>مهام اليوم</h1><p class="muted">10–15 دقيقة كل يوم تكفي. أنجز مهمتين على الأقل ليُحسب اليوم في سلسلتك 🔥</p>';
    const tasks = [
      ['typing', '⚡', 'إحماء الأصابع', 'لعبة كتابة سريعة (دقيقة واحدة)', '#/typing'],
      ['lesson', '📘', nextL ? 'درس اليوم' : (D.stage2 ? 'علم اليوم' : 'درس اليوم'), nextL ? nextL.title : (D.stage2 ? 'التقط علماً جديداً' : 'أكمل اختبار الوحدة'), nextL ? nextL.href : (D.stage2 ? '#/ctf' : '#/map')],
      ['review', '🧠', 'المراجعة', due ? cnt(due, ['سؤال واحد ينتظرك', 'سؤالان ينتظرانك', 'أسئلة تنتظرك', 'سؤالاً ينتظرك']) : 'تحدٍّ سريع من دروسك السابقة', '#/review']
    ];
    tasks.forEach(t => { h += '<a class="task ' + (tk[t[0]] ? 'done' : '') + '" href="' + t[4] + '"><div class="ck">' + (tk[t[0]] ? '✓' : t[1]) + '</div><div style="flex:1"><b>' + t[2] + '</b><br><small class="muted">' + esc(t[3]) + '</small></div>' + ic('back', 20) + '</a>'; });
    // streak days
    h += '<div class="card"><h3 style="text-align:center;margin-top:0">🔥 سلسلتك: ' + cnt(D.streak, F_DAY) + '</h3><div class="streak">';
    for (let i = 13; i >= 0; i--) { const dk = addDays(dayKey(), -i); h += '<span class="' + (D.active[dk] ? 'on' : '') + '" title="' + fmtDay(dk) + '">' + dk.slice(8) + '</span>'; }
    h += '</div></div>';
    const c = Coach.get();
    if (c.wk && c.wk.title && (!c.wk.to || c.wk.to === '*' || c.wk.to === Kid.pid())) {
      const w = k.W[c.wk.id];
      h += '<div class="card" style="border-color:var(--gold)"><h3 style="margin-top:0">🏆 تحدّي الأسبوع من أخيك</h3><b>' + esc(c.wk.title) + '</b><p style="white-space:pre-wrap">' + esc(c.wk.body || '') + '</p>' + (w ? '<p class="pill ok">✅ أرسلت إجابتك</p>' : '<a class="btn gold" href="#/weekly">حلّ التحدي</a>') + '</div>';
    }
    const msgs = Object.entries(c.msgs || {}).filter(([id, m]) => !m.to || m.to === '*' || m.to === Kid.pid()).sort((a, b) => b[1].t - a[1].t).slice(0, 5);
    if (msgs.length) h += '<div class="sec-h"><h2>رسائل أخيك الكبير</h2></div>' + msgs.map(([id, m]) => '<div class="card" style="padding:10px 14px"><small class="muted">' + fmtDay(dayKey(m.t)) + '</small><p style="margin:0;white-space:pre-wrap">' + esc(m.x) + '</p></div>').join('');
    return { html: h };
  },
  nextLesson(D) {
    const k = Kid.get();
    for (const u of C.units) {
      const s = D.st[u.id]; if (!s || !s.open) continue;
      for (const l of u.lessons) if (!(k.L[u.id + '.' + l.id] && k.L[u.id + '.' + l.id].d)) return { title: l.title, href: '#/lesson/' + u.id + '/' + l.id };
      if (!u.project && !s.passed) return { title: 'اختبار إتقان: ' + u.title, href: '#/test/' + u.id };
    }
    return null;
  },
  weekly() {
    const c = Coach.get(); if (!c.wk) { setTimeout(() => App.go('today')); return {}; }
    const w = Kid.get().W[c.wk.id];
    return {
      html: '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/today">' + ic('back', 18) + 'اليوم</a></div><div class="card"><h1>🏆 ' + esc(c.wk.title) + '</h1><p style="white-space:pre-wrap">' + esc(c.wk.body || '') + '</p><label><b>إجابتك أو ما فعلته:</b></label><textarea class="inp" id="wa" rows="5">' + esc(w ? w.ans : '') + '</textarea><button class="btn gold wide" id="ws" style="margin-top:10px">أرسل لأخي</button></div>',
      mount() { $('#ws').onclick = () => { const a = $('#wa').value.trim(); if (!a) { toast('اكتب إجابتك أولاً'); return; } const first = !w; Kid.weekly(c.wk.id, a); if (first) { Snd.win(); confetti(); xpFly(50, $('#ws')); } toast('وصلت إجابتك لأخيك ✅'); setTimeout(() => App.go('today'), 900); }; }
    };
  },

  review() { return Review.start(); },
  typing() { return Typing.start(); },

  glossary() {
    const k = Kid.get(); const ids = Object.keys(C.terms).filter(id => k.G[id]).sort((a, b) => C.terms[a].ar.localeCompare(C.terms[b].ar, 'ar'));
    let h = '<div class="row" style="margin:6px 0"><a class="btn sm sec" href="#/me">' + ic('back', 18) + 'ملفي</a></div><h1>📖 قاموسي</h1><p class="muted">كل كلمة تقابلها في الدروس تُضاف هنا تلقائياً. عندك الآن <b>' + ids.length + '</b> من ' + Object.keys(C.terms).length + ' كلمة.</p><input class="inp" id="gq" placeholder="ابحث عن كلمة...">';
    h += '<div id="gl">' + (ids.length ? ids.map(id => { const t = C.terms[id]; return '<div class="gl-item" data-s="' + esc((t.ar + ' ' + (t.en || '')).toLowerCase()) + '"><b>' + esc(t.ar) + '</b> ' + (t.en ? '<span class="en">' + esc(t.en) + '</span>' : '') + '<div>' + md(t.d) + '</div></div>'; }).join('') : '<div class="card" style="text-align:center">القاموس فارغ الآن. ابدأ أول درس وستمتلئ هذه الصفحة بالكلمات!</div>') + '</div>';
    return { html: h, mount() { const q = $('#gq'); if (q) q.oninput = () => { const v = q.value.trim().toLowerCase(); $$('.gl-item').forEach(e => e.style.display = !v || e.dataset.s.includes(v) ? '' : 'none'); }; } };
  },

  me(r, D) {
    const k = Kid.get(); const ri = App.rankInfo(D.xp); const d = Dev.get();
    let h = '<div class="card hatbox">' + Art.hat(ri.i) + '<h1 style="margin:0">' + esc(k.name || 'البطل') + (D.king ? ' 👑' : '') + '</h1><p style="margin:0;color:var(--primary);font-weight:800">🏷️ ' + esc(App.titleOf(k)) + '</p><p style="margin:0"><b>' + esc(ri.cur.n) + '</b> · <bdi>' + D.xp + ' XP</bdi></p><div class="bar" style="width:100%;max-width:340px"><i style="width:' + ri.pct + '%"></i></div><small class="muted">' + (ri.next ? 'باقي <bdi>' + (ri.next.x - D.xp) + ' XP</bdi> على «' + esc(ri.next.n) + '»' : 'وصلت لأعلى رتبة!') + '</small></div>';
    h += '<div class="grid2"><a class="btn gold" href="#/look">👕 خزانتي (الأشكال والألوان)</a><a class="btn sec" href="#/glossary">' + ic('book', 20) + 'قاموسي</a></div>';
    h += '<div class="sec-h"><h2>الرتب</h2></div><div class="ranks">' + RANKS.map((x, i) => '<div class="rk ' + (i === ri.i ? 'cur' : i > ri.i ? 'no' : '') + '">' + (i <= ri.i ? '🎩' : '🔒') + ' ' + esc(x.n) + '<span class="sp" style="flex:1"></span><small>' + x.x + ' XP</small></div>').join('') + '</div>';
    h += '<div class="sec-h"><h2>الميداليات</h2><small class="muted">' + Object.keys(k.M).filter(m => MEDALS[m]).length + ' من ' + Object.keys(MEDALS).length + '</small></div>';
    for (const dm in DOMAINS) {
      const ms = Object.keys(MEDALS).filter(m => MEDALS[m].d === dm); if (!ms.length) continue;
      h += '<h3 style="color:' + DOMAINS[dm][1] + '">' + DOMAINS[dm][0] + '</h3><div class="medals">' + ms.map(m => '<div class="medal ' + (k.M[m] ? '' : 'no') + '">' + Art.medal(MEDALS[m].ic, DOMAINS[dm][1], !!k.M[m]) + '<b>' + esc(MEDALS[m].n) + '</b><small>' + esc(MEDALS[m].how) + '</small></div>').join('') + '</div>';
    }
    h += '<div class="sec-h"><h2>الشهادات</h2></div><div class="card">' +
      (k.X.p_final2 ? '<button class="btn gold" data-act="cert" data-v="1">' + ic('dl', 20) + 'شهادة المرحلة الأولى (PDF)</button>' : '<p class="muted">🔒 شهادة المرحلة الأولى: بعد المشروع الكبير الثاني.</p>') +
      (D.solved.length >= C.ctf.length && C.ctf.length ? ' <button class="btn gold" data-act="cert" data-v="2">' + ic('dl', 20) + 'شهادة المرحلة الثانية (PDF)</button>' : '<p class="muted">🔒 شهادة المرحلة الثانية: بعد التقاط كل الأعلام.</p>') + '</div>';
    h += '<div class="sec-h"><h2>الإعدادات</h2></div><div class="card"><div class="row"><button class="btn sec" data-act="sound">' + ic(d.sound ? 'sound' : 'mute', 20) + (d.sound ? 'الصوت يعمل' : 'الصوت مكتوم') + '</button><button class="btn sec" data-act="big">' + (d.big ? 'خط عادي' : 'خط كبير') + '</button><button class="btn sec" data-act="link">🔗 ' + (d.fam ? 'رمز الربط: <span class="mono">' + esc(d.fam) + '</span>' : 'إضافة رمز الربط') + '</button></div><p class="muted" style="font-size:.85em;margin-top:10px">رقم هذا الجهاز: <span class="mono">' + esc(d.id) + '</span></p></div>';
    return { html: h };
  },

  ctf(r, D) { return CTF.hub(D); },
  ctfc(r, D) { return CTF.challenge(r[1], D); },
  next() { return CTF.next(); }
};

/* ---------- Lesson player ---------- */
const Lesson = {
  start(u, l, D) {
    const key = u.id + '.' + l.id;
    Kid.lessonStart(key);
    App.lessonKey = key; App.celeOK = false;
    const L = { u, l, key, i: App.preview && App.helpJump != null ? Math.min(App.helpJump, l.steps.length - 1) : 0, ok: false, steps: l.steps, xpBefore: D.xp, rank: D.rank };
    Lesson.cur = L;
    return { html: '<div id="lesson"></div>', mount() { Lesson.paint(); } };
  },
  paint() {
    const L = Lesson.cur; const s = L.steps[L.i]; const total = L.steps.length;
    const night = document.documentElement.dataset.stage === '2';
    L.ok = !Lesson.blocking(s); L.simpleShown = false;
    let h = '<div class="lhead"><button class="x" data-l="exit" aria-label="خروج">' + ic('x', 22) + '</button><div class="bar"><i style="width:' + Math.round(L.i / total * 100) + '%"></i></div><small class="muted">' + (L.i + 1) + '/' + total + '</small></div>';
    if (L.i === 0) h += '<h2 style="margin:0 0 6px">' + esc(L.l.title) + '</h2>';
    const mood = s.mood || (s.t === 'say' ? 'idle' : 'think');
    const text = s.m || s.q || '';
    if (text) h += '<div class="mentor">' + Art.eagle(mood, L.rank, night) + '<div class="bubble">' + md(text) + '<div id="simple"></div></div></div>';
    h += '<div id="stage"></div><div id="fb"></div>';
    h += '<div class="lfoot">' + (s.s ? '<button class="btn sec" data-l="simple">' + ic('bulb', 20) + 'اشرح لي بطريقة أبسط</button>' : '') + '<button class="btn" data-l="next" id="nextBtn"' + (L.ok ? '' : ' disabled') + '>' + (L.i === total - 1 ? 'أنهيت الدرس!' : 'التالي') + '</button></div>';
    const root = $('#lesson'); root.innerHTML = h;
    const stage = $('#stage');
    const api = Lesson.api(s, L);
    try { Steps.render(s, stage, api, L); } catch (e) { stage.innerHTML = '<div class="feedback bad">حدث خطأ في هذا الجزء. اضغط التالي.</div>'; api.done(); }
    root.onclick = e => {
      const b = e.target.closest('[data-l]'); if (!b) return;
      const a = b.dataset.l;
      if (a === 'exit') { if (L.i === 0 || confirm('تخرج من الدرس؟ ستبدأه من جديد لاحقاً.')) App.go('unit/' + L.u.id); }
      if (a === 'simple') { Snd.click(); if (!L.simpleShown) { L.simpleShown = true; Kid.lessonHint(L.key); } $('#simple').innerHTML = '<div class="simpler">' + md(s.s) + '</div>'; }
      if (a === 'next') { if (!L.ok) return; Snd.click(); if (L.i < total - 1) { L.i++; Lesson.paint(); window.scrollTo(0, 0); } else Lesson.finish(); }
    };
  },
  blocking(s) { return ['q', 'in', 'sort', 'order', 'match', 'do', 'sh', 'py'].includes(s.t) || (s.t === 'say' && s.w && s.w.goal); },
  api(s, L) {
    const qid = L.key + '.' + L.i;
    return {
      done(msg) { L.ok = true; const b = $('#nextBtn'); if (b) { b.disabled = false; b.focus({ preventScroll: true }); } if (msg) Lesson.fb(true, msg); },
      wrong(tag) { Kid.lessonWrong(L.key, tag || s.tag); },
      fb: Lesson.fb, qid,
      card(ok) { Kid.addCard(qid, ok); },
      medal(id) { if (Kid.medal(id)) toast('🏅 ربحت ميدالية: ' + MEDALS[id].n); },
      hint() { Kid.lessonHint(L.key); }
    };
  },
  fb(ok, msg, why) {
    const f = $('#fb'); if (!f) return;
    f.innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✅ ' : '❌ ') + md(msg) + (why ? '<div class="why">' + md(why) + '</div>' : '') + '</div>';
    if (ok) Snd.ok(); else Snd.bad();
    f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  finish() {
    const L = Lesson.cur; const first = Kid.lessonDone(L.key, L.l.title);
    if (L.l.medal) Kid.medal(L.l.medal);
    if (L.u.project && L.u.lessons.every(x => Kid.get().L[L.u.id + '.' + x.id] && Kid.get().L[L.u.id + '.' + x.id].d)) { if (Kid.flag(L.u.id === 'final' ? 'final' : 'p_' + L.u.id) && L.u.doneMedal) Kid.medal(L.u.doneMedal); }
    const D = App.derive(); const gain = D.xp - L.xpBefore;
    const idx = L.u.lessons.indexOf(L.l); const nx = L.u.lessons[idx + 1];
    const night = document.documentElement.dataset.stage === '2';
    App.lessonKey = null; App.celeOK = true;
    $('#lesson').innerHTML = '<div style="text-align:center;padding-top:30px">' + Art.eagle('happy', D.rank, night).replace('class="eagle"', 'class="eagle" style="width:150px"') + '<h1>أحسنت!</h1><p>أنهيت درس «' + esc(L.l.title) + '»</p>' + (gain > 0 ? '<p class="big-num"><bdi>+' + gain + ' XP</bdi></p>' : '<p class="muted">راجعت الدرس مرة أخرى. ممتاز!</p>') +
      '<div class="row" style="justify-content:center">' + (nx ? '<a class="btn" href="#/lesson/' + L.u.id + '/' + nx.id + '">الدرس التالي</a>' : (!L.u.project ? '<a class="btn gold" href="#/test/' + L.u.id + '">اختبار الإتقان</a>' : '<a class="btn gold" href="#/map">الرحلة</a>')) + '<a class="btn sec" href="#/unit/' + L.u.id + '">قائمة الدروس</a></div></div>';
    if (first) { Snd.win(); confetti(70); }
    setTimeout(App.checkCele, 900);
  }
};

/* ---------- step renderers ---------- */
const norm = s => String(s || '').trim().toLowerCase().replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ');
const Steps = {
  render(s, el, api, L) {
    const f = Steps[s.t]; if (f) f(s, el, api, L); else api.done();
  },
  say(s, el, api) { if (s.w) { const w = document.createElement('div'); el.appendChild(w); Widgets.mount(s.w, w, api); if (!s.w.goal) api.done(); } else api.done(); if (s.img) el.insertAdjacentHTML('afterbegin', '<div style="text-align:center;font-size:64px;line-height:1.2">' + s.img + '</div>'); },
  q(s, el, api, L) {
    const order = s.keep ? s.o.map((x, i) => i) : shuffle(s.o.map((x, i) => i));
    let firstTry = true, solved = false;
    el.innerHTML = (s.code ? '<pre class="hexv">' + esc(s.code) + '</pre>' : '') + '<div class="opts">' + order.map(i => '<button class="opt" data-i="' + i + '">' + md(s.o[i]) + '</button>').join('') + '</div>';
    el.onclick = e => {
      const b = e.target.closest('.opt'); if (!b || solved) return; const i = +b.dataset.i;
      if (i === s.a) { solved = true; b.classList.add('right'); api.card(firstTry); api.fb(true, s.yes || pick(['صحيح!', 'ممتاز!', 'أحسنت!', 'بالضبط!']), s.why); api.done(); }
      else { firstTry = false; b.classList.add('wrong'); b.disabled = true; api.wrong(); api.fb(false, (s.no && s.no[i]) || 'ليس هذا. حاول مرة أخرى!', s.hint); }
    };
  },
  in(s, el, api) {
    let firstTry = true;
    el.innerHTML = (s.code ? '<pre class="hexv">' + esc(s.code) + '</pre>' : '') + '<form class="row" style="flex-wrap:nowrap"><input class="inp' + (s.ltr ? ' mono' : '') + '" ' + (s.ltr ? 'dir="ltr"' : '') + ' autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(s.ph || 'اكتب إجابتك') + '"><button class="btn">تحقّق</button></form>';
    const inp = $('input', el); setTimeout(() => inp.focus({ preventScroll: true }), 50);
    $('form', el).onsubmit = e => {
      e.preventDefault(); const v = norm(inp.value); if (!v) return;
      const ok = [].concat(s.a).some(a => norm(a) === v || (s.loose && v.includes(norm(a))));
      if (ok) { inp.disabled = true; api.card(firstTry); api.fb(true, s.yes || 'صحيح!', s.why); api.done(); }
      else { firstTry = false; api.wrong(); api.fb(false, 'ليس بعد. حاول مرة أخرى!', s.hint); }
    };
  },
  sort(s, el, api) {
    const items = shuffle(s.items.map((x, i) => i)); let sel = null; const placed = {};
    const draw = () => {
      el.innerHTML = '<p class="muted" style="font-size:.9em">اضغط على البطاقة، ثم على الصندوق المناسب.</p><div class="tagbox">' + items.filter(i => !(i in placed)).map(i => '<button class="tag' + (sel === i ? ' sel' : '') + '" data-i="' + i + '">' + md(s.items[i][0]) + '</button>').join('') + '</div><div class="buckets">' + s.buckets.map((b, bi) => '<div class="bucket" data-b="' + bi + '"><h4>' + md(b) + '</h4>' + items.filter(i => placed[i] === bi).map(i => '<span class="tag right" style="display:inline-block;margin:3px">' + md(s.items[i][0]) + '</span>').join('') + '</div>').join('') + '</div>';
    };
    draw();
    el.onclick = e => {
      const t = e.target.closest('.tag[data-i]'); if (t) { sel = +t.dataset.i; Snd.click(); draw(); return; }
      const b = e.target.closest('.bucket'); if (!b || sel === null) return; const bi = +b.dataset.b;
      if (s.items[sel][1] === bi) { placed[sel] = bi; Snd.ok(); sel = null; draw(); if (Object.keys(placed).length === s.items.length) { api.card(true); api.fb(true, s.yes || 'رتّبتها كلها صحيحاً!', s.why); api.done(); } }
      else { api.wrong(); const why = s.items[sel][2]; api.fb(false, 'ليس هذا الصندوق. فكّر مرة أخرى!', why); const tg = $('.tag[data-i="' + sel + '"]', el); if (tg) tg.classList.add('wrong'); }
    };
  },
  order(s, el, api) {
    let cur = shuffle(s.items.map((x, i) => i)); if (cur.every((x, i) => x === i)) cur.reverse();
    const draw = () => { el.innerHTML = '<p class="muted" style="font-size:.9em">رتّب الخطوات بالأسهم، ثم اضغط «تحقّق».</p><div class="order-list">' + cur.map((i, p) => '<div class="order-item"><span class="n">' + (p + 1) + '</span><span>' + md(s.items[i]) + '</span><span class="mv"><button data-m="' + p + '" data-d="-1" aria-label="أعلى">' + ic('up', 18) + '</button><button data-m="' + p + '" data-d="1" aria-label="أسفل">' + ic('down', 18) + '</button></span></div>').join('') + '</div><button class="btn" data-ck>تحقّق</button>'; };
    draw();
    el.onclick = e => {
      const m = e.target.closest('[data-m]'); if (m) { const p = +m.dataset.m, d = +m.dataset.d, q = p + d; if (q < 0 || q >= cur.length) return;[cur[p], cur[q]] = [cur[q], cur[p]]; Snd.click(); draw(); return; }
      if (e.target.closest('[data-ck]')) { if (cur.every((x, i) => x === i)) { api.card(true); api.fb(true, s.yes || 'الترتيب صحيح!', s.why); api.done(); $$('[data-m],[data-ck]', el).forEach(b => b.disabled = true); } else { api.wrong(); const good = cur.filter((x, i) => x === i).length; api.fb(false, 'ليس بعد. ' + good + ' في مكانها الصحيح.', s.hint); } }
    };
  },
  match(s, el, api) {
    const L = shuffle(s.pairs.map((x, i) => i)), R = shuffle(s.pairs.map((x, i) => i)); let sel = null; const done = {};
    const draw = () => { el.innerHTML = '<p class="muted" style="font-size:.9em">اضغط على عنصر من اليمين، ثم على ما يناسبه من اليسار.</p><div class="match"><div class="col">' + L.map(i => '<button class="tag' + (done[i] ? ' right' : sel === i ? ' sel' : '') + '" data-l="' + i + '"' + (done[i] ? ' disabled' : '') + '>' + md(s.pairs[i][0]) + '</button>').join('') + '</div><div class="col">' + R.map(i => '<button class="tag' + (done[i] ? ' right' : '') + '" data-r="' + i + '"' + (done[i] ? ' disabled' : '') + '>' + md(s.pairs[i][1]) + '</button>').join('') + '</div></div>'; };
    draw();
    el.onclick = e => {
      const l = e.target.closest('[data-l]'); if (l) { sel = +l.dataset.l; Snd.click(); draw(); return; }
      const r = e.target.closest('[data-r]'); if (!r || sel === null) return; const ri = +r.dataset.r;
      if (ri === sel) { done[sel] = 1; sel = null; Snd.ok(); draw(); if (Object.keys(done).length === s.pairs.length) { api.card(true); api.fb(true, s.yes || 'وصّلتها كلها!', s.why); api.done(); } }
      else { api.wrong(); r.classList.add('wrong'); Snd.bad(); setTimeout(() => r.classList.remove('wrong'), 400); }
    };
  },
  do(s, el, api) { Widgets.mount(s.w, el, api); },
  sh(s, el, api) { Term.mission(s, el, api); },
  py(s, el, api) { Py.exercise(s, el, api); }
};
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- Mastery test ---------- */
const Test = {
  start(u, D) {
    const pool = (u.test || []).map((s, i) => ({ s, qid: u.id + '.t.' + i }));
    const qs = shuffle(pool).slice(0, Math.min(10, pool.length));
    Test.cur = { u, qs, i: 0, right: 0, wrong: [], xpBefore: D.xp, answered: false };
    App.celeOK = false;
    return { html: '<div id="test"></div>', mount() { Test.paint(); } };
  },
  paint() {
    const T = Test.cur; const { s, qid } = T.qs[T.i]; T.answered = false;
    let h = '<div class="lhead"><button class="x" data-t="exit" aria-label="خروج">' + ic('x', 22) + '</button><div class="bar"><i style="width:' + Math.round(T.i / T.qs.length * 100) + '%"></i></div><small class="muted">' + (T.i + 1) + '/' + T.qs.length + '</small></div>' +
      '<p class="muted" style="margin:0">🏅 اختبار إتقان: ' + esc(T.u.title) + ' · محاولة واحدة لكل سؤال</p><h2>' + md(s.q || s.m) + '</h2>' + (s.code ? '<pre class="hexv">' + esc(s.code) + '</pre>' : '');
    if (s.t === 'in') h += '<form class="row" style="flex-wrap:nowrap" id="tf"><input class="inp' + (s.ltr ? ' mono' : '') + '" ' + (s.ltr ? 'dir="ltr"' : '') + ' autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="اكتب إجابتك"><button class="btn">تأكيد</button></form>';
    else h += '<div class="opts">' + shuffle(s.o.map((x, i) => i)).map(i => '<button class="opt" data-i="' + i + '">' + md(s.o[i]) + '</button>').join('') + '</div>';
    h += '<div id="fb"></div><div class="lfoot"><button class="btn" id="tn" disabled>' + (T.i === T.qs.length - 1 ? 'النتيجة' : 'التالي') + '</button></div>';
    const root = $('#test'); root.innerHTML = h;
    const answer = (ok, el) => {
      if (T.answered) return; T.answered = true;
      if (ok) T.right++; else T.wrong.push(s.tag || '');
      Kid.review(qid, ok);
      Lesson.fb(ok, ok ? 'صحيح!' : 'خطأ. ' + (s.t === 'in' ? 'الإجابة: <span class="mono">' + esc([].concat(s.a)[0]) + '</span>' : 'الصحيح: ' + md(s.o[s.a])), s.why);
      $('#tn').disabled = false;
    };
    root.onclick = e => {
      const b = e.target.closest('.opt'); if (b && !T.answered) { const i = +b.dataset.i; b.classList.add(i === s.a ? 'right' : 'wrong'); if (i !== s.a) { const r = $('.opt[data-i="' + s.a + '"]', root); if (r) r.classList.add('right'); } answer(i === s.a); }
      if (e.target.closest('[data-t="exit"]') && confirm('تخرج من الاختبار؟ لن تُحسب هذه المحاولة.')) App.go('unit/' + T.u.id);
      if (e.target.id === 'tn' && T.answered) { if (T.i < T.qs.length - 1) { T.i++; Test.paint(); window.scrollTo(0, 0); } else Test.finish(); }
    };
    const f = $('#tf'); if (f) { const inp = $('input', f); setTimeout(() => inp.focus({ preventScroll: true }), 50); f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return; inp.disabled = true; const v = norm(inp.value); answer([].concat(s.a).some(a => norm(a) === v)); }; }
  },
  finish() {
    const T = Test.cur; const sc = Math.round(T.right / T.qs.length * 100); const pass = sc >= 80;
    const wasPassed = !!(Kid.get().T[T.u.id] && Kid.get().T[T.u.id].p); const firstTry = !Kid.get().T[T.u.id];
    Kid.testDone(T.u.id, sc, T.qs.length, T.wrong.filter(Boolean));
    if (sc === 100 && firstTry) Kid.medal('perfect');
    const D = App.derive(); const gain = D.xp - T.xpBefore;
    App.celeOK = true;
    const idx = C.units.indexOf(T.u); const nu = C.units[idx + 1];
    const tags = uniq(T.wrong.filter(Boolean));
    let h = '<div style="text-align:center;padding-top:24px">' + Art.eagle(pass ? 'happy' : 'think', D.rank).replace('class="eagle"', 'class="eagle" style="width:140px"') +
      '<h1>' + (pass ? (wasPassed ? 'ممتاز مرة أخرى!' : 'أتقنت الوحدة!') : 'اقتربت!') + '</h1><p class="big-num">' + sc + '%</p><div class="stars big">' + '★'.repeat(sc >= 100 ? 3 : sc >= 90 ? 2 : sc >= 80 ? 1 : 0) + '<i>' + '★'.repeat(3 - (sc >= 100 ? 3 : sc >= 90 ? 2 : sc >= 80 ? 1 : 0)) + '</i></div><p>' + T.right + ' من ' + T.qs.length + ' إجابات صحيحة</p>' + (gain > 0 ? '<p><b style="color:var(--gold)"><bdi>+' + gain + ' XP</bdi></b></p>' : '');
    if (pass) h += !wasPassed && nu ? '<p>فُتحت لك الوحدة التالية: <b>' + esc(nu.title) + '</b> 🔓</p><a class="btn gold" href="#/unit/' + nu.id + '">ادخلها الآن</a>' : '<a class="btn" href="#/map">الرحلة</a>';
    else h += '<p>تحتاج 80% على الأقل. لا بأس! راجع هذه الأفكار ثم حاول مرة أخرى:</p>' + (tags.length ? '<div class="tagbox" style="justify-content:center">' + tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') + '<div class="row" style="justify-content:center"><a class="btn" href="#/test/' + T.u.id + '">حاول مرة أخرى</a><a class="btn sec" href="#/unit/' + T.u.id + '">راجع الدروس</a></div>';
    h += '</div>';
    $('#test').innerHTML = h;
    if (pass && !wasPassed) { Snd.fanfare(); confetti(120); } else if (pass) Snd.win();
    setTimeout(App.checkCele, 1200);
  }
};

/* ---------- Spaced review ---------- */
const Review = {
  due() { const k = Kid.get(), t = dayKey(); return Object.keys(k.R).filter(q => QIDX[q] && k.R[q].due <= t).sort((a, b) => k.R[a].due < k.R[b].due ? -1 : 1); },
  start() {
    let qs = Review.due().slice(0, 6), quick = false;
    if (!qs.length) { quick = true; qs = shuffle(Object.keys(Kid.get().R).filter(q => QIDX[q])).slice(0, 3); }
    if (!qs.length) return { html: '<div class="card" style="text-align:center;margin-top:30px">' + Art.eagle('happy', 0).replace('class="eagle"', 'class="eagle" style="width:110px"') + '<h2>لا أسئلة للمراجعة بعد</h2><p>ابدأ أول درس، وستعود إليك أسئلته هنا بعد أيام لتثبّتها في ذاكرتك.</p><a class="btn" href="#/map">الرحلة</a></div>' };
    Review.cur = { qs, i: 0, right: 0, quick };
    App.celeOK = false;
    return { html: '<div id="rev"></div>', mount() { Review.paint(); } };
  },
  paint() {
    const R = Review.cur; const qid = R.qs[R.i]; const { s } = QIDX[qid];
    const root = $('#rev'); let answered = false;
    root.innerHTML = '<div class="lhead"><button class="x" data-r="exit" aria-label="خروج">' + ic('x', 22) + '</button><div class="bar"><i style="width:' + Math.round(R.i / R.qs.length * 100) + '%"></i></div><small class="muted">' + (R.i + 1) + '/' + R.qs.length + '</small></div><p class="muted" style="margin:0">🧠 ' + (R.quick ? 'تحدٍّ سريع' : 'مراجعة: هل تتذكّر؟') + '</p><h2>' + md(s.q || s.m) + '</h2>' + (s.code ? '<pre class="hexv">' + esc(s.code) + '</pre>' : '') +
      (s.t === 'in' ? '<form class="row" style="flex-wrap:nowrap" id="rf"><input class="inp' + (s.ltr ? ' mono' : '') + '" ' + (s.ltr ? 'dir="ltr"' : '') + ' autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn">تأكيد</button></form>' : '<div class="opts">' + shuffle(s.o.map((x, i) => i)).map(i => '<button class="opt" data-i="' + i + '">' + md(s.o[i]) + '</button>').join('') + '</div>') +
      '<div id="fb"></div><div class="lfoot"><button class="btn" id="rn" disabled>' + (R.i === R.qs.length - 1 ? 'إنهاء' : 'التالي') + '</button></div>';
    const answer = ok => { if (answered) return; answered = true; if (ok) R.right++; if (!R.quick) Kid.review(qid, ok); Lesson.fb(ok, ok ? 'تتذكّرها! ممتاز' : 'لا بأس، ستعود إليك غداً. ' + (s.t === 'in' ? 'الإجابة: <span class="mono">' + esc([].concat(s.a)[0]) + '</span>' : 'الصحيح: ' + md(s.o[s.a])), s.why); $('#rn').disabled = false; };
    root.onclick = e => {
      const b = e.target.closest('.opt'); if (b && !answered) { const i = +b.dataset.i; b.classList.add(i === s.a ? 'right' : 'wrong'); answer(i === s.a); }
      if (e.target.closest('[data-r="exit"]')) App.go('today');
      if (e.target.id === 'rn' && answered) { if (R.i < R.qs.length - 1) { R.i++; Review.paint(); } else Review.finish(); }
    };
    const f = $('#rf'); if (f) { const inp = $('input', f); inp.focus({ preventScroll: true }); f.onsubmit = e => { e.preventDefault(); if (!inp.value.trim()) return; inp.disabled = true; const v = norm(inp.value); answer([].concat(s.a).some(a => norm(a) === v)); }; }
  },
  finish() {
    const R = Review.cur; const first = Kid.task('review'); Kid.save();
    App.celeOK = true;
    $('#rev').innerHTML = '<div style="text-align:center;padding-top:30px">' + Art.eagle('happy', App.derive().rank).replace('class="eagle"', 'class="eagle" style="width:130px"') + '<h1>انتهت المراجعة!</h1><p class="big-num">' + R.right + ' / ' + R.qs.length + '</p><p>كل سؤال تتذكّره يبتعد موعده أكثر، وكل سؤال تنساه يعود غداً.</p><a class="btn" href="#/today">مهام اليوم</a></div>';
    if (first) { Snd.win(); confetti(50); }
    setTimeout(App.checkCele, 900);
  }
};

/* ---------- Typing warm-up ---------- */
const Typing = {
  WORDS: ['ls', 'cd', 'pwd', 'cat', 'echo', 'print', 'python', 'hello', 'data', 'port', 'ip', 'dns', 'web', 'hash', 'key', 'flag', 'code', 'loop', 'if', 'else', 'for', 'def', 'list', 'file', 'mkdir', 'grep', 'http', 'login', 'admin', 'cyber', 'byte', 'bit', 'cpu', 'ram', 'disk', 'server', 'client', 'oqab', 'shield', 'secret', 'cipher', 'linux', 'html', 'link', 'safe'],
  start() {
    const k = Kid.get(); const lvl = Object.keys(k.L).filter(x => k.L[x].d).length;
    let words = Typing.WORDS.slice(0, lvl < 10 ? 20 : lvl < 25 ? 34 : Typing.WORDS.length);
    if (lvl >= 20) words = words.concat(['ls -a', 'cd ..', 'print(x)', 'x = 5', 'cat log.txt']);
    const T = { words: shuffle(words), i: 0, typed: 0, start: 0, left: 60, timer: 0, ok: 0, errs: 0 };
    Typing.cur = T;
    return {
      html: '<div class="lhead"><button class="x" data-y="exit" aria-label="خروج">' + ic('x', 22) + '</button><div class="bar"><i id="tyb" style="width:100%"></i></div><small class="muted" id="tyt">60</small></div><div class="mentor">' + Art.eagle('idle', 0) + '<div class="bubble">إحماء الأصابع! اكتب الكلمة الظاهرة ثم اضغط مسافة أو Enter. لديك <b>دقيقة واحدة</b>. هذه الكلمات ستحتاجها في الطرفية والبرمجة.</div></div>' +
        '<div class="wbox typing"><div class="target" id="tw"></div><input class="inp mono" id="ti" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ابدأ الكتابة هنا" style="margin-top:10px;text-align:center"><div class="row" style="justify-content:space-around;margin-top:10px"><div><b id="tok">0</b> كلمة صحيحة</div><div><b id="terr">0</b> خطأ</div></div></div><div id="tyres"></div>',
      mount() {
        const inp = $('#ti'); inp.focus();
        const show = () => { const w = T.words[T.i % T.words.length]; const v = inp.value; let h = ''; for (let j = 0; j < w.length; j++) h += '<span class="' + (j < v.length ? (v[j] === w[j] ? 'd' : 'x') : j === v.length ? 'c' : 'n') + '">' + esc(w[j] === ' ' ? ' ' : w[j]) + '</span>'; $('#tw').innerHTML = h + ' <span class="muted" style="font-size:.7em">' + esc(T.words[(T.i + 1) % T.words.length]) + '</span>'; };
        show();
        $('[data-y="exit"]').onclick = () => { clearInterval(T.timer); App.go('today'); };
        inp.addEventListener('input', () => {
          if (!T.start) { T.start = now(); T.timer = setInterval(() => { T.left--; const tt = $('#tyt'), tb = $('#tyb'); if (tt) tt.textContent = T.left; if (tb) tb.style.width = (T.left / 60 * 100) + '%'; if (T.left <= 0) Typing.end(); }, 1000); }
          Snd.key();
          const w = T.words[T.i % T.words.length];
          const v = inp.value;
          const multi = w.includes(' ');
          if ((!multi && / $/.test(v)) || v === w + ' ') { Typing.submit(v.trimEnd()); inp.value = ''; }
          show();
        });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (inp.value.trim()) { Typing.submit(inp.value.trim()); inp.value = ''; show(); } } });
      }
    };
  },
  submit(v) { const T = Typing.cur; const w = T.words[T.i % T.words.length]; if (v === w) { T.ok++; T.typed += w.length + 1; Snd.click(); } else { T.errs++; Snd.bad(); } T.i++; $('#tok').textContent = T.ok; $('#terr').textContent = T.errs; },
  end() {
    const T = Typing.cur; clearInterval(T.timer); const wpm = Math.round(T.typed / 5);
    $('#ti').disabled = true;
    Kid.typing(wpm); const first = Kid.task('typing');
    if (wpm >= 25) Kid.medal('typer'); if (wpm >= 40) Kid.medal('typer40');
    $('#tyres').innerHTML = '<div class="card" style="text-align:center"><h2>انتهى الوقت!</h2><p class="big-num">' + wpm + ' كلمة/دقيقة</p><p>' + T.ok + ' كلمة صحيحة · ' + T.errs + ' خطأ</p><p class="muted">الهدف: 25 كلمة في الدقيقة لميدالية «أصابع البرق» ⚡</p><div class="row" style="justify-content:center"><a class="btn" href="#/today">مهام اليوم</a><a class="btn sec" href="#/typing" onclick="setTimeout(()=>App.render(),0)">مرة أخرى</a></div></div>';
    if (first) { Snd.win(); confetti(50); }
    setTimeout(App.checkCele, 900);
  }
};

/* ---------- certificate PDF (canvas → JPEG → minimal PDF) ---------- */
const Cert = {
  async make(stage) {
    const k = Kid.get(); const W = 1754, H = 1240; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    try { await document.fonts.ready; } catch (e) { }
    const night = stage === 2;
    g.fillStyle = night ? '#0A0F1F' : '#FFFDF6'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#F2A51A'; g.lineWidth = 18; g.strokeRect(40, 40, W - 80, H - 80);
    g.strokeStyle = night ? '#2BD67B' : '#1E4FA6'; g.lineWidth = 5; g.strokeRect(70, 70, W - 140, H - 140);
    const img = await Cert.svgImg(Art.hat(stage === 1 ? 5 : 6), 300, 240); if (img) g.drawImage(img, W / 2 - 150, 110, 300, 240);
    g.textAlign = 'center'; g.direction = 'rtl';
    const ink = night ? '#E7EEFF' : '#14213D';
    g.fillStyle = night ? '#4CF09A' : '#1E4FA6'; g.font = '800 92px "Baloo Bhaijaan 2", Tajawal, sans-serif'; g.fillText('شهادة إتمام', W / 2, 440);
    g.fillStyle = ink; g.font = '500 40px Tajawal, sans-serif'; g.fillText('يشهد عُقاب بأن البطل', W / 2, 530);
    g.fillStyle = '#C27C00'; g.font = '800 96px "Baloo Bhaijaan 2", Tajawal, sans-serif'; g.fillText(k.name || 'البطل', W / 2, 660);
    g.fillStyle = ink; g.font = '500 42px Tajawal, sans-serif';
    g.fillText(stage === 1 ? 'أتمّ بنجاح المرحلة الأولى: أساسيات الحاسوب والأمن السيبراني' : 'أتمّ بنجاح المرحلة الثانية: صيد الأعلام (CTF)', W / 2, 760);
    g.font = '500 34px Tajawal, sans-serif'; g.fillStyle = night ? '#9AA8C9' : '#5B6B86';
    if (stage === 1) { g.fillText('الحاسوب · الأمان الشخصي · الطرفية · البرمجة بـ Python · الشبكات', W / 2, 815); g.fillText('الويب · التشفير · التفكير الأمني · التحقيق الرقمي', W / 2, 860); }
    else g.fillText('الاستطلاع · ثغرات الويب · كسر الشيفرات · تحليل الملفات', W / 2, 830);
    const D = App.derive();
    g.fillStyle = ink; g.font = '700 36px Tajawal, sans-serif'; g.fillText('الرتبة: ' + RANKS[D.rank].n + '   ·   ' + D.xp + ' نقطة خبرة', W / 2, 935);
    const dt = stage === 1 ? k.X.p_final2 : Math.max(...D.solved.map(id => k.C[id].d));
    g.font = '500 32px Tajawal, sans-serif'; g.fillText('التاريخ: ' + fmtDay(dayKey(dt || now())) + ' ' + new Date(dt || now()).getFullYear(), W / 2, 995);
    const e = await Cert.svgImg(Art.eagle('happy', 6, night), 170, 170); if (e) { g.drawImage(e, 140, H - 330, 170, 170); g.drawImage(e, W - 310, H - 330, 170, 170); }
    g.font = '700 30px Tajawal, sans-serif'; g.fillText('المدرّب: أخوك الأكبر', W / 2, H - 170);
    const jpg = cv.toDataURL('image/jpeg', .92);
    const blob = Cert.pdf(jpg, W, H);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'oqab-certificate-' + stage + '.pdf'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    toast('تم تحميل الشهادة 🎓'); confetti(80); Snd.fanfare();
  },
  svgImg(svg, w, h) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" ')); }); },
  pdf(dataUrl, w, h) {
    const bin = atob(dataUrl.split(',')[1]); const img = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) img[i] = bin.charCodeAt(i);
    const pw = 842, ph = 595; const enc = new TextEncoder(); const parts = []; const offs = []; let len = 0;
    const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
    push('%PDF-1.4\n');
    const obj = (n, body, stream) => { offs[n] = len; push(n + ' 0 obj\n' + body + '\n'); if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); } push('endobj\n'); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    obj(4, '<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + img.length + ' >>', img);
    const cs = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + cs.length + ' >>', enc.encode(cs));
    const xref = len; let x = 'xref\n0 6\n0000000000 65535 f \n'; for (let n = 1; n <= 5; n++) x += String(offs[n]).padStart(10, '0') + ' 00000 n \n';
    push(x + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }
};
