/* Transformer 图解讲义 · 框架脚本
   顺序加载 parts/*.html → 注入 demos/*.html → 滚动监听 / 进度条 / 主题切换 / Hero 画布 */
(function () {
  'use strict';

  var PARTS = ['part01','part02','part03','part04','part05','part06','part07','part08','part09'];

  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- 主题 ---------- */
  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }
  function paintThemeBtn() {
    var b = qs('#theme-btn');
    if (b) b.textContent = currentTheme() === 'dark' ? '☀ 亮色' : '☾ 暗色';
  }
  window.__toggleTheme = function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('tf-course-theme', next); } catch (e) {}
    paintThemeBtn();
  };
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('tf-course-theme'); } catch (e) {}
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
    paintThemeBtn();
    var b = qs('#theme-btn');
    if (b) b.addEventListener('click', window.__toggleTheme);
  })();

  /* ---------- Hero 画布：注意力权重在词元之间流动 ---------- */
  function heroCanvas() {
    var cv = qs('#hero-canvas');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var TOKENS = ['我', '深', '爱', '着', '这', '门', '课', '。'];
    var W = 0, H = 0, dpr = 1, t = 0, raf = null, running = true;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function size() {
      var r = cv.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(280, r.width); H = Math.max(224, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function tokColor() { return getComputedStyle(document.documentElement); }
    function draw() {
      var cs = tokColor();
      var ink = cs.getPropertyValue('--ink').trim();
      var muted = cs.getPropertyValue('--muted').trim();
      var accent = cs.getPropertyValue('--accent').trim();
      var accent2 = cs.getPropertyValue('--accent2').trim();
      var paper3 = cs.getPropertyValue('--paper3').trim();
      ctx.clearRect(0, 0, W, H);

      var n = TOKENS.length;
      var rowY = [H * 0.30, H * 0.74];
      var xs = [];
      for (var i = 0; i < n; i++) xs.push(W * (0.08 + 0.84 * (i / (n - 1))));

      // 注意力连线（权重由时间驱动的伪随机函数模拟）
      var focus = Math.floor(t / 90) % n;
      for (var a = 0; a < n; a++) {
        for (var b = 0; b < n; b++) {
          if (a === b) continue;
          var w = Math.max(0, Math.sin(a * 3.1 + b * 1.7 + t / 55) * 0.5 + 0.5);
          w *= (b === focus) ? 1.0 : 0.28;
          if (w < 0.12) continue;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = w * 0.55;
          ctx.lineWidth = 0.6 + w * 3.4;
          ctx.beginPath();
          var mx = (xs[a] + xs[b]) / 2, my = (rowY[0] + rowY[1]) / 2 - 34 - Math.abs(xs[a] - xs[b]) * 0.14;
          ctx.moveTo(xs[a], rowY[0] + 16);
          ctx.quadraticCurveTo(mx, my, xs[b], rowY[1] - 16);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // 词元节点
      for (var r = 0; r < 2; r++) {
        for (var k = 0; k < n; k++) {
          var x = xs[k], y = rowY[r];
          var hot = (r === 1 && k === focus);
          ctx.beginPath(); ctx.arc(x, y, hot ? 23 : 19, 0, Math.PI * 2);
          ctx.fillStyle = hot ? accent2 : paper3;
          ctx.fill();
          ctx.lineWidth = 1.4; ctx.strokeStyle = hot ? accent2 : muted; ctx.stroke();
          ctx.fillStyle = hot ? '#fff' : ink;
          ctx.font = '600 15px "Noto Sans SC", sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(TOKENS[k], x, y + 0.5);
        }
      }
      ctx.fillStyle = muted;
      ctx.font = '10.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('attention(Q, K, V) = softmax(QKᵀ / √d) · V', 12, 20);
      ctx.fillText('score(' + TOKENS[focus] + ', ·)', 12, H - 10);

      t += 1;
      if (!reduced && running) raf = requestAnimationFrame(draw);
    }
    function restart() { size(); if (raf) cancelAnimationFrame(raf); draw(); if (reduced) { /* 静态一帧 */ } }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && !reduced) restart();
    });
    window.addEventListener('resize', restart);
    if (window.matchMedia) {
      try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restart);
      } catch (e) {}
    }
    restart();
  }

  /* ---------- 进度条 + 目录高亮 ---------- */
  var __scrollBound = false;
  function scrollUI() {
    var bar = qs('#progress-bar');
    var links = qsa('.toc a[data-ch]');
    var heads = qsa('.chapter');
    function onScroll() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (bar) bar.style.width = p.toFixed(2) + '%';
      var cur = null;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].getBoundingClientRect().top < window.innerHeight * 0.34) cur = heads[i].id;
      }
      for (var j = 0; j < links.length; j++) {
        links[j].classList.toggle('active', links[j].getAttribute('data-ch') === cur);
      }
    }
    if (!__scrollBound) {
      __scrollBound = true;
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
      }, { passive: true });
      window.__refreshScrollUI = function () {
        heads = qsa('.chapter');
        onScroll();
      };
    } else {
      heads = qsa('.chapter');
    }
    onScroll();
  }

  /* ---------- 动态加载 part 与 demo ---------- */
  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ' → HTTP ' + r.status);
      return r.text();
    });
  }

  function execScripts(container) {
    qsa('script', container).forEach(function (old) {
      var s = document.createElement('script');
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function hydrateDemos(root) {
    var frames = qsa('.demo-frame[data-demo]', root).filter(function (fr) {
      return !fr.getAttribute('data-hydrated');
    });
    return Promise.all(frames.map(function (fr) {
      var name = fr.getAttribute('data-demo');
      fr.setAttribute('data-hydrated', '1');
      fr.classList.add('loading');
      return fetchText('demos/' + encodeURIComponent(name) + '.html').then(function (html) {
        fr.classList.remove('loading');
        fr.innerHTML = html;
        execScripts(fr);
      }).catch(function (err) {
        fr.classList.remove('loading');
        fr.innerHTML = '<p style="font:500 .85rem/1.6 var(--f-mono);color:var(--accent2)">演示模块 ' +
          name + ' 未能加载（' + String(err.message || err) + '）。</p>';
      });
    }));
  }

  function loadParts() {
    var main = qs('#chapters');
    if (!main) return;
    var chain = Promise.resolve();
    PARTS.forEach(function (p) {
      chain = chain.then(function () {
        return fetchText('parts/' + p + '.html').then(function (html) {
          var sk = qs('#sk-' + p);
          var holder = document.createElement('div');
          holder.innerHTML = html;
          var frag = document.createDocumentFragment();
          while (holder.firstChild) frag.appendChild(holder.firstChild);
          if (sk) { sk.parentNode.replaceChild(frag, sk); } else { main.appendChild(frag); }
          if (window.__refreshScrollUI) window.__refreshScrollUI();
          return hydrateDemos(main);
        }).catch(function (err) {
          var sk = qs('#sk-' + p);
          if (sk) {
            sk.classList.add('sk-error');
            sk.innerHTML = '<p>章节 ' + p + ' 暂时缺席（' + String(err.message || err) +
              '）。它正在赶来的路上——请稍后刷新本页。</p>';
          }
        });
      });
    });
    /* 完成后隐藏仍在等待的占位（它们对应的章节这次没有交付） */
    return chain.then(function () {
      qsa('.part-skeleton:not(.sk-error)').forEach(function (sk) {
        sk.classList.add('sk-done');
        sk.style.display = 'none';
      });
      qsa('.part-skeleton.sk-error').forEach(function (sk) { sk.style.display = 'none'; });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    heroCanvas();
    scrollUI();
    loadParts().then(function () { scrollUI(); });
  });
})();
