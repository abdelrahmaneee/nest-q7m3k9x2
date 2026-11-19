/* ===== عُقاب — simulated terminal (nothing here touches a real system) ===== */
'use strict';
const Term = {
  DEFAULT_FS: () => ({
    home: { oqab: { 'hello.txt': 'أهلاً! هذا أول ملف تقرؤه في الطرفية.\nأحسنت يا بطل.', 'todo.txt': '1. أتعلّم الطرفية\n2. أتعلّم Python\n3. أصير خبير أمن', games: { 'chess.txt': 'لعبة الشطرنج: 0 فوز، 0 خسارة' }, pictures: { 'eagle.png': '[صورة عُقاب]', 'trip.png': '[صورة الرحلة]' }, school: { 'math.txt': '2 + 2 = 4\n10 × 10 = 100' } } },
    etc: { 'hostname': 'nest' }, tmp: {}
  }),
  /* fs spec: "text" = file; {$:"text", p:"rw-------", o:"root"} = file with owner/permissions; {"@":{p,o}, ...} = folder meta */
  build(spec, owner) {
    const mk = (o) => { const m = o['@'] || {}; const d = { t: 'd', c: {}, p: m.p || 'rwxr-xr-x', o: m.o || owner }; for (const k in o) { if (k === '@') continue; const v = o[k]; if (typeof v === 'string') d.c[k] = { t: 'f', x: v, p: 'rw-r--r--', o: owner }; else if (v && v.$ !== undefined) d.c[k] = { t: 'f', x: v.$, p: v.p || 'rw-r--r--', o: v.o || owner }; else d.c[k] = mk(v); } return d; };
    return mk(spec);
  },
  create(el, opts = {}) {
    const T = {
      user: opts.user || 'oqab', host: opts.host || 'nest', cwd: opts.cwd || '/home/' + (opts.user || 'oqab'), hist: [], hi: 0, ext: opts.ext || {}, onCmd: opts.onCmd || null,
      sudoers: opts.sudoers || [], groups: opts.groups || [], procs: (opts.procs || []).map(p => Object.assign({}, p)), net: opts.net || {}, pw: opts.pw || {}, pending: null
    };
    T.root = Term.build(opts.fs || Term.DEFAULT_FS(), T.user);
    el.innerHTML = '<div class="terminal" tabindex="0"><div class="tout"></div><form><span class="pr tprompt"></span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="اكتب أمراً"></form></div><div class="keybar">' + ['Tab', '↑', '/', '-', '.', '~', '>', '|', '"', '_'].map(k => '<button type="button" data-k="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>';
    const box = $('.terminal', el), out = $('.tout', el), inp = $('input', el), prompt = $('.tprompt', el);
    const P = () => T.user + '@' + T.host + ':' + T.cwd.replace('/home/' + T.user, '~') + (T.user === 'root' ? '#' : '$');
    const paint = () => { prompt.textContent = T.pending ? T.pending.label : P() + ' '; inp.type = T.pending && T.pending.secret ? 'password' : 'text'; };
    T.cap = null;
    T.print = (html, cls) => { if (T.cap) { T.cap.push(html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")); return; } out.insertAdjacentHTML('beforeend', '<div class="ln' + (cls ? ' ' + cls : '') + '">' + html + '</div>'); box.scrollTop = 1e9; };
    T.err = m => { const c = T.cap; T.cap = null; T.print(esc(m), 'er'); T.cap = c; };
    T.resolve = (p) => {
      const home = T.user === 'root' ? '/root' : '/home/' + T.user;
      if (!p || p === '~') p = home; if (p.startsWith('~/')) p = home + p.slice(1);
      const parts = (p.startsWith('/') ? p : T.cwd + '/' + p).split('/'); const st = [];
      for (const x of parts) { if (!x || x === '.') continue; if (x === '..') st.pop(); else st.push(x); }
      return '/' + st.join('/');
    };
    T.node = (abs) => { let n = T.root; for (const x of abs.split('/').filter(Boolean)) { if (!n || n.t !== 'd' || !n.c[x]) return null; n = n.c[x]; } return n; };
    T.parentOf = abs => { const a = abs.split('/').filter(Boolean); const name = a.pop(); return { dir: T.node('/' + a.join('/')), name }; };
    T.can = (n, what) => { if (T.user === 'root' || !n) return true; const cls = n.o === T.user ? 0 : T.groups.includes(n.o) ? 1 : 2; return (n.p || 'rwxrwxrwx')[cls * 3 + 'rwx'.indexOf(what)] !== '-'; };
    const denied = (cmd, name) => T.err(cmd + ': ممنوع! (Permission denied) ليس لك صلاحية على «' + name + '»');
    const lines = (txt) => String(txt).split('\n');
    const readFile = (cmd, f) => { const n = T.node(T.resolve(f)); if (!n) { T.err(cmd + ': لا يوجد ملف اسمه «' + f + '»'); return null; } if (n.t === 'd') { T.err(cmd + ': «' + f + '» مجلد وليس ملفاً'); return null; } if (!T.can(n, 'r')) { denied(cmd, f); return null; } return n.x; };
    /* filters work on a file argument or on the output of the previous command (|) */
    const filters = {
      grep(a, input) {
        const fl = a.filter(x => /^-[a-z]+$/.test(x)).join(''), rest = a.filter(x => !/^-[a-z]+$/.test(x)); const w = (rest[0] || '').replace(/^["']|["']$/g, '');
        if (!w) { T.err('grep: الطريقة: grep كلمة ملف'); return null; }
        let src = input; if (src == null) { if (!rest[1]) { T.err('grep: الطريقة: grep كلمة ملف'); return null; } const x = readFile('grep', rest[1]); if (x == null) return null; src = lines(x); }
        const ci = fl.includes('i'), inv = fl.includes('v');
        const hit = l => (ci ? l.toLowerCase().includes(w.toLowerCase()) : l.includes(w)) !== inv;
        const res = src.filter(hit);
        return fl.includes('c') ? [String(res.length)] : { lines: res, hl: inv ? null : new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ci ? 'gi' : 'g') };
      },
      sort(a, input) { let src = input; const f = a.filter(x => !x.startsWith('-'))[0]; if (src == null) { if (!f) { T.err('sort: اكتب اسم الملف'); return null; } const x = readFile('sort', f); if (x == null) return null; src = lines(x); } const num = a.some(x => /n/.test(x) && x.startsWith('-')), rev = a.some(x => /r/.test(x) && x.startsWith('-')); const r = src.slice().sort((p, q) => num ? (parseFloat(p) || 0) - (parseFloat(q) || 0) : p.localeCompare(q)); return rev ? r.reverse() : r; },
      uniq(a, input) { let src = input; const f = a.filter(x => !x.startsWith('-'))[0]; if (src == null) { const x = f && readFile('uniq', f); if (x == null) return null; src = lines(x); } const out = []; for (const l of src) { if (out.length && out[out.length - 1][0] === l) out[out.length - 1][1]++; else out.push([l, 1]); } return a.includes('-c') ? out.map(([l, n]) => String(n).padStart(4) + ' ' + l) : out.map(x => x[0]); },
      wc(a, input) { let src = input; const f = a.filter(x => !x.startsWith('-'))[0]; if (src == null) { const x = f && readFile('wc', f); if (x == null) return null; src = lines(x); } return [String(src.filter(l => l !== '').length) + (f && input == null ? ' ' + f : '')]; },
      head(a, input) { const n = +((a[a.indexOf('-n') + 1]) || 10) || 10; let src = input; const f = a.filter((x, i) => !x.startsWith('-') && a[i - 1] !== '-n')[0]; if (src == null) { const x = f && readFile('head', f); if (x == null) return null; src = lines(x); } return src.slice(0, a.includes('-n') ? n : 10); },
      tail(a, input) { const n = +((a[a.indexOf('-n') + 1]) || 10) || 10; let src = input; const f = a.filter((x, i) => !x.startsWith('-') && a[i - 1] !== '-n')[0]; if (src == null) { const x = f && readFile('tail', f); if (x == null) return null; src = lines(x); } return src.slice(-(a.includes('-n') ? n : 10)); },
      cut(a, input) { let d = ' ', n = 1, f = null; for (let i = 0; i < a.length; i++) { const x = a[i]; if (x === '-d') d = a[++i] || ' '; else if (x.startsWith('-d')) d = x.slice(2) || ' '; else if (x === '-f') n = +a[++i] || 1; else if (x.startsWith('-f')) n = +x.slice(2) || 1; else if (!x.startsWith('-')) f = x; } let src = input; if (src == null) { const x = f && readFile('cut', f); if (x == null) return null; src = lines(x); } return src.map(l => l.split(d)[n - 1] || ''); }
    };
    const showLines = (r) => { if (r == null) return; if (Array.isArray(r)) { if (!r.length) T.print('(لا توجد نتائج)', 'dim'); r.forEach(l => T.print(esc(l))); return; } if (!r.lines.length) T.print('(لا توجد نتائج)', 'dim'); r.lines.forEach(l => T.print(r.hl ? esc(l).replace(r.hl, m => '<span class="hl">' + esc(m) + '</span>') : esc(l))); };
    const HELP = [['pwd', 'أين أنا الآن؟'], ['ls', 'اعرض ما في المجلد'], ['ls -a', 'اعرض كل شيء حتى المخفي'], ['ls -l', 'اعرض التفاصيل والصلاحيات'], ['cd اسم', 'ادخل مجلداً'], ['cd ..', 'ارجع للمجلد الأعلى'], ['cat ملف', 'اقرأ ملفاً'], ['echo نص > ملف', 'اكتب نصاً في ملف'], ['mkdir / touch / rm', 'أنشئ مجلداً / ملفاً / احذف'], ['grep كلمة ملف', 'ابحث عن كلمة داخل ملف'], ['head / tail / wc -l', 'أول الملف / آخره / عدد أسطره'], ['sort / uniq -c', 'رتّب / عُدّ المتكرر'], ['أمر | أمر', 'مرّر ناتج أمر إلى أمر آخر'], ['find . -name اسم', 'ابحث عن ملف'], ['chmod 600 ملف', 'غيّر صلاحيات ملف'], ['whoami / id', 'من أنا؟ وما مجموعاتي؟'], ['sudo أمر', 'نفّذ أمراً بصلاحية المدير'], ['ps / kill رقم', 'البرامج التي تعمل / أوقف برنامجاً'], ['ping / traceroute', 'هل الجهاز يرد؟ / طريق الحزم'], ['clear', 'امسح الشاشة']];
    const cmds = {
      help() { T.print('<span class="hl">الأوامر المتاحة:</span>'); HELP.concat(T.ext.help || []).forEach(h => T.print('<span class="pr">' + esc(h[0].padEnd(20)) + '</span> ' + esc(h[1]))); },
      pwd() { T.print(esc(T.cwd)); },
      whoami() { T.print(esc(T.user)); },
      id() { T.print('uid=' + (T.user === 'root' ? 0 : 1000) + '(' + esc(T.user) + ') groups=' + esc([T.user].concat(T.user === 'root' ? [] : T.groups).join(','))); },
      groups() { T.print(esc([T.user].concat(T.groups).join(' '))); },
      hostname() { T.print(esc(T.host)); },
      date() { T.print(esc(new Date().toString().slice(0, 24))); },
      clear() { out.innerHTML = ''; },
      echo(a, raw) {
        const m = raw.match(/^echo\s+(.*?)\s*(>>?)\s*(\S+)\s*$/);
        if (m) { const txt = m[1].replace(/^["']|["']$/g, ''); const abs = T.resolve(m[3]); const { dir, name } = T.parentOf(abs); if (!dir || dir.t !== 'd') return T.err('echo: المجلد غير موجود'); const ex = dir.c[name]; if (ex && ex.t === 'd') return T.err('echo: هذا مجلد وليس ملفاً'); if (ex && !T.can(ex, 'w')) return denied('echo', m[3]); if (!ex && !T.can(dir, 'w')) return denied('echo', m[3]); dir.c[name] = Object.assign(ex || { t: 'f', p: 'rw-r--r--', o: T.user }, { x: (m[2] === '>>' && ex ? ex.x + '\n' : '') + txt }); return; }
        T.print(esc(raw.replace(/^echo\s*/, '').replace(/^["']|["']$/g, '')));
      },
      ls(a) {
        const fl = a.filter(x => x.startsWith('-')).join(''); const all = fl.includes('a'), long = fl.includes('l');
        const tgt = a.filter(x => !x.startsWith('-'))[0]; const abs = T.resolve(tgt || '.'); const n = T.node(abs);
        if (!n) return T.err('ls: لا يوجد شيء اسمه «' + tgt + '» هنا');
        const row = (nm, c) => { const d = c.t === 'd'; return (d ? 'd' : '-') + (c.p || 'rw-r--r--') + '  ' + esc((c.o || T.user).padEnd(6)) + ' ' + String(d ? 4096 : c.x.length).padStart(5) + '  ' + (d ? '<span class="dir">' + esc(nm) + '/</span>' : esc(nm)); };
        if (n.t === 'f') return T.print(long ? row(tgt, n) : esc(tgt));
        if (!T.can(n, 'r')) return denied('ls', tgt || abs);
        const names = Object.keys(n.c).filter(x => all || !x.startsWith('.')).sort();
        if (!names.length) return T.print('(المجلد فارغ)', 'dim');
        if (long) names.forEach(x => T.print(row(x, n.c[x])));
        else T.print(names.map(x => n.c[x].t === 'd' ? '<span class="dir">' + esc(x) + '/</span>' : esc(x)).join('   '));
      },
      cd(a) {
        const abs = T.resolve(a[0] || '~'); const n = T.node(abs);
        if (!n) return T.err('cd: لا يوجد مجلد اسمه «' + a[0] + '». جرّب ls لترى الأسماء.');
        if (n.t !== 'd') return T.err('cd: «' + a[0] + '» ملف وليس مجلداً. استخدم cat لقراءته.');
        if (!T.can(n, 'x') || (T.ext.deny && T.ext.deny(abs))) return denied('cd', a[0]);
        T.cwd = abs; paint();
      },
      cat(a) { if (!a.length) return T.err('cat: اكتب اسم الملف بعد cat، مثلاً: cat hello.txt'); for (const f of a) { const x = readFile('cat', f); if (x != null) T.print(esc(x)); } },
      mkdir(a) { if (!a[0]) return T.err('mkdir: اكتب اسم المجلد'); const { dir, name } = T.parentOf(T.resolve(a[0])); if (!dir || dir.t !== 'd') return T.err('mkdir: المسار غير موجود'); if (dir.c[name]) return T.err('mkdir: يوجد شيء بهذا الاسم'); if (!T.can(dir, 'w')) return denied('mkdir', a[0]); dir.c[name] = { t: 'd', c: {}, p: 'rwxr-xr-x', o: T.user }; },
      touch(a) { if (!a[0]) return T.err('touch: اكتب اسم الملف'); const { dir, name } = T.parentOf(T.resolve(a[0])); if (!dir || dir.t !== 'd') return T.err('touch: المسار غير موجود'); if (!dir.c[name]) { if (!T.can(dir, 'w')) return denied('touch', a[0]); dir.c[name] = { t: 'f', x: '', p: 'rw-r--r--', o: T.user }; } },
      rm(a) { const f = a.filter(x => !x.startsWith('-'))[0]; if (!f) return T.err('rm: اكتب اسم الملف'); const { dir, name } = T.parentOf(T.resolve(f)); if (!dir || !dir.c[name]) return T.err('rm: لا يوجد «' + f + '»'); if (dir.c[name].t === 'd' && !a.includes('-r')) return T.err('rm: هذا مجلد. (احذر! الحذف في الطرفية لا يذهب لسلة المحذوفات)'); if (!T.can(dir, 'w')) return denied('rm', f); delete dir.c[name]; T.print('🗑️ حُذف «' + esc(f) + '» نهائياً', 'dim'); },
      chmod(a) {
        const [mode, f] = a; if (!mode || !f) return T.err('chmod: الطريقة: chmod 600 ملف  أو  chmod u+x ملف'); const n = T.node(T.resolve(f)); if (!n) return T.err('chmod: لا يوجد «' + f + '»');
        if (T.user !== 'root' && n.o !== T.user) return T.err('chmod: لا تستطيع تغيير صلاحيات ملف لا تملكه (صاحبه: ' + n.o + ')');
        const b = 'rwx'; let p = (n.p || 'rw-r--r--').split('');
        if (/^[0-7]{3}$/.test(mode)) { p = mode.split('').map(Number).map(v => (v & 4 ? 'r' : '-') + (v & 2 ? 'w' : '-') + (v & 1 ? 'x' : '-')).join('').split(''); }
        else { const m = mode.match(/^([ugoa]*)([+-=])([rwx]+)$/); if (!m) return T.err('chmod: لم أفهم «' + mode + '». أمثلة: 600 أو 755 أو u+x أو o-r'); const who = (m[1] || 'a').replace('a', 'ugo'); for (const w of who) { const base = 'ugo'.indexOf(w) * 3; if (m[2] === '=') for (let i = 0; i < 3; i++) p[base + i] = '-'; for (const r of m[3]) p[base + b.indexOf(r)] = m[2] === '-' ? '-' : r; } }
        n.p = p.join('');
      },
      sudo(a, raw) {
        if (!a.length) return T.err('sudo: اكتب الأمر بعد sudo');
        if (T.user !== 'root' && !T.sudoers.includes(T.user)) return T.err(T.user + ' ليس في قائمة المسموح لهم بـ sudo. هذه المحاولة سُجّلت في السجل 📝');
        const old = T.user; T.user = 'root'; try { T.exec(raw.replace(/^sudo\s+/, '')); } finally { T.user = old; }
      },
      su(a) { const u = a[0] || 'root'; if (!(u in T.pw) && u !== T.user) return T.err('su: المستخدم «' + u + '» غير موجود'); T.pending = { label: 'كلمة المرور: ', secret: 1, fn: v => { if (T.pw[u] === v) { T.user = u; T.cwd = u === 'root' ? '/root' : '/home/' + u; T.print('✅ صرت ' + esc(u), 'pr'); } else T.err('su: كلمة المرور خاطئة'); } }; paint(); },
      exit() { if (T.home0 && T.user !== T.home0) { T.user = T.home0; T.cwd = '/home/' + T.user; paint(); T.print('رجعت إلى ' + esc(T.user), 'dim'); } else T.print('لا يمكنك الخروج من عُقاب 😄 لكن يمكنك الضغط على زر التالي.', 'dim'); },
      ps() { T.print('<span class="dim">  PID USER     COMMAND</span>'); T.procs.forEach(p => T.print(String(p.pid).padStart(5) + ' ' + esc(p.user.padEnd(8)) + ' ' + esc(p.cmd))); },
      kill(a) { const id = +a.filter(x => !x.startsWith('-'))[0]; const p = T.procs.find(x => x.pid === id); if (!p) return T.err('kill: لا يوجد برنامج رقمه ' + (id || '؟')); if (T.user !== 'root' && p.user !== T.user) return T.err('kill: لا تستطيع إيقاف برنامج يملكه ' + p.user); T.procs = T.procs.filter(x => x !== p); T.print('⏹️ أُوقف البرنامج ' + id + ' (' + esc(p.cmd) + ')', 'dim'); },
      ping(a) { const h = a.filter(x => !x.startsWith('-'))[0]; if (!h) return T.err('ping: اكتب اسم الجهاز أو عنوانه'); const n = (T.net.hosts || {})[h] || Object.values(T.net.hosts || {}).find(x => x.ip === h); if (!n || n.down) { T.print('PING ' + esc(h) + ' ...', 'dim'); for (let i = 1; i <= 4; i++) T.print('لا يوجد رد (Request timeout) #' + i, 'er'); T.print('4 أُرسلت، 0 وصلت، 100% ضائعة', 'er'); return; } T.print('PING ' + esc(h) + ' (' + esc(n.ip) + ')', 'dim'); for (let i = 1; i <= 4; i++) T.print('رد من ' + esc(n.ip) + ': رقم=' + i + ' الوقت=' + (n.ms + Math.round(Math.random() * n.ms / 5)) + ' ms', 'pr'); T.print('4 أُرسلت، 4 وصلت، 0% ضائعة'); },
      traceroute(a) { const h = a[0]; const n = (T.net.hosts || {})[h] || Object.values(T.net.hosts || {}).find(x => x.ip === h); if (!h) return T.err('traceroute: اكتب اسم الجهاز'); if (!n) return T.err('traceroute: لا أعرف «' + h + '»'); T.print('الطريق إلى ' + esc(h) + ' (' + esc(n.ip) + '):', 'dim'); (n.hops || []).concat([[n.ip, n.ms]]).forEach((x, i) => T.print(String(i + 1).padStart(2) + '  ' + esc(x[0].padEnd(16)) + ' ' + x[1] + ' ms')); },
      find(a) { const start = a[0] && !a[0].startsWith('-') ? a[0] : '.'; const ni = a.indexOf('-name'); const pat = ni >= 0 ? (a[ni + 1] || '').replace(/^["']|["']$/g, '') : ''; const re = new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'); const base = T.resolve(start); const walk = (n, p) => { if (n.t !== 'd' || !T.can(n, 'r')) return; for (const k in n.c) { const pp = (p === '/' ? '' : p) + '/' + k; if (!pat || re.test(k)) T.print(esc(start === '.' ? '.' + pp.slice(base === '/' ? 0 : base.length) : pp)); walk(n.c[k], pp); } }; const n = T.node(base); if (!n) return T.err('find: لا يوجد «' + start + '»'); walk(n, base); },
      history() { T.hist.forEach((h, i) => T.print(String(i + 1).padStart(3) + '  ' + esc(h))); }
    };
    Object.keys(filters).forEach(k => { cmds[k] = (a) => showLines(filters[k](a, null)); });
    Object.assign(cmds, T.ext.cmds || {});
    const parse = r => { const a = r.match(/"[^"]*"|'[^']*'|\S+/g) || []; return { c: a[0], a: a.slice(1).map(x => x.replace(/^["']|["']$/g, '')) }; };
    T.exec = (raw) => {
      const stages = raw.split('|').map(x => x.trim()).filter(Boolean);
      if (stages.length > 1) {
        const first = parse(stages[0]); let data;
        if (filters[first.c]) data = filters[first.c](first.a, null); else { T.cap = []; try { (cmds[first.c] || (() => T.err('«' + first.c + '»: أمر غير معروف')))(first.a, stages[0], T); } finally { data = T.cap; T.cap = null; } }
        for (const st of stages.slice(1)) { if (data == null) return { c: first.c, a: first.a }; const p = parse(st); if (!filters[p.c]) { T.err('«' + p.c + '» لا يعمل بعد | . جرّب: grep أو sort أو uniq أو wc أو head أو tail أو cut'); return { c: first.c, a: first.a }; } data = filters[p.c](p.a, Array.isArray(data) ? data : data.lines); }
        showLines(data); return { c: first.c, a: first.a, pipe: stages.slice(1).map(x => parse(x).c) };
      }
      const { c, a } = parse(raw);
      if (cmds[c]) { try { cmds[c](a, raw, T); } catch (e) { T.err('خطأ: ' + e.message); } }
      else { const sim = Object.keys(cmds).find(k => k.length > 1 && k.startsWith((c || '').slice(0, 2))); T.err('«' + c + '»: أمر غير معروف.' + (sim ? ' هل تقصد ' + sim + '؟' : '') + ' اكتب help لترى الأوامر.'); }
      return { c, a };
    };
    T.run = (raw) => {
      if (T.pending) { const p = T.pending; T.pending = null; T.print('<span class="pr">' + esc(p.label) + '</span>' + (p.secret ? '••••' : esc(raw))); p.fn(raw); paint(); return; }
      raw = raw.trim(); T.print('<span class="pr">' + esc(P()) + '</span> ' + esc(raw));
      if (!raw) return;
      T.hist.push(raw); T.hi = T.hist.length;
      const res = T.exec(raw);
      paint();
      if (T.onCmd) T.onCmd({ raw, cmd: res.c, args: res.a, pipe: res.pipe || [], T });
    };
    const tab = () => {
      const v = inp.value; const m = v.match(/(\S*)$/); const part = m[1]; const base = part.includes('/') ? part.slice(0, part.lastIndexOf('/') + 1) : ''; const pre = part.slice(base.length);
      const dn = T.node(T.resolve(base || '.')); if (!dn || dn.t !== 'd') return;
      const opts2 = Object.keys(dn.c).filter(x => x.startsWith(pre) && (pre.startsWith('.') || !x.startsWith('.')));
      if (opts2.length === 1) { const x = opts2[0]; inp.value = v.slice(0, v.length - part.length) + base + x + (dn.c[x].t === 'd' ? '/' : ' '); }
      else if (opts2.length > 1) T.print(opts2.join('   '), 'dim');
    };
    $('form', el).onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; T.run(v); };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); tab(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (T.hi > 0) { T.hi--; inp.value = T.hist[T.hi] || ''; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (T.hi < T.hist.length) { T.hi++; inp.value = T.hist[T.hi] || ''; } }
      else Snd.key();
    });
    $('.keybar', el).onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; if (k === 'Tab') tab(); else if (k === '↑') { if (T.hi > 0) { T.hi--; inp.value = T.hist[T.hi] || ''; } } else inp.value += k; inp.focus(); };
    /* click focuses the prompt, but never steals a text selection (so flags can be copied) */
    box.onclick = () => { const sel = window.getSelection && String(window.getSelection()); if (sel) return; inp.focus({ preventScroll: true }); };
    T.home0 = T.user;
    paint();
    if (opts.motd) T.print(opts.motd, 'dim');
    T.input = inp;
    return T;
  },

  /* lesson mission: goals = [{d, ok(ctx)}] */
  mission(s, el, api) {
    el.innerHTML = '<ul class="goals">' + s.goals.map((g, i) => '<li data-g="' + i + '"><i></i><span>' + md(g.d) + '</span></li>').join('') + '</ul><div class="tbox"></div>';
    const done = {};
    const T = Term.create($('.tbox', el), {
      fs: s.fs, cwd: s.cwd, host: s.host, user: s.user, sudoers: s.sudoers, groups: s.groups, procs: s.procs, net: s.net, pw: s.pw, motd: s.motd || 'اكتب help لترى الأوامر · اضغط Tab لإكمال الأسماء تلقائياً', ext: typeof s.ext === 'function' ? s.ext() : s.ext,
      onCmd(ctx) {
        s.goals.forEach((g, i) => {
          if (done[i]) return;
          let ok = false; try { ok = g.ok(ctx); } catch (e) { }
          if (ok) { done[i] = 1; const li = $('[data-g="' + i + '"]', el); li.classList.add('done'); $('i', li).textContent = '✓'; Snd.ok(); }
        });
        if (Object.keys(done).length === s.goals.length) { api.done(s.yes || 'أنجزت المهمة!'); if (s.medal) api.medal(s.medal); }
      }
    });
    setTimeout(() => T.input.focus({ preventScroll: true }), 80);
  }
};

/* ---- a tiny pretend git for lessons (works only on the pretend file system) ---- */
Term.git = function (spec = {}) {
  const G = { init: !!spec.init, commits: (spec.commits || []).map(c => Object.assign({}, c)), staged: {}, snap: Object.assign({}, spec.snap || {}), remote: spec.remote || '' };
  const hex = () => Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 7);
  const files = T => { const d = T.node(T.cwd); const o = {}; if (!d || d.t !== 'd') return o; for (const k in d.c) if (d.c[k].t === 'f' && k !== '.gitignore') o[k] = d.c[k].x; return o; };
  const ignored = T => { const g = T.node(T.resolve('.gitignore')); return g && g.t === 'f' ? g.x.split('\n').map(x => x.trim()).filter(Boolean) : []; };
  const changed = T => { const f = files(T), ig = ignored(T); return Object.keys(f).filter(k => !ig.includes(k) && f[k] !== G.snap[k] && !(k in G.staged && G.staged[k] === f[k])); };
  return {
    help: [['git init', 'ابدأ مستودعاً (صندوق حفظ النسخ)'], ['git status', 'ما الذي تغيّر؟'], ['git add ملف  أو  git add .', 'جهّز الملف للحفظ'], ['git commit -m "رسالة"', 'احفظ نسخة باسم'], ['git log', 'سجل النسخ المحفوظة'], ['git show رقم', 'ماذا تغيّر في نسخة معيّنة؟'], ['git push', 'ارفع النسخ إلى GitHub']],
    cmds: {
      git(a, raw, T) {
        const sub = a[0];
        if (!sub) return T.err('git: اكتب أمراً بعد git، مثل: git status');
        if (sub !== 'init' && !G.init) return T.err('git: هذا المجلد ليس مستودعاً بعد. ابدأ بـ git init');
        if (sub === 'init') { if (G.init) return T.print('المستودع موجود أصلاً ✓', 'dim'); G.init = true; return T.print('✅ صار هذا المجلد مستودع git (صندوق يحفظ كل نسخة من عملك)', 'pr'); }
        if (sub === 'status') {
          const st = Object.keys(G.staged), ch = changed(T), ig = ignored(T).filter(k => k in files(T));
          if (st.length) { T.print('<span class="pr">جاهز للحفظ (staged):</span>'); st.forEach(k => T.print('   ✅ ' + esc(k))); }
          if (ch.length) { T.print('<span class="er">تغيّر ولم يُجهّز بعد:</span>'); ch.forEach(k => T.print('   ✏️ ' + esc(k))); }
          if (ig.length) T.print('مُتجاهَل بسبب .gitignore: ' + esc(ig.join('، ')), 'dim');
          if (!st.length && !ch.length) T.print('لا شيء جديد. كل شيء محفوظ ✓', 'dim');
          return;
        }
        if (sub === 'add') {
          const f = files(T), ig = ignored(T), what = a[1];
          if (!what) return T.err('git add: اكتب اسم الملف، أو نقطة . لكل الملفات');
          const list = what === '.' ? Object.keys(f).filter(k => !ig.includes(k)) : [what];
          for (const k of list) { if (!(k in f)) return T.err('git add: لا يوجد ملف اسمه «' + k + '»'); if (ig.includes(k) && what !== '.') { T.err('git add: «' + k + '» مذكور في .gitignore فلن يُضاف 🛡️'); continue; } G.staged[k] = f[k]; }
          return T.print('جُهّز للحفظ: ' + esc(Object.keys(G.staged).join('، ') || '(لا شيء)'), 'dim');
        }
        if (sub === 'commit') {
          const m = raw.match(/-m\s+["']([^"']*)["']/) || raw.match(/-m\s+(\S+)/); if (!m) return T.err('git commit: أضف رسالة تصف ما فعلت: git commit -m "رسالتك"');
          const ks = Object.keys(G.staged); if (!ks.length) return T.err('git commit: لم تجهّز شيئاً. استخدم git add أولاً');
          const id = hex(); G.commits.unshift({ id, msg: m[1], diff: ks.map(k => '+++ ' + k + '\n' + G.staged[k].split('\n').map(l => '+ ' + l).join('\n')).join('\n') });
          ks.forEach(k => G.snap[k] = G.staged[k]); G.staged = {};
          return T.print('💾 حُفظت النسخة <span class="hl">' + id + '</span>: ' + esc(m[1]) + ' (' + ks.length + ' ملف)', 'pr');
        }
        if (sub === 'log') { if (!G.commits.length) return T.print('لا توجد نسخ محفوظة بعد.', 'dim'); G.commits.forEach(c => T.print('<span class="hl">' + esc(c.id) + '</span>  ' + esc(c.msg))); return; }
        if (sub === 'show') { const c = G.commits.find(x => x.id === a[1]) || (!a[1] && G.commits[0]); if (!c) return T.err('git show: لا توجد نسخة رقمها «' + (a[1] || '') + '». انظر git log'); T.print('<span class="hl">النسخة ' + esc(c.id) + '</span>: ' + esc(c.msg)); (c.diff || '').split('\n').forEach(l => T.print(esc(l), /^\+/.test(l) ? 'pr' : /^-/.test(l) ? 'er' : '')); return; }
        if (sub === 'push') { if (!G.commits.length) return T.err('git push: لا توجد نسخ لرفعها. احفظ نسخة أولاً بـ commit'); T.print('⬆️ رُفعت ' + G.commits.length + ' نسخة إلى GitHub', 'pr'); if (G.remote) T.print('🌍 موقعك منشور على: <span class="hl">' + esc(G.remote) + '</span>'); return; }
        T.err('git: لا أعرف «' + sub + '». جرّب: init أو status أو add أو commit أو log أو show أو push');
      }
    },
    G
  };
};
