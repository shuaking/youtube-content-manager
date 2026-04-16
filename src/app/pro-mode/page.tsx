import { ChevronRightIcon } from "@/components/icons";

const proFeatures = [
  {
    category: "AI 功能",
    features: [
      { name: "机器翻译", free: false, pro: true },
      { name: "语音识别", free: false, pro: true },
      { name: "AI 词语解析", free: false, pro: true },
    ],
  },
  {
    category: "学习工具",
    features: [
      { name: "基础字幕功能", free: true, pro: true },
      { name: "PhrasePump 高级模式", free: false, pro: true },
      { name: "无限保存词汇", free: false, pro: true },
      { name: "高级统计分析", free: false, pro: true },
    ],
  },
  {
    category: "内容访问",
    features: [
      { name: "Netflix 支持", free: true, pro: true },
      { name: "YouTube 支持", free: true, pro: true },
      { name: "优先访问新功能", free: false, pro: true },
      { name: "离线模式", free: false, pro: true },
    ],
  },
];

export default function ProModePage() {
  return (
    <main className="min-h-screen bg-background pt-[56px]">
      {/* Hero Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="text-5xl leading-none">💎</span>
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Pro 模式
            </h1>
          </div>
          <p className="mb-8 text-xl leading-relaxed text-white/70">
            Language Reactor 已经内置了许多实用的免费功能。
            <br />
            Pro 模式为您的体验增添了一些特别的光彩。 ✨
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="w-full py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">
            功能对比
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 border-b border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold text-white">功能</div>
              <div className="text-center text-lg font-semibold text-white">
                免费版
              </div>
              <div className="text-center text-lg font-semibold text-white">
                Pro 版
              </div>
            </div>

            {/* Table Body */}
            {proFeatures.map((category, idx) => (
              <div key={idx}>
                <div className="bg-white/5 px-6 py-3">
                  <h3 className="font-semibold text-white/90">
                    {category.category}
                  </h3>
                </div>
                {category.features.map((feature, featureIdx) => (
                  <div
                    key={featureIdx}
                    className="grid grid-cols-3 gap-4 border-t border-white/5 p-6"
                  >
                    <div className="text-white/80">{feature.name}</div>
                    <div className="flex justify-center">
                      {feature.free ? (
                        <span className="text-2xl text-green-400">✓</span>
                      ) : (
                        <span className="text-2xl text-white/20">—</span>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {feature.pro ? (
                        <span className="text-2xl text-green-400">✓</span>
                      ) : (
                        <span className="text-2xl text-white/20">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            选择您的计划
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-2xl border border-white/10 bg-card p-8">
              <h3 className="mb-2 text-2xl font-bold text-white">免费版</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-white/60">/月</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>基础字幕功能</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>Netflix 和 YouTube 支持</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>基础词汇保存</span>
                </li>
              </ul>
              <button className="w-full rounded-lg border border-white/20 bg-transparent px-6 py-3 font-semibold text-white transition-all hover:bg-white/10">
                当前计划
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border-2 border-secondary bg-card p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-4 py-1 text-sm font-semibold text-secondary-foreground">
                推荐
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white">Pro 版</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-white/60">/月</span>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>所有免费功能</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>AI 机器翻译</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>语音识别</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>无限词汇保存</span>
                </li>
                <li className="flex items-start gap-2 text-white/70">
                  <span className="text-green-400">✓</span>
                  <span>优先访问新功能</span>
                </li>
              </ul>
              <button className="group w-full rounded-lg bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:opacity-90">
                <span className="flex items-center justify-center gap-2">
                  升级到 Pro
                  <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            常见问题
          </h2>

          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">
                如何升级到 Pro 版？
              </h3>
              <p className="text-white/70">
                点击上方的"升级到 Pro"按钮，您将被引导至支付页面。支付完成后，Pro
                功能将立即激活。
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">
                可以随时取消吗？
              </h3>
              <p className="text-white/70">
                是的，您可以随时在设置页面取消订阅。取消后，Pro
                功能将在当前计费周期结束时停止。
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">
                支持哪些支付方式？
              </h3>
              <p className="text-white/70">
                我们支持信用卡、借记卡和 PayPal 支付。所有支付都通过安全的加密连接处理。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
