import { FeatureCard } from "./FeatureCard";

const vocabularyFeatures = [
  {
    title: "🧠 学习重点",
    description:
      "学习要讲究方法，事半功倍 🏃‍♂️ Language Reactor 为您推荐学习路上最重要的词汇，帮您把注意力集中在最关键的内容上。",
    image: "/images/features/what-to-learn.webp",
    link: "https://www.languagereactor.com/saved-items",
    imageAlt: "Learning focus feature",
  },
  {
    title: "🖍️ 智能高亮",
    description:
      "保存一个单词后，即可在各种形式中识别它。Language Reactor 能识别复数、动词变位及相关词形变化，让您在浏览所有内容时自然地强化学习。",
    image: "/images/features/smart-highlighting.webp",
    link: "https://www.languagereactor.com/settings",
    imageAlt: "Smart highlighting feature",
  },
];

export default function VocabularySection() {
  return (
    <section className="w-full bg-background py-20 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            掌握每个单词和短语
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-white/70">
            完整的词汇学习宝典
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {vocabularyFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
