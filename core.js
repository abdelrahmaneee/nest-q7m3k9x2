/* ===== عُقاب — core: helpers, state, merge, sync, sound ===== */
'use strict';
const C = { units: [], terms: {}, ctf: [], final: null };
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => Date.now();
const pad2 = n => (n < 10 ? '0' : '') + n;
const dayKey = (t) => { const d = t ? new Date(t) : new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); const x = new Date(y, m - 1, d + n); return dayKey(x.getTime()); };
const daysBetween = (a, b) => { const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number); return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 864e5); };
const rid = (n = 8) => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const r = crypto.getRandomValues(new Uint8Array(n)); for (const x of r) s += a[x % a.length]; return s; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const AR_DIG = s => String(s);
const minD = (a, b) => (a && b) ? Math.min(a, b) : (a || b || 0);
const maxN = (a, b) => Math.max(a || 0, b || 0);

/* Arabic plural helper: cnt(3,['دقيقة','دقيقتان','دقائق','دقيقة']) */
function cnt(n, f) {
  n = Math.round(n);
  if (n === 0) return 'لا ' + f[2];
  if (n === 1) return f[0];
  if (n === 2) return f[1];
  if (n >= 3 && n <= 10) return n + ' ' + f[2];
  return n + ' ' + f[3];
}
const F_MIN = ['دقيقة', 'دقيقتان', 'دقائق', 'دقيقة'];
const F_DAY = ['يوم واحد', 'يومان', 'أيام', 'يوماً'];
const F_TRY = ['محاولة واحدة', 'محاولتان', 'محاولات', 'محاولة'];
const F_HINT = ['تلميح واحد', 'تلميحان', 'تلميحات', 'تلميحاً'];
const fmtMin = s => { const m = Math.round((s || 0) / 60); return m < 1 ? 'أقل من دقيقة' : cnt(m, F_MIN); };
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const fmtDay = k => { const [y, m, d] = k.split('-').map(Number); const x = new Date(y, m - 1, d); return WDAYS[x.getDay()] + ' ' + d + ' ' + MONTHS[m - 1]; };
const fmtTime = t => { const d = new Date(t); let h = d.getHours(), m = d.getMinutes(); const ap = h < 12 ? 'ص' : 'م'; h = h % 12 || 12; return h + ':' + pad2(m) + ' ' + ap; };

/* text markup: **bold**, `code`, [[term]] ; [[term|shown]] */
function md(s) {
  if (!s) return '';
  let o = esc(s);
  o = o.replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>');
  o = o.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  o = o.replace(/\[\[([a-z0-9_]+)(?:\|([^\]]+))?\]\]/g, (m, id, shown) => {
    const t = C.terms[id];
    if (!t) return shown || id;
    Kid.seeTerm(id);
    const label = shown || t.ar;
    return '<span class="term" data-term="' + id + '" tabindex="0">' + label + (t.en && !shown ? ' <span class="mono" style="font-weight:500">(' + esc(t.en) + ')</span>' : '') + '</span>';
  });
  o = o.replace(/\n/g, '<br>');
  return o;
}

