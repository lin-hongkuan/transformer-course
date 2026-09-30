// num-verify.mjs — 抽查讲义中的关键手算数字是否自洽
// 运行: node num-verify.mjs
const eq = (name, got, want, tol = 0.01) => {
  const ok = Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  console.log(`${ok ? 'OK  ' : 'BAD '} ${name}: 算得 ${typeof got === 'number' ? got.toFixed(4) : got} 期望 ${want}`);
  return ok;
};
let allOk = true;
const chk = (...a) => { if (!eq(...a)) allOk = false; };

// softmax 工具
const sm = (xs) => { const m = Math.max(...xs); const e = xs.map(x => Math.exp(x - m)); const s = e.reduce((a, b) => a + b); return e.map(v => v / s); };

// —— 通用事实 ——
chk('√64 = 8', Math.sqrt(64), 8);
chk('√512 ≈ 22.63', Math.sqrt(512), 22.6274, 0.001);
chk('-ln 0.6 ≈ 0.511', -Math.log(0.6), 0.5108, 0.01);
chk('-ln 0.1 ≈ 2.303', -Math.log(0.1), 2.3026, 0.01);

// —— 原论文参数量（忽略偏置/LN，共享嵌入）——
const d = 512, dff = 2048, V = 37000, L = 6;
const encAttn = 4 * d * d;                    // Q K V O
const encFFN = 2 * d * dff;
const encLayer = encAttn + encFFN;
const decLayer = encLayer + 4 * d * d;        // 多一层交叉注意力
const embed = V * d;
const total = L * encLayer + L * decLayer + embed;
chk('编码器单层 ≈ 3.15M', encLayer / 1e6, 3.146, 0.01);
chk('解码器单层 ≈ 4.19M', decLayer / 1e6, 4.194, 0.01);
chk('嵌入 37000×512 = 18.944M', embed / 1e6, 18.944, 0.001);
chk('总量 ≈ 63M（与论文 65M 同量级）', total / 1e6, 63.0, 0.02);

// —— warmup: lr = d^-0.5 * min(step^-0.5, step*warmup^-1.5), d=512, warmup=4000 ——
const lr = (s) => Math.pow(d, -0.5) * Math.min(Math.pow(s, -0.5), s * Math.pow(4000, -1.5));
chk('lr(4000) 为峰值', lr(4000) >= lr(3999) && lr(4000) >= lr(4001), 1);
chk('lr(16000) = lr(4000)/2', lr(16000) / lr(4000), 0.5, 0.01);

// —— 温度采样: logits [2,1,0.5,0]（正文 part08 使用此组，作用方式 logit/T）——
const p1 = sm([2, 1, 0.5, 0]);
chk('T=1 概率和为 1', p1.reduce((a, b) => a + b), 1, 1e-9);
chk('T=1 首词 ≈ 0.58', p1[0], 0.579, 0.01);
const p05 = sm([2 / 0.5, 1 / 0.5, 0.5 / 0.5, 0]);
chk('T=0.5 更尖锐 首词 ≈ 0.83', p05[0], 0.831, 0.01);
const p2 = sm([2 / 2, 1 / 2, 0.5 / 2, 0]);
chk('T=2 更平坦 首词 ≈ 0.41', p2[0], 0.409, 0.01);
chk('top-p=0.9 核 {晴雨雪} 归一化首词 ≈ 0.63', 0.58 / 0.92, 0.63, 0.01);

// —— 贪心反例: 0.6×0.5=0.30 vs 0.4×0.95=0.38 ——
chk('贪心局优 0.30 < 0.38', 0.38 - 0.30, 0.08, 1e-9);

// —— LayerNorm 手算 [2,4,4,6]: μ=4, σ²=2, → [-1.414,0,0,1.414] ——
{
  const x = [2, 4, 4, 6];
  const mu = x.reduce((a, b) => a + b) / 4;
  const v = x.map(t => (t - mu) ** 2).reduce((a, b) => a + b) / 4;
  const y = x.map(t => (t - mu) / Math.sqrt(v));
  chk('LN μ=4', mu, 4, 1e-9);
  chk('LN σ²=2', v, 2, 1e-9);
  chk('LN 输出 [-1.414,0,0,1.414]', Math.abs(y[0] + 1.4142) + Math.abs(y[3] - 1.4142), 0, 0.001);
}

// —— KV cache: base 模型每词缓存 6层×2(KV)×512 = 6144 浮点 ——
chk('base 每词 KV 缓存 6144 浮点', 6 * 2 * 512, 6144, 1e-9);

console.log(allOk ? '\n== 关键数字全部自洽 ==' : '\n== 有数字不符，需回查正文 ==');
process.exit(allOk ? 0 : 1);
