// syntax-check.mjs — 提取所有 demo/part 内联 <script> 并做语法校验 + HTML 基本检查
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const root = process.argv[2] || 'G:/Research/transformer-course';
let failures = 0;

function checkJsSyntax(code, label) {
  const tmp = join(root, '_spec', '_check_tmp.js');
  writeFileSync(tmp, code);
  try {
    execSync(`node --check "${tmp}"`, { stdio: 'pipe' });
    console.log(`  JS OK   ${label}`);
  } catch (e) {
    failures++;
    console.log(`  JS FAIL ${label}\n${e.stderr ? e.stderr.toString().slice(0, 600) : e.message}`);
  }
}

function checkFile(fp) {
  const html = readFileSync(fp, 'utf8');
  const name = fp.replace(/\\/g, '/').split('/').slice(-2).join('/');
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  scripts.forEach((m, i) => checkJsSyntax(m[1], `${name} script#${i}`));
  // 禁止项
  const banned = [/<style/i.test(html) && fp.includes('part') ? '<style> in part' : null,
    /<!DOCTYPE/i.test(html) ? 'doctype in fragment' : null,
    /localStorage/.test(html) && fp.includes('demo') ? 'localStorage in demo' : null,
    /#(?:[0-9a-fA-F]{3}){1,2}\b/.test(html) && fp.includes('part') ? 'hex color in part' : null,
  ].filter(Boolean);
  if (banned.length) { failures++; console.log(`  BANNED  ${name}: ${banned.join(', ')}`); }
  // 结构统计
  const svgCount = (html.match(/<svg/g) || []).length;
  const figs = (html.match(/class="fig"/g) || []).length;
  const callouts = (html.match(/class="callout/g) || []).length;
  const quizzes = (html.match(/class="quiz"/g) || []).length;
  const lines = html.split('\n').length;
  console.log(`  STAT    ${name}: ${lines} 行, svg=${svgCount}, fig=${figs}, callout=${callouts}, quiz=${quizzes}`);
  return { name, lines, svgCount, figs, callouts, quizzes };
}

const stats = [];
for (const dir of ['parts', 'demos']) {
  const d = join(root, dir);
  if (!existsSync(d)) continue;
  console.log(`\n[${dir}]`);
  for (const f of readdirSync(d).filter(x => x.endsWith('.html')).sort()) {
    stats.push(checkFile(join(d, f)));
  }
}
console.log(`\n== ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'} ==`);
process.exit(failures ? 1 : 0);
