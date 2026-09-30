# Demo 质检清单 —— 对分配给你的 demo 文件逐一核对并直接修复
先 Read `G:\Research\transformer-course\_spec\SHARED_SPEC.md` 了解 demo 规范，然后：

1. **真实执行测试（必须做）**：在 `G:\Research\transformer-course\_spec\` 下写一个临时 Node 测试脚本，用正则提取 demo 的 `<script>` 内容，构造最小 DOM 桩（document.getElementById/querySelector/querySelectorAll/createElement/appendChild/addEventListener 等返回链式安全的桩对象，桩对象的 style/classList/dataset/getContext 都要存在；canvas 的 getContext 返回一个含全部常用方法（fillRect/fillText/beginPath/moveTo/lineTo/stroke/fill/arc/quadraticCurveTo/clearRect/setTransform/save/restore/measureText→{width:10}）的可链式对象）。然后 `new Function('document','window','requestAnimationFrame', code)` 执行并调用，断言不抛异常。对每个 demo 都跑一遍。若 demo 代码用了更复杂的 API，可适度增强桩。测试脚本跑完即删，不要留垃圾（可保留一个通用的 `_spec/dom-stub.cjs`）。
2. **交互逻辑人工走查**：读代码确认——自动播放/单步/重置按钮都真实绑定了事件；滑块输入实时更新视图；边界值（滑块最小/最大、空输入、0 层、T→0）不崩溃（如 softmax 温度不能为 0，除零保护，数组越界保护）。发现问题直接修。
3. **规范合规**：无 localStorage/alert/fetch/外部 URL；样式 scoped（所有选择器以该 demo 前缀开头，如 `.dz-attn`）；颜色只用 var(--accent)/var(--accent2)/var(--accent3)/var(--muted)/var(--paper2)/var(--line)/var(--ink)/var(--heat-lo)/var(--heat-hi) 等框架变量，无裸 hex（渐变色标等确需 hex 的场景改用 color-mix(in srgb, var(--accent) X%, transparent) 或预定义变量）；控件在 400px 宽可用（按钮 padding ≥ 10px，触摸目标够大）。
4. **教学价值**：demo 的标签、注释、单位、默认值与所属章节正文里的数字一致（如 demo 里的 d_model、句子、概率分布要与正文手算例子吻合）。

直接用 Edit/Write 修复问题。最终回复：每文件列出 [测试结果] [修复项] [遗留风险]。
