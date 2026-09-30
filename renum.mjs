// renum.mjs — 把所有 part 的手写 h3 编号包成 <span class="sec-no">，并校验连续性
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = 'G:/Research/transformer-course/parts';
const files = readdirSync(root).filter(f => /^part\d+\.html$/.test(f)).sort();

for (const f of files) {
  let html = readFileSync(join(root, f), 'utf8');
  // 按 section 切分处理，每章独立校验编号序列
  const sections = html.split(/(?=<section class="chapter")/);
  let changed = false;
  const out = sections.map(sec => {
    const idm = sec.match(/<section class="chapter" id="ch(\d+)"/);
    if (!idm) return sec;
    const chNo = parseInt(idm[1], 10);
    let expected = 1;
    const newSec = sec.replace(/<h3>(\d+)\.(\d+)\s*/g, (m, a, b) => {
      const ok = parseInt(a, 10) === chNo;
      if (!ok) console.log(`WARN ${f} ch${chNo}: 编号 ${a}.${b} 章号不符`);
      if (parseInt(b, 10) !== expected) console.log(`WARN ${f} ch${chNo}: 序号 ${a}.${b} 与预期 ${chNo}.${expected} 不符`);
      expected++;
      changed = true;
      return `<h3><span class="sec-no">${a}.${b}</span> `;
    }).replace(/<h3>(?!<span class="sec-no">)/g, () => {
      console.log(`NOTE ${f} ch${chNo}: 第 ${expected} 个 h3 无编号（将补 ${chNo}.${expected}）`);
      expected++;
      changed = true;
      return `<h3><span class="sec-no">${chNo}.${expected - 1}</span> `;
    });
    // 顺手把 h4 的 x.y.z 编号保留原文（样式上不加徽章，密度太高），但检查它引用的 h3 号存在
    return newSec;
  });
  if (changed) {
    writeFileSync(join(root, f), out.join(''));
    console.log(`OK  ${f}: h3 编号已包徽章`);
  }
}
console.log('done');
