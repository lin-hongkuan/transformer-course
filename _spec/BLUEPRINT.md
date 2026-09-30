# 内容蓝图（章节大纲）—— 作者严格按此分工，跨章引用用 id

全书 id 与章节映射（part 文件里的 section id 必须一致）：

- **part01.html · ch00 序言 + ch01 为什么需要 Transformer**
  - ch00: 这本书怎么读、零基础路线图、预备知识自检表（只要求：会看向量点积、知道概率分布、会一点 Python 伪代码）
  - ch01: 语言模型任务定义（预测下一个词）；n-gram 的失败；RNN/LSTM 的串行瓶颈与长程依赖问题（用"传话游戏"类比）；2017 年论文的历史背景；Transformer 总览图（全书地图）
  - demo: demo-ngram（n-gram 预测下一个词的交互玩具，展示其失败 → 引出注意力）
- **part02.html · ch02 词嵌入与位置编码**
  - 词表、one-hot、分布式表示、词嵌入几何（king-man+woman≈queen）、嵌入维度
  - 为什么需要位置信息；正弦位置编码推导直觉 + 为什么它能让模型外推到更长序列；可学习位置编码；RoPE 简述（现代做法）
  - demo: demo-embedding（2D 投影的词嵌入空间，可拖动词看语义距离）+ demo-positional（正弦位置编码可视化，调维度/位置看波形）
- **part03.html · ch03 注意力机制（核心章，全书最长）**
  - 直觉：查字典/数据库检索类比；Q K V 三矩阵的角色
  - 缩放点积注意力完整手算：3 个词的小例子，d_k=4，每个数都算出来
  - 为什么除以 √d_k（方差论证 + softmax 饱和）
  - softmax 复习；注意力权重矩阵的热力图读法
  - demo: demo-attention（输入一句话，实时计算并显示注意力矩阵热力图 + 逐词查询过程动画，可以改句子）
- **part04.html · ch04 多头注意力**
  - 为什么一个头不够（"一词多义/多种关系"）；把 d_model 切成 h 份
  - 完整维度推导：X[10×512] → 每头 Q,K,V [10×64] → 拼接 → W_O
  - 头数与效率：计算量其实不变；不同头学到不同模式（指代、句法、位置）
  - demo: demo-multihead（8 个头并排的小热力图，点选不同头看它关注的模式）
- **part05.html · ch05 前馈网络与残差/层归一化**
  - FFN: 两个线性层 + ReLU/GELU，d_ff=2048（4×扩张），"先升维再降维"的直觉
  - 每个位置的 FFN 是独立的（position-wise）
  - 残差连接：为什么深层网络需要它（梯度高速公路类比）
  - LayerNorm vs BatchNorm；Pre-LN vs Post-LN
  - Add & Norm 的完整数据流
  - demo: demo-residual（开关残差连接看梯度/信号衰减对比）
- **part06.html · ch06 完整编码器-解码器架构**
  - 把前面所有零件组装起来：编码器栈 ×6
  - 掩码自注意力（因果掩码）：为什么不能偷看未来；上三角 -inf
  - 交叉注意力：Q 来自解码器，K,V 来自编码器
  - 一个机器翻译的完整前向传播走查（"我爱你" → "I love you"，逐层张量形状标注）
  - 参数总量计算练习（亲手算出 65M）
  - demo: demo-architecture（可点击的架构图，点每个模块展开看里面发生什么，数据高亮流动）
- **part07.html · ch07 训练过程**
  - 训练数据从哪来；教师强制（teacher forcing）
  - 交叉熵损失从零讲：one-hot 目标、log-softmax、为什么等价于最大化正确词概率
  - 反向传播直觉（链式法则一图流，不推公式细节）
  - Adam 优化器直觉；学习率 warmup（原论文的 schedule 公式与曲线）
  - label smoothing、dropout
  - 训练成本与规模的直觉
  - demo: demo-training（一个小型模拟：训练曲线动画、loss 下降、调学习率看过冲/欠拟合）
- **part08.html · ch08 推理与解码策略**
  - 自回归生成：一步步生成的完整走查
  - 贪心解码；束搜索（beam search，beam=2 完整手算）
  - 温度采样、top-k、top-p（核采样）对比，概率分布图
  - KV Cache：为什么缓存 K,V 让推理快 N 倍；prefill vs decode
  - demo: demo-decoding（同一句话用贪心/温度/top-p 分别生成，看结果差异，可调参数实时重采样）
- **part09.html · ch09 现代变体与应用（结章）**
  - 编码器-only（BERT）、解码器-only（GPT）、编码器-解码器（T5）三大谱系
  - GPT 系列与规模定律（scaling laws）直觉；涌现能力
  - RoPE、GQA、SwiGLU、RMSNorm：现代 LLM 与 2017 原版的差异速查表
  - 上下文长度的挑战与 FlashAttention 思想
  - 继续学习的路线图（论文、课程、动手项目）
  - demo: demo-family（交互式族谱：切换三种架构看信息如何流动/掩码差异）

## 交叉引用约定
- 引用其他章：`<a href="#ch03" class="xref">第 3 章</a>`
- 每章 figcaption 图号：图 X-1、图 X-2（X = 章号，从 0 起）
- demo 文件名：demo/ch01-ngram → `data-demo="demo-ngram"`（清单：demo-ngram, demo-embedding, demo-positional, demo-attention, demo-multihead, demo-residual, demo-architecture, demo-training, demo-decoding, demo-family）

## 长度要求
每 part 正文（不含 demo 文件）**不少于 600 行 HTML**，内容密度优先：多手算例子、多表格、多图。写给零基础，所以"啰嗦"是对的。禁止用"显然""易知"。