/* ---------- storage ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
const SS = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { } } };
const K_KID = 'oqab_kid', K_COACH = 'oqab_coach', K_DEV = 'oqab_dev', K_BAK = 'oqab_kid_bak', K_PROF = 'oqab_prof';
const SCHEMA = 2;
const PIDS = ['k1', 'k2', 'k3', 'k4'];

function emptyKid() { return { v: SCHEMA, name: '', nameU: 0, pledge: 0, L: {}, T: {}, C: {}, M: {}, G: {}, R: {}, D: {}, E: {}, W: {}, MR: {}, X: {}, look: null }; }
function emptyCoach() { return { v: SCHEMA, pin: null, U: {}, msgs: {}, wk: null, wkh: {}, ctfU: {}, goal: null }; }
function emptyProf() { return { v: SCHEMA, list: {} }; }

/* migrations: never drop unknown fields */
function migrateKid(k) {
  if (!k || typeof k !== 'object') return emptyKid();
  const e = emptyKid();
  for (const f in e) if (k[f] === undefined) k[f] = e[f];
  if ((k.v || 1) < 2) k.v = 2;
  return k;
}
function migrateCoach(c) {
  if (!c || typeof c !== 'object') return emptyCoach();
  const e = emptyCoach();
  for (const f in e) if (c[f] === undefined) c[f] = e[f];
  // v1: U = {unitId:{m,u}} for everyone  ->  v2: U = {'*' or pid: {unitId:{m,u}}}
  const flat = Object.keys(c.U || {}).filter(k => c.U[k] && typeof c.U[k].m === 'string');
  if (flat.length) { const all = c.U['*'] || {}; flat.forEach(k => { all[k] = c.U[k]; delete c.U[k]; }); c.U['*'] = all; }
  if (c.ctfU && typeof c.ctfU.m === 'string') c.ctfU = { '*': c.ctfU };
  if (!c.ctfU) c.ctfU = {};
  if ((c.v || 1) < 2) c.v = 2;
  return c;
}
function migrateProf(p) { if (!p || typeof p !== 'object') return emptyProf(); if (!p.list) p.list = {}; return p; }

