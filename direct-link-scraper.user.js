// ==UserScript==
// @name         Paste → FuckingFast 直链提取器（中文版）
// @namespace    https://github.com/WuLinLee/Direct-link-scraper
// @version      1.10
// @description  在受支持的 Paste 页面解析、筛选并导出 FuckingFast 链接。
// @match        https://paste.fitgirl-repacks.site/*
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @connect      fuckingfast.co
// @license      MIT
// @homepageURL  https://greasyfork.org/scripts/591597-paste-fast-direct-link-scraper
// ==/UserScript==

(() => {
  'use strict';

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const style = document.createElement('style');
  style.textContent = `
    #ff-scraper{position:fixed;right:20px;bottom:20px;z-index:2147483647;width:min(760px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;color:#e8eef7;background:#0c1422;border:1px solid #30425b;border-radius:18px;box-shadow:0 28px 80px #020617bb,0 0 0 1px #ffffff08;font:14px/1.45 system-ui,sans-serif}
    #ff-scraper *{box-sizing:border-box} #ff-scraper .head{display:flex;gap:13px;align-items:center;padding:18px 20px;background:#111c2d;border-bottom:1px solid #26364b}
    #ff-scraper .mark{display:grid;place-items:center;flex:none;width:38px;height:38px;color:#07131d;background:#67e8f9;border-radius:11px;font-weight:900;box-shadow:0 8px 22px #22d3ee33}
    #ff-scraper h2{margin:0;font-size:16px;line-height:1.25;letter-spacing:-.015em} #ff-scraper .sub{margin:3px 0 0;color:#93a4ba;font-size:12px}
    #ff-scraper .close{margin-left:auto;width:32px;min-height:32px;padding:0;color:#9fb0c5;background:transparent;border:0;border-radius:7px;font-size:20px;cursor:pointer}
    #ff-scraper .close:hover{color:#fff;background:#26364b} #ff-scraper .body{padding:18px 20px 16px}
    #ff-scraper .actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
    #ff-scraper .action-group{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
    #ff-scraper .filter-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px;padding:10px;background:#111c2d;border:1px solid #26364b;border-radius:11px}
    #ff-scraper button,#ff-scraper input,#ff-scraper select{font:600 13px system-ui,sans-serif}
    #ff-scraper button{min-height:36px;padding:0 12px;color:#dce7f5;background:#1b293d;border:1px solid #3a4d66;border-radius:8px;cursor:pointer}
    #ff-scraper button:hover:not(:disabled){background:#263b55;border-color:#66809e} #ff-scraper button:disabled{opacity:.45;cursor:not-allowed}
    #ff-scraper button:focus-visible,#ff-scraper input:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}
    #ff-scraper .primary{color:#07131d;background:#67e8f9;border-color:#67e8f9} #ff-scraper .primary:hover:not(:disabled){background:#a5f3fc}
    #ff-scraper .speed{width:82px;min-height:36px;padding:0 8px;color:#dce7f5;background:#0a111d;border:1px solid #3a4d66;border-radius:8px}
    #ff-scraper .info{width:24px;min-height:24px;padding:0;border-radius:50%;cursor:help}
    #ff-scraper .filter{flex:1;min-width:180px;min-height:36px;padding:0 10px;color:#dce7f5;background:#0a111d;border:1px solid #3a4d66;border-radius:8px}
    #ff-scraper .check{display:inline-flex;align-items:center;gap:6px;color:#a9bbcf;font-size:12px;white-space:nowrap} #ff-scraper .check input{accent-color:#67e8f9}
    #ff-scraper .metrics{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px} #ff-scraper .metric{padding:5px 9px;color:#9fb0c5;background:#111c2d;border:1px solid #26364b;border-radius:7px;font-size:11px} #ff-scraper .metric strong{color:#e8eef7;font-weight:700}
    #ff-scraper .status{display:flex;justify-content:space-between;gap:12px;margin-bottom:7px;color:#dce7f5;font-size:12px} #ff-scraper .count{color:#67e8f9;white-space:nowrap}
    #ff-scraper .track{height:4px;margin-bottom:14px;overflow:hidden;background:#26364b;border-radius:99px} #ff-scraper .progress{display:block;width:0;height:100%;background:#67e8f9;transition:width 180ms ease}
    #ff-scraper .tabs{display:flex;gap:3px;width:max-content;margin-bottom:7px;padding:3px;background:#0a111d;border:1px solid #2b3a50;border-radius:8px}
    #ff-scraper .tabs button{min-height:30px;padding:0 12px;border:0;color:#93a4ba;background:transparent;font-size:12px} #ff-scraper .tabs button[aria-selected=true]{color:#07131d;background:#67e8f9;box-shadow:0 3px 10px #22d3ee2e}
    #ff-scraper textarea{display:block;width:100%;min-height:160px;resize:vertical;padding:11px;color:#d9e5f2;background:#0a111d;border:1px solid #2b3a50;border-radius:8px;font:12px/1.55 ui-monospace,monospace}
    #ff-scraper .list{display:grid;gap:5px;max-height:320px;overflow:auto} #ff-scraper .row{display:flex;align-items:center;gap:9px;min-height:44px;padding:8px 11px;background:#111c2d;border:1px solid #26364b;border-radius:9px} #ff-scraper .row:hover{background:#16243a;border-color:#3b526f} #ff-scraper .row input{accent-color:#67e8f9} #ff-scraper .num{width:26px;color:#71849b;font:11px ui-monospace,monospace} #ff-scraper .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap} #ff-scraper .row a,#ff-scraper .mini a{color:#67e8f9;text-decoration:none} #ff-scraper .row a:hover,#ff-scraper .mini a:hover{text-decoration:underline} #ff-scraper .mini{display:flex;flex-wrap:wrap;gap:7px 13px;align-content:flex-start;max-height:320px;overflow:auto;padding:14px;background:#08101c;border:1px solid #26364b;border-radius:10px;font:12px ui-monospace,monospace} #ff-scraper .empty{padding:28px;color:#71849b;text-align:center} #ff-scraper .credit{margin-top:13px;color:#71849b;font-size:11px;text-align:right}
    @media(max-width:520px){#ff-scraper{right:10px;bottom:10px;width:calc(100vw - 20px)}#ff-scraper .body{padding:14px}#ff-scraper .actions{align-items:stretch}#ff-scraper .action-group{width:100%}}@media(prefers-reduced-motion:reduce){#ff-scraper .progress{transition:none}}
  `;

  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = 'ff-scraper';

  root.innerHTML = `
    <div class="head">
      <div class="mark">↗</div>
      <div>
        <h2>直链提取工具</h2>
        <p class="sub">解析下载链接，并支持选择、复制和导出</p>
      </div>
      <button class="close" id="close" aria-label="关闭" title="关闭">×</button>
    </div>
    <div class="body">
      <div class="actions">
        <div class="action-group">
          <button class="primary" id="start">提取链接</button>
          <button id="cancel" disabled>取消</button>
          <button id="retry" disabled>重试失败项</button>
        </div>
        <div class="action-group">
          <input class="speed" id="speed" type="number" min="1" max="50" value="4" aria-label="并发请求数" title="同时处理的链接数量，建议保持 4">
          <button class="info" type="button" title="如果解析速度较慢，可以适当提高并发数。数值越大，同时发送的请求越多。建议保持默认值 4。" aria-label="并发请求说明">i</button>
          <button id="copy" disabled>复制已选链接</button>
          <button id="save" disabled>导出为 TXT</button>
        </div>
      </div>

      <div class="filter-row">
        <input class="filter" id="filter" type="search" placeholder="按文件名筛选…" aria-label="按文件名筛选">
        <label class="check">
          <input id="auto-copy" type="checkbox">
          完成后自动复制
        </label>
      </div>

      <div class="metrics">
        <span class="metric"><strong id="ready-count">0</strong> 可用</span>
        <span class="metric"><strong id="selected-count">0</strong> 已选</span>
        <span class="metric"><strong id="failed-count">0</strong> 失败</span>
      </div>

      <div class="status">
        <span id="status" aria-live="polite">请先打开 Paste 页面，再点击“提取链接”。</span>
        <span class="count" id="count">0 个链接</span>
      </div>

      <div class="track"><span class="progress" id="progress"></span></div>

      <div class="tabs" role="tablist">
        <button role="tab" data-view="text" aria-selected="true">文本</button>
        <button role="tab" data-view="rows" aria-selected="false">列表</button>
        <button role="tab" data-view="mini" aria-selected="false">链接预览</button>
      </div>

      <textarea id="output" readonly spellcheck="false" placeholder="解析成功的下载直链会显示在这里…"></textarea>
      <div class="list" id="rows" hidden></div>
      <div class="mini" id="mini" hidden></div>

      <div class="credit">AnonTooler 制作 🏴‍☠️</div>
    </div>
  `;

  document.body.appendChild(root);

  const $ = id => root.querySelector('#' + id);

  const start = $('start');
  const cancel = $('cancel');
  const retry = $('retry');
  const speed = $('speed');

  const filter = $('filter');
  const autoCopy = $('auto-copy');
  const copy = $('copy');
  const save = $('save');

  const status = $('status');
  const count = $('count');
  const progress = $('progress');
  const output = $('output');
  const rows = $('rows');
  const mini = $('mini');

  const readyCount = $('ready-count');
  const selectedCount = $('selected-count');
  const failedCount = $('failed-count');

  let shares = [];
  let direct = [];
  let selected = new Set();
  let runId = 0;
  let running = false;
  const activeRequests = new Set();

  function abortActiveRequests() {
    for (const request of [...activeRequests]) {
      try {
        request.abort();
      } catch {}
    }
    activeRequests.clear();
  }

  const ready = () => direct.filter(x => x && !x.startsWith('# FAILED'));

  const selectedLinks = () =>
    direct.filter((x, i) => x && !x.startsWith('# FAILED') && selected.has(i));

  const displayOutput = () =>
    direct.filter(Boolean).map(x =>
      x.startsWith('# FAILED')
        ? x.replace(/^# FAILED\s*/, '解析失败：')
        : x
    ).join('\n');

  const concurrency = () => {
    const n = Math.max(1, Math.min(50, Number.parseInt(speed.value, 10) || 4));
    speed.value = n;
    return n;
  };

  function filename(i, link = direct[i]) {
    try {
      return decodeURIComponent(new URL(shares[i] || link).hash.slice(1)) || `文件 ${i + 1}`;
    } catch {
      return `文件 ${i + 1}`;
    }
  }

  function render() {
    rows.replaceChildren();
    mini.replaceChildren();

    const term = filter.value.trim().toLowerCase();

    direct.forEach((link, i) => {
      if (!link) return;

      const name = filename(i);
      if (term && !name.toLowerCase().includes(term)) return;

      const row = document.createElement('div');
      row.className = 'row';

      const n = document.createElement('span');
      n.className = 'num';
      n.textContent = String(i + 1).padStart(2, '0');
      row.append(n);

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = selected.has(i);
      box.disabled = link.startsWith('# FAILED');
      box.setAttribute('aria-label', `选择文件：${name}`);

      box.onchange = () => {
        box.checked ? selected.add(i) : selected.delete(i);
        updateButtons();
      };

      row.append(box);

      const label = document.createElement('span');
      label.className = 'name';
      label.textContent = link.startsWith('# FAILED')
        ? `${name} — 解析失败`
        : name;

      row.append(label);

      if (!link.startsWith('# FAILED')) {
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = '打开';
        row.append(a);

        if (selected.has(i)) {
          const m = a.cloneNode(true);
          m.textContent = name;
          mini.append(m);
        }
      }

      rows.append(row);
    });

    if (!rows.children.length) {
      rows.innerHTML = '<div class="empty">暂时没有匹配的文件。</div>';
    }

    if (!mini.children.length) {
      mini.innerHTML = '<div class="empty">请切换到“列表”视图并勾选文件，这里会显示对应链接。</div>';
    }

    readyCount.textContent = ready().length;
    selectedCount.textContent = selectedLinks().length;
    failedCount.textContent = direct.filter(x => x && x.startsWith('# FAILED')).length;

    requestAnimationFrame(() => {
      rows.scrollTop = rows.scrollHeight;
    });
  }

  function updateButtons() {
    const has = selectedLinks().length > 0;
    copy.disabled = !has;
    save.disabled = !has;
    selectedCount.textContent = selectedLinks().length;
  }

  function setView(view) {
    root.querySelectorAll('[data-view]').forEach(b => {
      b.setAttribute('aria-selected', String(b.dataset.view === view));
    });

    output.style.display = view === 'text' ? 'block' : 'none';
    rows.style.display = view === 'rows' ? 'grid' : 'none';
    mini.style.display = view === 'mini' ? 'flex' : 'none';
  }

  root.querySelectorAll('[data-view]').forEach(b => {
    b.onclick = () => setView(b.dataset.view);
  });

  setView('text');

  filter.oninput = render;

  $('close').onclick = () => {
    runId++;
    running = false;
    abortActiveRequests();
    style.remove();
    root.remove();
  };

  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(selectedLinks().join('\n'));
      copy.textContent = '已复制';
      setTimeout(() => copy.textContent = '复制已选链接', 1400);
    } catch {
      copy.textContent = '复制失败';
    }
  };

  save.onclick = () => {
    const a = document.createElement('a');

    a.href = URL.createObjectURL(
      new Blob(
        [selectedLinks().join('\n') + '\n'],
        { type: 'text/plain' }
      )
    );

    a.download = 'FuckingFast下载直链.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  };

  function getShares() {
    return [...document.querySelectorAll('#plaintext a[href]')]
      .map(a => a.href)
      .filter(url => {
        try {
          const u = new URL(url);

          return /(^|\.)fuckingfast\.co$/i.test(u.hostname)
            && u.pathname.split('/').filter(Boolean)[0]
            && !u.pathname.startsWith('/f/');
        } catch {
          return false;
        }
      })
      .filter((x, i, a) => a.indexOf(x) === i);
  }

  function resolve(id) {
    return new Promise((ok, fail) => {
      let request;

      const cleanup = () => {
        if (request) activeRequests.delete(request);
      };

      request = GM_xmlhttpRequest({
        method: 'POST',
        url: `https://fuckingfast.co/f/${encodeURIComponent(id)}/go`,
        timeout: 20000,

        onload: r => {
          cleanup();
          const match = /^hx-redirect:\s*(.+)$/im.exec(r.responseHeaders || '');

          if (r.status >= 200 && r.status < 400 && match) {
            try {
              const target = new URL(match[1].trim(), 'https://fuckingfast.co/');
              if (target.protocol !== 'https:') {
                fail(new Error('服务器返回了非 HTTPS 下载地址'));
                return;
              }
              ok(target.href);
            } catch {
              fail(new Error('服务器返回的下载地址无效'));
            }
          } else {
            fail(new Error(`HTTP ${r.status}：服务器没有返回下载直链`));
          }
        },

        onerror: () => {
          cleanup();
          fail(new Error('请求失败'));
        },
        ontimeout: () => {
          cleanup();
          fail(new Error('请求超时'));
        },
        onabort: () => {
          cleanup();
          fail(new Error('请求已取消'));
        }
      });

      activeRequests.add(request);
    });
  }

  async function process(indexes) {
    const token = ++runId;
    const before = ready().length;
    const limit = concurrency();

    running = true;
    start.disabled = true;
    cancel.disabled = false;
    retry.disabled = true;
    speed.disabled = true;

    let next = 0;
    let done = 0;

    async function worker() {
      while (token === runId) {
        const i = indexes[next++];

        if (i === undefined) return;

        try {
          const id = new URL(shares[i]).pathname.split('/').filter(Boolean)[0];
          const link = await resolve(id);
          if (token !== runId) return;
          direct[i] = link;
        } catch (e) {
          if (token !== runId) return;
          direct[i] = `# FAILED ${shares[i]} — ${e.message}`;
        }

        done++;

        output.value = displayOutput();
        render();

        progress.style.width = `${(before + done) / shares.length * 100}%`;
        status.textContent = `已解析 ${before + done} / ${shares.length} 个链接`;
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(limit, indexes.length) },
        worker
      )
    );

    if (token !== runId) return;

    running = false;
    start.disabled = false;
    cancel.disabled = true;
    retry.disabled = !direct.some(x => x && x.startsWith('# FAILED'));
    speed.disabled = false;

    updateButtons();

    progress.style.width = `${ready().length / shares.length * 100}%`;

    status.textContent =
      `处理完成：${ready().length} / ${shares.length} 个链接可用` +
      (retry.disabled
        ? '。'
        : '；部分失败，可点击“重试失败项”。');

    if (autoCopy.checked && selectedLinks().length) {
      try {
        await navigator.clipboard.writeText(selectedLinks().join('\n'));
        status.textContent += ' 已自动复制。';
      } catch {}
    }
  }

  cancel.onclick = () => {
    if (!running) return;

    runId++;
    running = false;
    abortActiveRequests();

    cancel.disabled = true;
    start.disabled = false;
    speed.disabled = false;

    retry.disabled = !direct.some(x => x && x.startsWith('# FAILED'));

    status.textContent = '已取消。已经解析成功的链接仍然保留。';
  };

  retry.onclick = () => {
    const failed = direct
      .map((x, i) => x && x.startsWith('# FAILED') ? i : -1)
      .filter(i => i >= 0);

    failed.forEach(i => direct[i] = undefined);

    process(failed);
  };

  start.onclick = async () => {
    if (running) return;

    start.disabled = true;
    copy.disabled = true;
    save.disabled = true;
    retry.disabled = true;

    const deadline = Date.now() + 15000;
    let found = [];

    while (!(found = getShares()).length && Date.now() < deadline) {
      await sleep(300);
    }

    if (!found.length) {
      status.textContent =
        '没有找到 FuckingFast 链接。请确认页面已加载完成，并且正文中包含这类链接。';

      start.disabled = false;
      return;
    }

    const same =
      shares.length === found.length &&
      shares.every((x, i) => x === found[i]) &&
      direct.length === found.length;

    if (!same) {
      shares = found;
      direct = new Array(found.length);
      selected = new Set(found.map((_, i) => i));
      output.value = '';
      render();
    }

    count.textContent = `${found.length} 个链接`;

    const pending = found
      .map((_, i) => i)
      .filter(i => !direct[i] || direct[i].startsWith('# FAILED'));

    if (!pending.length) {
      progress.style.width = '100%';
      updateButtons();

      start.disabled = false;

      status.textContent =
        `无需重复解析：${ready().length} / ${found.length} 个链接已经可用。`;

      return;
    }

    status.textContent =
      `正在解析：最多同时处理 ${concurrency()} 个请求，剩余 ${pending.length} 个链接。`;

    process(pending);
  };

})();