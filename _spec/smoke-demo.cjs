// smoke-demo.cjs — 用 dom-stub 冒烟执行一个 demo 的内联脚本
// 用法: node _spec/smoke-demo.cjs demos/demo-softmax.html
// 增强版：把 demo 的 body HTML 里的 id / 根 class 注册进桩 document，
// 使 getElementById / querySelector / currentScript.closest 能命中真实桩元素。
'use strict';
const { readFileSync } = require('fs');
const path = require('path');
const stub = require('./dom-stub.cjs');
const { makeDocument, makeWindow, makeEl } = stub;

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
if (!scripts.length) { console.log('no script found'); process.exit(1); }

const doc = makeDocument();
const win = makeWindow();

// ---- 注册 demo HTML 中出现的所有 id ----
const byId = new Map();
for (const m of html.matchAll(/id="([^"]+)"/g)) {
  if (!byId.has(m[1])) byId.set(m[1], makeEl('div'));
}
// 推断根容器 class（第一个顶层 div 的 class）
const rootClass = (html.match(/<div class="([^"\s]+)/) || [])[1] || null;
const rootEl = makeEl('div');
rootEl.classList.contains = (c) => c === rootClass;
rootEl.querySelector = (sel) => {
  const idm = sel.match(/^#(.+)$/);
  if (idm && byId.has(idm[1])) return byId.get(idm[1]);
  return makeEl('div');
};
rootEl.querySelectorAll = () => [];
rootEl.closest = (sel) => {
  const cm = sel.match(/^\.(.+)$/);
  if (cm && cm[1] === rootClass) return rootEl;
  return null;
};

doc.getElementById = (id) => byId.get(id) || null;
doc.querySelector = (sel) => {
  const idm = sel.match(/^#(.+)$/);
  if (idm) return byId.get(idm[1]) || null;
  const cm = sel.match(/^\.(.+)$/);
  if (cm && cm[1] === rootClass) return rootEl;
  return rootEl;
};
doc.querySelectorAll = () => [];

// currentScript：让 demo 的 closest('.dz-xxx') 能找到根
doc.currentScript = { closest: () => rootEl };

let failed = 0;
scripts.forEach((m, i) => {
  try {
    const fn = new Function('document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'getComputedStyle',
      'IntersectionObserver', 'ResizeObserver', m[1]);
    fn(doc, win, win.requestAnimationFrame, win.cancelAnimationFrame,
      win.setTimeout, win.clearTimeout, win.setInterval, win.clearInterval, win.getComputedStyle,
      win.IntersectionObserver, win.ResizeObserver);
    console.log(`PASS ${path.basename(file)} script#${i}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${path.basename(file)} script#${i}: ${e.message}`);
  }
});
process.exit(failed ? 1 : 0);
