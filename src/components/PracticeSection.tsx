import { FeatureCard } from "./FeatureCard";

const practiceFeatures = [
  {
    title: "⛽ PhrasePump!",
    description:
      "PhrasePump 主要是一个听力练习工具。🎧 系统会选择包含需要复习的已保存单词的句子，同时引入新的词汇。无论是初学者还是高级学习者都能从中受益。",
    image: "/images/features/phrasepump.webp",
    link: "https://www.languagereactor.com/phrasepump",
    imageAlt: "PhrasePump feature",
  },
  {
    title: "🎴 导出到 Anki",
    description:
      "已经在使用 Anki？📤 导出精美的记忆卡片到 Anki，包含截图和音频片段。",
    image: "/images/features/export-to-anki.webp",
    link: "https://www.languagereactor.com/saved-items",
    imageAlt: "Export to Anki feature",
  },
  {
    title: "🤖 Aria",
    description:
      "来认识 Aria：你的机智语言伙伴。她既是导师又是段子手，总能妙语连珠。💬 获取即时纠正，探索无限话题，按照自己的节奏建立语言自信！💡",
    image: "/images/features/aria.webp",
    link: "https://www.languagereactor.com/chatbot",
    imageAlt: "Aria chatbot feature",
  },
  {
    title: "📚 FSI/DLI",
    description:
      "通过经过验证的政府语言培训课程来挑战自己。按照系统化的口语训练和练习来建立真正的语言流利度。💪 用 Language Reactor 的现代化工具来全面提升这些经典学习方法。",
    image: "/images/features/fsi-dli.webp",
    link: "https://www.languagereactor.com/c/en/dr/t_dr_all_en",
    imageAlt: "FSI/DLI courses feature",
  },
];

export default function PracticeSection() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            熟能生巧
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-white/70">
            让学习从被动转为主动
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {practiceFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
