/* ===== عُقاب — simulated terminal (nothing here touches a real system) ===== */
'use strict';
const Term = {
  DEFAULT_FS: () => ({
    home: { oqab: { 'hello.txt': 'أهلاً! هذا أول ملف تقرؤه في الطرفية.\nأحسنت يا بطل.', 'todo.txt': '1. أتعلّم الطرفية\n2. أتعلّم Python\n3. أصير خبير أمن', games: { 'chess.txt': 'لعبة الشطرنج: 0 فوز، 0 خسارة' }, pictures: { 'eagle.png': '[صورة عُقاب]', 'trip.png': '[صورة الرحلة]' }, school: { 'math.txt': '2 + 2 = 4\n10 × 10 = 100' } } },
    etc: { 'hostname': 'oqab-nest' }, tmp: {}
  }),
  build(spec) {
    const mk = o => { const d = { t: 'd', c: {} }; for (const k in o) d.c[k] = typeof o[k] === 'string' ? { t: 'f', x: o[k] } : mk(o[k]); return d; };
    return mk(spec);
  },
  create(el, opts = {}) {
    const T = {
      root: Term.build(opts.fs || Term.DEFAULT_FS()), cwd: opts.cwd || '/home/oqab', hist: [], hi: 0, user: opts.user || 'oqab', host: opts.host || 'nest', ext: opts.ext || {}, onCmd: opts.onCmd || null
    };
    el.innerHTML = '<div class="terminal" tabindex="0"><div class="tout"></div><form><span class="pr tprompt"></span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="اكتب أمراً"></form></div><div class="keybar">' + ['Tab', '↑', '/', '-', '.', '~', '>', '|', '"', '_'].map(k => '<button type="button" data-k="' + esc(k) + '">' + esc(k) + '</button>').join('') + '</div>';
    const box = $('.terminal', el), out = $('.tout', el), inp = $('input', el), prompt = $('.tprompt', el);
    const P = () => T.user + '@' + T.host + ':' + T.cwd.replace('/home/' + T.user, '~') + '$';
    const paint = () => { prompt.textContent = P() + ' '; };
    T.print = (html, cls) => { out.insertAdjacentHTML('beforeend', '<div class="ln' + (cls ? ' ' + cls : '') + '">' + html + '</div>'); box.scrollTop = 1e9; };
    T.err = m => T.print(esc(m), 'er');
    T.resolve = (p) => {
      if (!p || p === '~') p = '/home/' + T.user; if (p.startsWith('~/')) p = '/home/' + T.user + p.slice(1);
      const parts = (p.startsWith('/') ? p : T.cwd + '/' + p).split('/'); const st = [];
      for (const x of parts) { if (!x || x === '.') continue; if (x === '..') st.pop(); else st.push(x); }
      return '/' + st.join('/');
    };
    T.node = (abs) => { let n = T.root; for (const x of abs.split('/').filter(Boolean)) { if (!n || n.t !== 'd' || !n.c[x]) return null; n = n.c[x]; } return n; };
    T.parentOf = abs => { const a = abs.split('/').filter(Boolean); const name = a.pop(); return { dir: T.node('/' + a.join('/')), name }; };
    const HELP = [['pwd', 'أين أنا الآن؟'], ['ls', 'اعرض ما في المجلد'], ['ls -a', 'اعرض كل شيء حتى المخفي'], ['cd اسم', 'ادخل مجلداً'], ['cd ..', 'ارجع للمجلد الأعلى'], ['cat ملف', 'اقرأ ملفاً'], ['echo نص', 'اطبع نصاً'], ['echo نص > ملف', 'اكتب نصاً في ملف'], ['mkdir اسم', 'أنشئ مجلداً'], ['touch اسم', 'أنشئ ملفاً فارغاً'], ['rm ملف', 'احذف ملفاً'], ['grep كلمة ملف', 'ابحث عن كلمة داخل ملف'], ['clear', 'امسح الشاشة'], ['whoami', 'من أنا؟']];
    const cmds = {
      help() { T.print('<span class="hl">الأوامر المتاحة:</span>'); HELP.concat(T.ext.help || []).forEach(h => T.print('<span class="pr">' + esc(h[0].padEnd(16)) + '</span> ' + esc(h[1]))); },
      pwd() { T.print(esc(T.cwd)); },
      whoami() { T.print(esc(T.user)); },
      hostname() { T.print(esc(T.host)); },
      date() { T.print(esc(new Date().toString().slice(0, 24))); },
      clear() { out.innerHTML = ''; },
      echo(a, raw) {
        const m = raw.match(/^echo\s+(.*?)\s*(>>?)\s*(\S+)\s*$/);
        if (m) { const txt = m[1].replace(/^["']|["']$/g, ''); const abs = T.resolve(m[3]); const { dir, name } = T.parentOf(abs); if (!dir || dir.t !== 'd') return T.err('echo: المجلد غير موجود'); const ex = dir.c[name]; if (ex && ex.t === 'd') return T.err('echo: هذا مجلد وليس ملفاً'); dir.c[name] = { t: 'f', x: (m[2] === '>>' && ex ? ex.x + '\n' : '') + txt }; return; }
        T.print(esc(raw.replace(/^echo\s*/, '').replace(/^["']|["']$/g, '')));
      },
      ls(a) {
        const all = a.includes('-a') || a.includes('-la') || a.includes('-al'); const long = a.some(x => /^-.*l/.test(x));
        const tgt = a.filter(x => !x.startsWith('-'))[0]; const abs = T.resolve(tgt || '.'); const n = T.node(abs);
        if (!n) return T.err('ls: لا يوجد شيء اسمه «' + tgt + '» هنا');
        if (n.t === 'f') return T.print(esc(tgt));
        const names = Object.keys(n.c).filter(x => all || !x.startsWith('.')).sort();
        if (all) names.unshift('.', '..');
        if (!names.length) return T.print('(المجلد فارغ)', 'dim');
        if (long) names.forEach(x => { const c = n.c[x]; const d = !c || c.t === 'd'; T.print((d ? 'd' : '-') + 'rw-r--r--  ' + T.user + '  ' + String(c && c.t === 'f' ? c.x.length : 4096).padStart(5) + '  ' + (d ? '<span class="dir">' + esc(x) + '/</span>' : esc(x))); });
        else T.print(names.map(x => { const c = n.c[x]; return (!c || c.t === 'd') ? '<span class="dir">' + esc(x) + '/</span>' : esc(x); }).join('   '));
      },
      cd(a) {
        const abs = T.resolve(a[0] || '~'); const n = T.node(abs);
        if (!n) return T.err('cd: لا يوجد مجلد اسمه «' + a[0] + '». جرّب ls لترى الأسماء.');
        if (n.t !== 'd') return T.err('cd: «' + a[0] + '» ملف وليس مجلداً. استخدم cat لقراءته.');
        if (T.ext.deny && T.ext.deny(abs)) return T.err('cd: ممنوع الدخول (Permission denied)');
        T.cwd = abs; paint();
      },
      cat(a) {
        if (!a.length) return T.err('cat: اكتب اسم الملف بعد cat، مثلاً: cat hello.txt');
        for (const f of a) { const n = T.node(T.resolve(f)); if (!n) { T.err('cat: لا يوجد ملف اسمه «' + f + '»'); continue; } if (n.t === 'd') { T.err('cat: «' + f + '» مجلد. استخدم cd للدخول إليه.'); continue; } T.print(esc(n.x)); }
      },
      mkdir(a) { if (!a[0]) return T.err('mkdir: اكتب اسم المجلد'); const { dir, name } = T.parentOf(T.resolve(a[0])); if (!dir || dir.t !== 'd') return T.err('mkdir: المسار غير موجود'); if (dir.c[name]) return T.err('mkdir: يوجد شيء بهذا الاسم'); dir.c[name] = { t: 'd', c: {} }; },
      touch(a) { if (!a[0]) return T.err('touch: اكتب اسم الملف'); const { dir, name } = T.parentOf(T.resolve(a[0])); if (!dir || dir.t !== 'd') return T.err('touch: المسار غير موجود'); if (!dir.c[name]) dir.c[name] = { t: 'f', x: '' }; },
      rm(a) { const f = a.filter(x => !x.startsWith('-'))[0]; if (!f) return T.err('rm: اكتب اسم الملف'); const { dir, name } = T.parentOf(T.resolve(f)); if (!dir || !dir.c[name]) return T.err('rm: لا يوجد «' + f + '»'); if (dir.c[name].t === 'd' && !a.includes('-r')) return T.err('rm: هذا مجلد. (احذر! الحذف في الطرفية لا يذهب لسلة المحذوفات)'); delete dir.c[name]; T.print('🗑️ حُذف «' + esc(f) + '» نهائياً', 'dim'); },
      grep(a) {
        const flags = a.filter(x => x.startsWith('-')), rest = a.filter(x => !x.startsWith('-')); const [w, f] = rest; if (!w || !f) return T.err('grep: الطريقة: grep كلمة ملف');
        const n = T.node(T.resolve(f)); if (!n || n.t !== 'f') return T.err('grep: لا يوجد ملف اسمه «' + f + '»');
        const ci = flags.includes('-i'); const cnt = flags.includes('-c'); const ww = w.replace(/^["']|["']$/g, '');
        const hits = n.x.split('\n').filter(l => ci ? l.toLowerCase().includes(ww.toLowerCase()) : l.includes(ww));
        if (cnt) return T.print(String(hits.length));
        if (!hits.length) return T.print('(لا توجد نتائج)', 'dim');
        const re = new RegExp(ww.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ci ? 'gi' : 'g');
        hits.forEach(l => T.print(esc(l).replace(re, m => '<span class="hl">' + m + '</span>')));
      },
      history() { T.hist.forEach((h, i) => T.print(String(i + 1).padStart(3) + '  ' + esc(h))); },
      sudo() { T.err('sudo: 🦅 عُقاب يقول: لست بحاجة لصلاحيات المدير هنا!'); },
      exit() { T.print('لا يمكنك الخروج من عُقاب 😄 لكن يمكنك الضغط على زر التالي.', 'dim'); }
    };
    Object.assign(cmds, T.ext.cmds || {});
    T.run = (raw) => {
      raw = raw.trim(); T.print('<span class="pr">' + esc(P()) + '</span> ' + esc(raw));
      if (!raw) return;
      T.hist.push(raw); T.hi = T.hist.length;
      const pipe = raw.split('|').map(x => x.trim());
      const parse = r => { const a = r.match(/"[^"]*"|'[^']*'|\S+/g) || []; return { c: a[0], a: a.slice(1).map(x => x.replace(/^["']|["']$/g, '')) }; };
      let res;
      if (pipe.length === 2 && /^grep\s/.test(pipe[1])) {
        const cap = []; const old = T.print; T.print = (h) => cap.push(h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
        const p1 = parse(pipe[0]); try { (cmds[p1.c] || (() => cap.push('?')))(p1.a, pipe[0], T); } finally { T.print = old; }
        const p2 = parse(pipe[1]); const w = (p2.a.filter(x => !x.startsWith('-'))[0] || ''); const ci = p2.a.includes('-i');
        const lines = cap.join('\n').split('\n').filter(l => ci ? l.toLowerCase().includes(w.toLowerCase()) : l.includes(w));
        if (p2.a.includes('-c')) T.print(String(lines.length)); else lines.forEach(l => T.print(esc(l))); res = { c: p1.c, a: p1.a };
      } else {
        const { c, a } = parse(raw); res = { c, a };
        if (cmds[c]) { try { cmds[c](a, raw, T); } catch (e) { T.err('خطأ: ' + e.message); } }
        else { const sim = Object.keys(cmds).find(k => k.length > 1 && (k.startsWith(c.slice(0, 2)))); T.err('«' + c + '»: أمر غير معروف.' + (sim ? ' هل تقصد ' + sim + '؟' : '') + ' اكتب help لترى الأوامر.'); }
      }
      if (T.onCmd) T.onCmd({ raw, cmd: res.c, args: res.a, T });
    };
    const tab = () => {
      const v = inp.value; const m = v.match(/(\S*)$/); const part = m[1]; const base = part.includes('/') ? part.slice(0, part.lastIndexOf('/') + 1) : ''; const pre = part.slice(base.length);
      const dn = T.node(T.resolve(base || '.')); if (!dn || dn.t !== 'd') return;
      const opts = Object.keys(dn.c).filter(x => x.startsWith(pre) && (pre.startsWith('.') || !x.startsWith('.')));
      if (opts.length === 1) { const x = opts[0]; inp.value = v.slice(0, v.length - part.length) + base + x + (dn.c[x].t === 'd' ? '/' : ' '); }
      else if (opts.length > 1) T.print(opts.join('   '), 'dim');
    };
    $('form', el).onsubmit = e => { e.preventDefault(); const v = inp.value; inp.value = ''; T.run(v); };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); tab(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (T.hi > 0) { T.hi--; inp.value = T.hist[T.hi] || ''; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (T.hi < T.hist.length) { T.hi++; inp.value = T.hist[T.hi] || ''; } }
      else Snd.key();
    });
    $('.keybar', el).onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; if (k === 'Tab') tab(); else if (k === '↑') { if (T.hi > 0) { T.hi--; inp.value = T.hist[T.hi] || ''; } } else inp.value += k; inp.focus(); };
    box.onclick = () => inp.focus({ preventScroll: true });
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
      fs: s.fs, cwd: s.cwd, host: s.host, motd: s.motd || 'اكتب help لترى الأوامر · اضغط Tab لإكمال الأسماء تلقائياً', ext: s.ext,
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