/* ---------- merge (deterministic, never loses progress) ---------- */
function mergeMap(a, b, fn) { const o = {}; a = a || {}; b = b || {}; for (const k in a) o[k] = k in b ? fn(a[k], b[k]) : a[k]; for (const k in b) if (!(k in a)) o[k] = b[k]; return o; }
const uniq = arr => Array.from(new Set(arr));
const canon = x => { if (Array.isArray(x)) return '[' + x.map(canon).join(',') + ']'; if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map(k => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}'; return JSON.stringify(x === undefined ? null : x); };
const same = (a, b) => canon(a) === canon(b);
const lww = (x, y) => (!x ? y : !y ? x : ((y.u || 0) !== (x.u || 0) ? ((y.u || 0) > (x.u || 0) ? y : x) : (canon(y) > canon(x) ? y : x)));
function mergeKid(a, b) {
  a = migrateKid(a || emptyKid()); b = migrateKid(b || emptyKid());
  const o = Object.assign({}, b, a);
  o.v = Math.max(a.v || 1, b.v || 1);
  if ((b.nameU || 0) > (a.nameU || 0) || ((b.nameU || 0) === (a.nameU || 0) && (b.name || '') > (a.name || ''))) { o.name = b.name; o.nameU = b.nameU; } else { o.name = a.name; o.nameU = a.nameU; }
  o.pledge = minD(a.pledge, b.pledge);
  o.L = mergeMap(a.L, b.L, (x, y) => ({ d: minD(x.d, y.d), s: maxN(x.s, y.s), t: maxN(x.t, y.t), h: maxN(x.h, y.h), w: uniq([].concat(x.w || [], y.w || [])).sort() }));
  o.T = mergeMap(a.T, b.T, (x, y) => ({ b: maxN(x.b, y.b), p: minD(x.p, y.p), a: Object.assign({}, y.a || {}, x.a || {}) }));
  o.C = mergeMap(a.C, b.C, (x, y) => ({ d: minD(x.d, y.d), h: maxN(x.h, y.h), t: maxN(x.t, y.t), s: maxN(x.s, y.s) }));
  o.M = mergeMap(a.M, b.M, minD);
  o.G = mergeMap(a.G, b.G, minD);
  o.MR = mergeMap(a.MR, b.MR, minD);
  o.X = mergeMap(a.X, b.X, minD);
  o.R = mergeMap(a.R, b.R, lww);
  o.D = mergeMap(a.D, b.D, (x, y) => mergeMap(x, y, (p, q) => ({ s: maxN(p.s, q.s), k: mergeMap(p.k, q.k, minD), rx: maxN(p.rx, q.rx), ty: maxN(p.ty, q.ty) })));
  o.W = mergeMap(a.W, b.W, (x, y) => ({ d: minD(x.d, y.d), ans: ((x.ans || '').length !== (y.ans || '').length ? ((x.ans || '').length > (y.ans || '').length ? x.ans : y.ans) : ((x.ans || '') >= (y.ans || '') ? x.ans : y.ans)) }));
  o.look = lww(a.look, b.look);
  const E = Object.assign({}, b.E || {}, a.E || {});
  const ids = Object.keys(E);
  if (ids.length > 700) { ids.sort((p, q) => E[q].t - E[p].t || (p < q ? -1 : 1)); for (const id of ids.slice(700)) delete E[id]; }
  o.E = E;
  return o;
}
function mergeCoach(a, b) {
  a = migrateCoach(a || emptyCoach()); b = migrateCoach(b || emptyCoach());
  const o = Object.assign({}, b, a);
  o.pin = lww(a.pin, b.pin);
  o.U = mergeMap(a.U, b.U, (x, y) => mergeMap(x, y, lww));
  o.msgs = Object.assign({}, b.msgs || {}, a.msgs || {});
  o.wk = lww(a.wk, b.wk);
  o.wkh = Object.assign({}, b.wkh || {}, a.wkh || {});
  o.ctfU = mergeMap(a.ctfU, b.ctfU, lww);
  o.goal = lww(a.goal, b.goal);
  return o;
}
function mergeProf(a, b) { a = migrateProf(a); b = migrateProf(b); const o = Object.assign({}, b, a); o.list = mergeMap(a.list, b.list, lww); return o; }

/* ---------- device ---------- */
const Dev = (() => {
  let d = LS.get(K_DEV, null);
  if (!d) { d = { id: rid(6), fam: '', role: '', seen: {}, sound: 1, big: 0 }; LS.set(K_DEV, d); }
  if (!d.seen || typeof d.seen.rank === 'number') d.seen = {};
  return { get: () => d, save: () => LS.set(K_DEV, d), set(k, v) { d[k] = v; LS.set(K_DEV, d); } };
})();

/* ---------- Profiles (names + hashed simple passwords; stored in the family database, never in the code) ---------- */
const Prof = (() => {
  let p = migrateProf(LS.get(K_PROF, null));
  const ls = [];
  return {
    get: () => p,
    list() { return PIDS.filter(id => p.list[id] && !p.list[id].hide).map(id => Object.assign({ id }, p.list[id])); },
    one: id => p.list[id] || null,
    mergeIn(x) { const m = mergeProf(p, x); const ch = !same(m, p); p = m; LS.set(K_PROF, p); if (ch) ls.forEach(f => f()); return ch; },
    replace(x) { p = migrateProf(x); LS.set(K_PROF, p); ls.forEach(f => f()); },
    on(f) { ls.push(f); },
    set(id, obj) { p.list[id] = Object.assign({}, p.list[id] || {}, obj, { u: now() }); LS.set(K_PROF, p); ls.forEach(f => f()); Sync.schedule(); },
    freeId() { return PIDS.find(id => !p.list[id]); },
    async hash(id, salt, pw) { return sha('oqab-pw|' + id + '|' + salt + '|' + String(pw).trim().toLowerCase()); },
    async create(name, pw) { const id = Prof.freeId(); if (!id) return null; const salt = rid(10); const h = await Prof.hash(id, salt, pw); Prof.set(id, { name, salt, h, c: now() }); return id; },
    async check(id, pw) { const x = p.list[id]; if (!x) return false; return (await Prof.hash(id, x.salt, pw)) === x.h; },
    async setPw(id, pw) { const salt = rid(10); Prof.set(id, { salt, h: await Prof.hash(id, salt, pw) }); }
  };
})();

/* ---------- Kid stores (one per player) ---------- */
const Kid = (() => {
  const cache = {}; const ls = [];
  const key = id => K_KID + '_' + id;
  function of(id) { if (!id) return emptyKid(); if (!cache[id]) cache[id] = migrateKid(LS.get(key(id), null)); return cache[id]; }
  let pid = SS.get('oqab_pid'); if (pid && !Prof.one(pid)) pid = null;
  let s = of(pid);
  const live = () => !!pid && !App.preview;
  function persist(id) { LS.set(key(id), cache[id]); }
  function save(cloud = true) { if (!pid) return; persist(pid); ls.forEach(f => f()); if (cloud) Sync.schedule(); }
  function ev(k, data) { if (!live()) return; const id = Dev.get().id + '_' + rid(6); s.E[id] = Object.assign({ t: now(), k }, data || {}); }
  function today() { const k = dayKey(), dv = Dev.get().id; s.D[k] = s.D[k] || {}; s.D[k][dv] = s.D[k][dv] || { s: 0, k: {}, rx: 0, ty: 0 }; return s.D[k][dv]; }
  let pushT = 0;
  return {
    get: () => s, of, pid: () => pid,
    use(id, remember = true) { pid = id || null; s = of(pid); if (remember) SS.set('oqab_pid', pid); if (pid) { const bak = LS.get(K_BAK + '_' + pid, null); if (!bak || bak.day !== dayKey()) LS.set(K_BAK + '_' + pid, { day: dayKey(), kid: s }); } ls.forEach(f => f()); },
    mergeInto(id, x) { const cur = of(id); const m = mergeKid(cur, x); const ch = !same(m, cur); cache[id] = m; if (id === pid) s = m; persist(id); if (ch) ls.forEach(f => f()); return ch; },
    mergeIn(x) { return pid ? Kid.mergeInto(pid, x) : false; },
    on(f) { ls.push(f); },
    save, ev, today, live,
    seeTerm(id) { if (!live()) return; if (!s.G[id]) { s.G[id] = now(); clearTimeout(pushT); pushT = setTimeout(save, 400); } },
    setName(n) { s.name = n; s.nameU = now(); save(); },
    setLook(look) { s.look = Object.assign({}, s.look || {}, look, { u: now() }); save(); },
    pledge() { if (pid && !s.pledge) { s.pledge = now(); save(); } },
    tick(sec, lessonKey) { if (!live()) return; today().s += sec; if (lessonKey && s.L[lessonKey]) s.L[lessonKey].s = (s.L[lessonKey].s || 0) + sec; persist(pid); },
    task(name) { if (!live()) return false; const t = today(); if (t.k[name]) return false; t.k[name] = now(); save(); return true; },
    lessonStart(key) { if (!live()) return; s.L[key] = s.L[key] || { d: 0, s: 0, t: 0, h: 0, w: [] }; },
    lessonWrong(key, tag) { if (!live()) return; const l = s.L[key]; if (!l) return; l.t = (l.t || 0) + 1; if (tag && !(l.w || []).includes(tag)) (l.w = l.w || []).push(tag); },
    lessonHint(key) { if (!live()) return; const l = s.L[key]; if (l) l.h = (l.h || 0) + 1; },
    lessonDone(key, title) { if (!live()) return false; const l = s.L[key]; const first = !l.d; if (first) l.d = now(); ev('lesson', { id: key, n: title, s: l.s, tr: l.t, h: l.h }); today().k.lesson = today().k.lesson || now(); save(); return first; },
    testDone(uid, sc, n, wrongTags) {
      if (!live()) return; const T = s.T[uid] = s.T[uid] || { b: 0, p: 0, a: {} };
      const id = Dev.get().id + '_' + rid(5); T.a[id] = { t: now(), sc, n, w: wrongTags };
      const ks = Object.keys(T.a); if (ks.length > 25) { ks.sort((p, q) => T.a[p].t - T.a[q].t); delete T.a[ks[0]]; }
      T.b = Math.max(T.b || 0, sc); if (sc >= 80 && !T.p) T.p = now();
      ev('test', { id: uid, sc, ok: sc >= 80 }); save();
    },
    ctfDone(id, info) { if (!live()) return; const c = s.C[id] = s.C[id] || { d: 0, h: 0, t: 0, s: 0 }; if (!c.d) c.d = now(); Object.assign(c, { h: maxN(c.h, info.h), t: maxN(c.t, info.t), s: maxN(c.s, info.s) }); ev('ctf', { id, h: info.h, tr: info.t }); today().k.lesson = today().k.lesson || now(); save(); },
    ctfTouch(id, field) { if (!live()) return; const c = s.C[id] = s.C[id] || { d: 0, h: 0, t: 0, s: 0 }; c[field] = (c[field] || 0) + 1; save(); },
    medal(id) { if (!live()) return false; if (s.M[id]) return false; s.M[id] = now(); ev('medal', { id }); save(); return true; },
    review(qid, ok) {
      if (!live()) return; const r = s.R[qid] || { b: 0 };
      const IV = [1, 1, 3, 7, 14, 30, 60];
      const b = ok ? Math.min((r.b || 0) + 1, 6) : 1;
      s.R[qid] = { b, due: addDays(dayKey(), ok ? IV[b] : 1), u: now() };
      if (ok) today().rx = (today().rx || 0) + 1;
    },
    addCard(qid, ok) { if (!live()) return; if (!s.R[qid]) s.R[qid] = { b: ok ? 1 : 0, due: addDays(dayKey(), 1), u: now() }; },
    flag(k) { if (!live()) return false; if (s.X[k]) return false; s.X[k] = now(); save(); return true; },
    typing(wpm) { if (!live()) return; const t = today(); t.ty = Math.max(t.ty || 0, wpm); ev('typing', { wpm }); save(); },
    weekly(id, ans) { if (!live()) return; s.W[id] = { d: (s.W[id] && s.W[id].d) || now(), ans: ans || '' }; ev('weekly', { id }); save(); },
    msgRead(id) { if (!live()) return; if (!s.MR[id]) { s.MR[id] = now(); save(); } }
  };
})();

/* ---------- Coach store ---------- */
const Coach = (() => {
  let c = migrateCoach(LS.get(K_COACH, null));
  const listeners = [];
  return {
    get: () => c,
    replace(x) { c = migrateCoach(x); LS.set(K_COACH, c); listeners.forEach(f => f()); },
    mergeIn(x) { const m = mergeCoach(c, x); const ch = !same(m, c); c = m; LS.set(K_COACH, c); if (ch) listeners.forEach(f => f()); return ch; },
    on(f) { listeners.push(f); },
    save() { LS.set(K_COACH, c); listeners.forEach(f => f()); Sync.schedule(); },
    /* unit override for a player: player-specific beats "all" when newer */
    unit(pid, uid) { const a = c.U['*'] && c.U['*'][uid], b = pid && c.U[pid] && c.U[pid][uid]; const w = lww(a, b); return w && w.m || ''; },
    stage2(pid) { const w = lww(c.ctfU['*'], pid && c.ctfU[pid]); return w && w.m || ''; }
  };
})();

async function sha(text) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 5381; for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return 'x' + (h >>> 0).toString(16); }
}

