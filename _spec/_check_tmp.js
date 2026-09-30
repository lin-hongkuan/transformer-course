
  (function () {
    'use strict';
    var root = document.currentScript ? document.currentScript.closest('.dz-train') : null;
    if (!root) return;
    try {
      var $ = function (id) { return root.querySelector('#' + id); };
      var lrSlider = $('dzt-lr'), lrOut = $('dzt-lr-out');
      var stepsSlider = $('dzt-steps'), stepsOut = $('dzt-steps-out');
      var warmupChk = $('dzt-warmup'), lsChk = $('dzt-ls'), noiseChk = $('dzt-noise');
      var runBtn = $('dzt-run'), resetBtn = $('dzt-reset');
      var canvas = $('dzt-canvas');
      var stepEl = $('dzt-step'), curLossEl = $('dzt-curloss'), finLossEl = $('dzt-finloss'), statusEl = $('dzt-status');
      var commentEl = $('dzt-comment');

      if (!lrSlider || !canvas) throw new Error('控件初始化失败：找不到画布或滑块');
      var ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('控件初始化失败：无法创建 2D 画布上下文');

      // ---- 学习率滑块：0~100 映射到 0.001~1（对数尺度）----
      function sliderToLr(v) {
        var t = Math.min(100, Math.max(0, v)) / 100;      // 0..1
        return Math.pow(10, -3 + 3 * t);                  // 1e-3 .. 1
      }
      function fmtLr(lr) {
        return lr >= 0.1 ? lr.toFixed(2) : lr.toFixed(3);
      }
      function syncLabels() {
        lrOut.textContent = fmtLr(sliderToLr(parseFloat(lrSlider.value)));
        stepsOut.textContent = stepsSlider.value + ' 步';
      }
      lrSlider.addEventListener('input', syncLabels);
      stepsSlider.addEventListener('input', syncLabels);
      syncLabels();

      // ---- 模拟器核心：一套预定义的动力学规则 ----
      var TOTAL = 300;          // 总步数
      var L0 = 3.4;             // 初始 loss（相当于随机猜测 30522 词表其实应 ~10.3，这里缩小便于展示）
      var LR_MAX_SHOW = 1.0;

      var state = {
        step: 0,
        p: 0.02,                // 模型给正确词的概率（起点）
        v: 0,                   // 震荡速度（发散时用）
        diverged: false,
        anim: null,
        hist: [],               // loss 历史
        lrHist: []              // 学习率历史
      };

      function floorLoss() {
        // label smoothing 抬高 loss 地板（模型达到目标分布时 loss 仍 > 0）
        return lsChk.checked ? 0.42 : 0.05;
      }

      function lrAt(step) {
        var base = sliderToLr(parseFloat(lrSlider.value));
        if (warmupChk.checked) {
          var w = Math.max(5, Math.round(TOTAL * 0.15));
          if (step < w) return base * (step + 1) / w;   // 线性热身
        }
        return base;
      }

      function randn() {
        // 近似正态：均匀和
        return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      }

      function simulateStep() {
        var lr = lrAt(state.step);
        state.lrHist.push(lr);

        if (lr > 0.4) {
          // ---- 发散区：学习率太大，loss 震荡上升 ----
          if (!state.diverged && state.step > 2) state.diverged = true;
          var kick = (0.6 + Math.random() * 0.8) * (lr / LR_MAX_SHOW);
          state.v = state.v * 0.7 + kick * (Math.random() < 0.5 ? -1 : 1);
          var l0 = state.hist.length ? state.hist[state.hist.length - 1] : L0;
          var lv = Math.max(0.2, l0 + state.v + 0.04);
          state.hist.push(lv);
          state.p = Math.max(0.0005, state.p * (1 - 0.02 * lr));
        } else {
          // ---- 正常区：概率向目标爬升 ----
          // 有效步长：学习率决定收敛快慢
          var eff = lr * 3.2;                     // 调好的增益系数
          var target = 1;
          state.p = state.p + (target - state.p) * Math.min(0.5, eff);
          if (noiseChk.checked) {
            var jitter = 1 + 0.35 * lr * randn();  // 大学习率抖动更厉害
            state.p = Math.min(0.9999, Math.max(0.0005, state.p * jitter));
          }
          var loss = -Math.log(state.p) + floorLoss();
          state.hist.push(loss);
        }

        state.step++;
        draw();
        updateReadout(false);

        if (state.step < TOTAL) {
          state.anim = requestAnimationFrame(simulateStep);
        } else {
          finish();
        }
      }

      // ---- 绘图 ----
      var PAD = { l: 52, r: 52, t: 18, b: 34 };

      function setupCanvas() {
        var dpr = window.devicePixelRatio || 1;
        var rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(300, rect.width * dpr);
        canvas.height = 300 * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state.w = rect.width; state.h = 300;
      }

      function cssVar(name, fallback) {
        var v = getComputedStyle(root).getPropertyValue(name);
        return v ? v.trim() : fallback;
      }

      function draw() {
        var w = state.w, h = state.h;
        if (!w) return;
        var cLine = cssVar('--line', '#D9D2C0');
        var cMuted = cssVar('--muted', '#61687A');
        var cAccent = cssVar('--accent', '#2B4BD8');
        var cAccent2 = cssVar('--accent2', '#E05A12');

        ctx.clearRect(0, 0, w, h);

        var iw = w - PAD.l - PAD.r, ih = h - PAD.t - PAD.b;

        // loss 量程：正常时 0~3.6，发散时自适应放大
        var maxLoss = 3.6;
        for (var i = 0; i < state.hist.length; i++) {
          if (state.hist[i] > maxLoss) maxLoss = Math.min(12, state.hist[i] * 1.15);
        }

        // 网格
        ctx.strokeStyle = cLine; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.font = '10.5px monospace'; ctx.fillStyle = cMuted;
        for (var g = 0; g <= 4; g++) {
          var gy = PAD.t + ih * g / 4;
          ctx.beginPath(); ctx.moveTo(PAD.l, gy); ctx.lineTo(PAD.l + iw, gy); ctx.stroke();
          var val = maxLoss * (1 - g / 4);
          ctx.textAlign = 'right';
          ctx.fillText(val.toFixed(1), PAD.l - 6, gy + 3.5);
        }
        // 横轴刻度
        ctx.textAlign = 'center';
        for (var sx = 0; sx <= 4; sx++) {
          var gx = PAD.l + iw * sx / 4;
          ctx.beginPath(); ctx.moveTo(gx, PAD.t); ctx.lineTo(gx, PAD.t + ih); ctx.stroke();
          ctx.fillText(Math.round(TOTAL * sx / 4), gx, PAD.t + ih + 16);
        }
        ctx.setLineDash([]);
        ctx.textAlign = 'left';
        ctx.fillStyle = cMuted;
        ctx.fillText('loss', 6, PAD.t + 4);
        ctx.textAlign = 'right';
        ctx.fillText('lr', w - 6, PAD.t + 4);
        ctx.fillText('step', w - PAD.r + 4, PAD.t + ih + 16);

        // 学习率曲线（虚线，右轴，0~LR_MAX_SHOW 对数映射到高度）
        if (state.lrHist.length > 1) {
          ctx.strokeStyle = cAccent2; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
          ctx.beginPath();
          for (var j = 0; j < state.lrHist.length; j++) {
            var lr = state.lrHist[j];
            // 对数映射：log10(lr) 从 -3 到 0
            var t = (Math.log10(Math.max(1e-3, lr)) + 3) / 3;
            var x = PAD.l + iw * j / (TOTAL - 1);
            var y = PAD.t + ih * (1 - t);
            if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          // 右轴学习率标签
          ctx.fillStyle = cAccent2; ctx.textAlign = 'left'; ctx.font = '10px monospace';
          var labels = ['0.001', '0.032', '1.0'];
          for (var q = 0; q < 3; q++) {
            var tt = q / 2;
            var yy = PAD.t + ih * (1 - tt);
            ctx.fillText(labels[q], PAD.l + iw + 6, yy + 3);
          }
          ctx.font = '10.5px monospace';
        }

        // loss 曲线
        if (state.hist.length > 1) {
          ctx.strokeStyle = cAccent; ctx.lineWidth = 2.4;
          ctx.lineJoin = 'round'; ctx.lineCap = 'round';
          ctx.beginPath();
          for (var k = 0; k < state.hist.length; k++) {
            var lv = Math.min(state.hist[k], maxLoss);
            var x2 = PAD.l + iw * k / (TOTAL - 1);
            var y2 = PAD.t + ih * (1 - lv / maxLoss);
            if (k === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
          }
          ctx.stroke();

          // 最新点
          var lastX = PAD.l + iw * (state.hist.length - 1) / (TOTAL - 1);
          var lastY = PAD.t + ih * (1 - Math.min(state.hist[state.hist.length - 1], maxLoss) / maxLoss);
          ctx.fillStyle = cAccent;
          ctx.beginPath(); ctx.arc(lastX, lastY, 4, 0, Math.PI * 2); ctx.fill();
        }
      }

      function updateReadout(done) {
        stepEl.textContent = state.step + ' / ' + TOTAL;
        var cur = state.hist.length ? state.hist[state.hist.length - 1] : null;
        curLossEl.textContent = cur === null ? '—' : cur.toFixed(3);
        if (done) finLossEl.textContent = cur === null ? '—' : cur.toFixed(3);
        statusEl.textContent = done ? (state.diverged ? '发散' : '完成') : '训练中…';
      }

      function finish() {
        state.anim = null;
        updateReadout(true);
        runBtn.disabled = false;
        runBtn.textContent = '再训一次';

        var finalLoss = state.hist[state.hist.length - 1];
        var lr = sliderToLr(parseFloat(lrSlider.value));
        var msg, cls = 'dz-comment';

        if (state.diverged || finalLoss > 3.0) {
          msg = '学习率 ' + fmtLr(lr) + ' 太大了：步子一步跨过了谷底，在两边来回震荡甚至越走越远——loss 发散。试试调小 10 倍。';
          cls += ' dz-bad';
        } else if (finalLoss > 1.2 && lr <= 0.005) {
          msg = '学习率 ' + fmtLr(lr) + ' 太小了：方向没错，但每步只挪一丁点，' + TOTAL + ' 步还没走到半山腰。试试调大 10 倍，或者增加训练步数。';
          cls += ' dz-bad';
        } else if (finalLoss > 0.9) {
          msg = '下降中但还没收敛。可以把步数拉长，或把学习率微调大一点——注意过大就会震荡。';
          cls += ' dz-bad';
        } else {
          var extra = '';
          if (lsChk.checked) extra = ' 注意最终 loss 停在约 ' + floorLoss().toFixed(2) + ' 的"地板"上而不是 0——这是 label smoothing 留 10% 余地的正常现象。';
          if (warmupChk.checked) extra += ' warmup 让开头的爬升又稳又直。';
          msg = '漂亮！loss 平滑下降并收敛到 ' + finalLoss.toFixed(3) + '，这就是教科书式的训练曲线。' + extra;
          cls += ' dz-good';
        }
        commentEl.className = cls;
        commentEl.textContent = msg;
      }

      function reset() {
        if (state.anim) { cancelAnimationFrame(state.anim); state.anim = null; }
        TOTAL = parseInt(stepsSlider.value, 10);
        state.step = 0;
        state.p = 0.02;
        state.v = 0;
        state.diverged = false;
        state.hist = [];
        state.lrHist = [];
        runBtn.disabled = false;
        runBtn.textContent = '开始训练';
        finLossEl.textContent = '—';
        stepEl.textContent = '0';
        curLossEl.textContent = '—';
        statusEl.textContent = '待命';
        commentEl.className = 'dz-comment';
        commentEl.textContent = '调好学习率，按下「开始训练」。提示：0.01 ~ 0.05 通常是好起点；1.0 会立刻翻车。';
        setupCanvas();
        draw();
      }

      runBtn.addEventListener('click', function () {
        if (state.anim) return;
        if (state.step >= TOTAL || state.step === 0) {
          // 重新开始
          if (state.anim) { cancelAnimationFrame(state.anim); state.anim = null; }
          TOTAL = parseInt(stepsSlider.value, 10);
          state.step = 0; state.p = 0.02; state.v = 0;
          state.diverged = false; state.hist = []; state.lrHist = [];
          finLossEl.textContent = '—';
        }
        runBtn.disabled = true;
        runBtn.textContent = '训练中…';
        commentEl.className = 'dz-comment';
        commentEl.textContent = '训练中：观察左侧 loss 曲线（实线）与右侧学习率曲线（虚线）的配合……';
        state.anim = requestAnimationFrame(simulateStep);
      });

      resetBtn.addEventListener('click', reset);

      // 画布尺寸跟随容器
      var resizeT = null;
      window.addEventListener('resize', function () {
        clearTimeout(resizeT);
        resizeT = setTimeout(function () { setupCanvas(); draw(); }, 150);
      });

      reset();
    } catch (err) {
      var box = document.createElement('div');
      box.className = 'dz-err';
      box.textContent = '演示初始化失败：' + (err && err.message ? err.message : err);
      root.appendChild(box);
    }
  })();
  