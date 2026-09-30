// link-check.mjs — 交叉引用与 demo 引用一致性检查
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const root = 'G:/Research/transformer-course';
const parts = readdirSync(join(root, 'parts')).filter(f => /^(part|ch)\d+\.html$/.test(f));
const demos = new Set(readdirSync(join(root, 'demos')).filter(f => f.endsWith('.html')).map(f => f.replace('.html', '')));

const chIds = new Set();
const refTargets = [];
const demoRefs = [];

for (const p of parts) {
  const html = readFileSync(join(root, 'parts', p), 'utf8');
  for (const m of html.matchAll(/<section class="chapter" id="(ch\d+)"/g)) chIds.add(m[1]);
  for (const m of html.matchAll(/href="#(ch\d+)"/g)) refTargets.push({ file: p, id: m[1] });
  for (const m of html.matchAll(/data-demo="([^"]+)"/g)) demoRefs.push({ file: p, demo: m[1] });
}

let bad = 0;
console.log('章节 ids:', [...chIds].sort().join(' '));
for (const r of refTargets) {
  if (!chIds.has(r.id)) { bad++; console.log(`MISSING CHAPTER REF  ${r.file} → #${r.id}`); }
}
for (const d of demoRefs) {
  if (!demos.has(d.demo)) { bad++; console.log(`MISSING DEMO FILE  ${d.file} → ${d.demo}`); }
}
const unused = [...demos].filter(d => d !== 'demo-softmax' && !demoRefs.some(r => r.demo === d));
for (const u of unused) console.log(`NOTE: demo 未被任何章节引用（demo-softmax 为备用属正常）: ${u}`);
console.log(bad === 0 ? '\nALL LINKS OK' : `\n${bad} BROKEN REFS`);
process.exit(bad ? 1 : 0);