/* legacy single-player data (v1) -> first player */
function adoptLegacy(id, remoteKid) {
  const old = LS.get(K_KID, null);
  if (old && old.pledge) { Kid.mergeInto(id, old); try { localStorage.removeItem(K_KID); } catch (e) { } }
  if (remoteKid && remoteKid.pledge) Kid.mergeInto(id, remoteKid);
}

/* ---------- Sync (Firebase optional). Docs: coach, p (players), k1..k4 (progress) ---------- */
const Sync = (() => {
  let api = null, state = 'local', t = 0, busy = false, again = false;
  const remote = {}; const subs = {};
  const status = () => { if (!Dev.get().fam) return 'local'; if (!api) return state === 'fail' ? 'fail' : 'wait'; return state; };
  const local = name => name === 'coach' ? Coach.get() : name === 'p' ? Prof.get() : Kid.of(name);
  const paint = () => App.paintSync && App.paintSync();
  function attach(m) { api = m; state = 'wait'; start(); }
  function fail() { state = 'fail'; paint(); }
  function onDoc(name, val) {
    remote[name] = val;
    let ch = false;
    if (val) { if (name === 'coach') ch = Coach.mergeIn(val); else if (name === 'p') ch = Prof.mergeIn(val); else ch = Kid.mergeInto(name, val); }
    if (ch) App.refresh();
    if (!val || !same(local(name), val)) schedule();
    if (name === 'p') watchKids();
    state = 'on'; paint();
  }
  function sub(name) { if (subs[name] || !api) return; const fam = Dev.get().fam; subs[name] = api.watchDoc(fam, name, v => onDoc(name, v), () => { state = 'wait'; paint(); }); }
  function watchKids() { Object.keys(Prof.get().list).forEach(sub); }
  async function start() {
    if (!api) return;
    for (const k in subs) { try { subs[k](); } catch (e) { } delete subs[k]; }
    for (const k in remote) delete remote[k];
    if (!Dev.get().fam) { state = 'local'; paint(); return; }
    try { await api.init(window.FIREBASE_CONFIG); sub('coach'); sub('p'); watchKids(); } catch (e) { fail(); }
  }
  function schedule() { if (!api || !Dev.get().fam || App.preview) return; clearTimeout(t); t = setTimeout(push, 2500); }
  async function push() {
    if (!api || busy) { again = true; return; }
    busy = true; const fam = Dev.get().fam;
    try {
      const names = ['p', 'coach'].concat(Object.keys(Prof.get().list));
      for (const n of names) {
        const v = local(n);
        if (n.startsWith('k') && !v.pledge && !remote[n]) continue;
        if (!remote[n] || !same(v, remote[n])) { await api.saveDoc(fam, n, v); remote[n] = JSON.parse(JSON.stringify(v)); }
      }
      state = 'on';
    } catch (e) { state = 'wait'; setTimeout(schedule, 15000); }
    busy = false; paint();
    if (again) { again = false; schedule(); }
  }
  async function fetchAll(fam) { if (!api) return null; await api.init(window.FIREBASE_CONFIG); return api.getDocs(fam, ['coach', 'p', 'kid'].concat(PIDS)); }
  return { attach, fail, start, schedule, status, push, fetchAll, has: () => !!api, remote };
})();

