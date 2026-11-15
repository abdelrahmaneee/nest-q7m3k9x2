/* عُقاب — Python runs here, in a separate worker, so a stuck program can be stopped */
import { loadPyodide } from './py/pyodide.mjs';
let py = null;
const ready = (async () => {
  py = await loadPyodide({ indexURL: new URL('./py/', import.meta.url).href });
  postMessage({ type: 'ready' });
})().catch(e => postMessage({ type: 'fail', msg: String(e && e.message || e) }));
self.onmessage = async (e) => {
  const { id, code, inputs, after } = e.data;
  await ready;
  if (!py) return postMessage({ id, type: 'done', out: '', err: 'تعذّر تحميل Python', ok: false });
  let out = '';
  py.setStdout({ batched: s => { out += s + '\n'; } });
  py.setStderr({ batched: s => { out += s + '\n'; } });
  const prelude = 'import builtins as __b\n__oq_q=list(__oq_inputs)\ndef __oq_input(p=""):\n    v = __oq_q.pop(0) if __oq_q else ""\n    print(str(p)+str(v))\n    return v\n__b.input=__oq_input\n';
  let err = null, afterErr = null;
  try {
    const ns = py.globals.get('dict')();
    ns.set('__oq_inputs', py.toPy(inputs || []));
    py.runPython(prelude, { globals: ns });
    try { await py.runPythonAsync(code, { globals: ns }); } catch (x) { err = String(x.message || x); }
    if (!err && after) { try { py.runPython(after, { globals: ns }); } catch (x) { afterErr = String(x.message || x); } }
    ns.destroy && ns.destroy();
  } catch (x) { err = String(x.message || x); }
  postMessage({ id, type: 'done', out, err, afterErr });
};
