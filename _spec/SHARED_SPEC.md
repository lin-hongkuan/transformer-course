# 共享规范 —— 所有 part 作者与 demo 作者必读

## 文件与输出
- 你写的文件位于 `G:\Research\transformer-course\parts\part0X.html`（或 demos\demo-XX.html）。
- **只写 body 内容片段**：不要 `<!DOCTYPE>`、`<html>`、`<head>`、`<body>` 标签。从 `<section class="chapter" id="chXX">` 开始写。
- 全中文写作（术语保留英文原名并给中文解释，如 "Query（查询向量）"）。
- 受众：**完全零基础的大学生**。任何概念第一次出现都要用生活化类比解释。禁止使用未定义术语。每一个公式必须"先讲直觉 → 再给公式 → 再用具体小数字手算一遍"。
- 数学记号约定：向量用粗体小写 **x**，矩阵粗体大写 **W**；用「注意力分数」「缩放因子 √d_k」等中文术语。d_model=512, d_k=d_v=64, 头数 h=8, 词表 30522（BERT base）等数字用原始论文的真实数字。
- 每一章末尾给出：「小结」列表 + 「常见误区」警示框（callout-warn）+ 2~3 道「自测题」（details 折叠）。

## CSS 契约（框架已提供，直接用 class，不要重复定义）
章节结构：
```html
<section class="chapter" id="ch01">
  <header class="ch-head">
    <p class="ch-eyebrow">第 1 章 · 语言模型的直觉</p>
    <h2>标题</h2>
    <p class="ch-lede">本章导语（2~3 句，告诉读者学完能获得什么）</p>
  </header>
  ... 正文 ...
</section>
```
可用的 class（框架已定义样式）：
- `h3`（小节标题，自动带编号样式勿手写）、`h4`、`p`、`ul/ol/li`、`strong`、`code`（行内）
- `.callout` / `.callout-info` / `.callout-warn` / `.callout-tip` —— 提示框，内部第一个元素用 `<p class="callout-title">` 作标题
- `.formula` —— 独立成行的公式展示块（居中放大）；行内公式用 `<code class="math">`
- `.fig` —— 图容器，内部放 SVG/表格/HTML 图，配 `<figcaption>`（图注以「图 X-Y」开头，X 为章号）
- `.tbl-scroll` —— 宽表格容器（内部放普通 table）
- `.demo-frame` —— 交互 demo 占位容器：`<div class="demo-frame" data-demo="demo-attention">正在加载交互演示…</div>`，框架会把 demos/demo-attention.html 的内容注入其中并执行其中的 script。**每个 demo 章节里必须有一个，这是"过程演示"的核心。**
- `.cols-2` —— 双栏（窄屏自动堆叠）
- `.kbd-chip` —— 小标签 chip
- `.quiz` （details>summary 结构）
- `.big-number` —— 大数字展示
- 颜色只能通过框架变量，**不要在 part 里写任何 `<style>`，不要写内联颜色 hex**。SVG 图里需要颜色时使用框架提供的 CSS 变量（var(--ink), var(--accent), var(--accent2), var(--accent3), var(--muted), var(--paper2), var(--line)），SVG 内可以用 `fill="var(--accent)"`。
- 强调重点词用 `<mark>`。

## SVG 插图要求（每章至少 2 幅精心手绘的 SVG 示意图）
- viewBox 宽度 ≤ 760，高度自定；不要超出。字体用 `font-family="inherit"`，文字 fill 用 var(--muted) 或 var(--ink)。
- 图要"讲过程"：优先画数据流动（张量形状变化标注，如 `[10×512]` → `[10×64]`），而不是画装饰。
- 箭头用 `<marker>` 定义一次后复用（id 加章节前缀避免冲突，如 `id="arr-03"`）。

## Demo 规范（demo-XX.html，同样是 body 片段，可含 <script>）
- 自包含：内联 `<style>`（scoped 到一个前缀 class，如 `.dz-attn {}`）+ HTML + `<script>`（IIFE，vanilla JS，无依赖）。
- 必须有控制件（滑块/按钮/步进）让用户"玩"。默认展示一组真实的小数字。
- 所有 demo 颜色用 CSS 变量 var(--accent) 等（框架变量对 demo 可见）。
- demo 脚本防错：用 try/catch 包住初始化，出错时在容器里显示错误信息而不是静默失败。
- 每个 demo 都要有「自动播放/单步/重置」三类控件中的至少两类。
- 手机上可用：控件够大，触摸友好，宽度 100% 自适应。
- 不要在 demo 里用 localStorage、alert、外部资源。

## 事实准确性红线
- 数字必须准确：Transformer 原论文（Attention Is All You Need, 2017, Vaswani et al.）：d_model=512, h=8, d_k=d_v=64, d_ff=2048, 6 层编码器+6 层解码器, dropout 0.1, label smoothing 0.1, Adam β1=0.9 β2=0.98 ε=1e-9, warmup 4000 步, base 模型 65M 参数, big 213M。BERT base: 12层 768 维 12头 110M。GPT-3: 175B, 96层, 12288维。
- 训练成本数字要标注「量级估算」。
- 不确定的事实宁可不写，不要编造。