/* ---------- Sound (WebAudio, no files) ---------- */
const Snd = (() => {
  let ctx = null;
  function c() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
  function tone(f, d, type = 'sine', v = .12, delay = 0) {
    if (!Dev.get().sound) return; const a = c(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f;
    const t0 = a.currentTime + delay; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + d + .05);
  }
  return {
    click() { tone(660, .07, 'triangle', .06); },
    ok() { tone(660, .12, 'sine', .12); tone(990, .2, 'sine', .12, .09); },
    bad() { tone(220, .22, 'square', .05); tone(180, .25, 'square', .04, .1); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .25, 'triangle', .1, i * .12)); },
    fanfare() { [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i === 6 ? .6 : .18, 'triangle', .11, i * .13)); },
    key() { tone(1200 + Math.random() * 300, .03, 'square', .015); },
    whoosh() { tone(300, .3, 'sawtooth', .03); tone(600, .3, 'sawtooth', .02, .05); }
  };
})();

/* ---------- UI helpers ---------- */
function toast(msg, ms = 2600) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
function modal(html, opts = {}) {
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = '<div class="box" role="dialog" aria-modal="true">' + html + '</div>';
  document.body.appendChild(m);
  const close = () => { m.remove(); opts.onClose && opts.onClose(); };
  m.addEventListener('click', e => { if (e.target === m && !opts.sticky) close(); const b = e.target.closest('[data-close]'); if (b) close(); });
  return { el: m, close };
}
function confetti(n = 90) {
  const box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#FFD36B', '#F2A51A', '#2F6BD8', '#14A37F', '#E04B4B', '#9B6BFF', '#4CF09A'];
  for (let i = 0; i < n; i++) { const e = document.createElement('i'); e.style.left = (Math.random() * 100) + '%'; e.style.background = cols[i % cols.length]; e.style.animationDuration = (2 + Math.random() * 2.2) + 's'; e.style.animationDelay = (Math.random() * .8) + 's'; e.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)'; box.appendChild(e); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 5200);
}
function xpFly(n, el) {
  const r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
  const x = document.createElement('div'); x.className = 'xpfly'; x.textContent = '+' + n + ' XP';
  x.style.left = (r.left + r.width / 2 - 40) + 'px'; x.style.top = (r.top - 10) + 'px';
  document.body.appendChild(x); setTimeout(() => x.remove(), 1400);
}
