# Transformer 图解讲义 · 项目状态

## 目标
零基础中文图解讲义网页：10 章正文（parts/part01~09.html，body 片段）+ 10 个交互 demo（demos/）+ 框架（index.html / parts.css / frame.js）。最终发布为单个 artifact。

## 规范
- `_spec/SHARED_SPEC.md`（CSS 契约、SVG 约定、数字红线）
- `_spec/BLUEPRINT.md`（章节大纲与 demo 清单）
- `_spec/PART_QA.md` / `_spec/DEMO_QA.md`（质检清单）
- 工具：`syntax-check.mjs`（JS 语法+禁用项）、`link-check.mjs`（交叉引用）、`_spec/smoke-demo.cjs`（DOM 桩冒烟）、`serve.js`（本地预览 :8734）

## 进度
- [x] 框架三件套 + 目录/进度条/主题切换/Hero 注意力动画
- [x] part01(ch00+01) part02(ch02) part03(ch03) part05(ch05) part07(ch07) part08(ch08) 交付
- [x] demos: ngram/embedding/positional/attention/softmax/residual/training/family 交付
- [ ] part04(ch04 多头) + demo-multihead —— 写作 agent 进行中
- [ ] part06 收尾（补走查/参数量/掩码归位）+ part09 合并 chunk —— agent ac0e4840a3226db8a 处理中
- [ ] demo-architecture、demo-decoding —— 对应写作 agent 进行中
- [ ] QA：3 个质检 agent 运行中（part01-02 / part03-05 / part07-08）
- [ ] 终检 → 发布 artifact

## 关键框架决策
- part 按 PARTS 数组顺序 fetch 注入 #chapters；`.demo-frame[data-demo]` 惰性注入 demos/*.html 并执行内联脚本（`data-hydrated` 防重）。
- 骨架屏在全部加载完成后统一隐藏（缺章静默隐藏，目录照旧）。
- 颜色只走 CSS 变量；暗色 = 夜间蓝图 (#10141F 底 + #87A0FF 靛)。
