(function () {
  const logEl = document.getElementById('log');
  const ctxEl = document.getElementById('ctx');
  const connEl = document.getElementById('conn');
  const originEl = document.getElementById('origin');
  const helpEl = document.getElementById('help');

  const LMS_ORIGIN = '*'; // For local testing; set to your LMS origin in production
  const LMS_BASE = (function () {
    try { return new URL(document.referrer).origin || ''; } catch { return ''; }
  })();
  originEl.textContent = `App origin: ${location.origin}`;

  function log(msg, obj) {
    const time = new Date().toISOString();
    const text = obj ? `${time}  ${msg}  ${JSON.stringify(obj, null, 2)}` : `${time}  ${msg}`;
    logEl.textContent += text + "\n";
    logEl.scrollTop = logEl.scrollHeight;
  }

  function postEvent(ev) {
    window.parent?.postMessage(ev, LMS_ORIGIN);
    log('postMessage -> parent', ev);
  }

  const qs = new URLSearchParams(location.search);
  const launchToken = qs.get('token');
  if (launchToken) {
    log('Launch token present');
  } else {
    log('No launch token in URL; waiting for runtime.token from LMS');
  }

  let runtimeToken = null;
  window.addEventListener('message', (evt) => {
    try {
      if (!evt || typeof evt.data !== 'object') return;
      if (evt.data.type === 'runtime.token') {
        runtimeToken = evt.data.runtimeToken;
        log('Received runtime.token');
        connEl.textContent = 'Connected';
        connEl.style.background = '#dcfce7';
        connEl.style.borderColor = '#bbf7d0';
        fetchContext();
      }
      if (evt.data.type === 'checkpoint.load') {
        log('Received checkpoint.load from LMS');
      }
    } catch {}
  });

  async function exchangeIfNeeded() {
    if (runtimeToken || !launchToken) return;
    try {
      // NOTE: This path works only if the LMS permits cross-origin CORS to /api/runtime/* for this origin
      const base = LMS_BASE;
      const resp = await fetch(`${base}/api/runtime/auth/exchange`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: launchToken })
      });
      if (!resp.ok) {
        log('exchange failed', { status: resp.status });
        return;
      }
      const json = await resp.json();
      runtimeToken = json.runtimeToken;
      log('exchange OK');
      connEl.textContent = 'Connected';
      connEl.style.background = '#dcfce7';
      connEl.style.borderColor = '#bbf7d0';
      fetchContext();
    } catch (e) {
      log('exchange error', { message: String(e?.message || e) });
    }
  }

  async function fetchContext() {
    if (!runtimeToken) return;
    try {
      const base = LMS_BASE;
      const resp = await fetch(`${base}/api/runtime/context`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${runtimeToken}` }
      });
      if (!resp.ok) { log('context failed', { status: resp.status }); return; }
      const json = await resp.json();
      ctxEl.textContent = `alias=${json.alias} role=${json.role}`;
      ctxEl.style.background = '#e0e7ff';
      ctxEl.style.borderColor = '#c7d2fe';
      log('context', json);
    } catch (e) {
      log('context error', { message: String(e?.message || e) });
    }
  }

  async function sendProgress(pct) {
    postEvent({ type: 'course.progress', pct });
    if (!runtimeToken) return;
    try {
      const base = LMS_BASE;
      const resp = await fetch(`${base}/api/runtime/progress`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': `Bearer ${runtimeToken}` },
        body: JSON.stringify({ pct })
      });
      log('progress ->', { status: resp.status });
    } catch (e) {
      log('progress error', { message: String(e?.message || e) });
    }
  }

  async function sendGrade(score, max) {
    postEvent({ type: 'course.attempt.completed', score, max, passed: score >= (0.6 * max), runtimeAttemptId: 'sample-attempt' });
    if (!runtimeToken) return;
    try {
      const base = LMS_BASE;
      const resp = await fetch(`${base}/api/runtime/grade`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': `Bearer ${runtimeToken}` },
        body: JSON.stringify({ score, max, passed: score >= (0.6 * max), runtimeAttemptId: 'sample-attempt' })
      });
      log('grade ->', { status: resp.status });
    } catch (e) {
      log('grade error', { message: String(e?.message || e) });
    }
  }

  function sendError() {
    postEvent({ type: 'course.error', code: 'SAMPLE_ERR', message: 'Example error' });
  }

  function saveCheckpoint() {
    window.parent?.postMessage({ type: 'checkpoint.save' }, LMS_ORIGIN);
    log('checkpoint.save -> parent');
  }
  function loadCheckpoint() {
    window.parent?.postMessage({ type: 'checkpoint.load' }, LMS_ORIGIN);
    log('checkpoint.load -> parent');
  }

  document.getElementById('btnReady').addEventListener('click', () => postEvent({ type: 'course.ready' }));
  document.getElementById('btnP10').addEventListener('click', () => sendProgress(10));
  document.getElementById('btnP50').addEventListener('click', () => sendProgress(50));
  document.getElementById('btnP100').addEventListener('click', () => sendProgress(100));
  document.getElementById('btnGrade').addEventListener('click', () => sendGrade(85, 100));
  document.getElementById('btnError').addEventListener('click', () => sendError());
  document.getElementById('btnSave').addEventListener('click', () => saveCheckpoint());
  document.getElementById('btnLoad').addEventListener('click', () => loadCheckpoint());

  // Kick off
  postEvent({ type: 'course.ready' });
  exchangeIfNeeded();
})();


