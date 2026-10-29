/* =========================================================
   ⚙️ 사이트 동작 코드 — 보통은 고칠 필요 없어요
   (내용은 content/*.md, data/*.js, config.js 에서 바꾸세요)
   ========================================================= */
(() => {
  'use strict';

  const S = window.SITE || {};
  const QUIZ = window.QUIZ || [];
  const OX = window.OX || [];
  const KEY = (S.storageKey || 'study-site') + ':';

  /* ---------- 작은 도우미들 ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } },
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 문제·해설용 간단 서식: `코드`, **굵게**, 줄바꿈
  const inl = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  const md = (s) => (window.marked ? window.marked.parse(s) : `<pre>${esc(s)}</pre>`);
  const NUM = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
  const user = S.promptUser || 'guest';
  const host = S.promptHost || 'study';
  const promptHtml = (path, cmd) =>
    `<div class="prompt"><span class="p-user">${esc(user)}@${esc(host)}</span>:<span class="p-path">${esc(path)}</span>$ ${esc(cmd)}</div>`;

  /* ---------- 테마 ---------- */
  function initTheme() {
    const saved = store.get('theme', null);
    if (saved) document.documentElement.dataset.theme = saved;
    $('#themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme ||
        (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store.set('theme', next);
    });
  }

  /* ---------- 기본 정보 (제목, 사이드바 아래, 푸터) ---------- */
  function initMeta() {
    $('#brand').textContent = S.title || '';
    $('#brandSub').textContent = S.badge || '';
    for (const k of ['quiz', 'ox']) {
      const c = S[k] || {};
      $(`[data-tab="${k}"] .tab-label`).textContent = c.label || (k === 'quiz' ? '문제 풀이' : 'OX');
      $(`#${k}Head`).innerHTML = `<h2>${esc(c.title || c.label || '')} <small>${(k === 'quiz' ? QUIZ : OX).length}문항</small></h2>${c.desc ? `<p>${inl(c.desc)}</p>` : ''}`;
    }
    $('[data-tab="quiz"] .cnt').textContent = QUIZ.length || '';
    $('[data-tab="ox"] .cnt').textContent = OX.length || '';

    const links = [];
    if (S.github) links.push(`<a href="${esc(S.github)}" target="_blank" rel="noopener">GitHub</a>`);
    if (S.email) links.push(`<a href="mailto:${esc(S.email)}">메일</a>`);
    const upd = S.updates || [];
    $('#sideFoot').innerHTML =
      (S.author ? `<p>made by ${esc(S.author)} 🐧</p>` : '') +
      (links.length ? `<p>${links.join(' · ')}</p>` : '') +
      (upd.length ? `<button class="link-btn" id="updBtn">${esc(upd[0].date)} <em>업데이트 내역</em></button>` : '') +
      (S.notice ? `<p class="notice">${esc(S.notice)}</p>` : '');
    $('#footer').innerHTML =
      `made with 🐧 by ${esc(S.author || '')}${S.github ? ` · <a href="${esc(S.github)}" target="_blank" rel="noopener">${esc(S.github.replace(/^https?:\/\//, ''))}</a>` : ''}${S.email ? ` · ${esc(S.email)}` : ''}` +
      (S.notice ? `<br>${esc(S.notice)}` : '');

    if (upd.length) {
      const dlg = $('#updDlg');
      $('#updBody').innerHTML = upd.map((u) =>
        `<h4>${esc(u.date)}</h4><ul>${(u.items || []).map((i) => `<li>${inl(i)}</li>`).join('')}</ul>`).join('');
      $('#updBtn').addEventListener('click', () => dlg.showModal());
      $('#updClose').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    }
  }

  /* ---------- 사이드바 (모바일 열기/닫기) ---------- */
  const closeSidebar = () => document.body.classList.remove('side-open');
  function initSidebar() {
    $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('side-open'));
    $('#overlay').addEventListener('click', closeSidebar);
    $('#sidebar').addEventListener('click', (e) => { if (e.target.closest('a')) closeSidebar(); });
  }

  /* ---------- 탭 & 주소(#) 처리 ---------- */
  const TABS = ['guide', 'quiz', 'ox', 'wrong'];
  let currentTab = 'guide';
  function showTab(name, scrollTop = true) {
    currentTab = name;
    $$('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
    $$('#tabs [data-tab]').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
    if (name === 'wrong') renderWrong();
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'instant' });
    closeSidebar();
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h || TABS.includes(h)) { showTab(h || 'guide'); return; }
    showTab('guide', false);
    const el = document.getElementById(h);
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }

  /* ---------- 챕터 불러오기 ---------- */
  async function loadChapters() {
    const chs = S.chapters || [];
    const texts = await Promise.all(chs.map((c) =>
      fetch(c.file, { cache: 'no-cache' })
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .catch(() => null)));

    const fileHint = location.protocol === 'file:'
      ? 'index.html 을 더블클릭해서 열면 보안 정책 때문에 챕터를 못 불러와요. VS Code의 <b>Live Server</b>로 열어주세요 (README 참고).'
      : '파일 이름과 config.js 의 chapters 경로가 맞는지 확인하세요.';

    $('#chapters').innerHTML = chs.map((c, i) => {
      const name = c.file.split('/').pop();
      const body = texts[i] == null
        ? `<p class="load-error">⚠️ <code>${esc(c.file)}</code> 을(를) 불러오지 못했어요. ${fileHint}</p>`
        : md(texts[i]);
      return `<article class="chapter" data-ch="${i}">${promptHtml('~/' + c.label, 'cat ' + name)}<div class="md">${body}</div></article>`;
    }).join('') || '<p class="empty">config.js 의 chapters 에 챕터를 추가해 보세요.</p>';

    decorate();
    renderHero();
    buildToc();
    initBookmarks();
    scrollSpy();
  }

  /* 제목 id, 강조 박스, 표, 코드 박스 꾸미기 */
  function decorate() {
    let n = 0;
    $$('#chapters .md h2, #chapters .md h3').forEach((h) => {
      n++;
      let id = 'sec-' + n;
      const m = h.textContent.match(/\{#([\w-]+)\}\s*$/);
      if (m) { id = m[1]; h.innerHTML = h.innerHTML.replace(/\s*\{#[\w-]+\}\s*$/, ''); }
      h.id = id;
      h.dataset.title = h.textContent.trim();
    });

    calloutify('#chapters');

    $$('#chapters .md table').forEach((t) => {
      const w = document.createElement('div');
      w.className = 'table-wrap';
      t.replaceWith(w);
      w.append(t);
    });

    $$('#chapters .md pre').forEach((pre) => {
      const code = pre.querySelector('code');
      const lang = (code?.className.match(/language-(\w+)/) || [])[1] || '';
      const box = document.createElement('div');
      box.className = 'code-box';
      box.innerHTML = `<div class="code-head"><i></i><i></i><i></i><span>${esc(lang)}</span><button class="copy-btn" type="button">복사</button></div>`;
      pre.replaceWith(box);
      box.append(pre);
      box.querySelector('.copy-btn').addEventListener('click', (e) => {
        navigator.clipboard?.writeText(pre.innerText).then(() => {
          e.target.textContent = '복사됨!';
          setTimeout(() => { e.target.textContent = '복사'; }, 1200);
        });
      });
    });
  }

  /* 첫 화면 README 카드 */
  function renderHero() {
    const cards = $$('#chapters .chapter').map((art, i) => {
      const h = $('.md h2', art);
      if (!h) return '';
      return `<a class="ch-card" href="#${h.id}"><span class="ch-no">${esc(S.chapters[i].label)}</span><span class="ch-title">${esc(h.dataset.title)}</span></a>`;
    }).join('');
    $('#hero').innerHTML = promptHtml('~', 'cat README.md') +
      `<div class="readme md"><h1>${esc(S.title || '')}</h1>${S.intro ? md(S.intro) : ''}${cards ? `<div class="ch-cards">${cards}</div>` : ''}</div>`;
    calloutify('#hero');
  }

  /* > [!TIP] 제목  →  색깔 있는 강조 박스 */
  const CALLOUT = {
    TIP: ['tip', '💡', '팁'], NOTE: ['note', '📝', '참고'], WARNING: ['warning', '⚠️', '주의'],
    IMPORTANT: ['important', '⭐', '중요'], DANGER: ['danger', '🚨', '함정'],
  };
  function calloutify(scope) {
    $$(scope + ' blockquote').forEach((bq) => {
      const p = bq.querySelector('p');
      if (!p) return;
      const m = p.innerHTML.match(/^\s*\[!(\w+)\][ \t]*([^\n<]*)\n?/);
      const c = m && CALLOUT[m[1].toUpperCase()];
      if (!c) return;
      p.innerHTML = p.innerHTML.slice(m[0].length);
      if (!p.innerHTML.trim()) p.remove();
      bq.classList.add('callout', 'callout-' + c[0]);
      bq.insertAdjacentHTML('afterbegin', `<div class="callout-title">${c[1]} ${m[2].trim() || c[2]}</div>`);
    });
  }

  /* 목차 */
  function buildToc() {
    let html = '';
    $$('#chapters .chapter').forEach((art, i) => {
      $$('.md h2, .md h3', art).forEach((h) => {
        html += h.tagName === 'H2'
          ? `<a class="toc-h2" href="#${h.id}" data-target="${h.id}"><span class="toc-ch">${esc(S.chapters[i].label)}/</span>${esc(h.dataset.title)}</a>`
          : `<a class="toc-h3" href="#${h.id}" data-target="${h.id}">${esc(h.dataset.title)}</a>`;
      });
    });
    $('#toc').innerHTML = html;
  }

  /* 스크롤 위치에 맞춰 목차 강조 */
  function scrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map($$('#toc a').map((a) => [a.dataset.target, a]));
    const side = $('#sidebar');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const a = links.get(e.target.id);
        if (!a) return;
        $$('#toc a.active').forEach((x) => x.classList.remove('active'));
        a.classList.add('active');
        if (a.offsetTop < side.scrollTop || a.offsetTop > side.scrollTop + side.clientHeight - 60) {
          side.scrollTop = a.offsetTop - side.clientHeight / 3;
        }
      });
    }, { rootMargin: '-70px 0px -72% 0px' });
    $$('#chapters h2[id], #chapters h3[id]').forEach((h) => io.observe(h));
  }

  /* ---------- 북마크 ---------- */
  let bms = new Set(store.get('bookmarks', []));
  function initBookmarks() {
    $$('#chapters h2[id], #chapters h3[id]').forEach((h) => {
      const b = document.createElement('button');
      b.className = 'bm';
      b.type = 'button';
      b.title = '북마크';
      b.addEventListener('click', () => {
        bms.has(h.id) ? bms.delete(h.id) : bms.add(h.id);
        store.set('bookmarks', [...bms]);
        renderBookmarks();
      });
      h.append(b);
    });
    renderBookmarks();
  }
  function renderBookmarks() {
    $$('.bm').forEach((b) => {
      const on = bms.has(b.parentElement.id);
      b.classList.toggle('on', on);
      b.textContent = on ? '★' : '☆';
    });
    const items = [...bms].map((id) => document.getElementById(id)).filter(Boolean);
    $('#bookmarkList').innerHTML = items.length
      ? items.map((h) => `<li><a href="#${h.id}">★ ${esc(h.dataset.title)}</a></li>`).join('')
      : '<li class="empty-bm">제목 옆 ☆ 를 눌러 저장해 보세요</li>';
  }

  /* ---------- 문제 풀이 (객관식 · OX 공용) ---------- */
  function Practice(kind, items, root, onChange) {
    const isOX = kind === 'ox';
    const st = Object.assign({ answers: {}, idx: 0, cat: '전체' }, store.get(kind, {}));
    const cats = ['전체', ...new Set(items.map((q) => q.category).filter(Boolean))];
    if (!cats.includes(st.cat)) st.cat = '전체';
    const list = () => (st.cat === '전체' ? items : items.filter((q) => q.category === st.cat));
    const correctOf = (q) => (isOX ? String(q.answer).toUpperCase() : Number(q.answer));
    const isRight = (q) => String(st.answers[q.id]) === String(correctOf(q));
    const save = () => { store.set(kind, st); onChange && onChange(); };
    const label = (q, v) => (isOX ? v : `${NUM[v - 1] || v} ${(q.choices || [])[v - 1] ?? ''}`);

    function render() {
      if (!items.length) {
        root.innerHTML = `<p class="empty">아직 문제가 없어요. <code>data/${kind}.js</code> 에 문제를 추가해 보세요.</p>`;
        return;
      }
      const L = list();
      if (st.idx >= L.length || st.idx < 0) st.idx = 0;
      const q = L[st.idx];
      const solved = items.filter((x) => x.id in st.answers);
      const right = solved.filter(isRight).length;
      const chosen = st.answers[q.id];
      const answered = chosen !== undefined;
      const cls = (v) => {
        if (!answered) return '';
        if (String(v) === String(correctOf(q))) return 'correct';
        if (String(v) === String(chosen)) return 'wrong';
        return 'dim';
      };
      const opts = isOX
        ? ['O', 'X'].map((v) => `<button class="choice ${cls(v)}" data-choice="${v}" ${answered ? 'disabled' : ''}>${v}</button>`)
        : q.choices.map((c, i) => `<button class="choice ${cls(i + 1)}" data-choice="${i + 1}" ${answered ? 'disabled' : ''}><span class="num">${NUM[i] || i + 1}</span><span>${inl(c)}</span></button>`);

      root.innerHTML = `
        <div class="pr-toolbar">
          ${cats.length > 2 ? `<select aria-label="카테고리">${cats.map((c) => `<option ${c === st.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>` : ''}
          <span class="pr-stat">푼 문제 <b>${solved.length}</b>/${items.length} · 정답률 <b>${solved.length ? Math.round((right / solved.length) * 100) : 0}%</b></span>
          <button class="ghost-btn" data-act="reset">↺ 초기화</button>
        </div>
        <div class="pr-bar"><span style="width:${(solved.length / items.length) * 100}%"></span></div>
        <div class="qcard ${answered ? (isRight(q) ? 'is-right' : 'is-wrong') : ''}">
          <div class="q-meta"><span class="q-no">Q${st.idx + 1}</span><span>${st.idx + 1} / ${L.length}</span>${q.category ? `<span class="q-cat">${esc(q.category)}</span>` : ''}</div>
          <div class="q-text">${inl(q.question)}</div>
          ${q.code ? `<pre class="q-code"><code>${esc(q.code)}</code></pre>` : ''}
          <div class="choices ${isOX ? 'ox' : ''}">${opts.join('')}</div>
          ${answered ? `<div class="explain">
            <div class="verdict">${isRight(q) ? '✅ 정답!' : '❌ 오답'}<span>정답: ${isOX ? correctOf(q) : NUM[correctOf(q) - 1]}</span></div>
            ${q.explanation ? `<div class="explain-body">${inl(q.explanation)}</div>` : ''}
          </div>` : ''}
        </div>
        <div class="pr-nav">
          <button data-act="prev" ${st.idx === 0 ? 'disabled' : ''}>← 이전</button>
          ${answered ? '<button class="ghost-btn" data-act="retry">다시 풀기</button>' : ''}
          <button data-act="next" ${st.idx >= L.length - 1 ? 'disabled' : ''}>다음 →</button>
        </div>
        <div class="q-grid">${L.map((x, i) => `<button data-jump="${i}" class="${i === st.idx ? 'cur' : ''} ${x.id in st.answers ? (isRight(x) ? 'r' : 'w') : ''}">${i + 1}</button>`).join('')}</div>`;
    }

    function act(name, value) {
      const L = list();
      const q = L[st.idx];
      switch (name) {
        case 'choose':
          if (!q || q.id in st.answers) return;
          st.answers[q.id] = isOX ? value : Number(value);
          break;
        case 'prev': if (st.idx > 0) st.idx--; else return; break;
        case 'next': if (st.idx < L.length - 1) st.idx++; else return; break;
        case 'jump': st.idx = Number(value); break;
        case 'retry': delete st.answers[q.id]; break;
        case 'reset':
          if (!confirm('이 탭의 풀이 기록을 모두 지울까요?')) return;
          st.answers = {}; st.idx = 0; break;
        default: return;
      }
      save();
      render();
    }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.choice !== undefined) act('choose', b.dataset.choice);
      else if (b.dataset.jump !== undefined) act('jump', b.dataset.jump);
      else if (b.dataset.act) act(b.dataset.act);
    });
    root.addEventListener('change', (e) => {
      if (e.target.matches('select')) { st.cat = e.target.value; st.idx = 0; save(); render(); }
    });

    render();
    return {
      key(e) {
        const k = e.key.toUpperCase();
        if (e.key === 'ArrowLeft') act('prev');
        else if (e.key === 'ArrowRight') act('next');
        else if (isOX && (k === 'O' || k === 'X')) act('choose', k);
        else if (!isOX && /^[1-8]$/.test(e.key)) {
          const q = list()[st.idx];
          if (q && Number(e.key) <= q.choices.length) act('choose', e.key);
        }
      },
      wrongItems: () => items.filter((q) => q.id in st.answers && !isRight(q))
        .map((q) => ({ q, mine: label(q, st.answers[q.id]), right: label(q, correctOf(q)) })),
      retry(id) {
        st.cat = '전체';
        st.idx = Math.max(0, items.findIndex((q) => q.id === id));
        delete st.answers[id];
        save();
        render();
      },
    };
  }

  const P = {};

  function updateWrongBadge() {
    const n = (P.quiz ? P.quiz.wrongItems().length : 0) + (P.ox ? P.ox.wrongItems().length : 0);
    $('[data-tab="wrong"] .cnt').textContent = n || '';
    if (currentTab === 'wrong') renderWrong();
  }

  /* ---------- 오답노트 ---------- */
  function renderWrong() {
    const groups = [['quiz', (S.quiz && S.quiz.label) || '객관식'], ['ox', (S.ox && S.ox.label) || 'OX']];
    let total = 0;
    let html = '';
    for (const [k, name] of groups) {
      const ws = P[k] ? P[k].wrongItems() : [];
      total += ws.length;
      if (!ws.length) continue;
      html += `<h3 class="wrong-group">${esc(name)} <span class="cnt">${ws.length}</span></h3>` + ws.map(({ q, mine, right }) => `
        <div class="wcard">
          ${q.category ? `<div class="q-meta"><span class="q-cat">${esc(q.category)}</span></div>` : ''}
          <div class="q-text">${inl(q.question)}</div>
          ${q.code ? `<pre class="q-code"><code>${esc(q.code)}</code></pre>` : ''}
          <div class="w-ans"><span class="mine">✗ 내 답: ${inl(mine)}</span><span class="right">✓ 정답: ${inl(right)}</span></div>
          ${q.explanation ? `<div class="explain-body">${inl(q.explanation)}</div>` : ''}
          <button class="ghost-btn" data-retry="${k}" data-id="${esc(q.id)}">다시 풀기 →</button>
        </div>`).join('');
    }
    $('#wrongList').innerHTML = total ? html : '<p class="empty">🎉 틀린 문제가 없어요! 문제를 풀면 틀린 문제가 여기에 모입니다.</p>';
  }
  $('#wrongList').addEventListener('click', (e) => {
    const b = e.target.closest('[data-retry]');
    if (!b) return;
    const k = b.dataset.retry;
    P[k].retry(b.dataset.id);
    history.replaceState(null, '', '#' + k);
    showTab(k);
  });

  /* 키보드: 문제 탭에서 1~4 / O·X / ←→ */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, select, textarea')) return;
    if (P[currentTab]) P[currentTab].key(e);
  });

  /* ---------- 시작 ---------- */
  initTheme();
  initMeta();
  initSidebar();
  P.quiz = Practice('quiz', QUIZ, $('#quizRoot'), updateWrongBadge);
  P.ox = Practice('ox', OX, $('#oxRoot'), updateWrongBadge);
  updateWrongBadge();
  window.addEventListener('hashchange', route);
  route();
  loadChapters().then(() => {
    // 챕터가 로드된 뒤에 #sec-7 같은 주소로 이동
    if (location.hash && !TABS.includes(location.hash.slice(1))) route();
  });
})();
