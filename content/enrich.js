/* ===== طبقة الشرح الإضافي: تُدرج خطوات شرح جديدة داخل الدروس دون تغيير ملفات الدروس الأصلية =====
   C.enrich(uid, lid, ops)
   op = { at: رقم الخطوة الأصلية (تُدرج قبلها) أو 'end', steps: [...] }
   op = { simple: رقم الخطوة الأصلية, s: 'شرح أبسط' }  ← يضيف زر «اشرح لي بطريقة أبسط» لخطوة لم يكن لها */
C.enrich = function (uid, lid, ops) {
  const u = C.units.find(x => x.id === uid); const l = u && u.lessons.find(x => x.id === lid);
  if (!l) { if (typeof console !== 'undefined') console.warn('enrich: لا يوجد درس', uid, lid); return; }
  if (!l.tagged) { l.steps.forEach((s, i) => { s.oi = i; }); l.tagged = 1; }
  let added = 0;
  ops.forEach(op => {
    if (op.simple != null) { const st = l.steps.find(s => s.oi === op.simple); if (st && !st.s) st.s = op.s; return; }
    const pos = op.at === 'end' ? l.steps.length : l.steps.findIndex(s => s.oi === op.at);
    if (pos < 0) { if (typeof console !== 'undefined') console.warn('enrich: خطوة غير موجودة', uid, lid, op.at); return; }
    l.steps.splice(pos, 0, ...op.steps.map(s => Object.assign({ ex: 1 }, s)));
    added += op.steps.length;
  });
  l.mins = (l.mins || 8) + Math.round(added * 0.8);
};
