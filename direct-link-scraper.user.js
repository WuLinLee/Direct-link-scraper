// ==UserScript==
// @name         Paste → FuckingFast 直链提取器（中文版）
// @namespace    https://github.com/WuLinLee/Direct-link-scraper
// @version      1.37
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
    #ff-scraper{position:fixed;right:22px;bottom:22px;z-index:2147483647;display:flex;flex-direction:column;width:min(940px,calc(100vw - 44px));max-height:min(90vh,940px);overflow:hidden;color:#e8eef7;background:#0c1422;border:1px solid #30425b;border-radius:18px;box-shadow:0 24px 70px #020617c9,0 0 0 1px #ffffff08;font:14px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #ff-scraper *{box-sizing:border-box}
    #ff-scraper .head{display:flex;flex:none;gap:13px;align-items:center;padding:16px 20px;background:#111c2d;border-bottom:1px solid #26364b}
    #ff-scraper .mark{display:grid;place-items:center;flex:none;width:38px;height:38px;color:#07131d;background:#67e8f9;border-radius:11px;font-size:17px;font-weight:900}
    #ff-scraper h2{margin:0;font-size:17px;line-height:1.25;letter-spacing:-.015em}
    #ff-scraper .sub{margin:3px 0 0;color:#93a4ba;font-size:12px}
    #ff-scraper .close{margin-left:auto;width:34px;min-height:34px;padding:0;color:#9fb0c5;background:transparent;border:0;border-radius:8px;font-size:21px;cursor:pointer}
    #ff-scraper .close:hover{color:#fff;background:#26364b}
    #ff-scraper .body{min-height:0;overflow:auto;padding:16px 20px 14px}
    #ff-scraper .actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px}
    #ff-scraper .action-block{min-width:0;padding:12px 14px;background:#111c2d;border:1px solid #26364b;border-radius:12px}
    #ff-scraper .action-block:nth-child(3){grid-column:1/-1}
    #ff-scraper .section-label{margin-bottom:8px;color:#91a4bb;font-size:10px;font-weight:750;letter-spacing:.09em;text-transform:uppercase}
    #ff-scraper .action-group{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
    #ff-scraper button,#ff-scraper input,#ff-scraper select{font:600 13px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #ff-scraper button{min-height:38px;padding:0 13px;color:#dce7f5;background:#1b293d;border:1px solid #3a4d66;border-radius:8px;cursor:pointer;transition:background 120ms ease,border-color 120ms ease}
    #ff-scraper button:hover:not(:disabled){background:#263b55;border-color:#66809e}
    #ff-scraper button:disabled{opacity:.4;cursor:not-allowed}
    #ff-scraper button:focus-visible,#ff-scraper input:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}
    #ff-scraper .primary{color:#07131d;background:#67e8f9;border-color:#67e8f9}
    #ff-scraper .primary:hover:not(:disabled){background:#a5f3fc}
    #ff-scraper .speed-wrap{display:inline-flex;align-items:center;gap:7px;color:#a9bbcf;font-size:12px}
    #ff-scraper .speed{width:64px;min-height:38px;padding:0 9px;color:#dce7f5;background:#0a111d;border:1px solid #3a4d66;border-radius:8px}
    #ff-scraper .info{width:25px;min-height:25px;padding:0;border-radius:50%;font-size:12px}
    #ff-scraper .single-copy{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;min-width:0}
    #ff-scraper .single-file{min-width:0}
    #ff-scraper .single-file-label{display:block;margin-bottom:3px;color:#8195ad;font-size:10px;letter-spacing:.04em}
    #ff-scraper .single-name{display:block;min-width:0;overflow:hidden;color:#f0f6ff;font-size:13px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}
    #ff-scraper .single-position{grid-column:2;grid-row:1;flex:none;color:#9fb0c5;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
    #ff-scraper .single-actions{grid-column:3;grid-row:1;display:flex;align-items:center;gap:6px;min-width:max-content;white-space:nowrap}
    #ff-scraper .single-actions>button{white-space:nowrap}
    #ff-scraper .single-nav{display:flex;flex-direction:row;gap:4px;flex:none}
    #ff-scraper .single-nav button{width:30px;min-height:32px;height:32px;padding:0;font-size:12px}
    #ff-scraper .filter-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin-bottom:12px;padding:10px 13px;background:#111c2d;border:1px solid #26364b;border-radius:11px}
    #ff-scraper .filter{width:100%;min-width:0;min-height:38px;padding:0 12px;color:#dce7f5;background:#0a111d;border:1px solid #3a4d66;border-radius:8px;font-size:13px}
    #ff-scraper .check{display:inline-flex;align-items:center;gap:7px;color:#a9bbcf;font-size:12px;white-space:nowrap}
    #ff-scraper .check input{width:15px;height:15px;margin:0;accent-color:#67e8f9}
    #ff-scraper .metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}
    #ff-scraper .metric{display:flex;align-items:center;gap:8px;min-width:0;padding:8px 11px;color:#9fb0c5;background:#111c2d;border:1px solid #26364b;border-radius:9px;font-size:11px}
    #ff-scraper .metric strong{color:#e8eef7;font-size:17px;font-weight:750;font-variant-numeric:tabular-nums}
    #ff-scraper .status{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:7px;color:#dce7f5;font-size:12px}
    #ff-scraper #status{min-width:0;overflow-wrap:anywhere}
    #ff-scraper .count{flex:none;color:#67e8f9;font-size:11px;font-weight:650;white-space:nowrap}
    #ff-scraper .track{height:5px;margin-bottom:13px;overflow:hidden;background:#26364b;border-radius:99px}
    #ff-scraper .progress{display:block;width:0;height:100%;background:#67e8f9;border-radius:99px;transition:width 180ms ease}
    #ff-scraper .result-panel{padding:12px;background:#111c2d;border:1px solid #26364b;border-radius:12px}
    #ff-scraper .result-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
    #ff-scraper .result-title{color:#e8eef7;font-size:13px;font-weight:700}
    #ff-scraper .tabs{display:flex;gap:3px;width:max-content;max-width:100%;padding:3px;background:#0a111d;border:1px solid #2b3a50;border-radius:8px}
    #ff-scraper .tabs button{min-height:30px;padding:0 12px;border:0;color:#93a4ba;background:transparent;font-size:11px}
    #ff-scraper .tabs button[aria-selected=true]{color:#07131d;background:#67e8f9}
    #ff-scraper textarea{display:block;width:100%;min-height:230px;resize:vertical;padding:13px;color:#d9e5f2;background:#0a111d;border:1px solid #2b3a50;border-radius:9px;font:12px/1.65 ui-monospace,SFMono-Regular,monospace;white-space:pre-wrap;overflow-wrap:anywhere}
    #ff-scraper .list{display:grid;gap:7px;max-height:380px;overflow:auto}
    #ff-scraper .row{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 11px;background:#0d1828;border:1px solid #26364b;border-radius:9px}
    #ff-scraper .row:hover{background:#16243a;border-color:#3b526f}
    #ff-scraper .row input{width:15px;height:15px;margin:0;accent-color:#67e8f9}
    #ff-scraper .num{width:25px;color:#71849b;font:11px ui-monospace,monospace}
    #ff-scraper .name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #ff-scraper .row a,#ff-scraper .mini a{color:#67e8f9;text-decoration:none}
    #ff-scraper .row a:hover,#ff-scraper .mini a:hover{text-decoration:underline}
    #ff-scraper .mini{display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;max-height:380px;overflow:auto;padding:12px;background:#0a111d;border:1px solid #26364b;border-radius:9px;font:12px ui-monospace,monospace}
    #ff-scraper .mini a{max-width:100%;padding:7px 10px;background:#111c2d;border:1px solid #26364b;border-radius:7px;overflow-wrap:anywhere}
    #ff-scraper .empty{padding:28px 16px;color:#71849b;text-align:center}
    #ff-scraper .credit{margin-top:10px;color:#71849b;font-size:10px;text-align:right}
    @media(max-width:720px){
      #ff-scraper{right:10px;bottom:10px;width:calc(100vw - 20px);max-height:calc(100dvh - 20px);border-radius:15px}
      #ff-scraper .head{padding:13px 15px}
      #ff-scraper .body{padding:12px}
      #ff-scraper .actions{grid-template-columns:1fr;gap:8px}
      #ff-scraper .action-block{padding:10px 12px}
      #ff-scraper .action-block:nth-child(3){grid-column:auto}
      #ff-scraper .action-group{gap:6px}
      #ff-scraper .action-group button{flex:1 1 auto}
      #ff-scraper .single-copy{grid-template-columns:minmax(0,1fr) auto;gap:8px}
      #ff-scraper .single-position{grid-column:2;grid-row:1}
      #ff-scraper .single-actions{grid-column:1/-1;grid-row:2;justify-self:end;min-width:0}
      #ff-scraper .filter-row{grid-template-columns:1fr;gap:8px;padding:9px 11px}
      #ff-scraper .check{white-space:normal}
      #ff-scraper .status{align-items:flex-start;flex-direction:column;gap:3px}
      #ff-scraper .count{align-self:flex-end}
      #ff-scraper textarea{min-height:190px}
    }
    @media(max-width:390px){
      #ff-scraper .metrics{gap:5px}
      #ff-scraper .metric{gap:5px;padding:7px 8px;font-size:10px}
      #ff-scraper .metric strong{font-size:15px}
      #ff-scraper .tabs{width:100%}
      #ff-scraper .tabs button{flex:1;padding:0 6px}
      #ff-scraper .single-copy>button{padding:0 9px;font-size:12px}
    }
    @media(prefers-reduced-motion:reduce){#ff-scraper .progress,#ff-scraper button{transition:none}}
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
        <div class="action-block">
          <div class="section-label">任务控制</div>
          <div class="action-group">
            <button class="primary" id="start">开始提取</button>
            <button id="cancel" disabled>取消任务</button>
            <button id="retry" disabled>重试失败项</button>
          </div>
        </div>
        <div class="action-block">
          <div class="section-label">批量操作</div>
          <div class="action-group">
            <label class="speed-wrap">
              并发数
              <input class="speed" id="speed" type="number" min="1" max="50" value="4" aria-label="并发请求数" title="建议保持默认值 4">
            </label>
            <button class="info" type="button" title="同时处理的链接数量。数值越大，请求越集中，建议保持默认值 4。" aria-label="并发请求说明">i</button>
            <button id="copy" disabled>批量复制已选</button>
            <button id="save" disabled>导出 TXT</button>
          </div>
        </div>
        <div class="action-block">
          <div class="section-label">单条复制</div>
          <div class="single-copy">
            <div class="single-file">
              <span class="single-file-label">当前文件</span>
              <span class="single-name" id="single-name">暂无可复制链接</span>
            </div>
            <div class="single-position" id="single-position">0 / 0</div>
            <div class="single-actions">
              <button class="primary" id="single-copy" disabled>复制当前直链</button>
              <div class="single-nav" aria-label="切换链接">
                <button id="single-prev" type="button" aria-label="上一条链接" title="上一条" disabled>▲</button>
                <button id="single-next" type="button" aria-label="下一条链接" title="下一条" disabled>▼</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-row">
        <input class="filter" id="filter" type="search" placeholder="输入文件名进行筛选…" aria-label="按文件名筛选">
        <label class="check">
          <input id="auto-copy" type="checkbox">
          提取完成后自动复制已选链接
        </label>
      </div>

      <div class="metrics">
        <div class="metric"><strong id="ready-count">0</strong>可用链接</div>
        <div class="metric"><strong id="selected-count">0</strong>已选择</div>
        <div class="metric"><strong id="failed-count">0</strong>解析失败</div>
      </div>

      <div class="status">
        <span id="status" aria-live="polite">请先打开 Paste 页面，再点击“开始提取”。</span>
        <span class="count" id="count">0 个链接</span>
      </div>
      <div class="track"><span class="progress" id="progress"></span></div>

      <div class="result-panel">
        <div class="result-head">
          <div class="result-title">解析结果</div>
          <div class="tabs" role="tablist" aria-label="结果显示方式">
            <button role="tab" data-view="text" aria-selected="true">文本</button>
            <button role="tab" data-view="rows" aria-selected="false">文件列表</button>
            <button role="tab" data-view="mini" aria-selected="false">链接预览</button>
          </div>
        </div>
        <textarea id="output" readonly spellcheck="false" placeholder="解析结果会显示在这里；每条记录会标注文件名，并用横线分隔。"></textarea>
        <div class="list" id="rows" hidden></div>
        <div class="mini" id="mini" hidden></div>
      </div>

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
  const singleName = $('single-name');
  const singlePosition = $('single-position');
  const singlePrev = $('single-prev');
  const singleNext = $('single-next');
  const singleCopy = $('single-copy');

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
  let singleCopyIndex = -1;
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

  const LINK_SEPARATOR = '\n-------------------------------------------------------------------------------------\n';

  const selectedLinks = () =>
    direct.filter((x, i) => x && !x.startsWith('# FAILED') && selected.has(i));

  const availableIndexes = () =>
    direct.map((link, index) => ({ link, index }))
      .filter(({ link }) => link && !link.startsWith('# FAILED'))
      .map(({ index }) => index);

  const formattedSelectedLinks = () => {
    const divider = '-------------------------------------------------------------------------------------';
    const lines = direct
      .map((link, index) => ({ link, index }))
      .filter(({ link, index }) => link && !link.startsWith('# FAILED') && selected.has(index))
      .flatMap(({ link, index }) => [
        divider,
        `文件名：${filename(index)}`,
        divider,
        link
      ]);

    if (lines.length) lines.push(divider);
    return lines.join('\n');
  };

  const displayOutput = () =>
    direct
      .map((link, i) => {
        if (!link) return '';
        const name = filename(i);
        return link.startsWith('# FAILED')
          ? `文件名：${name}\n${link.replace(/^# FAILED\s*/, '解析失败：')}`
          : `文件名：${name}\n${link}`;
      })
      .filter(Boolean)
      .join(LINK_SEPARATOR);

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
    renderSingleCopy();

    requestAnimationFrame(() => {
      rows.scrollTop = rows.scrollHeight;
    });
  }

  function updateButtons() {
    const has = selectedLinks().length > 0;
    copy.disabled = !has;
    save.disabled = !has;
    selectedCount.textContent = selectedLinks().length;
    renderSingleCopy();
  }

  function renderSingleCopy() {
    const indexes = availableIndexes();

    if (!indexes.length) {
      singleCopyIndex = -1;
      singleName.textContent = running ? '正在等待解析结果…' : '暂无可复制链接';
      singlePosition.textContent = '0 / 0';
      singlePrev.disabled = true;
      singleNext.disabled = true;
      singleCopy.disabled = true;
      return;
    }

    let position = indexes.indexOf(singleCopyIndex);
    if (position < 0) {
      singleCopyIndex = indexes[0];
      position = 0;
    }

    singleName.textContent = filename(singleCopyIndex);
    singleName.title = filename(singleCopyIndex);
    singlePosition.textContent = `${position + 1} / ${indexes.length}`;
    singlePrev.disabled = position === 0;
    singleNext.disabled = position === indexes.length - 1;
    singleCopy.disabled = false;
  }

  function moveSingleCopy(direction) {
    const indexes = availableIndexes();
    if (!indexes.length) return;

    let position = indexes.indexOf(singleCopyIndex);
    if (position < 0) position = 0;

    position = Math.max(0, Math.min(indexes.length - 1, position + direction));
    singleCopyIndex = indexes[position];
    renderSingleCopy();
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

  singlePrev.onclick = () => moveSingleCopy(-1);
  singleNext.onclick = () => moveSingleCopy(1);

  singleCopy.onclick = async () => {
    const link = direct[singleCopyIndex];
    if (!link || link.startsWith('# FAILED')) return;

    const divider = '-------------------------------------------------------------------------------------';
    const content = [
      divider,
      `文件名：${filename(singleCopyIndex)}`,
      divider,
      link,
      divider
    ].join('\\n');

    try {
      await navigator.clipboard.writeText(content);
      singleCopy.textContent = '已复制当前文件';
      setTimeout(() => {
        singleCopy.textContent = '复制当前直链';
      }, 1400);
    } catch {
      singleCopy.textContent = '复制失败';
      setTimeout(() => {
        singleCopy.textContent = '复制当前直链';
      }, 1400);
    }
  };

  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(formattedSelectedLinks());
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
        [formattedSelectedLinks() + '\n'],
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
        await navigator.clipboard.writeText(formattedSelectedLinks());
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
      singleCopyIndex = -1;
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