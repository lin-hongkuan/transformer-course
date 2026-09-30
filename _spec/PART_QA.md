# 质检清单 —— 对分配给你的 part 文件逐一核对并直接修复
先 Read `G:\Research\transformer-course\_spec\SHARED_SPEC.md` 了解契约，再检查 part 文件：

1. **契约合规**：无 `<style>`/`<!DOCTYPE>`/`<html>`/`<head>`/`<body>`；正文颜色不写十六进制（SVG 里必须用 var(--accent) 等框架变量）；每个 `.demo-frame` 的 `data-demo` 名称存在于蓝图清单（demo-ngram / demo-embedding / demo-positional / demo-attention / demo-multihead / demo-residual / demo-architecture / demo-training / demo-decoding / demo-family）；章末有「小结」「常见误区」（callout-warn）和自测题（details.quiz）。
2. **数学与数字正确性**：逐个手算复核文中所有数值示例——softmax 求和是否为 1、矩阵乘法结果、方差论证、参数量加总、loss 数值（−ln p）等。发现错误直接改正，并保证改后全文上下文一致（表格、文字、图注引用同一组数字）。Transformer 原论文数字：d_model=512、h=8、d_k=d_v=64、d_ff=2048、6+6 层、dropout=0.1、label smoothing=0.1、warmup=4000、Adam β1=0.9 β2=0.98 ε=1e-9、base≈65M、big≈213M。
3. **SVG 质量**：每幅 SVG 有明确 viewBox 且宽度 ≤ 760；`<text>` 不溢出边界（估算：中文字符约 14px 宽、数字约 8px 宽，检查最右/最下文本的 x/y 坐标）；箭头 marker 的 id 唯一（带章节前缀）；所有 fill/stroke 颜色来自 var(--...) 框架变量；图注 figcaption 以「图 X-N」开头且 X 与章号一致。
4. **一致性**：章内交叉引用 `<a href="#chXX" class="xref">` 指向存在的章号（ch00~ch09）；术语与记号与 SHARED_SPEC 一致（d_model、d_k、Q/K/V 写法）。
5. **结构**：h3 用于小节（不要手写编号，框架自动编号）；`.tbl-scroll` 包裹宽表；`.fig` 包裹所有插图。

直接用 Edit/Write 修复你发现的问题，不要只报告。最终回复：每文件列出 [修复了什么] 与 [核对无误的关键数字清单]。
