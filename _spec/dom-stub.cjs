// dom-stub.cjs — 最小 DOM 桩：用于在 Node 中冒烟执行 demo 的内联脚本
// 用法：const { makeDocument, makeWindow } = require('./dom-stub.cjs')
'use strict';

let DOC = null; // 由 makeDocument() 回填，供元素的 ownerDocument 引用

function chainable(extra) {
  const base = {
    style: new Proxy({}, { get: (t, k) => (k === 'setProperty' ? () => {} : ''), set: () => true }),
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    dataset: {},
    children: [],
    childNodes: [],
    attributes: {},
    innerHTML: '',
    textContent: '',
    value: '0',
    checked: false,
    disabled: false,
    hidden: false,
    width: 300,
    height: 150,
    parentNode: null,
    parentElement: null,
    ownerDocument: null,
    isIntersecting: true,
    intersectionRatio: 1,
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    removeChild(c) { return c; },
    insertBefore(c) { this.children.push(c); return c; },
    replaceChild(n, o) { return o; },
    remove() {},
    cloneNode() { return makeEl(this.tagName || 'div'); },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] ?? null; },
    hasAttribute(k) { return k in this.attributes; },
    removeAttribute(k) { delete this.attributes[k]; },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    querySelector() { return makeEl('div'); },
    querySelectorAll() { return []; },
    getElementsByTagName() { return []; },
    getBoundingClientRect() { return { width: 300, height: 150, top: 0, left: 0, right: 300, bottom: 150 }; },
    getContext() { return ctx2d(); },
    focus() {}, blur() {}, click() {},
    scrollIntoView() {},
    insertAdjacentHTML() {},
    matches() { return false; },
    closest() { return null; },
    contains() { return false; },
    ...(extra || {}),
  };
  if (!base.ownerDocument) base.ownerDocument = DOC;
  return base;
}

function ctx2d() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, k) {
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => grad;
      if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      if (k === 'canvas') return { width: 300, height: 150 };
      if (typeof t[k] !== 'undefined') return t[k];
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}

function makeEl(tag) { return chainable({ tagName: String(tag || 'div').toUpperCase() }); }

function makeDocument() {
  const doc = chainable({
    documentElement: chainable({ tagName: 'HTML' }),
    body: chainable({ tagName: 'BODY' }),
    head: chainable({ tagName: 'HEAD' }),
    createElement: (t) => makeEl(t),
    createElementNS: (ns, t) => makeEl(t),
    createTextNode: (t) => ({ textContent: String(t) }),
    createDocumentFragment: () => chainable({ tagName: '#fragment' }),
    getElementById: () => null,
    readyState: 'complete',
    hidden: false,
    addEventListener() {},
  });
  DOC = doc;
  return doc;
}

function makeWindow() {
  return {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    addEventListener() {},
    removeEventListener() {},
    requestAnimationFrame: (cb) => 0,
    cancelAnimationFrame() {},
    setInterval: () => 0,
    clearInterval() {},
    setTimeout: (cb) => 0,
    clearTimeout() {},
    getComputedStyle: () => ({ getPropertyValue: () => '#888' }),
    location: { hash: '', href: 'http://localhost/' },
    IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  };
}

module.exports = { makeDocument, makeWindow, makeEl };
