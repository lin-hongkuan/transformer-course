# Transformer 图解讲义

一份面向**零基础**读者的中文图解讲义：从「预测下一个词」一路讲到完整的编码器–解码器架构、训练与推理，再到 BERT / GPT / T5 现代家族。

## 在线阅读

**https://lin-hongkuan.github.io/transformer-course/** （GitHub Pages）

## 内容

- **10 章正文**（约 9700 行 HTML）：序言与预备知识 → 为什么需要 Transformer → 词嵌入与位置编码 → 注意力机制（灵魂章，含「我 爱 猫」完整手算）→ 多头注意力 → 前馈网络与残差/层归一化 → 完整架构（含参数量 65M 手算）→ 训练过程（交叉熵/warmup/dropout）→ 推理与解码（贪心/束搜索/温度/top-p/KV Cache）→ 现代变体与学习路线
- **26 幅手绘 SVG 示意图**：数据流全部带张量形状标注，颜色随明暗主题自适应
- **10 个交互演示**（纯 vanilla JS，零依赖）：

| 演示 | 玩法 |
|---|---|
| n-gram 鹦鹉 | 亲身体验「只看前一个词」生成的句子有多僵硬 |
| 词嵌入空间 | 拖选词语看语义距离，播放 king−man+woman≈queen 向量箭头 |
| 位置编码 | 滑块调位置，看不同频率正弦波如何编码位置 |
| 注意力实验室 | 换词实时重算注意力热力图，逐帧观看 Q·K→softmax→加权求和 |
| softmax 温度室 | 捏 logits、拧温度旋钮，看分布收紧/摊平与信息熵 |
| 多头对比 | 8 个头并排热力图，看每个头自发学会的不同模式 |
| 残差与归一化 | 开关残差连接看 30 层信号衰减对比；LayerNorm 与迷你 FFN 沙盘 |
| 可点击架构图 | 点任意模块看解释与张量形状，一键播放数据流 |
| 训练模拟器 | 调学习率/warmup/label smoothing，看 loss 曲线收敛或发散 |
| 解码实验室 | 同前缀对比贪心/温度/top-p 的生成风格 |
| 三族架构 | 切换 BERT/GPT/T5 看注意力掩码与信息流差异 |

## 本地预览

```bash
node serve.js   # → http://localhost:8734
```

## 质量保障

```bash
node syntax-check.mjs .   # 全部 demo 内联脚本语法 + 规范检查
node link-check.mjs       # 章节交叉引用 / demo 引用完整性
node num-verify.mjs       # 正文关键手算数字自洽性抽查
```

## 参考脉络

Vaswani et al. 2017《Attention Is All You Need》、Stanford CS224n / CS336 课程脉络、Jay Alammar 的 Illustrated Transformer。
