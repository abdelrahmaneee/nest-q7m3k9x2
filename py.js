/* ===== عُقاب — Python editor (Pyodide in a worker, loaded only when needed) ===== */
'use strict';
const Py = {
  w: null, ready: null, seq: 0, pending: {},
  boot() {
    if (Py.ready) return Py.ready;
    Py.ready = new Promise((res, rej) => {
      try { Py.w = new Worker('py-worker.js', { type: 'module' }); } catch (e) { rej(e); return; }
      Py.w.onmessage = e => { const m = e.data; if (m.type === 'ready') res(); else if (m.type === 'fail') rej(new Error(m.msg)); else if (m.id && Py.pending[m.id]) { Py.pending[m.id](m); delete Py.pending[m.id]; } };
      Py.w.onerror = e => rej(e);
    });
    Py.ready.catch(() => { Py.ready = null; });
    return Py.ready;
  },
  kill() { if (Py.w) Py.w.terminate(); Py.w = null; Py.ready = null; for (const k in Py.pending) { Py.pending[k]({ type: 'done', out: '', err: '__TIMEOUT__' }); delete Py.pending[k]; } },
  async run(code, inputs, after, ms = 6000) {
    await Py.boot();
    const id = ++Py.seq;
    return new Promise(res => {
      const t = setTimeout(() => { Py.kill(); res({ out: '', err: '__TIMEOUT__' }); }, ms);
      Py.pending[id] = m => { clearTimeout(t); res(m); };
      Py.w.postMessage({ id, code, inputs, after });
    });
  },
  explain(err) {
    if (!err) return '';
    if (err === '__TIMEOUT__') return '⏰ برنامجك لم يتوقف! غالباً عندك <b>حلقة لا نهاية لها</b>: تأكد أن شرط <code>while</code> يصبح خطأ في وقت ما.';
    const last = err.trim().split('\n').filter(Boolean).pop() || err;
    const lineM = err.match(/line (\d+)/g); const ln = lineM ? lineM[lineM.length - 1].replace('line ', '') : null;
    const at = ln ? ' (في السطر ' + ln + ')' : '';
    let m;
    if (/IndentationError|unexpected indent|expected an indented block/.test(last)) return '📏 مشكلة في <b>المسافات أول السطر</b>' + at + '. الأسطر داخل <code>if</code> أو <code>for</code> أو <code>def</code> يجب أن تبدأ بـ 4 مسافات، والباقي بلا مسافات.';
    if (/unterminated string|EOL while scanning|unterminated triple/.test(last)) return '✏️ نسيت <b>إغلاق علامة التنصيص</b> <code>"</code>' + at + '. كل نص يبدأ بـ " وينتهي بـ ".';
    if (/was never closed|'\(' was never closed|unexpected EOF/.test(last)) return '🔒 فتحت قوساً <code>(</code> ولم تغلقه' + at + '. عدّ الأقواس: كل ( تحتاج ).';
    if (/expected ':'/.test(last)) return '➗ نسيت <b>النقطتين</b> <code>:</code> في آخر السطر' + at + '. بعد if و for و while و def نضع دائماً :';
    if (/invalid syntax|SyntaxError/.test(last)) return '🧩 Python لم يفهم طريقة الكتابة' + at + '. تأكد من الأقواس وعلامات التنصيص والنقطتين، وأنك كتبت الأوامر بالإنجليزية.';
    if ((m = last.match(/NameError: name '(.+?)' is not defined/))) return '❓ الاسم <code>' + esc(m[1]) + '</code> غير معروف' + at + '. هل أخطأت في كتابته؟ هل نسيت علامات التنصيص حول النص؟ هل عرّفت المتغير قبل استخدامه؟';
    if (/can only concatenate str|unsupported operand type.*str|must be str, not int/.test(last)) return '🧮 لا يمكن جمع <b>نص</b> مع <b>رقم</b> مباشرة' + at + '. حوّل الرقم لنص بـ <code>str(x)</code>، أو افصلهما بفاصلة داخل print.';
    if (/ZeroDivisionError/.test(last)) return '➗ لا يمكن القسمة على صفر' + at + '!';
    if (/IndexError/.test(last)) return '📦 طلبت عنصراً غير موجود في القائمة' + at + '. تذكّر: العدّ يبدأ من 0، وآخر عنصر رقمه (الطول − 1).';
    if ((m = last.match(/ValueError: invalid literal for int\(\) with base 10: '(.*)'/))) return '🔢 لا يمكن تحويل <code>' + esc(m[1]) + '</code> إلى رقم' + at + '.';
    if (/TypeError: .* takes \d+ positional argument/.test(last)) return '🛠️ عدد القيم التي أعطيتها للدالة غير صحيح' + at + '.';
    if (/TypeError/.test(last)) return '🧩 نوع البيانات غير مناسب' + at + ': ' + esc(last);
    if (/AttributeError/.test(last)) return '🔤 هذا الأمر لا يعمل مع هذا النوع من البيانات' + at + ': ' + esc(last);
    return esc(last);
  },
  tabKeys(ta) {
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 4; }
      if (e.key === 'Enter') { const s = ta.selectionStart; const line = ta.value.slice(0, s).split('\n').pop(); let ind = (line.match(/^ */) || [''])[0]; if (/:\s*$/.test(line)) ind += '    '; if (ind) { e.preventDefault(); ta.value = ta.value.slice(0, s) + '\n' + ind + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = s + 1 + ind.length; } }
    });
  },
  /* lesson exercise: {t:'py', m, code, check:{out|outHas|has|after|any}, inputs, hint, sol} */
  exercise(s, el, api) {
    const keys = ['    ', '(', ')', '"', ':', '=', '[', ']', '+', ','];
    el.innerHTML = '<div class="pybox"><textarea spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="محرّر الكود">' + esc(s.code || '') + '</textarea>' +
      (s.inputs ? '<div style="padding:6px 10px;border-top:2px solid var(--line);font-size:.9em">⌨️ ما سيكتبه المستخدم عند <code>input()</code>: ' + s.inputs.map(x => '<span class="pill mono">' + esc(x) + '</span>').join(' ') + '</div>' : '') +
      '<div class="bar2"><button class="btn sm ok" data-p="run">' + ic('play', 18) + 'شغّل</button><button class="btn sm sec" data-p="reset">' + ic('refresh', 18) + 'من جديد</button>' + (s.hint ? '<button class="btn sm sec" data-p="hint">' + ic('bulb', 18) + 'تلميح</button>' : '') + (s.sol ? '<button class="btn sm sec hide" data-p="sol">👀 الحل</button>' : '') + '<span class="sp" style="flex:1"></span><span class="muted pystat" style="font-size:.8em"></span></div>' +
      '<div class="keybar" style="padding:0 8px">' + keys.map(k => '<button type="button" data-ins="' + esc(k) + '">' + (k === '    ' ? '⇥' : esc(k)) + '</button>').join('') + '</div>' +
      '<div class="pyout" aria-live="polite"></div><div class="pyerr-ar hide"></div></div>';
    const ta = $('textarea', el), out = $('.pyout', el), er = $('.pyerr-ar', el), stat = $('.pystat', el);
    Py.tabKeys(ta);
    let fails = 0;
    stat.textContent = 'Python يستعد...';
    Py.boot().then(() => { stat.textContent = 'Python جاهز ✓'; }).catch(() => { stat.textContent = 'تعذّر تحميل Python. تأكد من الإنترنت ثم أعد فتح الدرس.'; });
    const check = (res, code) => {
      const c = s.check || { any: 1 }; const o = (res.out || '').replace(/\s+$/g, '');
      if (res.err) return false;
      if (c.has && !c.has.every(t => code.includes(t))) return 'has';
      if (c.out != null && o.split('\n').map(x => x.trim()).join('\n') !== String(c.out).split('\n').map(x => x.trim()).join('\n')) return 'out';
      if (c.outHas && ![].concat(c.outHas).every(t => o.includes(t))) return 'out';
      if (c.lines && o.split('\n').filter(x => x.trim()).length < c.lines) return 'out';
      if (c.after && res.afterErr) return 'after';
      return true;
    };
    el.onclick = async e => {
      const ins = e.target.closest('[data-ins]'); if (ins) { const v = ins.dataset.ins; const st = ta.selectionStart; ta.value = ta.value.slice(0, st) + v + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = st + v.length; ta.focus(); return; }
      const b = e.target.closest('[data-p]'); if (!b) return; const a = b.dataset.p;
      if (a === 'reset') { ta.value = s.code || ''; out.textContent = ''; er.classList.add('hide'); return; }
      if (a === 'hint') { api.hint && api.hint(); api.fb(false, '💡 ' + s.hint); return; }
      if (a === 'sol') { ta.value = s.sol; return; }
      if (a === 'run') {
        b.disabled = true; out.textContent = '⏳ يعمل...'; er.classList.add('hide');
        const code = ta.value;
        let res; try { res = await Py.run(code, s.inputs || [], s.check && s.check.after); } catch (x) { res = { out: '', err: 'تعذّر تحميل Python' }; }
        b.disabled = false;
        out.innerHTML = esc(res.out || '') + (res.err && res.err !== '__TIMEOUT__' ? '<span class="er">' + esc((res.err.trim().split('\n').pop() || '')) + '</span>' : '') || '<span class="dim">(لم يطبع البرنامج شيئاً)</span>';
        if (res.err) { er.innerHTML = Py.explain(res.err); er.classList.remove('hide'); }
        const ok = check(res, code);
        if (s.medal && !res.err) api.medal(s.medal);
        if (ok === true) { api.done(s.yes || 'برنامجك يعمل بشكل صحيح! 🎉'); }
        else {
          fails++; api.wrong();
          if (ok === 'has') api.fb(false, s.needMsg || 'البرنامج يعمل، لكن استخدم المطلوب في التمرين.');
          else if (ok === 'out') api.fb(false, s.outMsg || 'البرنامج يعمل، لكن الناتج ليس المطلوب بعد.' + (s.check.out != null ? ' المطلوب أن يطبع:<pre class="hexv" style="margin:6px 0">' + esc(s.check.out) + '</pre>' : ''));
          else if (ok === 'after') api.fb(false, s.afterMsg || 'جرّبت برنامجك بقيم أخرى ولم يعطِ النتيجة الصحيحة.', res.afterErr && res.afterErr.includes('AssertionError') ? '' : Py.explain(res.afterErr));
          else if (res.err) Snd.bad();
          if (fails >= 2 && s.sol) $('[data-p="sol"]', el).classList.remove('hide');
        }
      }
    };
  }
};
